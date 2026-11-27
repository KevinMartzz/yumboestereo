"use client";

// Reproductor en vivo. Vive en el layout raíz, así que el <audio> no se
// desmonta al navegar entre páginas y la señal no se corta.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { emisora, programaPorDefecto } from "@/data/emisora";
import { programaPorSlug } from "@/data/programas";
import { alAire } from "@/lib/horario";
import { useAhora, useDemo } from "@/lib/store";
import { conBase } from "@/lib/formato";

export type EstadoSenal = "detenido" | "cargando" | "sonando" | "reconectando" | "sin-senal";

interface Ctx {
  estado: EstadoSenal;
  alternar: () => void;
  sonandoAhora: string | null;
  esPrueba: boolean;
}

const ContextoReproductor = createContext<Ctx | null>(null);

export function useReproductor() {
  const c = useContext(ContextoReproductor);
  if (!c) throw new Error("useReproductor fuera de ProveedorReproductor");
  return c;
}

const ESPERAS = [2, 4, 8, 15, 30]; // segundos entre intentos de reconexión
const TEXTO_ESTADO: Record<EstadoSenal, string> = {
  detenido: "En pausa",
  cargando: "Conectando…",
  sonando: "Al aire",
  reconectando: "Se cayó la señal, reconectando…",
  "sin-senal": "Sin señal. Intenta de nuevo en un momento.",
};

export function ProveedorReproductor({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const intento = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quiereSonar = useRef(false);
  const [estado, setEstado] = useState<EstadoSenal>("detenido");
  const [sonandoAhora, setSonandoAhora] = useState<string | null>(null);
  // Si la señal real no responde al empezar, se pasa al tono de prueba.
  const [respaldo, setRespaldo] = useState(false);
  const respaldoRef = useRef(false);
  const yaSono = useRef(false); // la señal real sonó al menos una vez en esta sesión

  const tono = conBase("/audio/tono-prueba.mp3");
  const esPrueba = !emisora.streamUrl || respaldo;

  const conectar = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    const real = emisora.streamUrl && !respaldoRef.current ? emisora.streamUrl : null;
    // En un stream en vivo, un parámetro nuevo evita que el navegador reutilice
    // un búfer viejo al reconectar.
    a.src = real ? `${real}${real.includes("?") ? "&" : "?"}t=${Date.now()}` : tono;
    a.loop = !real;
    a.load();
    a.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        // El navegador bloqueó la reproducción: el usuario debe pulsar de nuevo.
        quiereSonar.current = false;
        setEstado("detenido");
      }
      // Otros errores (la fuente no es audio, se cortó) llegan también como
      // evento "error" y ahí se reintenta.
    });
  }, [tono]);

  const programarReconexion = useCallback(() => {
    if (!quiereSonar.current || temporizador.current) return;
    // La señal real nunca llegó a sonar: tras dos intentos, tono de prueba.
    if (emisora.streamUrl && !respaldoRef.current && !yaSono.current && intento.current >= 2) {
      respaldoRef.current = true;
      setRespaldo(true);
      intento.current = 0;
      conectar();
      return;
    }
    if (intento.current >= ESPERAS.length) {
      setEstado("sin-senal");
      quiereSonar.current = false;
      return;
    }
    setEstado("reconectando");
    const espera = ESPERAS[intento.current++] * 1000;
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      conectar();
    }, espera);
  }, [conectar]);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const alSonar = () => {
      intento.current = 0;
      if (!respaldoRef.current) yaSono.current = true;
      setEstado("sonando");
    };
    const alEsperar = () => quiereSonar.current && setEstado((e) => (e === "sonando" ? "cargando" : e));
    const alFallar = () => programarReconexion();
    const alTerminar = () => {
      // Un stream en vivo no debería terminar; si termina, se cayó.
      if (!esPrueba) programarReconexion();
    };
    a.addEventListener("playing", alSonar);
    a.addEventListener("waiting", alEsperar);
    a.addEventListener("error", alFallar);
    a.addEventListener("stalled", alEsperar);
    a.addEventListener("ended", alTerminar);
    return () => {
      a.removeEventListener("playing", alSonar);
      a.removeEventListener("waiting", alEsperar);
      a.removeEventListener("error", alFallar);
      a.removeEventListener("stalled", alEsperar);
      a.removeEventListener("ended", alTerminar);
    };
  }, [esPrueba, programarReconexion]);

  // Al volver la conexión a internet, reintenta de inmediato.
  useEffect(() => {
    const alVolver = () => {
      if (quiereSonar.current && estado !== "sonando") {
        intento.current = 0;
        conectar();
      }
    };
    window.addEventListener("online", alVolver);
    return () => window.removeEventListener("online", alVolver);
  }, [conectar, estado]);

  // "Sonando ahora" desde Icecast (status-json.xsl), si la emisora lo tiene.
  useEffect(() => {
    if (!emisora.metadatosUrl || estado !== "sonando") return;
    let vivo = true;
    const pedir = async () => {
      try {
        const r = await fetch(emisora.metadatosUrl!, { cache: "no-store" });
        const j = await r.json();
        const fuenteIce = Array.isArray(j?.icestats?.source) ? j.icestats.source[0] : j?.icestats?.source;
        if (vivo) setSonandoAhora(fuenteIce?.title ?? null);
      } catch {
        if (vivo) setSonandoAhora(null);
      }
    };
    pedir();
    const t = setInterval(pedir, 20_000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [estado]);

  const alternar = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    if (quiereSonar.current) {
      quiereSonar.current = false;
      a.pause();
      if (!esPrueba) a.removeAttribute("src"); // corta la descarga del stream
      setEstado("detenido");
    } else {
      quiereSonar.current = true;
      intento.current = 0;
      // Cada vez que se pulsa "escuchar", se intenta primero la señal real.
      respaldoRef.current = false;
      setRespaldo(false);
      setEstado("cargando");
      conectar();
    }
  }, [conectar, esPrueba]);

  return (
    <ContextoReproductor.Provider value={{ estado, alternar, sonandoAhora, esPrueba }}>
      {children}
      <audio ref={audio} preload="none" />
    </ContextoReproductor.Provider>
  );
}

