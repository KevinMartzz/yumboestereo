"use client";

// Almacén de la DEMO. En la versión real todo esto vive en Payload CMS con
// PostgreSQL. Aquí los cambios se guardan solo en el navegador de quien prueba
// (localStorage), para que el panel y la web pública se vean conectados sin
// servidor.

import { useEffect, useState, useSyncExternalStore } from "react";
import { horariosEjemplo } from "@/data/horarios";
import { noticiasEjemplo, type Noticia } from "@/data/noticias";
import { clasificadosEjemplo, type Clasificado } from "@/data/clasificados";
import type { Franja } from "./horario";

export type EstadoSolicitud = "nueva" | "cotizada" | "en-emision" | "vencida";
export const ESTADOS_SOLICITUD: { valor: EstadoSolicitud; texto: string }[] = [
  { valor: "nueva", texto: "Nueva" },
  { valor: "cotizada", texto: "Cotizada" },
  { valor: "en-emision", texto: "En emisión" },
  { valor: "vencida", texto: "Vencida" },
];

export interface Solicitud {
  id: string;
  fecha: string;
  nombre: string;
  negocio: string;
  telefono: string;
  interes: string;
  mensaje: string;
  estado: EstadoSolicitud;
}

export interface Mensaje {
  id: string;
  fecha: string;
  nombre: string;
  contacto: string;
  tema: string;
  mensaje: string;
  leido: boolean;
}

export type Rol = "administrador" | "editor" | "comercial";

export interface Datos {
  horarios: Franja[];
  noticias: Noticia[];
  clasificados: Clasificado[];
  solicitudes: Solicitud[];
  mensajes: Mensaje[];
}

type Coleccion = keyof Datos;

export interface Cambio {
  id: string;
  fecha: string;
  coleccion: Coleccion;
  descripcion: string;
  antes: unknown;
  deshecho?: boolean;
}

export interface Estado extends Datos {
  historial: Cambio[];
  rol: Rol;
}

const CLAVE = "yumbo-estereo-demo-v1";

const solicitudesEjemplo: Solicitud[] = [
  {
    id: "s1",
    fecha: "2026-11-26T16:20:00-05:00",
    nombre: "Carolina Vélez (ejemplo)",
    negocio: "Panadería de ejemplo",
    telefono: "300 555 0111",
    interes: "Cuñas publicitarias",
    mensaje: "Quiero anunciar los desayunos de diciembre. ¿Qué paquetes tienen?",
    estado: "nueva",
  },
  {
    id: "s2",
    fecha: "2026-11-22T10:05:00-05:00",
    nombre: "Hernán Ruiz (ejemplo)",
    negocio: "Ferretería de ejemplo",
    telefono: "300 555 0112",
    interes: "Menciones en vivo",
    mensaje: "Menciones en el programa de la mañana durante un mes.",
    estado: "cotizada",
  },
  {
    id: "s3",
    fecha: "2026-11-02T09:00:00-05:00",
    nombre: "Lina Torres (ejemplo)",
    negocio: "Óptica de ejemplo",
    telefono: "300 555 0113",
    interes: "Cuñas y redes",
    mensaje: "Campaña de noviembre.",
    estado: "en-emision",
  },
];

const mensajesEjemplo: Mensaje[] = [
  {
    id: "m1",
    fecha: "2026-11-26T19:40:00-05:00",
    nombre: "Oyente de ejemplo",
    contacto: "300 555 0121",
    tema: "Participación",
    mensaje: "Quiero saludar a mi mamá en el programa del sábado.",
    leido: false,
  },
];

export const INICIAL: Estado = {
  horarios: horariosEjemplo,
  noticias: noticiasEjemplo,
  clasificados: clasificadosEjemplo,
  solicitudes: solicitudesEjemplo,
  mensajes: mensajesEjemplo,
  historial: [],
  rol: "administrador",
};

let cache: Estado | null = null;
const oyentes = new Set<() => void>();

function leer(): Estado {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return INICIAL;
    return { ...INICIAL, ...JSON.parse(crudo) };
  } catch {
    return INICIAL;
  }
}

function escribir(nuevo: Estado) {
  cache = nuevo;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento (modo privado): la demo sigue funcionando en memoria.
  }
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      cache = leer();
      o();
    }
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(o);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const foto = () => (cache ??= leer());
const fotoServidor = () => INICIAL;

export function useDemo(): Estado {
  return useSyncExternalStore(suscribir, foto, fotoServidor);
}

export const nuevoId = (prefijo: string) =>
  `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Cambia una colección y deja el cambio en el historial para poder deshacerlo. */
export function cambiar<K extends Coleccion>(coleccion: K, valor: Datos[K], descripcion: string) {
  const actual = foto();
  const cambio: Cambio = {
    id: nuevoId("h"),
    fecha: new Date().toISOString(),
    coleccion,
    descripcion,
    antes: actual[coleccion],
  };
  escribir({ ...actual, [coleccion]: valor, historial: [cambio, ...actual.historial].slice(0, 60) });
}

/** Lo que llega desde la web pública (formularios): no va al historial del panel. */
export function recibir<K extends "solicitudes" | "mensajes">(coleccion: K, item: Datos[K][number]) {
  const actual = foto();
  escribir({ ...actual, [coleccion]: [item, ...actual[coleccion]] });
}

export function deshacer(id: string) {
  const actual = foto();
  const cambio = actual.historial.find((c) => c.id === id);
  if (!cambio || cambio.deshecho) return;
  const reversa: Cambio = {
    id: nuevoId("h"),
    fecha: new Date().toISOString(),
    coleccion: cambio.coleccion,
    descripcion: `Deshecho: ${cambio.descripcion}`,
    antes: actual[cambio.coleccion],
  };
  escribir({
    ...actual,
    [cambio.coleccion]: cambio.antes,
    historial: [reversa, ...actual.historial.map((c) => (c.id === id ? { ...c, deshecho: true } : c))],
  });
}

export function cambiarRol(rol: Rol) {
  escribir({ ...foto(), rol });
}

export function reiniciarDemo() {
  escribir(INICIAL);
}

/** La hora actual, actualizada cada 30 s. Es null hasta que la página carga en el navegador. */
export function useAhora(intervaloMs = 30_000): Date | null {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), intervaloMs);
    return () => clearInterval(t);
  }, [intervaloMs]);
  return ahora;
}

export const PERMISOS: Record<Rol, string[]> = {
  administrador: ["inicio", "programacion", "noticias", "noticias-ia", "clasificados", "bandeja", "historial"],
  editor: ["inicio", "programacion", "noticias", "noticias-ia", "historial"],
  comercial: ["inicio", "clasificados", "bandeja", "historial"],
};
