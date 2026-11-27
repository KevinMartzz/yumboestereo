import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { ListaNoticias } from "@/components/Listas";

export const metadata: Metadata = { title: "Noticias" };

export default function Noticias() {
  return (
    <>
      <Cabecera titulo="Noticias">
        Lo que pasa en Yumbo, sus corregimientos y el Valle. Las notas con fuentes externas citan y enlazan
        al medio original.
      </Cabecera>
      <section className="mx-auto max-w-6xl px-4">
        <ListaNoticias />
      </section>
    </>
  );
}
