// Fotos de PRUEBA hechas por computadora, por capas y en hilo claro.
// Cuando lleguen las fotos reales, cada función build* se cambia por cargar el PNG
// recortado de esa pieza; el motor de recolor no cambia.

const W = 800, H = 960;

function rng(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function canvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const gray = v => { v = Math.max(0, Math.min(255, v | 0)); return `rgb(${v},${v},${v})`; };

// Cómo se ve cada hilo: tamaño de puntada, irregularidad, pelusa y forma del hilo.
const LOOK = {
  algodon: { sw: 18, rh: 20, jit: .5, fib: .6, hair: 0, gap: 62, kind: 'round' },
  yute: { sw: 22, rh: 24, jit: 1.8, fib: 5, hair: 45, gap: 78, kind: 'round' },
  macrame: { sw: 30, rh: 32, jit: .8, fib: .4, hair: 0, gap: 52, kind: 'twist' },
  trapillo: { sw: 32, rh: 30, jit: .6, fib: 0, hair: 0, gap: 48, kind: 'fat' },
  rafia: { sw: 20, rh: 22, jit: 1.2, fib: 0, hair: 0, gap: 66, kind: 'flat' },
};

// Un "brazo" de la puntada: elipse con luz arriba a la izquierda.
function loop(ctx, x, y, rx, ry, ang, base, kind, r) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  let gr;
  if (kind === 'flat') {
    gr = ctx.createLinearGradient(-rx, 0, rx, 0);
    gr.addColorStop(0, gray(base - 75)); gr.addColorStop(.35, gray(base + 5));
    gr.addColorStop(.5, gray(base + 45)); gr.addColorStop(.65, gray(base)); gr.addColorStop(1, gray(base - 85));
  } else {
    gr = ctx.createRadialGradient(-rx * .25, -ry * .3, 0, 0, 0, Math.max(rx, ry) * 1.05);
    gr.addColorStop(0, gray(base + 30)); gr.addColorStop(kind === 'fat' ? .6 : .45, gray(base)); gr.addColorStop(1, gray(base - 95));
  }
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  if (kind === 'twist') {
    ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,.26)'; ctx.lineWidth = 1.6;
    for (let k = -ry * 1.6; k < ry * 1.6; k += 6) { ctx.beginPath(); ctx.moveTo(-rx, k); ctx.lineTo(rx, k + rx * 1.3); ctx.stroke(); }
  } else if (kind === 'flat') {
    ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = .8;
    for (let k = 0; k < 3; k++) { const xx = (r() - .5) * rx * 1.4; ctx.beginPath(); ctx.moveTo(xx, -ry); ctx.lineTo(xx + (r() - .5) * 3, ry); ctx.stroke(); }
  }
  ctx.restore();
}

function stitch(ctx, x, y, L, r, s = 1, ang = 0) {
  const base = 205 + (r() - .5) * 24;
  const rx = L.sw * s * (L.kind === 'fat' ? .34 : .27), ry = L.rh * s * .62;
  const dx = Math.cos(ang) * L.sw * s * .2, dy = Math.sin(ang) * L.sw * s * .2;
  loop(ctx, x - dx, y - dy, rx, ry, ang - .42, base, L.kind, r);
  loop(ctx, x + dx, y + dy, rx, ry, ang + .42, base - 6, L.kind, r);
}

