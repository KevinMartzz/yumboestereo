import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

export const metadata: Metadata = { title: "Participa" };

export default function Comunidad() {
  return (
    <>
      <Cabecera titulo="Participa">
        La emisora es de la gente de Yumbo. Cuéntanos tus historias, actividades y propuestas.
      </Cabecera>
      <div className="mx-auto max-w-6xl px-4">
        <a
          href={enlaceWhatsApp(emisora.whatsappParticipacion, "Hola Yumbo Estéreo. Quiero compartir una historia, actividad o propuesta para la emisora.")}
          className="btn btn-monte px-6 py-3 text-lg"
        >
          Escribir por WhatsApp
        </a>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          <section>
            <h2 className="titular text-3xl">Cuéntanos tu historia</h2>
            <p className="mt-2 text-gris">
              Una actividad en tu barrio, un emprendimiento o un tema que deba escucharse. Lo llevamos al aire.
            </p>
          </section>
          <section>
            <h2 className="titular text-3xl">Entrevistas al pueblo</h2>
            <p className="mt-2 text-gris">Voces e iniciativas de nuestra gente, en video.</p>
            <a href={emisora.facebook} className="mt-3 inline-block font-bold text-monte underline underline-offset-4">
              Verlas en Facebook
            </a>
          </section>
          <section>
            <h2 className="titular text-3xl">Convocatorias</h2>
            <p className="mt-2 text-gris">
              Oportunidades y avisos para la comunidad. En la versión final la emisora las publica desde el panel.
            </p>
            <a href={emisora.instagram} className="mt-3 inline-block font-bold text-monte underline underline-offset-4">
              Ver en Instagram
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
