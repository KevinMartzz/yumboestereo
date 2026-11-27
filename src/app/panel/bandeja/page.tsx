"use client";

import { useState } from "react";
import { TituloPanel } from "@/components/panel/MarcoPanel";
import { fechaHora } from "@/lib/formato";
import { cambiar, ESTADOS_SOLICITUD, useDemo, type EstadoSolicitud } from "@/lib/store";

export default function Bandeja() {
  const { solicitudes, mensajes, rol } = useDemo();
  const verMensajes = rol === "administrador";
  const [pestana, setPestana] = useState<"pauta" | "mensajes">("pauta");

  return (
    <>
      <TituloPanel titulo="Bandeja">
        Lo que llega desde los formularios de la web. Nada se pierde en un correo personal.
      </TituloPanel>

      <div className="mb-5 flex gap-1 rounded-full border border-linea bg-white p-1 sm:w-max" role="group" aria-label="Qué ver">
        <button type="button" aria-pressed={pestana === "pauta"} onClick={() => setPestana("pauta")} className="rounded-full px-4 py-1.5 font-bold aria-pressed:bg-monte aria-pressed:text-white">
          Solicitudes de pauta ({solicitudes.length})
        </button>
        {verMensajes ? (
          <button type="button" aria-pressed={pestana === "mensajes"} onClick={() => setPestana("mensajes")} className="rounded-full px-4 py-1.5 font-bold aria-pressed:bg-monte aria-pressed:text-white">
            Mensajes ({mensajes.filter((m) => !m.leido).length} sin leer)
          </button>
        ) : null}
      </div>

      {pestana === "pauta" ? (
        <>
          <ul className="space-y-3">
            {solicitudes.map((s) => (
              <li key={s.id} className="grid gap-4 rounded-xl border border-linea bg-white p-4 md:grid-cols-[1fr_12rem]">
                <div>
                  <p className="font-bold">
                    {s.negocio} <span className="font-normal text-gris">({s.nombre})</span>
                  </p>
                  <p className="text-sm text-gris">
                    {s.interes}. {fechaHora(s.fecha)}. Tel. {s.telefono}
                  </p>
                  {s.mensaje ? <p className="mt-2">{s.mensaje}</p> : null}
                </div>
                <label>
                  <span className="etiqueta text-sm">Estado</span>
                  <select
                    className="campo"
                    value={s.estado}
                    onChange={(e) => {
                      const estado = e.target.value as EstadoSolicitud;
                      cambiar(
                        "solicitudes",
                        solicitudes.map((x) => (x.id === s.id ? { ...x, estado } : x)),
                        `Solicitud de ${s.negocio}: ${ESTADOS_SOLICITUD.find((x) => x.valor === estado)?.texto.toLowerCase()}`,
                      );
                    }}
                  >
                    {ESTADOS_SOLICITUD.map((e) => (
                      <option key={e.valor} value={e.valor}>
                        {e.texto}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gris">
            Más adelante, cada solicitud nueva puede enviarse sola a un CRM por webhook.
          </p>
        </>
      ) : (
        <ul className="space-y-3">
          {mensajes.map((m) => (
            <li key={m.id} className={`rounded-xl border bg-white p-4 ${m.leido ? "border-linea" : "border-monte"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {m.nombre} <span className="font-normal text-gris">({m.tema})</span>
                  </p>
                  <p className="text-sm text-gris">
                    {fechaHora(m.fecha)}. {m.contacto}
                  </p>
                  <p className="mt-2">{m.mensaje}</p>
                </div>
                {!m.leido ? (
                  <button
                    type="button"
                    className="btn btn-borde text-monte"
                    onClick={() =>
                      cambiar("mensajes", mensajes.map((x) => (x.id === m.id ? { ...x, leido: true } : x)), `Marcó como leído el mensaje de ${m.nombre}`)
                    }
                  >
                    Marcar como leído
                  </button>
                ) : (
                  <span className="text-sm text-gris">Leído</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
