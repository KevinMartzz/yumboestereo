import type { NextConfig } from "next";

// En GitHub Pages el sitio vive en /<nombre-del-repo>. El flujo de despliegue
// pasa esa ruta en NEXT_PUBLIC_BASE_PATH; en local queda vacía.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
