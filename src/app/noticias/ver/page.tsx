import { Suspense } from "react";
import { DetalleNoticiaPorParametro } from "@/components/DetalleNoticia";

export default function VerNoticia() {
  return (
    <Suspense>
      <DetalleNoticiaPorParametro />
    </Suspense>
  );
}
