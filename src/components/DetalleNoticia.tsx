"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { noticiasEjemplo, type Noticia } from "@/data/noticias";
import { fechaLarga } from "@/lib/formato";
import { useAhora, useDemo } from "@/lib/store";

function Cuerpo({ n, vistaPrevia }: { n: Noticia; vistaPrevia?: boolean }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: n.titulo,
    description: n.resumen,
    datePublished: n.fecha,
    author: { "@type": "Organization", name: n.autor },
    publisher: { "@type": "RadioStation", name: "Yumbo Estéreo 107.0 FM" },
    contentLocation: { "@type": "Place", name: n.zona },
  };
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12">
      {!vistaPrevia ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null}
      <p className="font-bold text-vino">
        {n.categoria}, {n.zona}
      </p>
      <h1 className="titular mt-2 text-[clamp(2.4rem,6vw,4rem)] text-monte">{n.titulo}</h1>
      <p className="mt-4 text-xl text-gris">{n.resumen}</p>
      <p className="mt-4 border-y border-linea py-3 text-sm text-gris">
        {n.autor}, {fechaLarga(n.fecha)} <span className="marca-ejemplo ml-1">Nota de ejemplo</span>
      </p>
      <div className="prosa mt-8 text-lg">
        {n.cuerpo.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {n.fuentes?.length ? (
        <section className="mt-10 rounded-xl border border-linea bg-hoja p-5">
          <h2 className="font-bold">Fuentes</h2>
          <p className="text-sm text-gris">Esta nota resume lo publicado por estos medios. Lee el original en cada enlace.</p>
          <ul className="mt-3 space-y-2">
            {n.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} className="font-bold text-monte underline underline-offset-4" rel="noopener">
                  {f.medio}
                </a>
                : {f.titulo}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-10">
        <Link href="/noticias/" className="font-bold text-monte underline underline-offset-4">
          Volver a noticias
        </Link>
      </p>
    </article>
  );
}

/** Página de una nota. Si la emisora la editó en el panel de la demo, muestra la versión editada. */
export function DetalleNoticia({ id }: { id: string }) {
  const { noticias } = useDemo();
  const ahora = useAhora();
  const n = noticias.find((x) => x.id === id) ?? noticiasEjemplo.find((x) => x.id === id);
  if (!n) return <NoEncontrada />;
  const publica = n.estado === "publicada" || (n.estado === "programada" && ahora && new Date(n.fecha) <= ahora);
  if (!publica && ahora) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12">
        <p className="rounded-lg bg-amarillo-suave p-4">
          Esta nota todavía no está publicada ({n.estado === "programada" ? `sale el ${fechaLarga(n.fecha)}` : "es un borrador"}).
          Puedes verla en la <Link className="font-bold underline" href={`/panel/noticias/editar/?id=${n.id}`}>vista previa del panel</Link>.
        </p>
      </div>
    );
  }
  return <Cuerpo n={n} />;
}

export function DetalleNoticiaPorParametro() {
  const id = useSearchParams().get("id") ?? "";
  return <DetalleNoticia id={id} />;
}

export function VistaPrevia({ n }: { n: Noticia }) {
  return <Cuerpo n={n} vistaPrevia />;
}

function NoEncontrada() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <h1 className="titular text-5xl text-monte">No encontramos esa nota</h1>
      <p className="mt-4">
        Puede que la hayan borrado.{" "}
        <Link href="/noticias/" className="font-bold underline">
          Ver todas las noticias
        </Link>
      </p>
    </div>
  );
}
