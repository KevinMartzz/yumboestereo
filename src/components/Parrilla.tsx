"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { programaPorDefecto } from "@/data/emisora";
import { programaPorSlug } from "@/data/programas";
import { locutorPorSlug } from "@/data/locutores";
import { aHHMM, describirDias, horaColombia, NOMBRES_DIA, tramosDelDia, type Dia } from "@/lib/horario";
import { horaBonita } from "@/lib/formato";
import { useAhora, useDemo } from "@/lib/store";

const ORDEN: Dia[] = [1, 2, 3, 4, 5, 6, 0];

export function ParrillaSemanal() {
  const { horarios } = useDemo();
  const ahora = useAhora();
  const hora = ahora ? horaColombia(ahora) : null;
  const [dia, setDia] = useState<Dia>(1);
  const [elegido, setElegido] = useState(false);

  useEffect(() => {
    if (hora && !elegido) setDia(hora.dia);
  }, [hora, elegido]);

  const tramos = tramosDelDia(horarios, dia, programaPorDefecto);

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex min-w-max gap-1 border-b-2 border-monte" role="group" aria-label="Día de la semana">
          {ORDEN.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={dia === d}
              onClick={() => {
                setDia(d);
                setElegido(true);
              }}
              className="rounded-t-lg px-4 py-2.5 font-bold text-monte hover:bg-hoja aria-pressed:bg-monte aria-pressed:text-white"
            >
              {NOMBRES_DIA[d]}
              {hora?.dia === d ? <span className="ml-1.5 font-normal opacity-80">(hoy)</span> : null}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-2" aria-label={`Programación del ${NOMBRES_DIA[dia].toLowerCase()}`}>
        {tramos.map((t) => {
          const p = programaPorSlug(t.programa)!;
          const enVivo = hora && hora.dia === dia && hora.minutos >= t.inicio && hora.minutos < t.fin;
          const voces = p.locutores.map((s) => locutorPorSlug(s)?.nombre).filter(Boolean);
          return (
            <li
              key={`${t.programa}-${t.inicio}`}
              className={`grid gap-1 border-b border-linea py-5 sm:grid-cols-[13rem_1fr] sm:gap-6 ${
                enVivo ? "-mx-4 bg-amarillo-suave/60 px-4" : ""
              }`}
            >
              <p className="cifras text-xl font-bold text-monte">
                {aHHMM(t.inicio)} a {t.fin >= 1440 ? "24:00" : aHHMM(t.fin)}
              </p>
              <div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link href={`/programas/${p.slug}/`} className="titular text-3xl hover:text-monte">
                    {p.nombre}
                  </Link>
                  {enVivo ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-vino">
                      <span className="punto-vivo" aria-hidden="true" />
                      Al aire
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-gris">
                  {p.tipo}
                  {voces.length ? `. Con ${voces.join(" y ")}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-gris">
        Horarios de ejemplo en hora de Colombia. La emisora los cambia desde el panel.
      </p>
    </>
  );
}

/** Horarios de un programa, leídos del panel. */
export function HorariosPrograma({ slug }: { slug: string }) {
  const { horarios } = useDemo();
  const propios = horarios.filter((f) => f.programa === slug);
  if (slug === programaPorDefecto) {
    return <p>Suena cuando no hay otro programa al aire.</p>;
  }
  if (!propios.length) return <p className="text-gris">Este programa no tiene horario asignado.</p>;
  return (
    <ul className="space-y-2">
      {propios.map((f) => (
        <li key={f.id} className="text-lg">
          <strong>{describirDias(f.dias)}</strong>, de {horaBonita(f.inicio)} a {horaBonita(f.fin)}
        </li>
      ))}
    </ul>
  );
}
