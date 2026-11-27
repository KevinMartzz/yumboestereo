# Yumbo Estéreo 107.0 FM: demo de la propuesta

Prototipo navegable de la nueva web de Yumbo Estéreo, la emisora comunitaria de Yumbo (Valle del Cauca). Sirve para presentar la propuesta: se puede escuchar, navegar, cambiar un horario desde el panel y pasar de una noticia a un guion para el aire.

**Es una demo estática** (GitHub Pages): no tiene servidor ni base de datos. La versión real irá en un repositorio privado, con Payload CMS y PostgreSQL en un servidor propio.

## Qué es real y qué es de ejemplo

| Parte | En la demo |
|---|---|
| Nombres de los programas | Reales (aparecen en TuneIn) |
| Dirección, teléfono, WhatsApp, redes, corregimientos | Reales (de la web actual) |
| Horarios, descripciones de programas | De ejemplo |
| Locutores | Solo Leonardo Orozco es real; los demás son inventados y van marcados |
| Noticias, clasificados, solicitudes | Ficticios y marcados |
| Noticias con IA | Ficticias: medios inventados y enlaces a `example.com` |
| Señal en vivo | Tono de prueba: falta la URL real del streaming |

## Qué funciona y qué está simulado

- **Funciona de verdad:**
  - Reproductor fijo que no se corta al navegar, con estados (en pausa, conectando, al aire, reconectando, sin señal), reconexión sola y controles en la pantalla de bloqueo del celular.
  - «Al aire ahora» y el dial de hoy, calculados con la hora de Colombia.
  - Programación semanal, páginas de programas y locutores, noticias, clasificados (los vencidos se ocultan solos), pauta, contacto y textos legales en borrador.
- **Simulado en el navegador:** el panel guarda los cambios en `localStorage`. Cada persona que prueba ve sus propios cambios, y «Restablecer la demo» los borra. Con eso se puede:
  - mover horarios, con aviso cuando dos programas se cruzan;
  - escribir, programar y publicar noticias, con vista previa;
  - publicar clasificados;
  - recibir los formularios en una bandeja;
  - deshacer cambios desde el historial;
  - cambiar de rol (administrador, editor o comercial).
- **Noticias reales, automáticas:** la pestaña «Lo último» del tablero muestra noticias reales. Un flujo de GitHub Actions (`.github/workflows/noticias.yml`) corre `scripts/recolectar.mts` cada 3 horas. El script lee los RSS de `data/fuentes.json`, agrupa las notas del mismo hecho sin IA (`src/lib/noticias.ts`, con pruebas), guarda el resultado en `public/datos/noticias.json` y vuelve a publicar la demo. El estado de cada fuente queda en `docs/fuentes-noticias.md`.
- **Preparado de antemano:** la pestaña «Resúmenes y guiones». Los hechos agrupados, los resúmenes con fuentes, las alertas de fuente única o de contradicción y los guiones de 30, 60 y 90 s están escritos de antemano. En la versión real los genera la API de Claude a partir de los RSS.

## Correrlo en local

Requiere Node 22.

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # pruebas de horarios y de agrupación de noticias
node --experimental-strip-types scripts/recolectar.mts   # recolectar noticias (necesita internet)
npm run build   # genera el sitio estático en out/
```

## Publicarlo en GitHub Pages

1. El repositorio debe ser público (Pages gratis no funciona con repos privados).
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Cada push a `main` corre las pruebas, compila y publica (`.github/workflows/pages.yml`). La dirección queda como `https://<usuario>.github.io/yumboestereo/`.

La demo le pide a Google que no la indexe (`noindex` y `robots.txt`), para que no compita con el sitio oficial.

## Cómo cambiar el contenido base

- **Señal en vivo:** `src/data/emisora.ts` → `streamUrl` (debe ser HTTPS). Si el servidor es Icecast, también `metadatosUrl` (su `status-json.xsl`) para mostrar «Sonando ahora».
- **Programas:** `src/data/programas.ts`.
- **Horarios:** `src/data/horarios.ts`.
- **Locutores:** `src/data/locutores.ts`.
- **Noticias:** `src/data/noticias.ts`.
- **Clasificados:** `src/data/clasificados.ts`.
- **Tablero de IA:** `public/datos/hechos.json` (hechos reales procesados) o, si no existe, `src/data/hechos-ia.ts` (ejemplo).
- **Fuentes de noticias:** `data/fuentes.json` (ver `docs/fuentes-noticias.md`).
- **Audio de prueba:** `npm run audio` lo vuelve a generar (necesita ffmpeg).

## Estructura

```
src/app/            páginas públicas y panel (/panel)
src/components/     reproductor, dial, parrilla, listas, formularios, panel
src/data/           contenido de ejemplo
src/lib/horario.ts  "al aire ahora", días completos, cruces (con pruebas)
src/lib/store.ts    almacén de la demo (localStorage + historial)
```

## Lo que falta de parte de la emisora

- La URL real del streaming, y si da metadatos y estadísticas de oyentes.
- El logo en alta, los colores oficiales y las fotos de los locutores.
- La parrilla real con horarios, y quién conduce cada programa.
- Las tarifas o paquetes de pauta y de clasificados, si quieren mostrarlos.
- El correo oficial, la razón social y el NIT (para la política de datos, Ley 1581 de 2012).
- Si tienen o planean una app (la web actual menciona «Privacidad de la app»).
- Confirmar con MinTIC qué permite una emisora comunitaria en publicidad y patrocinio.
