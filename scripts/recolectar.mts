// Recolector de noticias. Corre en GitHub Actions (que tiene internet abierto)
// cada pocas horas:
//   node --experimental-strip-types scripts/recolectar.mts
//
// 1. Prueba cada fuente de data/fuentes.json; si ninguna dirección candidata
//    responde, busca el RSS que el medio anuncia en su página principal.
// 2. Guarda título, medio, enlace, fecha y el resumen del propio medio.
// 3. Quita duplicados y agrupa las notas del mismo hecho (sin IA).
// 4. Revisa la página del reproductor actual de la emisora para encontrar la
//    URL del streaming y si da metadatos.
// Escribe public/datos/noticias.json (lo lee el tablero), data/generado/estado-fuentes.json
// y docs/fuentes-noticias.md.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import {
  agrupar,
  limpiarHtml,
  normalizarUrl,
  separarMedioDeTitulo,
  type ItemNoticia,
} from "../src/lib/noticias.ts";

const VENTANA_HORAS = 48;
const MAX_POR_FUENTE = 40;
const TIEMPO_MAX_MS = 20_000;
// Navegador genérico: algunos medios rechazan clientes sin User-Agent.
const AGENTE = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface Fuente {
  id: string;
  medio: string;
  tipo: string;
  inicio?: string;
  candidatas: string[];
}

