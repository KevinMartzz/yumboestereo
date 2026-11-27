"use client";

import { useState } from "react";
import { Aviso, TituloPanel } from "@/components/panel/MarcoPanel";
import { CATEGORIAS_CLASIFICADO, type Clasificado } from "@/data/clasificados";
import { ZONAS } from "@/data/noticias";
import { cambiar, nuevoId, useAhora, useDemo } from "@/lib/store";

export default function ClasificadosPanel() {
  const { clasificados } = useDemo();
  const ahora = useAhora();
  const hoy = ahora ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(ahora) : "";
  const [ok, setOk] = useState("");

  return (
    <>
      <TituloPanel titulo="Clasificados">
        Escribe el aviso y su fecha de vencimiento. Ese día desaparece solo de la web.
      </TituloPanel>

      <form
        className="mb-8 grid gap-4 rounded-xl border border-linea bg-white p-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const nuevo: Clasificado = {
            id: nuevoId("c"),
            titulo: String(f.get("titulo")),
            categoria: f.get("categoria") as Clasificado["categoria"],
            texto: String(f.get("texto")),
            contacto: String(f.get("contacto")),
            zona: String(f.get("zona")),
            vence: String(f.get("vence")),
          };
          cambiar("clasificados", [nuevo, ...clasificados], `Publicó el clasificado «${nuevo.titulo}»`);
          e.currentTarget.reset();
          setOk(`Publicado: «${nuevo.titulo}». Ya se ve en la web.`);
        }}
      >
        <label className="md:col-span-2">
          <span className="etiqueta">Título del aviso</span>
          <input name="titulo" required className="campo" />
        </label>
        <label>
          <span className="etiqueta">Categoría</span>
          <select name="categoria" className="campo">
            {CATEGORIAS_CLASIFICADO.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Zona</span>
          <select name="zona" className="campo">
            {ZONAS.slice(0, 11).map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="etiqueta">Texto</span>
          <textarea name="texto" required rows={3} className="campo" />
          <span className="ayuda">Máximo tres líneas. Es el mismo texto que se lee al aire.</span>
        </label>
        <label>
          <span className="etiqueta">Teléfono de contacto</span>
          <input name="contacto" required className="campo" />
        </label>
        <label>
          <span className="etiqueta">Vence el</span>
          <input name="vence" type="date" required min={hoy} className="campo" />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-monte">Publicar el clasificado</button>
        </div>
      </form>

      {ok ? (
        <div className="mb-6">
          <Aviso tono="ok">{ok}</Aviso>
        </div>
      ) : null}

      <ul className="divide-y divide-linea rounded-xl border border-linea bg-white">
        {clasificados.map((c) => {
          const vencido = hoy && c.vence < hoy;
          return (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-bold">{c.titulo}</p>
                <p className="text-sm text-gris">
                  {c.categoria}, {c.zona}. {vencido ? <strong className="text-vino">Vencido, ya no se ve en la web</strong> : `Vence el ${c.vence}`}
                </p>
              </div>
              <button
                type="button"
                className="btn text-vino hover:bg-vino/10"
                onClick={() => cambiar("clasificados", clasificados.filter((x) => x.id !== c.id), `Borró el clasificado «${c.titulo}»`)}
              >
                Borrar
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
