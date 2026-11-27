import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BarraReproductor, ProveedorReproductor } from "@/components/Reproductor";
import { Encabezado, FranjaDemo, Pie } from "@/components/Marco";
import { emisora } from "@/data/emisora";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
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
