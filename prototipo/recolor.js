// Motor de recolor: tiñe la foto de una pieza tejida en hilo claro con cualquier color
// conservando la textura real (puntadas, brillos y sombras).
//
// Idea: de la foto solo se usa el brillo de cada pixel. Se compara con el brillo
// promedio de la pieza: lo más claro que el promedio se acerca al blanco (brillos)
// y lo más oscuro se oscurece en proporción (huecos entre puntadas).

const toLin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const toSrgb = v => { v = Math.min(1, Math.max(0, v)); return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055) * 255); };
const hexRgb = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lumOf = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// Tabla de 256 brillos -> color final, para no calcular potencias por pixel.
function makeLut(hex, refLin, highlights = 0.35) {
  const c = hexRgb(hex).map(toLin);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const k = toLin(i) / refLin;
    for (let ch = 0; ch < 3; ch++) {
      const v = k <= 1 ? c[ch] * k : c[ch] + (1 - c[ch]) * Math.min(1, (k - 1) * highlights);
      lut[i * 3 + ch] = toSrgb(v);
    }
  }
  return lut;
}

// Una capa = una pieza recortada (cuerpo, correa, borla...). Guarda solo el
// rectángulo donde hay pieza, para teñir menos pixeles.
class Layer {
  constructor(canvas, role) {
    this.role = role;
    const { width: w, height: h } = canvas;
    const d = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 4) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) { this.empty = true; return; }
    Object.assign(this, { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
    if (role === 'fixed') { this.canvas = canvas; this.x = this.y = 0; return; }

    const n = this.w * this.h;
    this.lum = new Uint8Array(n);
    this.alpha = new Uint8Array(n);
    let sum = 0, cnt = 0;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const j = ((y + y0) * w + x + x0) * 4, i = y * this.w + x;
      const l = Math.round(lumOf(d[j], d[j + 1], d[j + 2]));
      this.lum[i] = l; this.alpha[i] = d[j + 3];
      if (d[j + 3] > 128) { sum += toLin(l); cnt++; }
    }
    this.ref = sum / Math.max(1, cnt);
    this.cache = new Map();
  }

  tinted(hex) {
    if (this.role === 'fixed') return this.canvas;
    let c = this.cache.get(hex);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    const ctx = c.getContext('2d'), img = ctx.createImageData(this.w, this.h), o = img.data;
    const lut = makeLut(hex, this.ref);
    for (let i = 0, n = this.lum.length; i < n; i++) {
      const l = this.lum[i] * 3, j = i * 4;
      o[j] = lut[l]; o[j + 1] = lut[l + 1]; o[j + 2] = lut[l + 2]; o[j + 3] = this.alpha[i];
    }
    ctx.putImageData(img, 0, 0);
    this.cache.set(hex, c);
    return c;
  }
}

// ---------- Selección en fotos subidas por el usuario ("varita mágica") ----------

// Desenfoque de caja separable; quita la textura del tejido para que la selección
// no se detenga en los huecos oscuros entre puntadas.
function boxBlur(src, w, h, ch, r) {
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
  const pass = (a, b, horiz) => {
    const len = horiz ? w : h, lines = horiz ? h : w;
    for (let L = 0; L < lines; L++) for (let c = 0; c < ch; c++) {
      let acc = 0;
      const at = k => { k = Math.min(len - 1, Math.max(0, k)); return ((horiz ? L * w + k : k * w + L) * ch) + c; };
      for (let k = -r; k <= r; k++) acc += a[at(k)];
      for (let k = 0; k < len; k++) {
        b[at(k)] = acc / (2 * r + 1);
        acc += a[at(k + r + 1)] - a[at(k - r)];
      }
    }
  };
  pass(src, tmp, true); pass(tmp, out, false);
  return out;
}

// Rellena desde (x0,y0) todos los pixeles conectados de color parecido.
function floodSelect(soft, w, h, x0, y0, tol) {
  const mask = new Uint8Array(w * h), s = (y0 * w + x0) * 3;
  const sr = soft[s], sg = soft[s + 1], sb = soft[s + 2], t2 = tol * tol * 3;
  const stack = [y0 * w + x0];
  while (stack.length) {
    const p = stack.pop();
    if (mask[p]) continue;
    const j = p * 3, dr = soft[j] - sr, dg = soft[j + 1] - sg, db = soft[j + 2] - sb;
    if (dr * dr + dg * dg + db * db > t2) continue;
    mask[p] = 255;
    const x = p % w;
    if (x > 0 && !mask[p - 1]) stack.push(p - 1);
    if (x < w - 1 && !mask[p + 1]) stack.push(p + 1);
    if (p >= w && !mask[p - w]) stack.push(p - w);
    if (p < w * (h - 1) && !mask[p + w]) stack.push(p + w);
  }
  return mask;
}

// Cierre morfológico (rellena huequitos) y borde suave de 1-2 px.
function refineMask(mask, w, h) {
  const morph = (a, r, isMax) => {
    const tmp = new Uint8Array(a.length), out = new Uint8Array(a.length);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = isMax ? 0 : 255;
      for (let k = -r; k <= r; k++) { const xx = Math.min(w - 1, Math.max(0, x + k)), m = a[y * w + xx]; v = isMax ? Math.max(v, m) : Math.min(v, m); }
      tmp[y * w + x] = v;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = isMax ? 0 : 255;
      for (let k = -r; k <= r; k++) { const yy = Math.min(h - 1, Math.max(0, y + k)), m = tmp[yy * w + x]; v = isMax ? Math.max(v, m) : Math.min(v, m); }
      out[y * w + x] = v;
    }
    return out;
  };
  const closed = morph(morph(mask, 3, true), 3, false);
  const soft = boxBlur(closed, w, h, 1, 1);
  return Uint8Array.from(soft, v => Math.round(v));
}
