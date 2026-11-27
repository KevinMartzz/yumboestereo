"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Aviso, TituloPanel } from "@/components/panel/MarcoPanel";
import { VistaPrevia } from "@/components/DetalleNoticia";
import { enlaceNoticia } from "@/components/Listas";
import { CATEGORIAS, ZONAS, type EstadoNoticia, type Noticia } from "@/data/noticias";
import { aCampoFecha, deCampoFecha, fechaLarga } from "@/lib/formato";
import { cambiar, nuevoId, useDemo } from "@/lib/store";

const vacia = (): Noticia => ({
  id: nuevoId("nota"),
  titulo: "",
  resumen: "",
  cuerpo: [""],
  categoria: "Comunidad",
  zona: "Yumbo",
  fecha: new Date().toISOString(),
  estado: "borrador",
  origen: "propia",
  autor: "Redacción Yumbo Estéreo",
});

function Editor() {
  const id = useSearchParams().get("id") ?? "nueva";
  const router = useRouter();
  const { noticias } = useDemo();
  const existente = noticias.find((n) => n.id === id);
  const [n, setN] = useState<Noticia | null>(null);
  const [vista, setVista] = useState<"editar" | "previa">("editar");
  const [mensaje, setMensaje] = useState("");
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);
  // Espera a que el navegador cargue lo guardado antes de decidir si la nota existe.
  useEffect(() => {
    if (!montado) return;
    setN((actual) => actual ?? existente ?? (id === "nueva" ? vacia() : null));
  }, [montado, existente, id]);

  if (!montado) return <p>Cargando…</p>;
  if (!n) {
    return (
      <p>
        No encontramos esa noticia.{" "}
        <Link href="/panel/noticias/" className="font-bold text-monte underline">Volver a la lista</Link>
      </p>
    );
  }

  const poner = (c: Partial<Noticia>) => {
    setMensaje("");
    setN({ ...n, ...c });
  };

  const guardar = (estado: EstadoNoticia) => {
    const final = { ...n, estado, fecha: estado === "publicada" && n.estado !== "publicada" ? new Date().toISOString() : n.fecha };
    const yaEsta = noticias.some((x) => x.id === n.id);
    const lista = yaEsta ? noticias.map((x) => (x.id === n.id ? final : x)) : [final, ...noticias];
    const accion = { borrador: "Guardó como borrador", programada: "Programó", publicada: "Publicó" }[estado];
    cambiar("noticias", lista, `${accion} la noticia «${final.titulo || "sin título"}»`);
    setN(final);
    setMensaje(
      estado === "publicada"
        ? "Publicada. Ya se ve en la web."
        : estado === "programada"
          ? `Programada. Sale sola el ${fechaLarga(final.fecha)}.`
          : "Guardada como borrador. No se ve en la web.",
    );
    if (id === "nueva") router.replace(`/panel/noticias/editar/?id=${final.id}`);
  };

  const listaParaPublicar = n.titulo.trim().length > 5 && n.resumen.trim().length > 10;
  const sinFuentes = n.origen === "ia" && !n.fuentes?.length;

  return (
    <>
      <TituloPanel
        titulo={id === "nueva" ? "Nueva noticia" : "Editar noticia"}
        acciones={
          <div className="flex gap-1 rounded-full border border-linea bg-white p-1" role="group" aria-label="Modo">
            {(["editar", "previa"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={vista === v}
                onClick={() => setVista(v)}
                className="rounded-full px-4 py-1.5 font-bold aria-pressed:bg-monte aria-pressed:text-white"
              >
                {v === "editar" ? "Editar" : "Vista previa"}
              </button>
            ))}
          </div>
        }
      >
        <Link href="/panel/noticias/" className="font-bold text-monte underline">
          Volver a la lista
        </Link>
      </TituloPanel>

      {n.origen === "ia" ? (
        <div className="mb-5">
          <Aviso>
            <strong>Este borrador lo preparó la herramienta de noticias con IA.</strong> Revisa cada dato contra las
            fuentes antes de publicar. Las fuentes se muestran al final de la nota y no se pueden quitar.
          </Aviso>
        </div>
      ) : null}

      {vista === "previa" ? (
        <div className="rounded-xl border border-linea bg-papel pb-10">
          <VistaPrevia n={{ ...n, cuerpo: n.cuerpo.filter(Boolean) }} />
        </div>
      ) : (
        <form className="grid gap-6 rounded-xl border border-linea bg-white p-5 lg:grid-cols-[1fr_18rem]" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-5">
            <div>
              <label className="etiqueta" htmlFor="titulo">Título</label>
              <input id="titulo" className="campo text-lg" value={n.titulo} onChange={(e) => poner({ titulo: e.target.value })} />
              <span className="ayuda">Corto y claro, como lo diría al aire. Ideal: menos de 90 caracteres ({n.titulo.length}).</span>
            </div>
            <div>
              <label className="etiqueta" htmlFor="resumen">Resumen</label>
              <textarea id="resumen" rows={2} className="campo" value={n.resumen} onChange={(e) => poner({ resumen: e.target.value })} />
              <span className="ayuda">Una o dos frases. Es lo que se ve en la portada y al compartir en redes.</span>
            </div>
            <div>
              <label className="etiqueta" htmlFor="cuerpo">Texto de la nota</label>
              <textarea
                id="cuerpo"
                rows={10}
                className="campo"
                value={n.cuerpo.join("\n\n")}
                onChange={(e) => poner({ cuerpo: e.target.value.split(/\n{2,}/) })}
              />
              <span className="ayuda">Deja una línea en blanco entre párrafos.</span>
            </div>
            {n.fuentes?.length ? (
              <div>
                <p className="etiqueta">Fuentes</p>
                <ul className="space-y-1">
                  {n.fuentes.map((f) => (
                    <li key={f.url}>
                      <a href={f.url} className="text-monte underline" rel="noopener">{f.medio}</a>: {f.titulo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <label className="etiqueta" htmlFor="categoria">Tema</label>
              <select id="categoria" className="campo" value={n.categoria} onChange={(e) => poner({ categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="etiqueta" htmlFor="zona">Zona</label>
              <select id="zona" className="campo" value={n.zona} onChange={(e) => poner({ zona: e.target.value })}>
                {ZONAS.map((z) => <option key={z}>{z}</option>)}
              </select>
              <span className="ayuda">Municipio o corregimiento. Sirve para filtrar en la web.</span>
            </div>
            <div>
              <label className="etiqueta" htmlFor="fecha">Fecha de publicación</label>
              <input
                id="fecha"
                type="datetime-local"
                className="campo"
                value={aCampoFecha(n.fecha)}
                onChange={(e) => e.target.value && poner({ fecha: deCampoFecha(e.target.value) })}
              />
              <span className="ayuda">Hora de Colombia. Para programar, elige una fecha futura.</span>
            </div>

            <div className="space-y-2 border-t border-linea pt-5">
              <button type="button" className="btn btn-monte w-full justify-center" disabled={!listaParaPublicar || sinFuentes} onClick={() => guardar("publicada")}>
                Publicar ahora
              </button>
              <button
                type="button"
                className="btn btn-borde w-full justify-center text-monte"
                disabled={!listaParaPublicar || new Date(n.fecha) <= new Date()}
                onClick={() => guardar("programada")}
              >
                Programar
              </button>
              <button type="button" className="btn w-full justify-center text-gris hover:bg-papel" onClick={() => guardar("borrador")}>
                Guardar como borrador
              </button>
              {!listaParaPublicar ? <p className="text-sm text-gris">Para publicar falta el título y el resumen.</p> : null}
              <p className="text-sm text-gris">Estado actual: <strong>{n.estado}</strong></p>
            </div>
          </div>
        </form>
      )}

      {mensaje ? (
        <div className="mt-4">
          <Aviso tono="ok">
            {mensaje}{" "}
            {n.estado === "publicada" ? (
              <Link href={enlaceNoticia(n)} className="font-bold text-monte underline">Ver en la web</Link>
            ) : null}
          </Aviso>
        </div>
      ) : null}
    </>
  );
}

export default function EditarNoticia() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
