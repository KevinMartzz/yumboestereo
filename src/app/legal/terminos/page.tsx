import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";

export const metadata: Metadata = { title: "Términos de uso" };

export default function Terminos() {
  return (
    <>
      <Cabecera titulo="Términos de uso">
        <span className="marca-ejemplo">Borrador</span> Texto base para revisar antes de publicarlo.
      </Cabecera>
      <div className="prosa mx-auto max-w-6xl px-4 text-lg">
        <p>
          Este sitio ofrece la señal en vivo, la programación, noticias, clasificados y canales de contacto de
          Yumbo Estéreo 107.0 FM. Escuchar la emisora es gratis.
        </p>
        <p>
          Los textos, logos y piezas propias de la emisora no se pueden reproducir sin autorización. Las noticias
          que se basan en otros medios incluyen un resumen propio y el enlace al original.
        </p>
        <p>
          Los clasificados y mensajes de la comunidad son responsabilidad de quien los envía. La emisora puede
          no publicar avisos que sean engañosos, ofensivos o ilegales.
        </p>
        <p>
          La señal en vivo depende de proveedores externos y puede tener interrupciones.
        </p>
      </div>
    </>
  );
}
