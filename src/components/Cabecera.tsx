export function Cabecera({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-8">
      <h1 className="titular text-[clamp(2.6rem,7vw,4.75rem)] text-monte">{titulo}</h1>
      {children ? <div className="mt-4 max-w-2xl text-lg text-gris">{children}</div> : null}
    </div>
  );
}
