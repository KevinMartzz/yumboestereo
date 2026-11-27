"use client";

import Link from "next/link";
import { programaPorDefecto } from "@/data/emisora";
import { programaPorSlug } from "@/data/programas";
import { locutorPorSlug } from "@/data/locutores";
import { aHHMM, alAire, horaColombia, NOMBRES_DIA } from "@/lib/horario";
import { aLaHora, conArticulo, horaBonita } from "@/lib/formato";
import { useAhora, useDemo } from "@/lib/store";
import { IconoPlay, useReproductor } from "./Reproductor";

export function BotonEscuchar({ grande = false }: { grande?: boolean }) {
  const { estado, alternar } = useReproductor();
  const activo = estado === "sonando" || estado === "cargando" || estado === "reconectando";
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      className={`btn btn-amarillo ${grande ? "px-6 py-3 text-lg" : ""}`}
    >
      <IconoPlay sonando={activo} className="size-5" />
      {activo ? "Pausar" : "Escuchar en vivo"}
    </button>
  );
}

/** Bloque principal de inicio: qué suena ahora, con quién y qué sigue. */
export function AlAireAhora() {
  const { horarios } = useDemo();
  const ahora = useAhora();

  if (!ahora) {
    return (
      <div aria-busy="true">
        <p className="flex items-center gap-2 text-white/80">Al aire ahora</p>
        <p className="titular mt-2 text-5xl text-white/40 sm:text-7xl">Cargando…</p>
      </div>
    );
  }

  const r = alAire(horarios, ahora, programaPorDefecto);
  const p = programaPorSlug(r.actual.programa)!;
  const sig = programaPorSlug(r.siguiente.programa);
  const voces = p.locutores.map((s) => locutorPorSlug(s)?.nombre).filter(Boolean);
  const hoy = horaColombia(ahora).dia;
  const fin = r.actual.fin >= 1440 ? "medianoche" : horaBonita(aHHMM(r.actual.fin));

  return (
    <div>
      <p className="flex items-center gap-2 text-white/85">
        <span className="punto-vivo" aria-hidden="true" />
        Al aire ahora, hasta {conArticulo(fin)}
      </p>
      <h1 className="titular mt-3 text-[clamp(2.8rem,9vw,6.5rem)] text-white">
        <Link href={`/programas/${p.slug}/`} className="hover:text-amarillo-suave">
          {p.nombre}
        </Link>
      </h1>
      <p className="mt-3 max-w-xl text-lg text-white/85">
        {voces.length ? <>Con {voces.join(" y ")}. </> : null}
        {sig ? (
          <>
            Sigue <strong className="text-white">{sig.nombre}</strong>
            {r.siguiente.dia !== hoy ? ` el ${NOMBRES_DIA[r.siguiente.dia].toLowerCase()}` : ""}{" "}
            {aLaHora(horaBonita(aHHMM(r.siguiente.inicio)))}
            {horaBonita(aHHMM(r.siguiente.inicio)).endsWith(".") ? "" : "."}
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <BotonEscuchar grande />
        <Link href="/programacion/" className="btn btn-borde px-6 py-3 text-lg text-white">
          Ver la programación
        </Link>
      </div>
    </div>
  );
}
