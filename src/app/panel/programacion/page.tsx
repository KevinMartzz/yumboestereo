"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Aviso, TituloPanel } from "@/components/panel/MarcoPanel";
import { programas, programaPorSlug } from "@/data/programas";
import { programaPorDefecto } from "@/data/emisora";
import { aMinutos, describirDias, NOMBRES_DIA, solapamientos, type Dia, type Franja } from "@/lib/horario";
import { cambiar, nuevoId, useDemo } from "@/lib/store";

const ORDEN: Dia[] = [1, 2, 3, 4, 5, 6, 0];
const elegibles = programas.filter((p) => p.slug !== programaPorDefecto);

// Orden de lunes a domingo y por hora. Se ordena solo al cargar, para que las
// filas no salten mientras se editan.
const primerDia = (f: Franja) => Math.min(...f.dias.map((d) => ORDEN.indexOf(d)));
const ordenar = (l: Franja[]) =>
  [...l].sort((a, b) => primerDia(a) - primerDia(b) || aMinutos(a.inicio) - aMinutos(b.inicio));

export default function EditorProgramacion() {
  const { horarios } = useDemo();
  const guardadas = useMemo(() => ordenar(horarios), [horarios]);
  const [borrador, setBorrador] = useState<Franja[]>(guardadas);
  const [guardado, setGuardado] = useState(false);

  // Si cambia lo guardado (por ejemplo, al deshacer desde el historial), se recarga.
  useEffect(() => setBorrador(guardadas), [guardadas]);

  const sucio = JSON.stringify(borrador) !== JSON.stringify(guardadas);
  const choques = useMemo(() => solapamientos(borrador), [borrador]);
  const conChoque = new Set(choques.flatMap((c) => [c.a, c.b]));
  const errores = borrador.filter((f) => !f.dias.length || f.inicio === f.fin);


  const editar = (id: string, cambio: Partial<Franja>) => {
    setGuardado(false);
    setBorrador((l) => l.map((f) => (f.id === id ? { ...f, ...cambio } : f)));
  };

  const guardar = () => {
    const nombres = new Set<string>();
    for (const f of borrador) {
      const antes = horarios.find((h) => h.id === f.id);
      if (!antes || JSON.stringify(antes) !== JSON.stringify(f)) nombres.add(programaPorSlug(f.programa)?.nombre ?? f.programa);
    }
    for (const h of horarios) if (!borrador.some((f) => f.id === h.id)) nombres.add(programaPorSlug(h.programa)?.nombre ?? h.programa);
    cambiar("horarios", borrador, `Programación: cambió ${[...nombres].join(", ") || "la parrilla"}`);
    setGuardado(true);
  };

  return (
    <>
      <TituloPanel
        titulo="Programación"
        acciones={
          <Link href="/programacion/" className="font-bold text-monte underline">
            Ver la parrilla en la web
          </Link>
        }
      >
        Cada fila es un programa que se repite cada semana. Si un programa termina después de medianoche, pon una hora
        de fin menor que la de inicio (por ejemplo, de 22:00 a 02:00). Donde no hay programa suena «Señal musical».
      </TituloPanel>

      <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-linea bg-hoja/95 px-4 py-3 backdrop-blur">
        <button type="button" className="btn btn-monte" disabled={!sucio || errores.length > 0} onClick={guardar}>
          Guardar cambios
        </button>
        <button type="button" className="btn btn-borde text-gris" disabled={!sucio} onClick={() => setBorrador(guardadas)}>
          Descartar
        </button>
        <button
          type="button"
          className="btn btn-borde text-monte"
          onClick={() => {
            setGuardado(false);
            setBorrador((l) => [...l, { id: nuevoId("f"), programa: elegibles[0].slug, dias: [1], inicio: "11:00", fin: "12:00" }]);
          }}
        >
          Agregar programa a la parrilla
        </button>
        <span className="text-sm text-gris" aria-live="polite">
          {sucio ? "Tienes cambios sin guardar." : guardado ? "Guardado. Ya se ve en la web." : ""}
        </span>
      </div>

      {choques.length ? (
        <div className="mb-4">
          <Aviso tono="alerta">
            <strong>Hay programas que se cruzan.</strong> En la web gana el que empieza primero.
            <ul className="mt-1 list-disc pl-5">
              {choques.map((c) => (
                <li key={`${c.dia}${c.a}${c.b}`}>
                  {NOMBRES_DIA[c.dia]}: {programaPorSlug(borrador.find((f) => f.id === c.a)!.programa)?.nombre} y{" "}
                  {programaPorSlug(borrador.find((f) => f.id === c.b)!.programa)?.nombre}
                </li>
              ))}
            </ul>
          </Aviso>
        </div>
      ) : null}

      <ul className="space-y-3">
        {borrador.map((f) => {
          const p = programaPorSlug(f.programa);
          const invalida = !f.dias.length || f.inicio === f.fin;
          return (
            <li
              key={f.id}
              className={`rounded-xl border bg-white p-4 ${conChoque.has(f.id) || invalida ? "border-vino" : "border-linea"}`}
            >
              <fieldset className="grid gap-4 xl:grid-cols-[1.2fr_2fr_auto_auto_auto] xl:items-end">
                <legend className="sr-only">
                  {p?.nombre}, {describirDias(f.dias)}
                </legend>
                <label>
                  <span className="etiqueta">Programa</span>
                  <select className="campo" value={f.programa} onChange={(e) => editar(f.id, { programa: e.target.value })}>
                    {elegibles.map((x) => (
                      <option key={x.slug} value={x.slug}>
                        {x.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="etiqueta">Días</span>
                  <div className="flex flex-wrap gap-1">
                    {ORDEN.map((d) => {
                      const activo = f.dias.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={activo}
                          aria-label={NOMBRES_DIA[d]}
                          onClick={() =>
                            editar(f.id, { dias: activo ? f.dias.filter((x) => x !== d) : [...f.dias, d] })
                          }
                          className="h-10 w-11 rounded-lg border-2 border-monte font-bold text-monte aria-pressed:bg-monte aria-pressed:text-white"
                        >
                          {NOMBRES_DIA[d].slice(0, 2)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label>
                  <span className="etiqueta">Empieza</span>
                  <input type="time" className="campo" value={f.inicio} onChange={(e) => editar(f.id, { inicio: e.target.value })} required />
                </label>
                <label>
                  <span className="etiqueta">Termina</span>
                  <input type="time" className="campo" value={f.fin} onChange={(e) => editar(f.id, { fin: e.target.value })} required />
                </label>
                <button
                  type="button"
                  className="btn text-vino hover:bg-vino/10"
                  onClick={() => {
                    setGuardado(false);
                    setBorrador((l) => l.filter((x) => x.id !== f.id));
                  }}
                >
                  Quitar
                </button>
              </fieldset>
              {invalida ? (
                <p className="mt-2 text-sm font-bold text-vino">
                  {!f.dias.length ? "Elige al menos un día." : "La hora de inicio y la de fin no pueden ser iguales."}
                </p>
              ) : f.fin <= f.inicio && f.fin !== "00:00" ? (
                <p className="mt-2 text-sm text-gris">Termina al día siguiente.</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