function fibers(ctx, w, h, L, r, s = 1) {
  const n = (w * h) / (L.sw * L.rh * s * s) * L.fib;
  ctx.lineWidth = .6 * s;
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, a = r() * Math.PI * 2, l = (3 + r() * 8) * s;
    ctx.strokeStyle = r() < .5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.16)';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * l / 2 + (r() - .5) * 3 * s, y + Math.sin(a) * l / 2 + (r() - .5) * 3 * s, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.lineWidth = .5 * s;
  for (let i = 0, m = L.hair * w * h / 1e5; i < m; i++) {
    const x = r() * w, y = r() * h, a = r() * Math.PI * 2, l = (10 + r() * 14) * s;
    ctx.strokeStyle = 'rgba(235,235,235,.35)';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (r() - .5) * 10 * s, y + (r() - .5) * 10 * s, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

// Lienzo completo de tejido de punto (columnas de "V").
function knit(w, h, yarn, seed = 1, s = 1) {
  const L = LOOK[yarn], r = rng(seed), c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = gray(L.gap); ctx.fillRect(0, 0, w, h);
  for (let y = -L.rh * s; y < h + L.rh * s; y += L.rh * s)
    for (let x = -L.sw * s; x < w + L.sw * s; x += L.sw * s)
      stitch(ctx, x + (r() - .5) * L.jit * 2 * s, y + (r() - .5) * L.jit * 2 * s, L, r, s);
  fibers(ctx, w, h, L, r, s);
  return c;
}

// ---------- Geometría de la bolsa (vista de frente) ----------

function bodyPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(215, 300); ctx.lineTo(585, 300);
  ctx.bezierCurveTo(600, 480, 625, 700, 630, 790);
  ctx.quadraticCurveTo(632, 845, 575, 848);
  ctx.lineTo(225, 848);
  ctx.quadraticCurveTo(168, 845, 170, 790);
  ctx.bezierCurveTo(175, 700, 200, 480, 215, 300);
  ctx.closePath();
}
const HANDLE_FRONT = [[300, 314], [290, 80], [510, 80], [500, 314]];
const HANDLE_BACK = [[322, 286], [314, 108], [486, 108], [478, 286]];

function bezierPoints(P, step) {
  const pts = [];
  let prev = null, acc = 0;
  for (let i = 0; i <= 800; i++) {
    const t = i / 800, m = 1 - t;
    const x = m ** 3 * P[0][0] + 3 * m * m * t * P[1][0] + 3 * m * t * t * P[2][0] + t ** 3 * P[3][0];
    const y = m ** 3 * P[0][1] + 3 * m * m * t * P[1][1] + 3 * m * t * t * P[2][1] + t ** 3 * P[3][1];
    if (prev) { acc += Math.hypot(x - prev.x, y - prev.y); if (acc < step && i < 800) { prev = { x, y }; continue; } acc = 0; }
    prev = { x, y }; pts.push({ x, y });
  }
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; p.a = Math.atan2(b.y - a.y, b.x - a.x); });
  return pts;
}
function bezierStroke(ctx, P) { ctx.beginPath(); ctx.moveTo(...P[0]); ctx.bezierCurveTo(...P[1], ...P[2], ...P[3]); }

function buildBackground(bottom = false) {
  const c = canvas(), x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#f1ece4'); gr.addColorStop(1, '#ddd3c5');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.save();
  x.translate(400, bottom ? 520 : 862); x.scale(1, bottom ? .7 : .085);
  const sh = x.createRadialGradient(0, 0, 0, 0, 0, bottom ? 360 : 300);
  sh.addColorStop(0, 'rgba(70,45,25,.38)'); sh.addColorStop(1, 'rgba(70,45,25,0)');
  x.fillStyle = sh; x.fillRect(-420, -420, 840, 840);
  x.restore();
  return c;
}

function buildBody(yarn) {
  const L = LOOK[yarn], r = rng(11), tex = knit(W, H, yarn, 3);
  const c = canvas(), x = c.getContext('2d');
  // Interior visible (pared de atrás), más oscuro.
  x.save();
  x.beginPath(); x.moveTo(215, 302); x.quadraticCurveTo(400, 262, 585, 302); x.closePath(); x.clip();
  x.drawImage(tex, 0, 0); x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, H);
  x.restore();
  // Cuerpo.
  x.save();
  bodyPath(x); x.clip();
  x.drawImage(tex, 0, 0);
  // Orilla superior en canalé.
  x.fillStyle = gray(L.gap); x.fillRect(150, 298, 500, 38);
  for (let xx = 205; xx < 600; xx += 9) loop(x, xx + (r() - .5), 317, 4.6, 15, .22, 212 + (r() - .5) * 20, L.kind === 'flat' ? 'flat' : 'round', r);
  let gr = x.createLinearGradient(0, 334, 0, 352);
  gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 334, W, 18);
  // Volumen: más oscuro a los lados y abajo.
  x.globalCompositeOperation = 'multiply';
  gr = x.createLinearGradient(170, 0, 630, 0);
  [[0, 140], [.16, 222], [.42, 255], [.78, 218], [1, 118]].forEach(([o, v]) => gr.addColorStop(o, gray(v)));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  gr = x.createLinearGradient(0, 300, 0, 850);
  [[0, 238], [.7, 255], [1, 168]].forEach(([o, v]) => gr.addColorStop(o, gray(v)));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.restore();
  return c;
}

