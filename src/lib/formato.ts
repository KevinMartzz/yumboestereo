import { ZONA } from "./horario";

/** Prefijo de GitHub Pages para archivos que no pasan por <Link> (audio, imágenes). */
export const conBase = (ruta: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${ruta}`;

export function fechaLarga(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function fechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "07:00" → "7:00 a. m." */
export function horaBonita(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === 0 && m === 0) return "medianoche";
  if (h === 12 && m === 0) return "mediodía";
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** "hasta las 8:00 a. m.", "hasta la 1:00 p. m.", "hasta el mediodía", "hasta la medianoche". */
export function conArticulo(horaTexto: string) {
  if (horaTexto === "medianoche") return "la medianoche";
  if (horaTexto === "mediodía") return "el mediodía";
  return horaTexto.startsWith("1:") ? `la ${horaTexto}` : `las ${horaTexto}`;
}

/** "a las 8:00 a. m.", "a la 1:00 p. m.", "al mediodía", "a medianoche". */
export function aLaHora(horaTexto: string) {
  if (horaTexto === "medianoche") return "a medianoche";
  if (horaTexto === "mediodía") return "al mediodía";
  return `a ${conArticulo(horaTexto)}`;
}

/** ISO → "AAAA-MM-DDTHH:MM" en hora de Bogotá, para <input type="datetime-local">. */
export function aCampoFecha(iso: string) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const v = (t: string) => p.find((x) => x.type === t)?.value;
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}

/** "AAAA-MM-DDTHH:MM" (hora de Bogotá, siempre UTC-5) → ISO. */
export const deCampoFecha = (local: string) => `${local}:00-05:00`;
