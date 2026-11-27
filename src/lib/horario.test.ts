import { describe, expect, it } from "vitest";
import {
  aHHMM,
  aMinutos,
  alAire,
  describirDias,
  duracion,
  horaColombia,
  solapamientos,
  tramosDelDia,
  type Franja,
} from "./horario";

const DEF = "senal-musical";

// Fecha en hora de Colombia (UTC-5, sin horario de verano).
const bogota = (iso: string) => new Date(`${iso}-05:00`);

const franjas: Franja[] = [
  { id: "a", programa: "despertar", dias: [1, 2, 3, 4, 5, 6], inicio: "05:00", fin: "06:00" },
  { id: "b", programa: "noticias", dias: [1, 2, 3, 4, 5], inicio: "06:00", fin: "08:00" },
  { id: "c", programa: "trasnocho", dias: [5], inicio: "22:00", fin: "02:00" },
  { id: "d", programa: "baul", dias: [0], inicio: "10:00", fin: "00:00" },
];

describe("horas", () => {
  it("convierte HH:MM a minutos y de vuelta", () => {
    expect(aMinutos("00:00")).toBe(0);
    expect(aMinutos("23:59")).toBe(1439);
    expect(aHHMM(1439)).toBe("23:59");
    expect(aHHMM(1440)).toBe("00:00");
  });

  it("rechaza horas mal escritas", () => {
    expect(() => aMinutos("24:00")).toThrow();
    expect(() => aMinutos("7")).toThrow();
  });

  it("usa la hora de Bogotá aunque el instante venga en UTC", () => {
    // 03:30 UTC del sábado = 22:30 del viernes en Colombia.
    const { dia, minutos } = horaColombia(new Date("2026-11-28T03:30:00Z"));
    expect(dia).toBe(5);
    expect(minutos).toBe(22 * 60 + 30);
  });

  it("calcula la duración de franjas que pasan la medianoche", () => {
    expect(duracion(franjas[2])).toBe(240);
    expect(duracion(franjas[3])).toBe(14 * 60);
  });
});

describe("al aire ahora", () => {
  it("encuentra el programa de la franja actual", () => {
    const r = alAire(franjas, bogota("2026-11-23T06:15:00"), DEF); // lunes
    expect(r.actual.programa).toBe("noticias");
    expect(r.siguiente.programa).toBe(DEF);
  });

  it("el límite es inclusivo al inicio y exclusivo al final", () => {
    expect(alAire(franjas, bogota("2026-11-23T06:00:00"), DEF).actual.programa).toBe("noticias");
    expect(alAire(franjas, bogota("2026-11-23T08:00:00"), DEF).actual.programa).toBe(DEF);
  });

  it("sin franja, suena el programa por defecto", () => {
    expect(alAire(franjas, bogota("2026-11-23T03:00:00"), DEF).actual.programa).toBe(DEF);
  });

  it("una franja de viernes 22:00 a 02:00 sigue al aire el sábado de madrugada", () => {
    const r = alAire(franjas, bogota("2026-11-28T01:30:00"), DEF); // sábado
    expect(r.dia).toBe(6);
    expect(r.actual.programa).toBe("trasnocho");
    expect(r.actual.fin).toBe(120);
  });

  it("una franja que empieza el viernes por la noche no aparece el viernes de madrugada", () => {
    const r = alAire(franjas, bogota("2026-11-27T01:30:00"), DEF); // viernes 01:30
    expect(r.actual.programa).toBe(DEF);
  });

  it("lo siguiente puede estar en otro día", () => {
    const r = alAire(franjas, bogota("2026-11-28T23:00:00"), DEF); // sábado noche
    expect(r.siguiente.programa).toBe("baul");
    expect(r.siguiente.dia).toBe(0);
  });

  it("fin 00:00 significa hasta la medianoche", () => {
    const domingo = tramosDelDia(franjas, 0, DEF);
    expect(domingo.at(-1)).toMatchObject({ programa: "baul", fin: 1440 });
    const lunes = tramosDelDia(franjas, 1, DEF);
    expect(lunes[0]).toMatchObject({ programa: DEF, inicio: 0 });
  });
});

describe("día completo y choques", () => {
  it("el día queda cubierto de 00:00 a 24:00 sin huecos", () => {
    for (let d = 0; d < 7; d++) {
      const tramos = tramosDelDia(franjas, d as 0, DEF);
      expect(tramos[0].inicio).toBe(0);
      expect(tramos.at(-1)!.fin).toBe(1440);
      for (let i = 1; i < tramos.length; i++) expect(tramos[i].inicio).toBe(tramos[i - 1].fin);
    }
  });

  it("detecta franjas que se pisan, también al pasar la medianoche", () => {
    const conChoque: Franja[] = [
      ...franjas,
      { id: "e", programa: "otro", dias: [1], inicio: "07:00", fin: "09:00" },
      { id: "f", programa: "madrugada", dias: [6], inicio: "01:00", fin: "03:00" },
    ];
    const choques = solapamientos(conChoque);
    expect(choques).toContainEqual({ dia: 1, a: "b", b: "e" });
    expect(choques).toContainEqual({ dia: 6, a: "c", b: "f" });
    expect(solapamientos(franjas)).toEqual([]);
  });

  it("si dos franjas se pisan, gana la que empezó antes", () => {
    const conChoque: Franja[] = [
      ...franjas,
      { id: "e", programa: "otro", dias: [1], inicio: "07:00", fin: "09:00" },
    ];
    const lunes = tramosDelDia(conChoque, 1, DEF);
    expect(lunes.find((t) => t.inicio === 7 * 60)).toBeUndefined();
    expect(lunes.find((t) => t.programa === "otro")).toMatchObject({ inicio: 8 * 60, fin: 9 * 60 });
  });
});

describe("días en texto", () => {
  it("resume los días de forma legible", () => {
    expect(describirDias([1, 2, 3, 4, 5])).toBe("Lunes a viernes");
    expect(describirDias([6, 0])).toBe("Sábado y domingo");
    expect(describirDias([2, 4])).toBe("Martes y jueves");
    expect(describirDias([1, 3, 5])).toBe("Lun, Mié, Vie");
  });
});
