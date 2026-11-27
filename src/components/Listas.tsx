"use client";

import Link from "next/link";
import { useState } from "react";
import { noticiasEjemplo, visibles, type Noticia } from "@/data/noticias";
import { CATEGORIAS_CLASIFICADO, vigentes } from "@/data/clasificados";
import { fechaLarga } from "@/lib/formato";
import { useAhora, useDemo } from "@/lib/store";

// Las notas creadas en el panel de la demo no tienen una página generada al
// compilar; se abren en /noticias/ver/?id=… (en la versión real todas tienen su URL).
const GENERADAS = new Set(noticiasEjemplo.map((n) => n.id));
export const enlaceNoticia = (n: Noticia) =>
  GENERADAS.has(n.id) ? `/noticias/${n.id}/` : `/noticias/ver/?id=${n.id}`;

export function NoticiasPortada() {
  const { noticias } = useDemo();
  const ahora = useAhora();
  const lista = visibles(noticias, ahora ?? new Date(0)).slice(0, 4);
  if (!lista.length) return <p className="text-gris">Todavía no hay noticias publicadas.</p>;
  const [principal, ...resto] = lista;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <article>
        <p className="text-sm font-bold text-vino">
          {principal.categoria}, {principal.zona}
        </p>
        <h3 className="titular mt-2 text-4xl sm:text-5xl">
          <Link href={enlaceNoticia(principal)} className="hover:text-monte">
            {principal.titulo}
          </Link>
        </h3>
        <p className="mt-3 max-w-prose text-lg text-gris">{principal.resumen}</p>
        <p className="mt-3 text-sm text-gris">
          {fechaLarga(principal.fecha)} <span className="marca-ejemplo ml-1">Nota de ejemplo</span>
        </p>
      </article>
      <ul className="divide-y divide-linea border-y border-linea">
        {resto.map((n) => (
          <li key={n.id} className="py-4">
            <p className="text-sm font-bold text-vino">
              {n.categoria}, {n.zona}
            </p>
            <Link href={enlaceNoticia(n)} className="mt-1 block text-lg leading-snug font-bold hover:text-monte">
              {n.titulo}
            </Link>
            <p className="mt-1 text-sm text-gris">{fechaLarga(n.fecha)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListaNoticias() {
  const { noticias } = useDemo();
  const ahora = useAhora();
  const [categoria, setCategoria] = useState("Todas");
  const todas = visibles(noticias, ahora ?? new Date(0));
  const categorias = ["Todas", ...Array.from(new Set(todas.map((n) => n.categoria)))];
  const lista = categoria === "Todas" ? todas : todas.filter((n) => n.categoria === categoria);

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tema">
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={categoria === c}
            onClick={() => setCategoria(c)}
            className="min-h-11 rounded-full border-2 border-monte px-3 py-1 font-bold text-monte aria-pressed:bg-monte aria-pressed:text-white"
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-8 divide-y divide-linea border-y border-linea">
        {lista.map((n) => (
          <li key={n.id} className="grid gap-1 py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
            <p className="text-sm text-gris">
              {fechaLarga(n.fecha)}
              <br />
              <span className="font-bold text-vino">{n.zona}</span>
            </p>
            <div>
              <p className="text-sm font-bold text-vino">
                {n.categoria}
                {n.origen === "ia" ? <span className="ml-2 font-normal text-gris">con fuentes externas</span> : null}
              </p>
              <h2 className="titular mt-1 text-3xl">
                <Link href={enlaceNoticia(n)} className="hover:text-monte">
                  {n.titulo}
                </Link>
              </h2>
              <p className="mt-2 max-w-prose text-gris">{n.resumen}</p>
              <span className="marca-ejemplo mt-2">Nota de ejemplo</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ListaClasificados({ limite }: { limite?: number }) {
  const { clasificados } = useDemo();
  const ahora = useAhora();
  const [cat, setCat] = useState<string>("Todos");
  const todos = vigentes(clasificados, ahora ?? new Date(0));
  const lista = (cat === "Todos" ? todos : todos.filter((c) => c.categoria === cat)).slice(0, limite);

  return (
    <>
      {!limite ? (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar clasificados">
          {["Todos", ...CATEGORIAS_CLASIFICADO].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className="min-h-11 rounded-full border-2 border-vino px-3 py-1 font-bold text-vino aria-pressed:bg-vino aria-pressed:text-white"
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
      {lista.length ? (
        <ul className="grid gap-px overflow-hidden rounded-lg border border-linea bg-linea sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <li key={c.id} className="bg-hoja p-5">
              <p className="text-sm font-bold text-vino">{c.categoria}</p>
              <h3 className="mt-1 text-lg leading-snug font-bold">{c.titulo}</h3>
              <p className="mt-2 text-gris">{c.texto}</p>
              <p className="mt-3 text-sm">
                {c.zona}. Contacto: <span className="cifras font-bold">{c.contacto}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gris">No hay clasificados vigentes en esta categoría.</p>
      )}
    </>
  );
}
