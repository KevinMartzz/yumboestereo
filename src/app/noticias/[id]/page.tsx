import type { Metadata } from "next";
import { noticiasEjemplo } from "@/data/noticias";
import { DetalleNoticia } from "@/components/DetalleNoticia";

export const dynamicParams = false;
export function generateStaticParams() {
  return noticiasEjemplo.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const n = noticiasEjemplo.find((x) => x.id === id);
  return n
    ? { title: n.titulo, description: n.resumen, openGraph: { type: "article", title: n.titulo, description: n.resumen } }
    : {};
}

export default async function PaginaNoticia({ params }: { params: Promise<{ id: string }> }) {
  return <DetalleNoticia id={(await params).id} />;
}
