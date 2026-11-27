// Datos generales de la emisora. Los que vienen de la web actual
// (yumboestereo107.com) están marcados como "real"; el resto falta confirmarlo.

export const emisora = {
  nombre: "Yumbo Estéreo",
  frecuencia: "107.0",
  lema: "Orgullo del municipio yumbeño", // real
  descripcion:
    "La emisora comunitaria de Yumbo, Valle del Cauca: música, información local y participación de la gente las 24 horas.",
  direccion: "Calle 10 #6-43, Yumbo, Valle del Cauca", // real
  telefono: "(602) 206 8392", // real
  whatsappComercial: "573151995633", // real
  whatsappParticipacion: "573116058828", // real
  correo: null as string | null, // falta: la web actual lo oculta
  facebook: "https://www.facebook.com/YumboEstereo107", // real
  instagram: "https://www.instagram.com/yumboestereo107/", // real
  sitioOficial: "https://www.yumboestereo107.com",

  // Falta la URL real del streaming (Icecast o Shoutcast). Mientras sea null,
  // el reproductor usa un tono de prueba y lo dice en pantalla.
  streamUrl: null as string | null,
  // Si el servidor es Icecast, su status-json.xsl da "sonando ahora" y oyentes.
  metadatosUrl: null as string | null,

  // Corregimientos y veredas que aparecen en la web actual como zona de cobertura.
  cobertura: [
    "Arroyohondo",
    "Dapa",
    "Montañitas",
    "Mulaló",
    "San Marcos",
    "Yumbillo",
    "El Pedregal",
    "La Buitrera",
    "Santa Inés",
    "La Olga",
  ],
};

export const programaPorDefecto = "senal-musical";

export function enlaceWhatsApp(numero: string, texto?: string) {
  return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
