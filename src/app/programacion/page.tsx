import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { ParrillaSemanal } from "@/components/Parrilla";

export const metadata: Metadata = { title: "Programación" };

export default function Programacion() {
  return (
    <>
      <Cabecera titulo="Programación">
        Lo que suena cada día en el 107.0 FM. El programa resaltado está al aire en este momento.
      </Cabecera>
      <section className="mx-auto max-w-6xl px-4">
        <ParrillaSemanal />
      </section>
    </>
  );
}
