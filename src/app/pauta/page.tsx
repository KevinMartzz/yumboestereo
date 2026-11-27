import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { FormularioPauta } from "@/components/Formularios";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

export const metadata: Metadata = { title: "Pauta con nosotros" };

// Los cuatro servicios vienen de la web actual de la emisora.
const SERVICIOS = [
  { nombre: "Cuñas publicitarias", texto: "Mensajes grabados que suenan en la programación." },
  { nombre: "Menciones en vivo", texto: "El locutor nombra tu marca durante el programa." },
  { nombre: "Publicidad para negocios", texto: "Difusión para tu comercio, emprendimiento o evento." },
  { nombre: "Planes en Facebook e Instagram", texto: "Tu mensaje también en las redes de la emisora." },
];

export default function Pauta() {
  return (
    <>
      <Cabecera titulo="Pauta con nosotros">
        Lleva tu negocio, servicio o evento a la gente de Yumbo. Armamos la pauta según tu presupuesto.
      </Cabecera>
      <div className="mx-auto grid max-w-6xl gap-14 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-12">
          <section>
            <h2 className="titular text-3xl">Qué ofrecemos</h2>
            <dl className="mt-4 divide-y divide-linea border-y border-linea">
              {SERVICIOS.map((s) => (
                <div key={s.nombre} className="py-4">
                  <dt className="text-lg font-bold">{s.nombre}</dt>
                  <dd className="text-gris">{s.texto}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2 className="titular text-3xl">Dónde nos escuchan</h2>
            <p className="mt-2 text-gris">El casco urbano de Yumbo y estos corregimientos:</p>
            <p className="titular-ancho mt-3 text-xl text-monte">{emisora.cobertura.join(", ")}.</p>
          </section>
          <section className="rounded-xl bg-hoja p-6">
            <h2 className="titular text-3xl">Audiencia</h2>
            <p className="mt-2 text-gris">
              Aquí irán las cifras reales: oyentes por internet, visitas a la web y clics en cada banner. Se
              publican cuando la medición lleve unas semanas funcionando.
            </p>
          </section>
        </div>
        <section>
          <h2 className="titular text-3xl">Pide una cotización</h2>
          <p className="mt-2 mb-6 text-gris">
            Llega directo al equipo comercial. Si prefieres hablar ya,{" "}
            <a
              className="font-bold text-monte underline"
              href={enlaceWhatsApp(emisora.whatsappComercial, "Hola Yumbo Estéreo. Quiero recibir asesoría para una pauta comercial.")}
            >
              escríbenos por WhatsApp
            </a>
            .
          </p>
          <FormularioPauta />
        </section>
      </div>
    </>
  );
}
