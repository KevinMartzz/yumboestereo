"use client";

import Link from "next/link";
import { useState } from "react";
import { nuevoId, recibir } from "@/lib/store";

// En la versión real el formulario se envía al servidor, que valida Cloudflare
// Turnstile (antispam) y guarda la solicitud en Payload. En la demo se guarda en
// la bandeja del panel de este navegador.

function Aviso({ bandeja }: { bandeja: string }) {
  return (
    <div role="status" className="rounded-xl border-2 border-monte bg-hoja p-6">
      <h3 className="titular text-3xl text-monte">Recibimos tu mensaje</h3>
      <p className="mt-2">Te respondemos en horario laboral, de lunes a viernes.</p>
      <p className="mt-4 text-sm text-gris">
        Demo: el mensaje quedó en la{" "}
        <Link href="/panel/bandeja/" className="font-bold text-monte underline">
          {bandeja} del panel
        </Link>
        , no en un correo.
      </p>
    </div>
  );
}

function Consentimiento() {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" required className="mt-1 size-5 accent-monte" />
      <span>
        Autorizo el tratamiento de mis datos para responder este mensaje, según la{" "}
        <Link href="/legal/privacidad/" className="font-bold underline">
          política de tratamiento de datos
        </Link>
        .
      </span>
    </label>
  );
}

function Antispam() {
  return (
    <p className="text-sm text-gris">
      Aquí va la verificación antispam de Cloudflare Turnstile (no se carga en la demo).
    </p>
  );
}

export function FormularioContacto() {
  const [enviado, setEnviado] = useState(false);
  if (enviado) return <Aviso bandeja="bandeja de mensajes" />;
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        recibir("mensajes", {
          id: nuevoId("m"),
          fecha: new Date().toISOString(),
          nombre: String(f.get("nombre")),
          contacto: String(f.get("contacto")),
          tema: String(f.get("tema")),
          mensaje: String(f.get("mensaje")),
          leido: false,
        });
        setEnviado(true);
      }}
    >
      <div>
        <label className="etiqueta" htmlFor="c-nombre">Nombre</label>
        <input id="c-nombre" name="nombre" required autoComplete="name" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-contacto">Teléfono o correo</label>
        <input id="c-contacto" name="contacto" required autoComplete="tel" className="campo" />
        <span className="ayuda">Para poder responderte.</span>
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-tema">Tema</label>
        <select id="c-tema" name="tema" required className="campo" defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Participación</option>
          <option>Saludos y complacencias</option>
          <option>Clasificados</option>
          <option>Pauta comercial</option>
          <option>Otro</option>
        </select>
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-mensaje">Mensaje</label>
        <textarea id="c-mensaje" name="mensaje" required rows={5} className="campo" />
      </div>
      <Consentimiento />
      <Antispam />
      <button type="submit" className="btn btn-monte">Enviar mensaje</button>
    </form>
  );
}

export function FormularioPauta() {
  const [enviado, setEnviado] = useState(false);
  if (enviado) return <Aviso bandeja="bandeja de solicitudes" />;
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        recibir("solicitudes", {
          id: nuevoId("s"),
          fecha: new Date().toISOString(),
          nombre: String(f.get("nombre")),
          negocio: String(f.get("negocio")),
          telefono: String(f.get("telefono")),
          interes: String(f.get("interes")),
          mensaje: String(f.get("mensaje")),
          estado: "nueva",
        });
        setEnviado(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="p-nombre">Tu nombre</label>
          <input id="p-nombre" name="nombre" required autoComplete="name" className="campo" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="p-negocio">Negocio o entidad</label>
          <input id="p-negocio" name="negocio" required autoComplete="organization" className="campo" />
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="p-telefono">Teléfono o WhatsApp</label>
        <input id="p-telefono" name="telefono" required type="tel" autoComplete="tel" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="p-interes">Qué te interesa</label>
        <select id="p-interes" name="interes" required className="campo" defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Cuñas publicitarias</option>
          <option>Menciones en vivo</option>
          <option>Publicidad para negocios</option>
          <option>Planes en Facebook e Instagram</option>
          <option>No sé todavía, quiero asesoría</option>
        </select>
      </div>
      <div>
        <label className="etiqueta" htmlFor="p-mensaje">Qué quieres promocionar</label>
        <textarea id="p-mensaje" name="mensaje" rows={4} className="campo" />
        <span className="ayuda">Por ejemplo: un evento, una temporada o tu negocio. Incluye fechas si las tienes.</span>
      </div>
      <Consentimiento />
      <Antispam />
      <button type="submit" className="btn btn-monte">Pedir una cotización</button>
    </form>
  );
}
