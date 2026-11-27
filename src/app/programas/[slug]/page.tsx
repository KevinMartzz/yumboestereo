import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { programas, programaPorSlug } from "@/data/programas";
import { locutorPorSlug } from "@/data/locutores";
import { HorariosPrograma } from "@/components/Parrilla";
import { BotonEscuchar } from "@/components/AlAire";
import { iniciales } from "@/lib/formato";

export const dynamicParams = false;
export function generateStaticParams() {
  return programas.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = programaPorSlug((await params).slug);
  return p ? { title: p.nombre, description: p.descripcion, openGraph: { title: p.nombre, description: p.descripcion } } : {};
}

export default async function PaginaPrograma({ params }: { params: Promise<{ slug: string }> }) {
  const p = programaPorSlug((await params).slug);
  if (!p) notFound();
  const voces = p.locutores.map(locutorPorSlug).filter((l) => !!l);

  // Programa que se repite cada semana: RadioSeries (no Event, que es para fechas puntuales).
  const ld = {
    "@context": "https://schema.org",
    "@type": "RadioSeries",
    name: p.nombre,
    description: p.descripcion,
    genre: p.tipo,
    actor: voces.map((l) => ({ "@type": "Person", name: l.nombre })),
    publisher: { "@type": "RadioStation", name: "Yumbo Estéreo 107.0 FM" },
  };

  return (
    <article className="mx-auto max-w-6xl px-4 pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="text-sm font-bold text-vino">{p.tipo}</p>
      <h1 className="titular mt-2 text-[clamp(2.8rem,8vw,5.5rem)] text-monte">{p.nombre}</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="prosa text-xl">{p.descripcion}</p>
          <div className="mt-6">
            <BotonEscuchar />
          </div>
          <h2 className="titular mt-12 text-3xl">Episodios y podcasts</h2>
          <p className="mt-2 text-gris">
            Aquí aparecerán los programas grabados cuando la emisora los suba desde el panel.
          </p>
        </div>
        <aside className="space-y-10">
          <section>
            <h2 className="titular text-3xl">Horario</h2>
            <div className="mt-3">
              <HorariosPrograma slug={p.slug} />
            </div>
          </section>
          {voces.length ? (
            <section>
              <h2 className="titular text-3xl">Lo presentan</h2>
              <ul className="mt-3 space-y-3">
                {voces.map((l) => (
                  <li key={l.slug}>
                    <Link href={`/locutores/${l.slug}/`} className="group flex items-center gap-3">
                      <span className="titular grid size-12 place-items-center rounded-full bg-monte text-lg text-amarillo">
                        {iniciales(l.nombre)}
                      </span>
                      <span>
                        <span className="block font-bold group-hover:underline">{l.nombre}</span>
                        <span className="text-sm text-gris">{l.rol}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
