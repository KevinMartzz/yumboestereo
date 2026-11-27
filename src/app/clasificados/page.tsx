import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { ListaClasificados } from "@/components/Listas";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

export const metadata: Metadata = { title: "Clasificados" };

export default function Clasificados() {
  return (
    <>
      <Cabecera titulo="Clasificados">
        Empleo, arriendos, ventas y servicios de la comunidad. Cada aviso se retira solo cuando vence.
      </Cabecera>
      <section className="mx-auto max-w-6xl px-4">
        <ListaClasificados />
        <div className="mt-10 rounded-xl bg-hoja p-6">
          <h2 className="titular text-3xl">Publica tu clasificado</h2>
          <p className="mt-2 max-w-xl text-gris">
            Escríbenos con el texto del aviso y por cuánto tiempo lo quieres. Lo publicamos en la web y lo leemos
            al aire.
          </p>
          <a
            className="btn btn-monte mt-4"
            href={enlaceWhatsApp(emisora.whatsappComercial, "Hola Yumbo Estéreo. Quiero publicar un clasificado.")}
          >
            Enviar mi clasificado por WhatsApp
          </a>
        </div>
        <p className="mt-6 text-sm text-gris">Avisos de ejemplo con teléfonos ficticios.</p>
      </section>
    </>
  );
}
