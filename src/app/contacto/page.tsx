import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { FormularioContacto } from "@/components/Formularios";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

export const metadata: Metadata = { title: "Contacto" };

export default function Contacto() {
  return (
    <>
      <Cabecera titulo="Contacto">Escríbenos para participar, pedir una canción o enviar una sugerencia.</Cabecera>
      <div className="mx-auto grid max-w-6xl gap-14 px-4 lg:grid-cols-[1fr_1.2fr]">
        <dl className="space-y-6 text-lg">
          <div>
            <dt className="font-bold">Dirección</dt>
            <dd className="text-gris">{emisora.direccion}</dd>
          </div>
          <div>
            <dt className="font-bold">Teléfono</dt>
            <dd>
              <a className="text-monte underline" href={`tel:+57${emisora.telefono.replace(/\D/g, "")}`}>
                {emisora.telefono}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">WhatsApp para oyentes</dt>
            <dd>
              <a className="text-monte underline" href={enlaceWhatsApp(emisora.whatsappParticipacion)}>
                +57 311 605 8828
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">WhatsApp comercial</dt>
            <dd>
              <a className="text-monte underline" href={enlaceWhatsApp(emisora.whatsappComercial)}>
                +57 315 199 5633
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">Correo</dt>
            <dd className="text-gris">Por confirmar con la emisora</dd>
          </div>
        </dl>
        <FormularioContacto />
      </div>
    </>
  );
}
