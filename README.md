# Lilián Cuevas · Handwoven bags

*¡Una ventana al arte!* Online store for Lilián Cuevas' handwoven bags, with real product photos, live recoloring on those photos and a bag configurator.

**👉 Live site: <https://maucam3.github.io/bolsas-tejidas/>**

> The store itself is in Spanish.

## Features

- **The studio**: real photos of finished bags, several views each and tap-to-zoom.
- **Try another color**: recolors the real photo in the browser, keeping every stitch and the yarn's sheen.
- **Moonlight**: a WebGL light that follows your finger or mouse over the real photo, revealing the relief of each stitch (estimated from the photo itself).
- **Scroll effects**: windows that open their shutters, stitched headings, and a yarn thread that knits itself through the process steps.
- **Order list** stored in the browser, with a thumbnail of the chosen color (sending is simulated; prices pending).
- **Share**: copies a link to the exact bag and color.

## Install as an app

The store is an installable web app (PWA) that also opens offline.

- **Android (Chrome)**: open the link → *Install app* button in the header, or menu ⋮ → *Install app*.
- **iPhone (Safari)**: open the link → Share button → *Add to Home Screen*.
- **Desktop (Chrome or Edge)**: install icon in the address bar.

## Run locally

Plain HTML, CSS and JavaScript, no dependencies. From this folder:

```bash
python -m http.server 5500
```

then open <http://localhost:5500>.

## Files

- `index.html`: page structure.
- `styles.css`: styles, animations and responsive layout.
- `colores.js`: placeholder yarn colors (to be replaced with the real ones).
- `estudio.js`: the studio (bags, views, recoloring, order button, share link) and the hero.
- `luz.js`: moonlight relighting (WebGL).
- `app.js`: order list, scroll effects and installable app.
- `prototipo/`: earlier lab; `prototipo/recolor.js` is the recoloring engine used by the store.
- `img/`: web-sized photos, recolor maps and the logo.

Version history: `v0.1` tag = first version with real photos and the Lilián Cuevas brand.
