# Trama · Bolsas tejidas a mano

Tienda web de demostración para bolsas tejidas a mano con un configurador en vivo.

## Qué incluye

- **Diseños prestablecidos**: seis bolsas de ejemplo que se pueden comprar tal cual o personalizar.
- **Taller de diseño**: modelo (tote, balde, media luna, sobre), tipo de hilo (algodón, yute, macramé, trapillo, rafia), 14 colores de hilo, patrón del tejido, correa y accesorios (borla, pompón, dije de concha, botón, flecos, forro) más iniciales bordadas.
- **Vista previa en SVG** que se dibuja al instante, con lupa para ver la textura del hilo.
- **Sorpréndeme**: genera un diseño al azar.
- **Compartir**: copia un enlace con el diseño exacto.
- **Carrito** guardado en el navegador (el pedido es simulado).

## Cómo verlo

Es HTML, CSS y JavaScript puro, sin dependencias. Desde esta carpeta:

```bash
python -m http.server 5500
```

y abre <http://localhost:5500>.

## Archivos

- `index.html`: estructura de la página.
- `styles.css`: estilos y diseño responsive.
- `bag.js`: catálogo (colores, hilos, correas…) y el dibujo de la bolsa en SVG.
- `app.js`: configurador, diseños, carrito y animaciones.
