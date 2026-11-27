"use client";

import Link from "next/link";
import { TituloPanel } from "@/components/panel/MarcoPanel";
import { fechaHora } from "@/lib/formato";
import { useDemo } from "@/lib/store";
import type { EstadoNoticia } from "@/data/noticias";

const TEXTO_ESTADO: Record<EstadoNoticia, string> = {
  borrador: "Borrador",
  programada: "Programada",
  publicada: "Publicada",
};
const COLOR_ESTADO: Record<EstadoNoticia, string> = {
  borrador: "bg-papel text-gris",
  programada: "bg-amarillo-suave text-noche",
  publicada: "bg-monte text-white",
};

export default function ListaNoticiasPanel() {
  const { noticias } = useDemo();
  const orden = [...noticias].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  return (
    <>
      <TituloPanel
        titulo="Noticias"
        acciones={
          <Link href="/panel/noticias/editar/?id=nueva" className="btn btn-monte">
            Escribir una noticia
          </Link>
        }
      >
        Los borradores no se ven en la web. Las programadas salen solas a la hora que elijas.
      </TituloPanel>
      <div className="overflow-x-auto rounded-xl border border-linea bg-white">
        <table className="w-full min-w-[42rem] text-left">
          <thead className="border-b border-linea text-sm text-gris">
            <tr>
              <th className="px-4 py-3 font-bold">Título</th>
              <th className="px-4 py-3 font-bold">Estado</th>
              <th className="px-4 py-3 font-bold">Tema y zona</th>
              <th className="px-4 py-3 font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {orden.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-3">
                  <Link href={`/panel/noticias/editar/?id=${n.id}`} className="font-bold text-monte hover:underline">
                    {n.titulo}
                  </Link>
                  {n.origen === "ia" ? <span className="ml-2 text-sm text-gris">desde Noticias con IA</span> : null}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${COLOR_ESTADO[n.estado]}`}>
                    {TEXTO_ESTADO[n.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gris">
                  {n.categoria}, {n.zona}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap text-gris">{fechaHora(n.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
