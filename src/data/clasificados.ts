// Clasificados ficticios. Los teléfonos usan el rango 300 555 01xx, que no
// pertenece a nadie en la demo.

export interface Clasificado {
  id: string;
  titulo: string;
  categoria: "Empleo" | "Arriendo" | "Venta" | "Servicios" | "Perdidos y encontrados" | "Eventos";
  texto: string;
  contacto: string;
  zona: string;
  vence: string; // AAAA-MM-DD
}

export const CATEGORIAS_CLASIFICADO: Clasificado["categoria"][] = [
  "Empleo",
  "Arriendo",
  "Venta",
  "Servicios",
  "Perdidos y encontrados",
  "Eventos",
];

export const clasificadosEjemplo: Clasificado[] = [
  {
    id: "c1",
    titulo: "Se necesita auxiliar de bodega",
    categoria: "Empleo",
    texto: "Empresa de la zona industrial busca auxiliar con experiencia en inventarios. Turno diurno.",
    contacto: "300 555 0101",
    zona: "Yumbo",
    vence: "2026-12-15",
  },
  {
    id: "c2",
    titulo: "Arriendo apartamento de dos habitaciones",
    categoria: "Arriendo",
    texto: "Segundo piso, cerca del parque principal. Servicios independientes.",
    contacto: "300 555 0102",
    zona: "Yumbo",
    vence: "2026-12-10",
  },
  {
    id: "c3",
    titulo: "Perrita criolla perdida en Arroyohondo",
    categoria: "Perdidos y encontrados",
    texto: "Color canela, collar rojo, responde al nombre de Luna. Se perdió el domingo cerca de la escuela.",
    contacto: "300 555 0103",
    zona: "Arroyohondo",
    vence: "2026-12-05",
  },
  {
    id: "c4",
    titulo: "Arreglo de electrodomésticos a domicilio",
    categoria: "Servicios",
    texto: "Neveras, lavadoras y estufas. Atención en el casco urbano y corregimientos cercanos.",
    contacto: "300 555 0104",
    zona: "Yumbo",
    vence: "2026-12-31",
  },
  {
    id: "c5",
    titulo: "Bazar navideño de la parroquia",
    categoria: "Eventos",
    texto: "Comida típica, música en vivo y rifas. Domingo desde las 10:00 a. m.",
    contacto: "300 555 0105",
    zona: "Montañitas",
    vence: "2026-12-14",
  },
  {
    id: "c6",
    titulo: "Vendo bicicleta de montaña rin 29",
    categoria: "Venta",
    texto: "Poco uso, frenos de disco. Precio a convenir.",
    contacto: "300 555 0106",
    zona: "La Buitrera",
    vence: "2026-11-20",
  },
];

/** Los vencidos se ocultan solos de la web pública. */
export function vigentes(lista: Clasificado[], hoy = new Date()): Clasificado[] {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(hoy);
  return lista.filter((c) => c.vence >= iso);
}
