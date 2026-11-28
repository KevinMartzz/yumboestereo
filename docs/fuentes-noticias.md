# Fuentes de noticias

Este archivo lo escribe el recolector (`scripts/recolectar.mts`) en cada corrida. No lo edites a mano: para agregar una fuente, edita `data/fuentes.json`.

Última revisión: **2026-11-28 11:50 UTC**

| Medio | ¿Funciona? | Notas | Nota más reciente | RSS que se usa / motivo de la falla |
|---|---|---|---|---|
| Google News: Yumbo | Sí | 40 | 2026-11-27 21:54 UTC | `https://news.google.com/rss/search?q=Yumbo&hl=es-419&gl=CO&ceid=CO:es-419` |
| Google News: Cali y Valle | Sí | 40 | 2026-11-28 11:32 UTC | `https://news.google.com/rss/search?q=Cali+OR+%22Valle+del+Cauca%22&hl=es-419&gl=CO&ceid=CO:es-419` |
| Google News: Colombia | Sí | 34 | 2026-11-28 04:01 UTC | `https://news.google.com/rss?hl=es-419&gl=CO&ceid=CO:es-419` |
| El País Cali | Sí | 40 | 2026-11-28 04:13 UTC | `https://www.elpais.com.co/arc/outboundfeeds/rss/?outputType=xml` |
| 90 Minutos | Sí | 12 | 2026-11-27 22:06 UTC | `https://90minutos.co/feed/` |
| El Tiempo | Sí | 10 | 2026-11-28 09:22 UTC | `https://www.eltiempo.com/rss/colombia.xml` |
| El Espectador | Sí | 20 | 2026-11-28 05:08 UTC | `https://www.elespectador.com/arc/outboundfeeds/discover/` (encontrada en la página) |
| Semana | Sí | 40 | 2026-11-28 11:40 UTC | `https://www.semana.com/arc/outboundfeeds/rss/?outputType=xml` |
| Caracol Radio | Sí | 40 | 2026-11-28 11:34 UTC | `https://caracol.com.co/arc/outboundfeeds/rss/?outputType=xml` |
| Blu Radio | No | - | - | HTTP 404; Maximum nested tags exceeded |
| La FM | No | - | - | HTTP 404; la página no anuncia RSS |
| RCN Radio | No | - | - | no es un RSS/Atom; no es un RSS/Atom; la página no anuncia RSS |
| Infobae Colombia | Sí | 40 | 2026-11-28 11:33 UTC | `https://www.infobae.com/arc/outboundfeeds/rss/category/colombia/?outputType=xml` |
| El Colombiano | No | - | - | HTTP 404; la página no anuncia RSS |
| La República | Sí | 40 | 2026-11-28 05:05 UTC | `https://www.larepublica.co/rss/` |

## Señal en vivo (reproductor de la web actual)

```json
{
  "pagina": "https://roquetest.dongee.com/radio_yumbo.php",
  "revisado": "2026-11-28T11:50:28.331Z",
  "paginaEstado": 200,
  "paginaTipo": "audio/mpeg",
  "recursos": [],
  "fragmentos": [],
  "candidatas": [
    "https://roquetest.dongee.com/radio_yumbo.php"
  ],
  "pruebas": [
    {
      "url": "https://roquetest.dongee.com/radio_yumbo.php",
      "estado": 200,
      "content-type": "audio/mpeg",
      "server": "LiteSpeed"
    }
  ]
}
```

## Cómo agregar una fuente

1. Agrega un bloque en `data/fuentes.json` con `id`, `medio`, `tipo` (`regional`, `nacional` o `agregador`), `inicio` (página principal) y `candidatas` (direcciones de RSS a probar).
2. Si no conoces el RSS, deja `candidatas` vacío: el recolector lo busca en la página principal.
3. Corre el flujo «Recolectar noticias» en la pestaña Actions de GitHub y revisa este archivo.
