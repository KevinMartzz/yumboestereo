import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { emisora } from "@/data/emisora";

export const metadata: Metadata = { title: "Tratamiento de datos personales" };

export default function Privacidad() {
  return (
    <>
      <Cabecera titulo="Tratamiento de datos personales">
        <span className="marca-ejemplo">Borrador</span> Texto base para revisar con un abogado antes de publicarlo.
      </Cabecera>
      <div className="prosa mx-auto max-w-6xl px-4 text-lg">
        <p>
          <strong>Responsable:</strong> Yumbo Estéreo 107.0 FM, [razón social por confirmar], NIT [por confirmar],
          con domicilio en {emisora.direccion}. Correo para temas de datos: [por confirmar].
        </p>
        <p>
          <strong>Norma aplicable:</strong> Ley 1581 de 2012 y su reglamentación (Decreto 1074 de 2015, que
          compila el Decreto 1377 de 2013).
        </p>
        <p>
          <strong>Qué datos recogemos:</strong> nombre, teléfono o correo y el mensaje que nos envías por los
          formularios, WhatsApp o redes. Para medir las visitas usamos una analítica que no guarda datos
          personales ni usa cookies de seguimiento.
        </p>
        <p>
          <strong>Para qué:</strong> responder tu mensaje, gestionar tu participación al aire, cotizar y
          gestionar pauta o clasificados, y mejorar nuestros canales de atención.
        </p>
        <p>
          <strong>Tus derechos:</strong> conocer, actualizar, rectificar y suprimir tus datos, revocar la
          autorización y presentar quejas ante la Superintendencia de Industria y Comercio. Para ejercerlos,
          escríbenos al correo de arriba; respondemos consultas en máximo 10 días hábiles y reclamos en máximo 15.
        </p>
        <p>
          <strong>Vigencia:</strong> conservamos los datos mientras dure la finalidad para la que los diste.
        </p>
      </div>
    </>
  );
}
