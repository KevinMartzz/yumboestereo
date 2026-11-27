"use client";

// La parrilla de hoy dibujada como la escala de un sintonizador FM:
// cada programa ocupa su tramo del día y la aguja amarilla marca la hora actual.

import Link from "next/link";
import { useEffect, useRef } from "react";
import { programaPorDefecto } from "@/data/emisora";
import { programaPorSlug } from "@/data/programas";
import { aHHMM, horaColombia, MIN_DIA, tramosDelDia } from "@/lib/horario";
import { horaBonita } from "@/lib/formato";
import { useAhora, useDemo } from "@/lib/store";

export function Dial() {
  const { horarios } = useDemo();
  const ahora = useAhora();
  const caja = useRef<HTMLDivElement>(null);
  const centrado = useRef(false);

  const hora = ahora ? horaColombia(ahora) : null;
  const tramos = hora ? tramosDelDia(horarios, hora.dia, programaPorDefecto) : [];
  const pos = hora ? (hora.minutos / MIN_DIA) * 100 : 0;

  // En el celular el dial es más ancho que la pantalla: se centra en la aguja una vez.
  useEffect(() => {
    const c = caja.current;
    if (!c || !hora || centrado.current) return;
    centrado.current = true;
    c.scrollLeft = (c.scrollWidth * pos) / 100 - c.clientWidth / 2;
  }, [hora, pos]);

  return (
    <div className="relative">
      <div
        ref={caja}
        className="overflow-x-auto pb-2 [scrollbar-color:rgba(255,255,255,.3)_transparent]"
        tabIndex={0}
        aria-label="Programación de hoy"
      >
        <div className="relative min-w-[1100px] pt-2">
          {/* Tramos */}
          <ol className="relative flex h-20">
            {tramos.map((t) => {
              const p = programaPorSlug(t.programa);
              const actual = hora && hora.minutos >= t.inicio && hora.minutos < t.fin;
              const relleno = t.franjaId === null;
              return (
                <li
                  key={`${t.programa}-${t.inicio}`}
                  style={{ width: `${((t.fin - t.inicio) / MIN_DIA) * 100}%` }}
                  className={`relative min-w-0 border-l border-white/25 first:border-l-0 ${
                    actual ? "bg-amarillo/15" : ""
                  }`}
                >
                  <Link
                    href={`/programas/${t.programa}/`}
                    className={`flex h-full flex-col justify-end px-2 pb-2 hover:bg-white/10 ${
                      relleno ? "text-white/55" : "text-white"
                    }`}
                    title={`${p?.nombre}: ${horaBonita(aHHMM(t.inicio))} a ${horaBonita(aHHMM(t.fin))}`}
                  >
                    <span className={`truncate text-sm leading-tight font-bold ${actual ? "text-amarillo" : ""}`}>
                      {p?.nombre}
                    </span>
                    <span className="cifras truncate text-xs text-white/60">{aHHMM(t.inicio)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* Escala con marcas cada 15 minutos y números cada 2 horas */}
          <div className="dial-escala relative h-5 border-t-2 border-white/60" aria-hidden="true" />
          <div className="relative h-6" aria-hidden="true">
            {Array.from({ length: 13 }, (_, i) => i * 2).map((h) => (
              <span
                key={h}
                className="cifras absolute -translate-x-1/2 text-sm text-white/70 first:translate-x-0 last:-translate-x-full"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Aguja */}
          {hora ? (
            <div
              className="pointer-events-none absolute top-0 bottom-6 w-0.5 bg-amarillo"
              style={{ left: `${pos}%` }}
              aria-hidden="true"
            >
              <span className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-amarillo" />
            </div>
          ) : null}
        </div>
      </div>
      {!hora ? <p className="text-white/70">Cargando la programación de hoy…</p> : null}
    </div>
  );
}
