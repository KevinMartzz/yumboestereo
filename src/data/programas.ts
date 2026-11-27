// Los nombres de los programas son reales (aparecen en TuneIn). Las
// descripciones y los locutores asignados son de ejemplo: la emisora los
// reemplaza desde el panel.

export interface Programa {
  slug: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  locutores: string[]; // slugs
  real: boolean; // el nombre del programa existe
}

export const programas: Programa[] = [
  {
    slug: "despertar-con-cristo",
    nombre: "Despertar con Cristo",
    tipo: "Espiritual",
    descripcion:
      "Un espacio de reflexión y oración para empezar el día. Texto de ejemplo: la emisora escribe aquí de qué trata el programa.",
    locutores: ["paula-mena"],
    real: true,
  },
  {
    slug: "noticias-107",
    nombre: "Noticias 107",
    tipo: "Informativo",
    descripcion:
      "Lo que pasa en Yumbo, Cali y el Valle del Cauca, con el resumen nacional. Texto de ejemplo para la demo.",
    locutores: ["andres-cuero", "paula-mena"],
    real: true,
  },
  {
    slug: "mesa-redonda",
    nombre: "Mesa Redonda",
    tipo: "Opinión",
    descripcion:
      "Invitados y oyentes conversan sobre los temas del municipio. Texto de ejemplo para la demo.",
    locutores: ["andres-cuero"],
    real: true,
  },
  {
    slug: "el-defensor",
    nombre: "El Defensor",
    tipo: "Servicio",
    descripcion:
      "Orientación sobre derechos, trámites y quejas de la comunidad. Texto de ejemplo para la demo.",
    locutores: ["andres-cuero"],
    real: true,
  },
  {
    slug: "hablando-con-tu-hospital",
    nombre: "Hablando con tu hospital",
    tipo: "Salud",
    descripcion:
      "Prevención, campañas y servicios de salud explicados por profesionales. Texto de ejemplo para la demo.",
    locutores: ["paula-mena"],
    real: true,
  },
  {
    slug: "mujer-visible",
    nombre: "Mujer Visible",
    tipo: "Comunidad",
    descripcion:
      "Historias, emprendimientos y derechos de las mujeres de Yumbo. Texto de ejemplo para la demo.",
    locutores: ["paula-mena"],
    real: true,
  },
  {
    slug: "el-baul-antillano",
    nombre: "El Baúl Antillano",
    tipo: "Música",
    descripcion:
      "Salsa, son y música del Caribe para el fin de semana. Texto de ejemplo para la demo.",
    locutores: ["jhon-fredy-ocampo"],
    real: true,
  },
  {
    slug: "las-mas-sonadas",
    nombre: "Las más sonadas",
    tipo: "Música",
    descripcion:
      "La selección musical de la emisora, la misma de su playlist. Texto de ejemplo para la demo.",
    locutores: ["jhon-fredy-ocampo"],
    real: false,
  },
  {
    slug: "senal-musical",
    nombre: "Señal musical",
    tipo: "Música",
    descripcion:
      "Música continua cuando no hay un programa en vivo. Es la franja que aparece en la parrilla de la web actual.",
    locutores: [],
    real: true,
  },
];

export const programaPorSlug = (slug: string) => programas.find((p) => p.slug === slug);
