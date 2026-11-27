"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "@/components/Marco";
import { cambiarRol, PERMISOS, reiniciarDemo, useDemo, type Rol } from "@/lib/store";

const SECCIONES = [
  { id: "inicio", href: "/panel/", texto: "Resumen" },
  { id: "programacion", href: "/panel/programacion/", texto: "Programación" },
  { id: "noticias", href: "/panel/noticias/", texto: "Noticias" },
  { id: "noticias-ia", href: "/panel/noticias-ia/", texto: "Noticias con IA" },
  { id: "clasificados", href: "/panel/clasificados/", texto: "Clasificados" },
  { id: "bandeja", href: "/panel/bandeja/", texto: "Bandeja" },
  { id: "historial", href: "/panel/historial/", texto: "Historial" },
];

const ROLES: { valor: Rol; texto: string; ayuda: string }[] = [
  { valor: "administrador", texto: "Administrador", ayuda: "Ve y edita todo." },
  { valor: "editor", texto: "Editor", ayuda: "Noticias y programación." },
  { valor: "comercial", texto: "Comercial", ayuda: "Clasificados y solicitudes de pauta." },
];

export function seccionDeRuta(ruta: string) {
  const s = [...SECCIONES].reverse().find((x) => ruta.startsWith(x.href));
  return s?.id ?? "inicio";
}

export function MarcoPanel({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const { rol, solicitudes, mensajes } = useDemo();
  const permitidas = PERMISOS[rol];
  const actual = seccionDeRuta(ruta);
  const pendientes = solicitudes.filter((s) => s.estado === "nueva").length + mensajes.filter((m) => !m.leido).length;

  return (
    <div className="min-h-screen bg-hoja">
      <div className="border-b border-linea bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/panel/" aria-label="Panel, resumen">
              <Marca />
            </Link>
            <span className="text-gris">Panel de la emisora</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-bold">Ver como</span>
              <select
                className="campo w-auto py-1.5"
                value={rol}
                onChange={(e) => cambiarRol(e.target.value as Rol)}
                aria-describedby="ayuda-rol"
              >
                {ROLES.map((r) => (
                  <option key={r.valor} value={r.valor}>
                    {r.texto}
                  </option>
                ))}
              </select>
            </label>
            <span id="ayuda-rol" className="hidden text-sm text-gris md:inline">
              {ROLES.find((r) => r.valor === rol)?.ayuda}
            </span>
            <Link href="/" className="btn btn-borde text-monte">
              Ver la web
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Secciones del panel">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECCIONES.filter((s) => permitidas.includes(s.id)).map((s) => (
              <li key={s.id}>
                <Link
                  href={s.href}
                  aria-current={actual === s.id ? "page" : undefined}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-bold whitespace-nowrap text-tinta hover:bg-white aria-[current=page]:bg-monte aria-[current=page]:text-white"
                >
                  {s.texto}
                  {s.id === "bandeja" && pendientes ? (
                    <span className="rounded-full bg-amarillo px-2 text-sm text-noche">{pendientes}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden rounded-lg border border-linea bg-white p-3 text-sm text-gris lg:block">
            <p>
              <strong className="text-tinta">Demo.</strong> Los cambios se guardan solo en este navegador.
            </p>
            <button
              type="button"
              className="mt-2 font-bold text-vino underline"
              onClick={() => {
                if (confirm("¿Volver al contenido de ejemplo? Se borran los cambios hechos en este navegador.")) reiniciarDemo();
              }}
            >
              Restablecer la demo
            </button>
          </div>
        </nav>

        <div className="min-w-0">
          {permitidas.includes(actual) ? (
            children
          ) : (
            <div className="rounded-xl border border-linea bg-white p-8">
              <h1 className="titular text-4xl text-monte">Esta sección no está en tu rol</h1>
              <p className="mt-2 text-gris">
                Con el rol {ROLES.find((r) => r.valor === rol)?.texto.toLowerCase()} no puedes entrar aquí. Pídele
                acceso a un administrador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Encabezado de cada sección del panel. */
export function TituloPanel({ titulo, children, acciones }: { titulo: string; children?: React.ReactNode; acciones?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="titular text-5xl text-monte">{titulo}</h1>
        {children ? <p className="mt-2 max-w-2xl text-gris">{children}</p> : null}
      </div>
      {acciones}
    </div>
  );
}

export function Aviso({ children, tono = "info" }: { children: React.ReactNode; tono?: "info" | "ok" | "alerta" }) {
  const estilos = {
    info: "border-linea bg-white",
    ok: "border-monte bg-white",
    alerta: "border-vino bg-white",
  }[tono];
  return (
    <div role={tono === "info" ? undefined : "status"} className={`rounded-lg border-l-4 p-4 ${estilos}`}>
      {children}
    </div>
  );
}
