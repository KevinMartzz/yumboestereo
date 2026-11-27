import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locutores, locutorPorSlug } from "@/data/locutores";
import { programas } from "@/data/programas";
import { iniciales } from "@/lib/formato";

export const dynamicParams = false;
export function generateStaticParams() {
  return locutores.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = locutorPorSlug((await params).slug);
  return l ? { title: l.nombre } : {};
}

export default async function PaginaLocutor({ params }: { params: Promise<{ slug: string }> }) {
  const l = locutorPorSlug((await params).slug);
  if (!l) notFound();
  const suyos = programas.filter((p) => p.locutores.includes(l.slug));
  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 md:grid-cols-[18rem_1fr]">
      <span className="titular grid aspect-square place-items-center rounded-2xl bg-monte text-8xl text-amarillo">
        {iniciales(l.nombre)}
      </span>
      <div>
        <p className="font-bold text-vino">{l.rol}</p>
        <h1 className="titular mt-1 text-6xl text-monte">{l.nombre}</h1>
        {l.ejemplo ? <span className="marca-ejemplo mt-3">Persona de ejemplo</span> : null}
        <p className="prosa mt-6 text-lg">{l.bio}</p>
        <h2 className="titular mt-10 text-3xl">Programas</h2>
        {suyos.length ? (
          <ul className="mt-3 space-y-2">
            {suyos.map((p) => (
              <li key={p.slug}>
                <Link href={`/programas/${p.slug}/`} className="text-lg font-bold text-monte underline underline-offset-4">
                  {p.nombre}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gris">Por confirmar con la emisora.</p>
        )}
      </div>
    </article>
  );
}
