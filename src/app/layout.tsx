import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BarraReproductor, ProveedorReproductor } from "@/components/Reproductor";
import { Encabezado, FranjaDemo, Pie } from "@/components/Marco";
import { emisora } from "@/data/emisora";

// Fuentes servidas desde el propio sitio, solo el subconjunto latino (cubre el
// español). next/font las precarga y ajusta la fuente de respaldo para que el
// texto no salte cuando cargan.
const anybody = localFont({
  src: "./fuentes/anybody.woff2",
  weight: "100 900",
  variable: "--fuente-anybody",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "50% 150%" }],
  adjustFontFallback: "Arial",
});
const atkinson = localFont({
  src: "./fuentes/atkinson-hyperlegible-next.woff2",
  weight: "200 800",
  variable: "--fuente-atkinson",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: {
    default: "Yumbo Estéreo 107.0 FM · Demo de propuesta",
    template: "%s · Yumbo Estéreo 107.0 FM (demo)",
  },
  description: emisora.descripcion,
  // Es una demo pública: que Google no la indexe ni compita con el sitio oficial.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Yumbo Estéreo 107.0 FM",
    title: "Yumbo Estéreo 107.0 FM",
    description: emisora.descripcion,
  },
};

export const viewport: Viewport = {
  themeColor: "#062a1a",
  width: "device-width",
  initialScale: 1,
  // Permite usar el área de la barra de inicio del iPhone (con safe-area en CSS).
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${anybody.variable} ${atkinson.variable}`}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-amarillo focus:px-3 focus:py-2"
        >
          Saltar al contenido
        </a>
        <ProveedorReproductor>
          <FranjaDemo />
          <Encabezado />
          <main id="contenido">{children}</main>
          <Pie />
          <BarraReproductor />
        </ProveedorReproductor>
      </body>
    </html>
  );
}
