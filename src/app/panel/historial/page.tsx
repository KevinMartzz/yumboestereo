"use client";

import { TituloPanel } from "@/components/panel/MarcoPanel";
import { fechaHora } from "@/lib/formato";
import { deshacer, useDemo } from "@/lib/store";

export default function Historial() {
  const { historial } = useDemo();
  return (
    <>
      <TituloPanel titulo="Historial">
        Cada cambio queda registrado. Si algo salió mal, deshazlo y la web vuelve a como estaba.
      </TituloPanel>
      {historial.length ? (
        <ul className="divide-y divide-linea rounded-xl border border-linea bg-white">
          {historial.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className={c.deshecho ? "text-gris line-through" : ""}>{c.descripcion}</p>
                <p className="text-sm text-gris">{fechaHora(c.fecha)}</p>
              </div>
              {c.deshecho ? (
                <span className="text-sm text-gris">Deshecho</span>
              ) : (
                <button type="button" className="btn btn-borde text-vino" onClick={() => deshacer(c.id)}>
                  Deshacer
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-linea bg-white p-6 text-gris">
          Todavía no hay cambios. Cuando alguien edite un horario, una noticia o un clasificado, aparecerá aquí.
        </p>
      )}
    </>
  );
}