// Correa: 'cordon' trenzado, 'tejida' (banda de puntadas) o 'piel'.
function paintStrap(x, type, P, r) {
  x.lineCap = 'round';
  if (type === 'cordon') {
    bezierStroke(x, P); x.lineWidth = 22; x.strokeStyle = gray(70); x.stroke();
    for (const p of bezierPoints(P, 6)) loop(x, p.x, p.y, 4.6, 12, p.a + .6, 208 + (r() - .5) * 20, 'round', r);
  } else if (type === 'tejida') {
    bezierStroke(x, P); x.lineWidth = 30; x.strokeStyle = gray(60); x.stroke();
    const L = { sw: 15, rh: 11, kind: 'round' };
    for (const p of bezierPoints(P, 10)) {
      const n = p.a + Math.PI / 2;
      for (const s of [-1, 1]) loop(x, p.x + Math.cos(n) * s * 6.5, p.y + Math.sin(n) * s * 6.5, 4.2, 8.5, p.a - Math.PI / 2 + s * .42, 205 + (r() - .5) * 22, L.kind, r);
    }
  } else {
    bezierStroke(x, P); x.lineWidth = 26; x.strokeStyle = gray(80); x.stroke();
    x.lineWidth = 22; x.strokeStyle = gray(168); x.stroke();
    x.lineWidth = 7; x.strokeStyle = 'rgba(255,255,255,.28)'; x.stroke();
    x.setLineDash([5, 4]); x.lineWidth = 1.5; x.strokeStyle = gray(232);
    for (const s of [-1, 1]) {
      const pts = bezierPoints(P, 4);
      x.beginPath();
      pts.forEach((p, i) => { const n = p.a + Math.PI / 2, px = p.x + Math.cos(n) * s * 8, py = p.y + Math.sin(n) * s * 8; i ? x.lineTo(px, py) : x.moveTo(px, py); });
      x.stroke();
    }
    x.setLineDash([]);
  }
}

function buildStrap(type, back) {
  const c = canvas(), x = c.getContext('2d'), r = rng(back ? 21 : 22);
  paintStrap(x, type, back ? HANDLE_BACK : HANDLE_FRONT, r);
  if (back) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(0,0,0,.32)'; x.fillRect(0, 0, W, H); }
  return c;
}