export function IconoPlay({ sonando, className = "" }: { sonando: boolean; className?: string }) {
  return sonando ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
    </svg>
  );
}

/** Barra fija inferior. */
export function BarraReproductor() {
  const { estado, alternar, sonandoAhora, esPrueba } = useReproductor();
  const datos = useDemo();
  const ahora = useAhora();
  const actual = ahora ? alAire(datos.horarios, ahora, programaPorDefecto).actual : null;
  const programa = actual ? programaPorSlug(actual.programa) : null;
  const activo = estado === "sonando" || estado === "cargando" || estado === "reconectando";

  // Controles en la pantalla de bloqueo del celular.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: programa?.nombre ?? `${emisora.nombre} ${emisora.frecuencia} FM`,
      artist: `${emisora.nombre} ${emisora.frecuencia} FM`,
    });
    navigator.mediaSession.setActionHandler("play", alternar);
    navigator.mediaSession.setActionHandler("pause", alternar);
  }, [programa?.nombre, alternar]);

  return (
    <div className="sobre-oscuro fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-noche text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4">
        <button
          type="button"
          onClick={alternar}
          aria-label={activo ? "Pausar la señal en vivo" : "Escuchar la señal en vivo"}
          aria-pressed={activo}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-amarillo text-noche transition hover:bg-amarillo-suave"
        >
          {estado === "cargando" || estado === "reconectando" ? (
            <svg viewBox="0 0 24 24" className="size-6 animate-spin motion-reduce:animate-none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
            </svg>
          ) : (
            <IconoPlay sonando={activo} className="size-6" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm text-white/80" aria-live="polite">
            {estado === "sonando" ? (
              <span className="eq inline-flex h-4 items-end text-amarillo" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            ) : null}
            <span>{TEXTO_ESTADO[estado]}</span>
            {esPrueba ? (
              <span className="marca-ejemplo">
                {emisora.streamUrl ? "La señal no respondió: tono de prueba" : "Tono de prueba"}
              </span>
            ) : null}
          </p>
          <p className="truncate font-bold">
            {sonandoAhora ? (
              <>Sonando: {sonandoAhora}</>
            ) : programa ? (
              <Link href={`/programas/${programa.slug}/`} className="hover:underline">
                {programa.nombre}
              </Link>
            ) : (
              <span className="text-white/60">Cargando programación…</span>
            )}
          </p>
        </div>

        <p className="hidden shrink-0 text-right sm:block">
          <span className="cifras block text-2xl leading-none font-bold text-amarillo">{emisora.frecuencia}</span>
          <span className="text-xs text-white/70">FM Yumbo</span>
        </p>
      </div>
    </div>
  );
}
