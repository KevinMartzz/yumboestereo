// Solo Leonardo Orozco aparece con nombre en la web actual. Los demás son
// personas inventadas para la demo y se muestran marcadas como ejemplo.

export interface Locutor {
  slug: string;
  nombre: string;
  rol: string;
  bio: string;
  ejemplo: boolean;
}

export const locutores: Locutor[] = [
  {
    slug: "leonardo-orozco",
    nombre: "Leonardo Orozco",
    rol: "Locutor",
    bio: "Aparece en la web actual como locutor de la emisora. Falta su biografía, su foto y los programas que conduce.",
    ejemplo: false,
  },
  {
    slug: "paula-mena",
    nombre: "Paula Mena",
    rol: "Locución y producción",
    bio: "Persona de ejemplo para la demo. Aquí va una biografía corta escrita por la emisora.",
    ejemplo: true,
  },
  {
    slug: "andres-cuero",
    nombre: "Andrés Cuero",
    rol: "Periodista",
    bio: "Persona de ejemplo para la demo. Aquí va una biografía corta escrita por la emisora.",
    ejemplo: true,
  },
  {
    slug: "jhon-fredy-ocampo",
    nombre: "Jhon Fredy Ocampo",
    rol: "Locución musical",
    bio: "Persona de ejemplo para la demo. Aquí va una biografía corta escrita por la emisora.",
    ejemplo: true,
  },
];

export const locutorPorSlug = (slug: string) => locutores.find((l) => l.slug === slug);