interface EstadoFuente {
  id: string;
  medio: string;
  tipo: string;
  ok: boolean;
  url: string | null;
  descubierta: boolean;
  notas: number;
  ultima: string | null;
  intentos: { url: string; resultado: string }[];
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text" });

const MAX_BYTES = 5_000_000;

/** Solo cabeceras: para probar el streaming sin descargarlo. */
async function pedir(url: string, extra: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIEMPO_MAX_MS);
  try {
    return await fetch(url, { headers: { "User-Agent": AGENTE, Accept: "*/*", ...extra }, signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Pide una URL y lee el cuerpo con límite de tiempo Y de tamaño. Sin esto, un
 * servidor que entrega un stream sin fin (audio en vivo) deja colgado el script.
 */
async function pedirTexto(url: string, extra: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIEMPO_MAX_MS);
  try {
    const r = await fetch(url, { headers: { "User-Agent": AGENTE, Accept: "*/*", ...extra }, signal: ctrl.signal, redirect: "follow" });
    const tipo = r.headers.get("content-type") ?? "";
    if (/^(audio|video)\//i.test(tipo)) {
      await r.body?.cancel();
      return { r, cuerpo: "", tipo };
    }
    const partes: Uint8Array[] = [];
    let total = 0;
    if (r.body) {
      for await (const trozo of r.body as unknown as AsyncIterable<Uint8Array>) {
        partes.push(trozo);
        total += trozo.length;
        if (total > MAX_BYTES) {
          ctrl.abort();
          throw new Error(`respuesta de más de ${MAX_BYTES / 1e6} MB`);
        }
      }
    }
    return { r, cuerpo: Buffer.concat(partes).toString("utf8"), tipo };
  } catch (e) {
    if (ctrl.signal.aborted && !(e instanceof Error && e.message.startsWith("respuesta"))) {
      throw new Error(`sin respuesta completa en ${TIEMPO_MAX_MS / 1000} s`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

const texto = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return texto(v[0]);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return texto(o["#text"] ?? o["@_href"] ?? "");
  }
  return "";
};

const lista = <T,>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

function enlaceAtom(link: unknown): string {
  const ls = lista(link as Record<string, string> | Record<string, string>[]);
  const alt = ls.find((l) => typeof l === "object" && (!l["@_rel"] || l["@_rel"] === "alternate"));
  return texto(alt ?? ls[0]);
}

function aISO(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(+d) ? null : d.toISOString();
}

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 12);

/** Convierte un RSS o Atom en notas. Lanza error si no es un feed. */
function leerFeed(xml: string, f: Fuente): ItemNoticia[] {
  const doc = parser.parse(xml);
  const crudos: Record<string, unknown>[] = doc?.rss?.channel
    ? lista(doc.rss.channel.item)
    : doc?.feed
      ? lista(doc.feed.entry)
      : doc?.["rdf:RDF"]
        ? lista(doc["rdf:RDF"].item)
        : (() => {
            throw new Error("no es un RSS/Atom");
          })();

  return crudos.slice(0, MAX_POR_FUENTE).flatMap((it) => {
    let titulo = limpiarHtml(texto(it.title), 300);
    if (/^comentario en /i.test(titulo)) return [];
    const url = (texto(it.link) || enlaceAtom(it.link)).trim() || texto(it.guid);
    if (!titulo || !/^https?:\/\//.test(url)) return [];
    let medio = f.medio;
    if (f.tipo === "agregador") {
      const sep = separarMedioDeTitulo(titulo);
      titulo = sep.titulo;
      medio = texto(it.source) || sep.medio || f.medio;
    }
    const fecha = aISO(texto(it.pubDate) || texto(it.published) || texto(it.updated) || texto(it["dc:date"]));
    // Google News pone en la descripción una lista de enlaces, no un resumen.
    const resumen = f.tipo === "agregador" ? "" : limpiarHtml(texto(it.description) || texto(it.summary) || texto(it.content));
    return [{ id: hash(normalizarUrl(url)), fuente: f.id, medio, titulo, url, fecha, resumen }];
  });
}

/** Busca <link rel="alternate" type="application/rss+xml"> en la página principal. */
async function descubrir(inicio: string): Promise<string[]> {
  const { r, cuerpo: html } = await pedirTexto(inicio);
  if (!r.ok) return [];
  const enlaces = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((tag) => /rel=["']?alternate/i.test(tag) && /type=["']?application\/(rss|atom)\+xml/i.test(tag))
    .map((tag) => /href=["']([^"']+)["']/i.exec(tag)?.[1])
    // Los feeds de comentarios de lectores no son noticias.
    .filter((h): h is string => !!h && !/comment/i.test(h))
    .map((h) => new URL(h.replace(/&amp;/g, "&"), inicio).toString());
  return [...new Set(enlaces)].slice(0, 4);
}

async function recolectarFuente(f: Fuente): Promise<{ estado: EstadoFuente; items: ItemNoticia[] }> {
  const estado: EstadoFuente = { id: f.id, medio: f.medio, tipo: f.tipo, ok: false, url: null, descubierta: false, notas: 0, ultima: null, intentos: [] };

  const probar = async (url: string, descubierta: boolean) => {
    try {
      const { r, cuerpo } = await pedirTexto(url, { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5" });
      if (!r.ok) {
        estado.intentos.push({ url, resultado: `HTTP ${r.status}` });
        return null;
      }
      const items = leerFeed(cuerpo, f);
      if (!items.length) {
        estado.intentos.push({ url, resultado: "feed vacío" });
        return null;
      }
      estado.intentos.push({ url, resultado: `ok, ${items.length} notas` });
      Object.assign(estado, { ok: true, url, descubierta });
      return items;
    } catch (e) {
      estado.intentos.push({ url, resultado: e instanceof Error ? e.message : String(e) });
      return null;
    }
  };

  let items: ItemNoticia[] | null = null;
  for (const url of f.candidatas) if (!items) items = await probar(url, false);
  if (!items && f.inicio) {
    try {
      const encontrados = await descubrir(f.inicio);
      if (!encontrados.length) estado.intentos.push({ url: f.inicio, resultado: "la página no anuncia RSS" });
      for (const url of encontrados) if (!items) items = await probar(url, true);
    } catch (e) {
      estado.intentos.push({ url: f.inicio, resultado: `no se pudo abrir la página: ${e instanceof Error ? e.message : e}` });
    }
  }
  items ??= [];
  estado.notas = items.length;
  estado.ultima = items.map((i) => i.fecha).filter(Boolean).sort().at(-1) ?? null;
  return { estado, items };
}

/** Busca la URL del streaming en la página del reproductor actual y la prueba. */
async function revisarSenal(pagina: string) {
  const salida: Record<string, unknown> = { pagina, revisado: new Date().toISOString() };
  try {
    const { r, cuerpo: html, tipo } = await pedirTexto(pagina);
    salida.paginaEstado = r.status;
    salida.paginaTipo = tipo;
    // Recursos que carga la página (iframes, scripts, audio), con rutas relativas resueltas.
    const recursos = (doc: string, base: string) =>
      [...doc.matchAll(/<(iframe|script|audio|source|embed|object)\b[^>]*?(?:src|data)=["']([^"']+)["']/gi)].map((m) => ({
        etiqueta: m[1].toLowerCase(),
        url: new URL(m[2].replace(/&amp;/g, "&"), base).toString(),
      }));
    const propios = recursos(html, pagina);
    salida.recursos = propios.slice(0, 20);
    // Busca también dentro de los iframes (un nivel) y de los scripts que no son librerías conocidas.
    let textos = html;
    for (const rec of propios.filter((x) => x.etiqueta === "iframe" || (x.etiqueta === "script" && !/(jquery|google|facebook|cloudflare|gtag|analytics|bootstrap|cdn)/i.test(x.url))).slice(0, 5)) {
      try {
        const { cuerpo } = await pedirTexto(rec.url);
        textos += "\n" + cuerpo;
        (salida.recursos as { url: string; etiqueta: string }[]).push(...recursos(cuerpo, rec.url).slice(0, 10));
      } catch {
        // recurso no disponible
      }
    }
    // Fragmentos del código que mencionan el audio, para revisarlos a mano.
    salida.fragmentos = [...textos.matchAll(/.{0,80}(stream|audio|\.mp3|\.aac|icecast|shoutcast|radio_|player).{0,80}/gi)]
      .map((m) => m[0].replace(/\s+/g, " ").trim())
      .slice(0, 15);
    const urls = [
      ...[...textos.matchAll(/https?:\/\/[^\s"'<>()\\]+/g)].map((m) => m[0]),
      ...(salida.recursos as { url: string; etiqueta: string }[]).filter((x) => x.etiqueta === "audio" || x.etiqueta === "source").map((x) => x.url),
    ];
    const candidatas = [
      ...new Set(
        urls.filter((u) =>
          /(\.mp3|\.aac|\.ogg|\.m3u8?|\.pls|:\d{4}|\/stream|\/live|listen|icecast|shoutcast|zeno\.fm|radio\.co|streamtheworld|radiojar|caster|sonic)/i.test(u),
        ),
      ),
    ].slice(0, 6);
    // Si la "página" ya es audio, el stream es la página misma.
    if (/^audio\//i.test(tipo)) candidatas.unshift(pagina);
    salida.candidatas = candidatas;
    salida.pruebas = [];
    for (const u of candidatas) {
      const prueba: Record<string, unknown> = { url: u };
      try {
        const s = await pedir(u, { "Icy-MetaData": "1", Range: "bytes=0-1" });
        prueba.estado = s.status;
        for (const h of ["content-type", "server", "icy-name", "icy-br", "icy-genre", "icy-metaint", "icy-description"]) {
          const v = s.headers.get(h);
          if (v) prueba[h] = v;
        }
        await s.body?.cancel();
      } catch (e) {
        prueba.error = e instanceof Error ? e.message : String(e);
      }
      // Estadísticas de Icecast y Shoutcast, si el servidor las publica.
      try {
        const origen = new URL(u).origin;
        for (const ruta of ["/status-json.xsl", "/stats?json=1"]) {
          const { r: s, cuerpo, tipo } = await pedirTexto(origen + ruta);
          if (s.ok && /json/.test(tipo)) {
            prueba.estadisticas = { url: origen + ruta, muestra: cuerpo.slice(0, 600) };
            break;
          }
        }
      } catch {
        // sin estadísticas públicas
      }
      (salida.pruebas as unknown[]).push(prueba);
    }
  } catch (e) {
    salida.error = e instanceof Error ? e.message : String(e);
  }
  return salida;
}

function markdown(generado: string, estados: EstadoFuente[], senal: Record<string, unknown>) {
  const filas = estados
    .map((e) => `| ${e.medio} | ${e.ok ? "Sí" : "No"} | ${e.ok ? e.notas : "-"} | ${e.ultima ? e.ultima.slice(0, 16).replace("T", " ") + " UTC" : "-"} | ${e.url ? `\`${e.url}\`${e.descubierta ? " (encontrada en la página)" : ""}` : e.intentos.map((i) => `${i.resultado}`).join("; ")} |`)
    .join("\n");
  return `# Fuentes de noticias

Este archivo lo escribe el recolector (\`scripts/recolectar.mts\`) en cada corrida. No lo edites a mano: para agregar una fuente, edita \`data/fuentes.json\`.

Última revisión: **${generado.slice(0, 16).replace("T", " ")} UTC**

| Medio | ¿Funciona? | Notas | Nota más reciente | RSS que se usa / motivo de la falla |
|---|---|---|---|---|
${filas}

## Señal en vivo (reproductor de la web actual)

\`\`\`json
${JSON.stringify(senal, null, 2)}
\`\`\`

## Cómo agregar una fuente

1. Agrega un bloque en \`data/fuentes.json\` con \`id\`, \`medio\`, \`tipo\` (\`regional\`, \`nacional\` o \`agregador\`), \`inicio\` (página principal) y \`candidatas\` (direcciones de RSS a probar).
2. Si no conoces el RSS, deja \`candidatas\` vacío: el recolector lo busca en la página principal.
3. Corre el flujo «Recolectar noticias» en la pestaña Actions de GitHub y revisa este archivo.
`;
}

async function main() {
  const config = JSON.parse(await readFile(process.env.FUENTES ?? "data/fuentes.json", "utf8"));
  const fuentes: Fuente[] = config.fuentes;
  const resultados = await Promise.all(fuentes.map(recolectarFuente));
  const generado = new Date().toISOString();
  const limite = Date.now() - VENTANA_HORAS * 3600_000;

  const items = resultados
    .flatMap((r) => r.items)
    .filter((i) => !i.fecha || +new Date(i.fecha) >= limite)
    .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  const grupos = agrupar(items).slice(0, 120);
  const senal = await revisarSenal(config.senal.pagina);

  await mkdir("data/generado", { recursive: true });
  await mkdir("public/datos", { recursive: true });
  await mkdir("docs", { recursive: true });
  await writeFile("public/datos/noticias.json", JSON.stringify({ generado, ventanaHoras: VENTANA_HORAS, grupos }, null, 1));
  await writeFile("data/generado/estado-fuentes.json", JSON.stringify({ generado, fuentes: resultados.map((r) => r.estado), senal }, null, 2));
  await writeFile("docs/fuentes-noticias.md", markdown(generado, resultados.map((r) => r.estado), senal));

  const ok = resultados.filter((r) => r.estado.ok).length;
  console.log(`Fuentes que funcionan: ${ok} de ${fuentes.length}. Notas: ${items.length}. Grupos: ${grupos.length}.`);
  for (const r of resultados) console.log(`${r.estado.ok ? "OK   " : "FALLA"} ${r.estado.medio}: ${r.estado.intentos.map((i) => i.resultado).join(" | ")}`);
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
