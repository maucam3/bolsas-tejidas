# Trama · Handwoven bags

Online store for handwoven bags with a live bag configurator.

**👉 Live site: <https://maucam3.github.io/bolsas-tejidas/>**

> The store itself is in Spanish.

## Features

- **Preset designs**: six example bags that can be bought as they are or customized.
- **Design studio**: bag model (tote, bucket, half-moon, envelope), yarn type (cotton, jute, macramé, t-shirt yarn, raffia), 14 yarn colors, weave pattern, strap and accessories (tassel, pom-pom, shell charm, button, fringe, lining), plus embroidered initials.
- **Live SVG preview** that redraws instantly, with a magnifier to inspect the yarn texture.
- **Surprise me**: generates a random design.
- **Share**: copies a link to the exact design.
- **Cart** stored in the browser (checkout is simulated).

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
