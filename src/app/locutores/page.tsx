import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { locutores } from "@/data/locutores";
import { programas } from "@/data/programas";
import { iniciales } from "@/lib/formato";

export const metadata: Metadata = { title: "Locutores" };

export default function Locutores() {
  return (
    <>
      <Cabecera titulo="Las voces del 107.0">Quienes hacen la emisora todos los días.</Cabecera>
      <ul className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {locutores.map((l) => {
          const suyos = programas.filter((p) => p.locutores.includes(l.slug));
          return (
            <li key={l.slug}>
              <Link href={`/locutores/${l.slug}/`} className="group block">
                <span className="titular grid aspect-square place-items-center rounded-2xl bg-monte text-7xl text-amarillo">
                  {iniciales(l.nombre)}
                </span>
                <span className="mt-3 block text-xl font-bold group-hover:underline">{l.nombre}</span>
                <span className="block text-gris">{l.rol}</span>
              </Link>
              <p className="mt-1 text-sm text-gris">
                {suyos.length ? suyos.map((p) => p.nombre).join(", ") : "Programas por confirmar"}
              </p>
              {l.ejemplo ? <span className="marca-ejemplo mt-2">Persona de ejemplo</span> : null}
            </li>
          );
        })}
      </ul>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-sm text-gris">
        Las fotos se suben desde el panel; la web las recorta y comprime sola.
      </p>
    </>
  );
}
