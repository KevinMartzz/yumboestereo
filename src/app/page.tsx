import Link from "next/link";
import { AlAireAhora } from "@/components/AlAire";
import { Dial } from "@/components/Dial";
import { ListaClasificados, NoticiasPortada } from "@/components/Listas";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "RadioStation",
  name: "Yumbo Estéreo 107.0 FM",
  description: emisora.descripcion,
  telephone: emisora.telefono,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle 10 #6-43",
    addressLocality: "Yumbo",
    addressRegion: "Valle del Cauca",
    addressCountry: "CO",
  },
  sameAs: [emisora.facebook, emisora.instagram],
};

export default function Inicio() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
      />

      <section className="sobre-oscuro bg-noche text-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:pt-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <AlAireAhora />
            <p className="hidden text-right lg:block" aria-hidden="true">
              <span className="cifras block text-[9rem] leading-[0.8] font-black text-amarillo [font-stretch:62%]">
                107.0
              </span>
              <span className="titular-ancho text-lg text-white/70">FM desde Yumbo</span>
            </p>
          </div>
          <div className="mt-12">
            <h2 className="mb-2 text-sm text-white/70">Hoy en el 107.0</h2>
            <Dial />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="titular text-5xl">Noticias de Yumbo</h2>
          <Link href="/noticias/" className="font-bold text-monte underline underline-offset-4">
            Todas las noticias
          </Link>
        </div>
        <NoticiasPortada />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="titular text-5xl">Clasificados</h2>
          <Link href="/clasificados/" className="font-bold text-vino underline underline-offset-4">
            Ver todos los clasificados
          </Link>
        </div>
        <ListaClasificados limite={3} />
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-10 rounded-2xl bg-monte p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="titular text-5xl">Nos escuchan en todo el municipio</h2>
            <p className="mt-4 max-w-md text-white/85">
              La señal llega al casco urbano y a los corregimientos. Si tienes un negocio, tu mensaje llega a
              esta gente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pauta/" className="btn btn-amarillo">
                Pautar con nosotros
              </Link>
              <a
                href={enlaceWhatsApp(emisora.whatsappParticipacion, "Hola Yumbo Estéreo. Quiero participar en la emisora.")}
                className="btn btn-borde text-white"
              >
                Participar por WhatsApp
              </a>
            </div>
          </div>
          <ul className="titular-ancho flex flex-wrap content-start gap-x-4 gap-y-1 text-xl text-amarillo-suave">
            {emisora.cobertura.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
