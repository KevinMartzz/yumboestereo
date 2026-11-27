import Link from "next/link";

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16">
      <h1 className="titular text-6xl text-monte">Esta página no existe</h1>
      <p className="mt-4 text-lg">
        Revisa la dirección o vuelve al <Link href="/" className="font-bold underline">inicio</Link>. La señal sigue
        sonando abajo.
      </p>
    </div>
  );
}
