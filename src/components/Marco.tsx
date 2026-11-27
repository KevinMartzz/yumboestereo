"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { emisora, enlaceWhatsApp } from "@/data/emisora";

const NAV = [
  { href: "/programacion/", texto: "Programación" },
  { href: "/locutores/", texto: "Locutores" },
  { href: "/noticias/", texto: "Noticias" },
  { href: "/clasificados/", texto: "Clasificados" },
  { href: "/comunidad/", texto: "Participa" },
  { href: "/pauta/", texto: "Pauta" },
  { href: "/contacto/", texto: "Contacto" },
];

export function FranjaDemo() {
  return (
    <div className="bg-amarillo px-4 py-1.5 text-center text-sm text-noche">
      <strong>Demo de propuesta.</strong>{" "}
      <span className="hidden sm:inline">
        El contenido es de ejemplo; los nombres de los programas y los datos de contacto vienen de la web actual.
      </span>
      <span className="sm:hidden">Contenido de ejemplo.</span>{" "}
      <Link href="/panel/" className="font-bold underline underline-offset-2">
        Probar el panel
      </Link>
    </div>
  );
}

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-baseline gap-2 leading-none">
      <span className={`titular text-[1.6rem] ${claro ? "text-white" : "text-monte"}`}>Yumbo Estéreo</span>
      <span className="cifras rounded bg-amarillo px-1.5 py-0.5 text-sm font-bold text-noche">107.0</span>
    </span>
  );
}

export function Encabezado() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  if (ruta.startsWith("/panel")) return null;

  return (
    <header className="border-b border-linea bg-hoja">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/">
          <Marca />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={ruta.startsWith(n.href) ? "page" : undefined}
                  className="rounded-full px-3 py-2 font-bold text-tinta hover:bg-papel aria-[current=page]:bg-monte aria-[current=page]:text-white"
                >
                  {n.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="btn btn-borde text-monte lg:hidden"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </div>
      {abierto ? (
        <nav id="menu-movil" aria-label="Principal" className="border-t border-linea lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-linea/60 py-3 text-lg font-bold last:border-0"
                >
                  {n.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function Pie() {
  const ruta = usePathname();
  if (ruta.startsWith("/panel")) return null;
  return (
    <footer className="sobre-oscuro mt-20 bg-monte text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Marca claro />
          <p className="mt-4 max-w-sm text-white/85">{emisora.descripcion}</p>
        </div>
        <div>
          <h2 className="font-bold">Escríbenos</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            <li>{emisora.direccion}</li>
            <li>
              <a className="hover:underline" href={`tel:+57${emisora.telefono.replace(/\D/g, "")}`}>
                {emisora.telefono}
              </a>
            </li>
            <li>
              <a className="hover:underline" href={enlaceWhatsApp(emisora.whatsappParticipacion)}>
                WhatsApp para oyentes
              </a>
            </li>
            <li>
              <a className="hover:underline" href={enlaceWhatsApp(emisora.whatsappComercial)}>
                WhatsApp comercial
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold">Síguenos</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            <li>
              <a className="hover:underline" href={emisora.facebook}>
                Facebook
              </a>
            </li>
            <li>
              <a className="hover:underline" href={emisora.instagram}>
                Instagram
              </a>
            </li>
            <li>
              <Link className="hover:underline" href="/legal/privacidad/">
                Tratamiento de datos
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/legal/terminos/">
                Términos de uso
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/15 px-4 py-4 text-center text-sm text-white/70">
        Demo de propuesta para Yumbo Estéreo 107.0 FM. No es el sitio oficial:{" "}
        <a className="underline" href={emisora.sitioOficial}>
          yumboestereo107.com
        </a>
      </p>
    </footer>
  );
}
