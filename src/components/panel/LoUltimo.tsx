"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Grupo, Region } from "@/lib/noticias";
import { conBase, fechaHora } from "@/lib/formato";
import { cambiar, nuevoId, useDemo } from "@/lib/store";

interface Datos {
  generado: string | null;
  ventanaHoras: number;
  grupos: Grupo[];
}

const REGIONES: (Region | "Todas")[] = ["Todas", "Yumbo", "Cali y Valle", "Nacional"];
const POR_PAGINA = 30;

/** Noticias reales recolectadas por RSS y agrupadas por hecho, sin IA. */
export function LoUltimo() {
  const router = useRouter();
  const { noticias } = useDemo();
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState(false);
  const [region, setRegion] = useState<(typeof REGIONES)[number]>("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [mostrar, setMostrar] = useState(POR_PAGINA);

  useEffect(() => {
    fetch(conBase("/datos/noticias.json"), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDatos, () => setError(true));
  }, []);

  if (error) return <p className="rounded-xl border border-linea bg-white p-6">No se pudieron cargar las noticias recolectadas.</p>;
  if (!datos) return <p className="text-gris">Cargando noticias…</p>;
  if (!datos.generado || !datos.grupos.length) {
    return (
      <p className="rounded-xl border border-linea bg-white p-6 text-gris">
        Todavía no hay noticias recolectadas. El recolector corre cada 3 horas en GitHub; la primera corrida llena esta lista.
      </p>
    );
  }

  const q = busqueda.trim().toLowerCase();
  const lista = datos.grupos
    .filter((g) => region === "Todas" || g.region === region)
    .filter((g) => !q || g.items.some((i) => `${i.titulo} ${i.medio} ${i.resumen}`.toLowerCase().includes(q)));
  const medios = new Set(datos.grupos.flatMap((g) => g.medios)).size;

  const crearBorrador = (g: Grupo) => {
    const existente = noticias.find((n) => n.fuentes?.some((f) => f.url === g.items[0].url));
    if (existente) return router.push(`/panel/noticias/editar/?id=${existente.id}`);
    const id = nuevoId("nota");
    cambiar(
      "noticias",
      [
        {
          id,
          titulo: g.titular,
          resumen: "",
          cuerpo: [
            "Escribe aquí un resumen propio con lo que dicen las fuentes. No copies el texto de los medios: resume, atribuye y enlaza.",
          ],
          categoria: "Nacional",
          zona: g.region === "Yumbo" ? "Yumbo" : g.region === "Cali y Valle" ? "Valle del Cauca" : "Colombia",
          fecha: new Date().toISOString(),
          estado: "borrador",
          origen: "ia",
          autor: "Redacción Yumbo Estéreo",
          fuentes: g.items.map((i) => ({ medio: i.medio, titulo: i.titulo, url: i.url })),
        },
        ...noticias,
      ],
      `Creó un borrador desde Lo último: «${g.titular}»`,
    );
    router.push(`/panel/noticias/editar/?id=${id}`);
  };

  return (
    <>
      <div className="mb-6 grid gap-4 rounded-xl border border-linea bg-white p-4 md:grid-cols-[1fr_auto]">
        <label>
          <span className="etiqueta">Buscar</span>
          <input type="search" className="campo" placeholder="Palabra, medio o lugar" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
        <label>
          <span className="etiqueta">Región</span>
          <select className="campo" value={region} onChange={(e) => setRegion(e.target.value as typeof region)}>
            {REGIONES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-3 text-sm text-gris" aria-live="polite">
        Recolectado el {fechaHora(datos.generado)} de {medios} medios: {lista.length} {lista.length === 1 ? "hecho" : "hechos"} de las
        últimas {datos.ventanaHoras} horas. Yumbo primero, luego Cali y el Valle.
      </p>

      <ul className="space-y-3">
        {lista.slice(0, mostrar).map((g) => (
          <li key={g.id} className="rounded-xl border border-linea bg-white p-5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-bold text-vino">{g.region}</span>
              {g.fecha ? <span className="text-gris">{fechaHora(g.fecha)}</span> : null}
              {g.medios.length === 1 ? (
                <span className="rounded bg-amarillo-suave px-1.5 font-bold text-noche">Una sola fuente</span>
              ) : (
                <span className="text-gris">{g.medios.length} medios</span>
              )}
            </p>
            <h2 className="mt-1 text-xl leading-snug font-bold">{g.titular}</h2>
            {g.items[0].resumen ? <p className="mt-1 max-w-3xl text-gris">{g.items[0].resumen}</p> : null}
            <ul className="mt-3 space-y-1 text-sm">
              {g.items.slice(0, 6).map((i) => (
                <li key={i.id}>
                  <a href={i.url} className="font-bold text-monte underline" rel="noopener noreferrer" target="_blank">
                    {i.medio}
                  </a>
                  : {i.titulo}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-borde mt-4 text-monte" onClick={() => crearBorrador(g)}>
              Crear borrador
            </button>
          </li>
        ))}
      </ul>
      {lista.length > mostrar ? (
        <button type="button" className="btn btn-borde mt-4 text-monte" onClick={() => setMostrar((m) => m + POR_PAGINA)}>
          Ver más
        </button>
      ) : null}
    </>
  );
}
