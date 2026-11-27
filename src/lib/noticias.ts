// Limpieza, deduplicación y agrupación de noticias recolectadas por RSS.
// Sin IA: agrupa por parecido de títulos. La IA (fase siguiente) resume y
// escribe guiones a partir de estos grupos.
//
// Este archivo lo usan la web y el recolector (scripts/recolectar.ts, que corre
// con node --experimental-strip-types), por eso no usa alias "@/".

export interface ItemNoticia {
  id: string;
  fuente: string; // id de la fuente
  medio: string; // nombre del medio que publicó
  titulo: string;
  url: string;
  fecha: string | null; // ISO
  resumen: string; // texto corto del propio medio, sin HTML
}

export type Region = "Yumbo" | "Cali y Valle" | "Nacional";

export interface Grupo {
  id: string;
  titular: string;
  region: Region;
  fecha: string | null; // la más reciente del grupo
  items: ItemNoticia[];
  medios: string[];
}

const STOP = new Set(
  "a al ante bajo con contra de del desde durante e el en entre esta este esto estos hacia hasta la las le les lo los mas más me mi muy no o os para pero por que qué se según ser si sí sin sobre su sus también tras un una uno unos unas y ya fue han ha son está están dice dijo así como cómo cuando donde quien quién tras hoy ayer este esta".split(
    " ",
  ),
);

/** Quita tildes, signos y palabras vacías. */
export function palabras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2 && !STOP.has(p));
}

/** Parecido entre dos títulos: palabras compartidas sobre el título más corto (0 a 1). */
export function parecido(a: string, b: string): number {
  const A = new Set(palabras(a));
  const B = new Set(palabras(b));
  if (!A.size || !B.size) return 0;
  let comunes = 0;
  for (const p of A) if (B.has(p)) comunes++;
  return comunes / Math.min(A.size, B.size);
}

const PARAMETROS_BASURA = /^(utm_|fbclid|gclid|mc_|outputtype|ref$|cmpid)/i;

/** URL comparable: sin www, sin parámetros de rastreo, sin # ni barra final. */
export function normalizarUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const k of [...u.searchParams.keys()]) if (PARAMETROS_BASURA.test(k)) u.searchParams.delete(k);
    if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, "");
    const s = u.toString();
    return s.endsWith("/") ? s.slice(0, -1) : s;
  } catch {
    return url.trim();
  }
}

/** Google News pone " - Medio" al final del título. */
export function separarMedioDeTitulo(titulo: string): { titulo: string; medio: string | null } {
  const m = /^(.*\S)\s+[-–|]\s+([^-–|]{2,60})$/.exec(titulo.trim());
  return m ? { titulo: m[1], medio: m[2].trim() } : { titulo: titulo.trim(), medio: null };
}

export function limpiarHtml(html: string, max = 280): string {
  const texto = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
  return texto.length > max ? `${texto.slice(0, max).replace(/\s+\S*$/, "")}…` : texto;
}

const YUMBO = ["yumbo", "arroyohondo", "dapa", "montanitas", "mulalo", "san marcos", "yumbillo", "el pedregal", "la buitrera", "santa ines", "la olga"];
const VALLE = ["cali", "valle del cauca", "vallecaucan*", "palmira", "jamundi", "buenaventura", "tulua", "cartago", "buga", "candelaria", "florida", "pradera", "rozo", "vijes", "la cumbre", "dagua", "caleno", "calena", "america de cali", "deportivo cali"];

const plano = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Región por palabras clave ("*" al final = vale como prefijo). Prioridad: Yumbo, luego Cali y el Valle. */
export function regionDe(texto: string): Region {
  const t = ` ${plano(texto)} `;
  const esta = (p: string) =>
    p.endsWith("*") ? new RegExp(`[^a-z]${p.slice(0, -1)}`).test(t) : new RegExp(`[^a-z]${p}(?![a-z])`).test(t);
  if (YUMBO.some(esta)) return "Yumbo";
  if (VALLE.some(esta)) return "Cali y Valle";
  return "Nacional";
}

const PESO: Record<Region, number> = { Yumbo: 0, "Cali y Valle": 1, Nacional: 2 };

/**
 * Agrupa las notas del mismo hecho: misma URL, o títulos con al menos
 * `umbral` de palabras en común. Ordena por región (Yumbo primero) y fecha.
 */
export function agrupar(items: ItemNoticia[], umbral = 0.6): Grupo[] {
  const grupos: { items: ItemNoticia[]; urls: Set<string> }[] = [];
  const orden = [...items].sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));

  for (const it of orden) {
    const url = normalizarUrl(it.url);
    const destino = grupos.find(
      (g) => g.urls.has(url) || g.items.some((x) => parecido(x.titulo, it.titulo) >= umbral),
    );
    if (destino) {
      if (destino.urls.has(url)) continue; // la misma nota repetida en dos RSS
      destino.items.push(it);
      destino.urls.add(url);
    } else {
      grupos.push({ items: [it], urls: new Set([url]) });
    }
  }

  return grupos
    .map((g) => {
      const texto = g.items.map((i) => `${i.titulo} ${i.resumen}`).join(" ");
      const fecha = g.items.map((i) => i.fecha).filter(Boolean).sort().at(-1) ?? null;
      return {
        id: g.items[0].id,
        titular: g.items[0].titulo,
        region: regionDe(texto),
        fecha,
        items: g.items,
        medios: [...new Set(g.items.map((i) => i.medio))],
      };
    })
    .sort((a, b) => PESO[a.region] - PESO[b.region] || (b.fecha ?? "").localeCompare(a.fecha ?? ""));
}
