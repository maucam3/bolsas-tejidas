# Lilián Cuevas · Handwoven bags

*¡Una ventana al arte!* Online store for Lilián Cuevas' handwoven bags, with real product photos, live recoloring on those photos and a bag configurator.

**👉 Live site: <https://maucam3.github.io/bolsas-tejidas/>**

> The store itself is in Spanish.

## Features

- **Real bags**: photo gallery of finished bags with several views each and tap-to-zoom.
- **Try another color**: recolors the real photo in the browser, keeping every stitch and the yarn's sheen.
- **Preset designs**: six example bags that can be bought as they are or customized.
- **Design studio**: bag model (tote, bucket, half-moon, envelope), yarn type (cotton, jute, macramé, t-shirt yarn, raffia), 14 yarn colors, weave pattern, strap and accessories (tassel, pom-pom, shell charm, button, fringe, lining), plus embroidered initials.
- **Live SVG preview** that redraws instantly, with a magnifier to inspect the yarn texture.
- **Surprise me**: generates a random design.
- **Share**: copies a link to the exact design.
- **Cart** stored in the browser (checkout is simulated).

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
- `styles.css`: styles and responsive layout.
- `bag.js`: catalog (colors, yarns, straps…) and the SVG bag renderer.
- `app.js`: configurator, presets, cart and animations.
- `real.js`: real-photo gallery, zoom and recoloring (uses `prototipo/recolor.js`).
- `img/`: web-sized photos, recolor maps and the logo.
