// Todas las noticias de la demo son ficticias. Cada una se muestra con la
// marca "Nota de ejemplo" en la web.

export type EstadoNoticia = "borrador" | "programada" | "publicada";

export interface Fuente {
  medio: string;
  titulo: string;
  url: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  cuerpo: string[];
  categoria: string;
  zona: string;
  fecha: string; // ISO, hora de Colombia
  estado: EstadoNoticia;
  origen: "propia" | "ia";
  autor: string;
  fuentes?: Fuente[];
}

export const CATEGORIAS = [
  "Comunidad",
  "Cultura",
  "Movilidad",
  "Salud",
  "Deportes",
  "Economía",
  "Orden público",
  "Medio ambiente",
  "Nacional",
] as const;

export const ZONAS = [
  "Yumbo",
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
  "Cali",
  "Valle del Cauca",
  "Colombia",
] as const;

export const noticiasEjemplo: Noticia[] = [
  {
    id: "n1",
    titulo: "Vecinos de Dapa organizan una jornada de siembra en la quebrada",
    resumen:
      "La junta de acción comunal convoca a voluntarios para sembrar árboles nativos el próximo sábado.",
    cuerpo: [
      "La junta de acción comunal de Dapa invita a la comunidad a una jornada de siembra de árboles nativos en la ribera de la quebrada. La cita es el sábado a las 7:00 a. m. en el parque principal del corregimiento.",
      "Los organizadores piden llevar guantes, agua y ropa cómoda. Las plántulas las aporta un vivero de la zona.",
      "Quienes quieran inscribirse pueden escribir al WhatsApp de participación de la emisora.",
    ],
    categoria: "Medio ambiente",
    zona: "Dapa",
    fecha: "2026-11-26T09:30:00-05:00",
    estado: "publicada",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
  {
    id: "n2",
    titulo: "Abren inscripciones para la escuela de música del barrio Belalcázar",
    resumen:
      "Hay cupos para niños y jóvenes entre 8 y 17 años en percusión, guitarra y coro.",
    cuerpo: [
      "La escuela de música comunitaria abrió inscripciones para el primer semestre. Los talleres son gratuitos y se dictan por las tardes, de lunes a jueves.",
      "Las familias interesadas deben llevar copia del documento del menor y un recibo de servicios públicos.",
    ],
    categoria: "Cultura",
    zona: "Yumbo",
    fecha: "2026-11-25T15:00:00-05:00",
    estado: "publicada",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
  {
    id: "n3",
    titulo: "Cierre parcial en la vía a Mulaló por mantenimiento de un puente",
    resumen:
      "El paso será a un carril entre las 8:00 a. m. y las 4:00 p. m. durante dos semanas.",
    cuerpo: [
      "Los conductores que van hacia Mulaló encontrarán paso a un solo carril mientras se repara la estructura de un puente. Habrá personal regulando el tráfico.",
      "Se recomienda salir con tiempo y, en lo posible, usar el horario de la tarde.",
    ],
    categoria: "Movilidad",
    zona: "Mulaló",
    fecha: "2026-11-24T07:10:00-05:00",
    estado: "publicada",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
  {
    id: "n4",
    titulo: "Torneo intercolegiado de fútbol de salón llega a la final",
    resumen: "Dos colegios del casco urbano se disputan el título este viernes en el coliseo.",
    cuerpo: [
      "Después de seis semanas de partidos, el torneo intercolegiado define campeón este viernes a las 3:00 p. m. La entrada es libre.",
      "La emisora transmitirá el partido en vivo por el 107.0 FM y por la web.",
    ],
    categoria: "Deportes",
    zona: "Yumbo",
    fecha: "2026-11-23T18:20:00-05:00",
    estado: "publicada",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
  {
    id: "n5",
    titulo: "Jornada de salud oral para adultos mayores en San Marcos",
    resumen: "Valoración gratuita y entrega de kits de higiene en el salón comunal.",
    cuerpo: [
      "Un equipo de odontología atenderá a adultos mayores del corregimiento en el salón comunal, de 8:00 a. m. a 12:00 m.",
      "No se necesita cita previa; se atiende por orden de llegada.",
    ],
    categoria: "Salud",
    zona: "San Marcos",
    fecha: "2026-11-30T08:00:00-05:00",
    estado: "programada",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
  {
    id: "n6",
    titulo: "Borrador: nueva ruta de bus entre Yumbillo y el centro",
    resumen: "Pendiente confirmar horarios con la empresa de transporte.",
    cuerpo: ["Borrador sin terminar. Falta confirmar horarios y tarifa."],
    categoria: "Movilidad",
    zona: "Yumbillo",
    fecha: "2026-11-27T10:00:00-05:00",
    estado: "borrador",
    origen: "propia",
    autor: "Redacción Yumbo Estéreo",
  },
];

/** Las que ve el público: publicadas, o programadas cuya hora ya llegó. */
export function visibles(noticias: Noticia[], ahora = new Date()): Noticia[] {
  return noticias
    .filter(
      (n) =>
        n.estado === "publicada" || (n.estado === "programada" && new Date(n.fecha) <= ahora),
    )
    .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}