// Argollas metálicas de la correa de piel (no se tiñen).
function buildRings() {
  const c = canvas(), x = c.getContext('2d');
  for (const [px, py] of [HANDLE_FRONT[0], HANDLE_FRONT[3]]) {
    x.lineWidth = 5; x.strokeStyle = '#a9853a';
    x.beginPath(); x.arc(px, py + 6, 11, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 2; x.strokeStyle = '#f3dc9a';
    x.beginPath(); x.arc(px - 1, py + 5, 11, Math.PI * 1.05, Math.PI * 1.6); x.stroke();
  }
  return c;
}

// Franja de la base que se ve de frente (solo piel y corcho; la tejida es parte del cuerpo).
function buildBaseFront(type) {
  const c = canvas(), x = c.getContext('2d');
  if (type === 'tejida') return c;
  x.beginPath(); x.roundRect(176, 830, 448, 28, 14);
  x.save(); x.clip();
  baseMaterial(x, type, 400, 844, 260, 30, rng(5));
  const gr = x.createLinearGradient(0, 830, 0, 858);
  gr.addColorStop(0, 'rgba(255,255,255,.25)'); gr.addColorStop(.4, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.35)');
  x.fillStyle = gr; x.fillRect(0, 830, W, 28);
  if (type === 'piel') { x.setLineDash([5, 4]); x.strokeStyle = gray(232); x.lineWidth = 1.4; x.beginPath(); x.moveTo(186, 837); x.lineTo(614, 837); x.stroke(); }
  x.restore();
  return c;
}

function baseMaterial(x, type, cx, cy, rx, ry, r) {
  if (type === 'piel') {
    const gr = x.createRadialGradient(cx - rx * .2, cy - ry * .25, 0, cx, cy, Math.max(rx, ry));
    gr.addColorStop(0, gray(196)); gr.addColorStop(1, gray(132));
    x.fillStyle = gr; x.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    for (let i = 0; i < rx * ry * .12; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.07)'; x.fillRect(cx + (r() - .5) * 2 * rx, cy + (r() - .5) * 2 * ry, 1.5, 1.5); }
  } else {
    x.fillStyle = gray(178); x.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    for (let i = 0; i < rx * ry * .3; i++) {
      x.fillStyle = gray(130 + r() * 110);
      x.beginPath(); x.ellipse(cx + (r() - .5) * 2 * rx, cy + (r() - .5) * 2 * ry, .6 + r() * 1.8, .6 + r() * 1.4, r() * 3, 0, Math.PI * 2); x.fill();
    }
  }
}

// ---------- Accesorios ----------

function buildAccessory(id) {
  const c = canvas(), x = c.getContext('2d'), r = rng(31 + id.length);
  if (id === 'borla') {
    x.lineWidth = 3; x.strokeStyle = gray(170);
    x.beginPath(); x.moveTo(256, 322); x.quadraticCurveTo(244, 350, 248, 378); x.stroke();
    for (let i = 0; i < 80; i++) {
      const x0 = 248 + (r() - .5) * 22, len = 108 + r() * 22;
      x.strokeStyle = gray(150 + r() * 95); x.lineWidth = 1.4 + r() * 1.2;
      x.beginPath(); x.moveTo(x0, 392); x.quadraticCurveTo(x0 + (r() - .5) * 10, 392 + len / 2, x0 + (x0 - 248) * .5 + (r() - .5) * 8, 392 + len); x.stroke();
    }
    const cap = x.createRadialGradient(243, 380, 1, 248, 386, 15);
    cap.addColorStop(0, gray(240)); cap.addColorStop(1, gray(130));
    x.fillStyle = cap; x.beginPath(); x.arc(248, 386, 14, 0, Math.PI * 2); x.fill();
    x.fillStyle = gray(115); x.beginPath(); x.ellipse(248, 404, 13, 5, 0, 0, Math.PI * 2); x.fill();
  } else if (id === 'pompon') {
    x.lineWidth = 3; x.strokeStyle = gray(170);
    x.beginPath(); x.moveTo(566, 322); x.quadraticCurveTo(586, 360, 590, 420); x.stroke();
    for (let i = 0; i < 1100; i++) {
      const a = r() * Math.PI * 2, l = 24 + r() * 16, s = r() * 6;
      x.strokeStyle = gray(120 + r() * 125); x.lineWidth = 1.3;
      x.beginPath(); x.moveTo(592 + Math.cos(a) * s, 456 + Math.sin(a) * s); x.lineTo(592 + Math.cos(a) * l, 456 + Math.sin(a) * l); x.stroke();
    }
    x.globalCompositeOperation = 'source-atop';
    const sh = x.createRadialGradient(578, 440, 4, 592, 456, 44);
    sh.addColorStop(0, 'rgba(255,255,255,.25)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
    x.fillStyle = sh; x.fillRect(540, 400, 110, 110);
  } else if (id === 'concha') {
    // Dije natural: se dibuja en su color real y no se tiñe.
    x.lineWidth = 2; x.strokeStyle = '#a88a5c';
    x.beginPath(); x.moveTo(400, 324); x.lineTo(400, 392); x.stroke();
    x.beginPath(); x.moveTo(400, 452); x.lineTo(366, 414); x.quadraticCurveTo(400, 372, 434, 414); x.closePath();
    const gr = x.createLinearGradient(380, 380, 420, 452);
    gr.addColorStop(0, '#fbf3e4'); gr.addColorStop(1, '#d7c2a0');
    x.fillStyle = gr; x.fill();
    x.strokeStyle = 'rgba(140,110,75,.55)'; x.lineWidth = 1.2;
    for (let k = 0; k <= 8; k++) { const t = k / 8, px = 366 + 68 * t, py = 414 - Math.sin(t * Math.PI) * 21; x.beginPath(); x.moveTo(400, 452); x.lineTo(px, py); x.stroke(); }
    x.fillStyle = '#cdb38a'; x.fillRect(392, 446, 16, 7);
  }
  return c;
}

// ---------- Vista desde abajo ----------

function buildBottomRing(yarn) {
  const c = canvas(), x = c.getContext('2d');
  x.save();
  x.beginPath(); x.ellipse(400, 500, 300, 205, 0, 0, Math.PI * 2); x.ellipse(400, 500, 250, 165, 0, 0, Math.PI * 2);
  x.clip('evenodd');
  x.drawImage(knit(W, H, yarn, 8), 0, 0);
  x.globalCompositeOperation = 'multiply';
  const gr = x.createRadialGradient(400, 500, 150, 400, 500, 305);
  gr.addColorStop(0, gray(255)); gr.addColorStop(.75, gray(235)); gr.addColorStop(1, gray(140));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.restore();
  return c;
}

function buildBottomBase(type, yarn) {
  const c = canvas(), x = c.getContext('2d'), r = rng(9);
  x.save();
  x.beginPath(); x.ellipse(400, 500, 250, 165, 0, 0, Math.PI * 2); x.clip();
  if (type === 'tejida') {
    const L = LOOK[yarn];
    x.fillStyle = gray(L.gap); x.fillRect(0, 0, W, H);
    const rings = Math.ceil(165 / (L.rh * .95));
    for (let k = 0; k <= rings; k++) {
      const f = (k + .4) / rings, rx = 250 * f, ry = 165 * f, n = Math.max(6, Math.round(2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) / L.sw));
      for (let i = 0; i < n; i++) {
        const t = (i + (k % 2) * .5) / n * Math.PI * 2;
        stitch(x, 400 + Math.cos(t) * rx, 500 + Math.sin(t) * ry, L, r, .95, t + Math.PI / 2);
      }
    }
    fibers(x, W, H, L, r);
  } else {
    baseMaterial(x, type, 400, 500, 250, 165, r);
  }
  x.globalCompositeOperation = 'multiply';
  const gr = x.createRadialGradient(360, 460, 30, 400, 500, 260);
  gr.addColorStop(0, gray(255)); gr.addColorStop(.8, gray(225)); gr.addColorStop(1, gray(150));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.restore();
  if (type !== 'tejida') {
    x.lineWidth = 4; x.strokeStyle = 'rgba(0,0,0,.35)';
    x.beginPath(); x.ellipse(400, 500, 248, 163, 0, 0, Math.PI * 2); x.stroke();
  }
  if (type === 'piel') {
    x.setLineDash([6, 5]); x.lineWidth = 1.8; x.strokeStyle = gray(232);
    x.beginPath(); x.ellipse(400, 500, 233, 150, 0, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]);
  }
  return c;
}

// Pies metálicos de la base de piel (no se tiñen).
function buildFeet() {
  const c = canvas(), x = c.getContext('2d');
  for (const [dx, dy] of [[-160, -90], [160, -90], [-160, 90], [160, 90]]) {
    const gr = x.createRadialGradient(400 + dx - 4, 500 + dy - 4, 1, 400 + dx, 500 + dy, 13);
    gr.addColorStop(0, '#fff6d8'); gr.addColorStop(.5, '#d2b06a'); gr.addColorStop(1, '#7d6230');
    x.fillStyle = gr; x.beginPath(); x.arc(400 + dx, 500 + dy, 12, 0, Math.PI * 2); x.fill();
  }
  return c;
}

// ---------- De cerca ----------

function buildClose(yarn) {
  const c = knit(W, H, yarn, 4, 2.6), x = c.getContext('2d');
  x.globalCompositeOperation = 'multiply';
  const gr = x.createRadialGradient(360, 400, 120, 400, 480, 640);
  gr.addColorStop(0, gray(255)); gr.addColorStop(1, gray(150));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  return c;
}
