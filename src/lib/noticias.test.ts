import { describe, expect, it } from "vitest";
import {
  agrupar,
  limpiarHtml,
  normalizarUrl,
  parecido,
  regionDe,
  separarMedioDeTitulo,
  type ItemNoticia,
} from "./noticias";

const item = (id: string, titulo: string, url: string, medio = "Medio", fecha = "2026-11-27T10:00:00Z"): ItemNoticia => ({
  id,
  fuente: medio.toLowerCase(),
  medio,
  titulo,
  url,
  fecha,
  resumen: "",
});

describe("normalizar", () => {
  it("quita www, parámetros de rastreo, # y barra final", () => {
    expect(normalizarUrl("https://www.medio.com/nota/?utm_source=x&id=4#arriba")).toBe("https://medio.com/nota?id=4");
    expect(normalizarUrl("https://medio.com/nota/")).toBe("https://medio.com/nota");
  });

  it("separa el medio del título de Google News", () => {
    expect(separarMedioDeTitulo("Cierran la vía Cali-Yumbo - El País Cali")).toEqual({
      titulo: "Cierran la vía Cali-Yumbo",
      medio: "El País Cali",
    });
    expect(separarMedioDeTitulo("Sin medio al final").medio).toBeNull();
  });

  it("limpia HTML y recorta sin partir palabras", () => {
    expect(limpiarHtml("<p>Hola&nbsp;<b>mundo</b> &amp; más</p>")).toBe("Hola mundo & más");
    expect(limpiarHtml("uno dos tres cuatro", 9)).toBe("uno dos…");
  });
});

describe("parecido y región", () => {
  it("títulos del mismo hecho se parecen; los distintos no", () => {
    expect(parecido("Cierran un carril de la vía Cali–Yumbo por obras", "Obras: cierre de un carril en la vía Cali Yumbo")).toBeGreaterThanOrEqual(0.6);
    expect(parecido("Cierran la vía Cali–Yumbo por obras", "América de Cali gana el clásico")).toBeLessThan(0.4);
  });

  it("prioriza Yumbo y sus corregimientos, luego Cali y el Valle", () => {
    expect(regionDe("Emergencia en Mulaló por lluvias")).toBe("Yumbo");
    expect(regionDe("Nueva ruta del MIO en Cali")).toBe("Cali y Valle");
    expect(regionDe("Congreso aprueba reforma")).toBe("Nacional");
    // "Calima" no es Cali
    expect(regionDe("Festival en Calima")).toBe("Nacional");
  });
});

describe("agrupar", () => {
  const items = [
    item("1", "Cierran un carril de la vía Cali–Yumbo por obras", "https://a.com/1", "Medio A"),
    item("2", "Obras: cierre de un carril en la vía Cali Yumbo", "https://b.com/2", "Medio B"),
    item("3", "Gobierno presenta presupuesto nacional", "https://c.com/3", "Medio C"),
    item("4", "Cierran un carril de la vía Cali–Yumbo por obras", "https://www.a.com/1/?utm_source=rss", "Medio A"),
  ];

  it("junta las notas del mismo hecho y descarta duplicados exactos", () => {
    const g = agrupar(items);
    expect(g).toHaveLength(2);
    expect(g[0].items.map((i) => i.id).sort()).toEqual(["1", "2"]);
    expect(g[0].medios.sort()).toEqual(["Medio A", "Medio B"]);
  });

  it("ordena Yumbo antes que lo nacional", () => {
    const g = agrupar(items);
    expect(g[0].region).toBe("Yumbo");
    expect(g[1].region).toBe("Nacional");
  });
});
