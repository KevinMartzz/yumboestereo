// Lógica de la parrilla: qué programa está al aire, qué sigue y cómo se
// arma cada día. Todo se calcula con la hora de Colombia (America/Bogota).

export const ZONA = "America/Bogota";
export const MIN_DIA = 24 * 60;

/** 0 = domingo … 6 = sábado (igual que Date.getDay). */
export type Dia = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const NOMBRES_DIA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

/**
 * Una franja es un bloque que se repite cada semana.
 * `dias` son los días en que la franja EMPIEZA. Si `fin` es menor o igual
 * que `inicio`, la franja pasa la medianoche y termina al día siguiente
 * ("22:00"–"02:00"). `fin` "00:00" significa "hasta la medianoche".
 */
export interface Franja {
  id: string;
  programa: string;
  dias: Dia[];
  inicio: string; // "HH:MM"
  fin: string; // "HH:MM"
}

/** Un tramo concreto dentro de un día, en minutos desde la medianoche. */
export interface Tramo {
  franjaId: string | null; // null = relleno (programa por defecto)
  programa: string;
  inicio: number;
  fin: number;
}

export function aMinutos(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error(`Hora inválida: "${hhmm}" (usa HH:MM)`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) throw new Error(`Hora inválida: "${hhmm}"`);
  return h * 60 + min;
}

export function aHHMM(minutos: number): string {
  const m = ((minutos % MIN_DIA) + MIN_DIA) % MIN_DIA;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Día de la semana y minuto del día en Bogotá para un instante dado. */
export function horaColombia(fecha: Date): { dia: Dia; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const val = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dia = dias.indexOf(val("weekday")) as Dia;
  return { dia, minutos: Number(val("hour")) * 60 + Number(val("minute")) };
}

/** Duración de una franja en minutos (las que pasan la medianoche cuentan bien). */
export function duracion(f: Franja): number {
  const i = aMinutos(f.inicio);
  const fin = aMinutos(f.fin);
  return fin > i ? fin - i : MIN_DIA - i + fin;
}

/**
 * Tramos de las franjas reales que caen en un día, sin relleno, ordenados.
 * Incluye la cola de las franjas que empezaron el día anterior y pasan la medianoche.
 */
function tramosReales(franjas: Franja[], dia: Dia): Tramo[] {
  const ayer = ((dia + 6) % 7) as Dia;
  const tramos: Tramo[] = [];
  for (const f of franjas) {
    const i = aMinutos(f.inicio);
    const fin = aMinutos(f.fin);
    const cruza = fin <= i;
    if (f.dias.includes(dia)) {
      tramos.push({ franjaId: f.id, programa: f.programa, inicio: i, fin: cruza ? MIN_DIA : fin });
    }
    if (cruza && fin > 0 && f.dias.includes(ayer)) {
      tramos.push({ franjaId: f.id, programa: f.programa, inicio: 0, fin });
    }
  }
  return tramos.sort((a, b) => a.inicio - b.inicio || a.fin - b.fin);
}

/**
 * El día completo, de 00:00 a 24:00, sin huecos: donde no hay franja se pone
 * el programa por defecto. Si dos franjas se pisan, gana la que empezó antes
 * (el panel avisa de los choques con `solapamientos`).
 */
export function tramosDelDia(franjas: Franja[], dia: Dia, porDefecto: string): Tramo[] {
  const salida: Tramo[] = [];
  let cursor = 0;
  for (const t of tramosReales(franjas, dia)) {
    if (t.fin <= cursor) continue;
    const inicio = Math.max(t.inicio, cursor);
    if (inicio > cursor) salida.push({ franjaId: null, programa: porDefecto, inicio: cursor, fin: inicio });
    salida.push({ ...t, inicio });
    cursor = t.fin;
  }
  if (cursor < MIN_DIA) salida.push({ franjaId: null, programa: porDefecto, inicio: cursor, fin: MIN_DIA });
  return salida;
}

export interface Ahora {
  dia: Dia;
  minutos: number;
  actual: Tramo;
  siguiente: Tramo & { dia: Dia };
}

/** Qué está al aire y qué sigue, en este instante y en hora de Colombia. */
export function alAire(franjas: Franja[], fecha: Date, porDefecto: string): Ahora {
  const { dia, minutos } = horaColombia(fecha);
  const hoy = tramosDelDia(franjas, dia, porDefecto);
  const idx = hoy.findIndex((t) => minutos >= t.inicio && minutos < t.fin);
  const actual = hoy[idx];

  // Lo siguiente es el próximo tramo con un programa distinto; si el día se
  // acaba, se busca en los días que vienen (una semana como máximo).
  let siguiente: (Tramo & { dia: Dia }) | null = null;
  for (let k = idx + 1; k < hoy.length && !siguiente; k++) {
    if (hoy[k].programa !== actual.programa) siguiente = { ...hoy[k], dia };
  }
  for (let d = 1; d <= 7 && !siguiente; d++) {
    const otro = ((dia + d) % 7) as Dia;
    for (const t of tramosDelDia(franjas, otro, porDefecto)) {
      if (t.programa !== actual.programa) {
        siguiente = { ...t, dia: otro };
        break;
      }
    }
  }
  return { dia, minutos, actual, siguiente: siguiente ?? { ...actual, dia } };
}

export interface Choque {
  dia: Dia;
  a: string;
  b: string;
}

/** Franjas que se pisan el mismo día. El panel las muestra como aviso. */
export function solapamientos(franjas: Franja[]): Choque[] {
  const choques: Choque[] = [];
  const vistos = new Set<string>();
  for (let d = 0; d < 7; d++) {
    const tramos = tramosReales(franjas, d as Dia);
    for (let i = 0; i < tramos.length; i++) {
      for (let j = i + 1; j < tramos.length; j++) {
        const x = tramos[i];
        const y = tramos[j];
        if (y.inicio < x.fin && x.franjaId !== y.franjaId) {
          const clave = `${d}:${[x.franjaId, y.franjaId].sort().join("|")}`;
          if (!vistos.has(clave)) {
            vistos.add(clave);
            choques.push({ dia: d as Dia, a: x.franjaId!, b: y.franjaId! });
          }
        }
      }
    }
  }
  return choques;
}

/** Texto corto para un rango de días: "Lunes a viernes", "Sábado y domingo", "Lun, Mié, Vie". */
export function describirDias(dias: Dia[]): string {
  const orden = [1, 2, 3, 4, 5, 6, 0].filter((d) => dias.includes(d as Dia));
  const clave = orden.join(",");
  if (clave === "1,2,3,4,5,6,0") return "Todos los días";
  if (clave === "1,2,3,4,5") return "Lunes a viernes";
  if (clave === "1,2,3,4,5,6") return "Lunes a sábado";
  if (clave === "6,0") return "Sábado y domingo";
  if (orden.length === 1) return NOMBRES_DIA[orden[0]];
  if (orden.length === 2) return `${NOMBRES_DIA[orden[0]]} y ${NOMBRES_DIA[orden[1]].toLowerCase()}`;
  return orden.map((d) => NOMBRES_DIA[d].slice(0, 3)).join(", ");
}
