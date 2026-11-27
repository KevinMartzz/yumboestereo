"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Aviso, TituloPanel } from "@/components/panel/MarcoPanel";
import { hechosEjemplo, TEMAS_IA, type Hecho, type Prioridad } from "@/data/hechos-ia";
import { fechaHora } from "@/lib/formato";
import { cambiar, nuevoId, useDemo } from "@/lib/store";

const REGIONES: (Prioridad | "Todas")[] = ["Todas", "Yumbo", "Cali y Valle", "Nacional"];
const DURACIONES = [30, 60, 90] as const;

function palabras(t: string) {
  return t.trim().split(/\s+/).length;
}

function TarjetaHecho({ h }: { h: Hecho }) {
  const router = useRouter();
  const { noticias } = useDemo();
  const [abierto, setAbierto] = useState(false);
  const [duracion, setDuracion] = useState<(typeof DURACIONES)[number]>(60);
  const [copiado, setCopiado] = useState(false);
  const yaCreado = noticias.find((n) => n.fuentes?.[0]?.url === h.fuentes[0].url);

  const crearBorrador = () => {
    if (yaCreado) {
      router.push(`/panel/noticias/editar/?id=${yaCreado.id}`);
      return;
    }
    const id = nuevoId("nota");
    cambiar(
      "noticias",
      [
        {
          id,
          titulo: h.titular,
          resumen: h.resumen.split(". ")[0].replace(/\.?$/, "."),
          cuerpo: [h.resumen, "Borrador preparado con IA a partir de las fuentes citadas. Revísalo antes de publicar."],
          categoria: h.tema === "Comunidad" ? "Comunidad" : h.tema,
          zona: h.zona,
          fecha: new Date().toISOString(),
          estado: "borrador",
          origen: "ia",
          autor: "Redacción Yumbo Estéreo",
          fuentes: h.fuentes.map((f) => ({ medio: f.medio, titulo: f.titulo, url: f.url })),
        },
        ...noticias,
      ],
      `Creó un borrador desde Noticias con IA: «${h.titular}»`,
    );
    router.push(`/panel/noticias/editar/?id=${id}`);
  };

  const guion = h.guiones[duracion];

  return (
    <li className="rounded-xl border border-linea bg-white">
      <div className="p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-bold text-vino">{h.tema}</span>
          <span className="text-gris">{h.region === "Yumbo" ? "Yumbo" : h.zona}</span>
          <span className="text-gris">Actualizado {fechaHora(h.actualizado)}</span>
          <span className="text-gris">
            {h.fuentes.length} {h.fuentes.length === 1 ? "fuente" : "fuentes"}
          </span>
        </p>
        <h2 className="titular mt-2 text-3xl">{h.titular}</h2>
        <p className="mt-2 max-w-3xl">{h.resumen}</p>

        {h.alertas.map((a) => (
          <p
            key={a.tipo}
            className={`mt-3 rounded-lg border-l-4 px-3 py-2 text-sm ${
              a.tipo === "contradiccion" ? "border-vino bg-vino/5" : "border-amarillo bg-amarillo-suave/50"
            }`}
          >
            <strong>{a.tipo === "contradiccion" ? "Las fuentes no coinciden. " : "Una sola fuente. "}</strong>
            {a.detalle}
          </p>
        ))}

        <ul className="mt-4 space-y-1 text-sm">
          {h.fuentes.map((f) => (
            <li key={f.url}>
              <a href={f.url} className="font-bold text-monte underline" rel="noopener">
                {f.medio}
              </a>
              : {f.titulo} <span className="text-gris">({fechaHora(f.hora)})</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn btn-monte" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
            {abierto ? "Ocultar el guion" : "Guion para el aire"}
          </button>
          <button type="button" className="btn btn-borde text-monte" onClick={crearBorrador}>
            {yaCreado ? "Abrir el borrador" : "Crear borrador"}
          </button>
        </div>
      </div>

      {abierto ? (
        <div className="border-t border-linea bg-papel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full border border-linea bg-white p-1" role="group" aria-label="Duración del guion">
              {DURACIONES.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={duracion === d}
                  onClick={() => {
                    setDuracion(d);
                    setCopiado(false);
                  }}
                  className="rounded-full px-4 py-1.5 font-bold aria-pressed:bg-monte aria-pressed:text-white"
                >
                  {d} segundos
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-borde text-monte"
              onClick={() => {
                navigator.clipboard?.writeText(guion).then(() => setCopiado(true), () => setCopiado(false));
              }}
            >
              {copiado ? "Copiado" : "Copiar el guion"}
            </button>
          </div>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed">{guion}</p>
          <p className="mt-3 text-sm text-gris">
            {palabras(guion)} palabras, unos {Math.round(palabras(guion) / 2.5)} segundos a ritmo de locución.
          </p>
        </div>
      ) : null}
    </li>
  );
}

export default function NoticiasIA() {
  const [region, setRegion] = useState<(typeof REGIONES)[number]>("Todas");
  const [tema, setTema] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");

  const q = busqueda.trim().toLowerCase();
  // Prioridad: Yumbo, luego Cali y el Valle, luego el resto del país; dentro de cada una, lo más reciente.
  const peso: Record<Prioridad, number> = { Yumbo: 0, "Cali y Valle": 1, Nacional: 2 };
  const lista = hechosEjemplo
    .filter((h) => region === "Todas" || h.region === region)
    .filter((h) => tema === "Todos" || h.tema === tema)
    .filter((h) => !q || `${h.titular} ${h.resumen} ${h.fuentes.map((f) => f.medio).join(" ")}`.toLowerCase().includes(q))
    .sort((a, b) => peso[a.region] - peso[b.region] || +new Date(b.actualizado) - +new Date(a.actualizado));

  return (
    <>
      <TituloPanel titulo="Noticias con IA">
        Lo importante del día en Yumbo, el Valle y el país, agrupado por hecho. Cada resumen cita sus fuentes. Nada se
        publica solo: pasa a borrador y lo revisa una persona.
      </TituloPanel>

      <div className="mb-5">
        <Aviso>
          <strong>Datos de demostración.</strong> Los medios y las noticias son ficticios y los enlaces van a
          example.com. En la versión real, el sistema revisa los RSS de los medios cada 15 a 30 minutos y la IA
          escribe los resúmenes y guiones usando solo lo que dicen las fuentes.
        </Aviso>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-linea bg-white p-4 md:grid-cols-[1fr_auto_auto]">
        <label>
          <span className="etiqueta">Buscar</span>
          <input
            type="search"
            className="campo"
            placeholder="Palabra, medio o lugar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        <label>
          <span className="etiqueta">Región</span>
          <select className="campo" value={region} onChange={(e) => setRegion(e.target.value as typeof region)}>
            {REGIONES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Tema</span>
          <select className="campo" value={tema} onChange={(e) => setTema(e.target.value)}>
            {["Todos", ...TEMAS_IA].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-3 text-sm text-gris" aria-live="polite">
        {lista.length} {lista.length === 1 ? "hecho" : "hechos"}. Última revisión de fuentes: hoy, 8:15 a. m. (ejemplo).
      </p>
      {lista.length ? (
        <ul className="space-y-4">
          {lista.map((h) => (
            <TarjetaHecho key={h.id} h={h} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-linea bg-white p-6 text-gris">
          No hay hechos con esos filtros. Prueba con otra región o borra la búsqueda.
        </p>
      )}
    </>
  );
}
