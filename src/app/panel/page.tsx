"use client";

import Link from "next/link";
import { TituloPanel } from "@/components/panel/MarcoPanel";
import { programaPorDefecto } from "@/data/emisora";
import { programaPorSlug } from "@/data/programas";
import { alAire } from "@/lib/horario";
import { fechaHora } from "@/lib/formato";
import { PERMISOS, useAhora, useDemo } from "@/lib/store";

export default function ResumenPanel() {
  const d = useDemo();
  const ahora = useAhora();
  const permitidas = PERMISOS[d.rol];
  const actual = ahora ? programaPorSlug(alAire(d.horarios, ahora, programaPorDefecto).actual.programa) : null;
  const borradores = d.noticias.filter((n) => n.estado === "borrador").length;
  const programadas = d.noticias.filter((n) => n.estado === "programada").length;
  const nuevas = d.solicitudes.filter((s) => s.estado === "nueva").length;
  const sinLeer = d.mensajes.filter((m) => !m.leido).length;

  const tarjetas = [
    { id: "programacion", href: "/panel/programacion/", titulo: "Cambiar un horario", texto: "Mueve, agrega o quita programas de la parrilla." },
    { id: "noticias", href: "/panel/noticias/editar/?id=nueva", titulo: "Escribir una noticia", texto: "Guárdala como borrador, prográmala o publícala." },
    { id: "noticias-ia", href: "/panel/noticias-ia/", titulo: "Ver lo último del país", texto: "Hechos agrupados, con resumen, fuentes y guion para el aire." },
    { id: "bandeja", href: "/panel/bandeja/", titulo: "Revisar la bandeja", texto: `${nuevas} solicitudes de pauta nuevas y ${sinLeer} mensajes sin leer.` },
    { id: "clasificados", href: "/panel/clasificados/", titulo: "Publicar un clasificado", texto: "Se retira solo cuando vence." },
  ].filter((t) => permitidas.includes(t.id));

  return (
    <>
      <TituloPanel titulo="Hola">
        Desde aquí cambian el contenido de la web sin programador. Al aire ahora:{" "}
        <strong className="text-tinta">{actual?.nombre ?? "…"}</strong>.
      </TituloPanel>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map((t) => (
          <li key={t.id}>
            <Link href={t.href} className="block h-full rounded-xl border border-linea bg-white p-5 hover:border-monte">
              <span className="titular text-2xl text-monte">{t.titulo}</span>
              <span className="mt-1 block text-gris">{t.texto}</span>
            </Link>
          </li>
        ))}
      </ul>

      {permitidas.includes("noticias") ? (
        <p className="mt-6 text-gris">
          Noticias: {borradores} en borrador y {programadas} programadas.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="titular text-3xl">Últimos cambios</h2>
        {d.historial.length ? (
          <ul className="mt-3 divide-y divide-linea rounded-xl border border-linea bg-white">
            {d.historial.slice(0, 5).map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                <span>{c.descripcion}</span>
                <span className="text-sm text-gris">{fechaHora(c.fecha)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-gris">Todavía no hay cambios. Prueba a mover un horario.</p>
        )}
      </section>
    </>
  );
}
