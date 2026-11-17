// El estudio: bolsas reales, cambio de color sobre la foto y luz de luna.
// Los textos solo describen lo que se ve en las fotos; nombres y precios reales están pendientes.

const REAL = [
  {
    id: 'vino', name: 'Vino con dorado',
    title: 'Bolsa vino con boquilla dorada',
    desc: 'Tejida con tiras de tela de punto color vino, en puntadas con relieve que forman diagonales. Boquilla dorada labrada, broche de bolitas y asa dorada.',
    views: [['vino-1', 'De frente']],
    recolor: true,
  },
  {
    id: 'negra', name: 'Negra con madera',
    title: 'Bolsa negra con boquilla de madera',
    desc: 'Tejida con una cinta que tiene una cara mate y otra brillante: al girar, el tejido alterna los dos acabados. Boquilla de madera con broche de esferas.',
    views: [['negra-1', 'De frente'], ['negra-2', 'Con cadena']],
    recolor: true,
  },
  {
    id: 'rayas', name: 'Rayas con dorado',
    title: 'Bolsa de rayas con boquilla dorada',
    desc: 'Tejido crema con franjas de hilo metálico dorado y plateado y una franja naranja. Boquilla dorada y dije de abeja.',
    views: [['rayas-1', 'Sola'], ['rayas-2', 'Cadena gruesa'], ['rayas-3', 'Cadena larga']],
  },
  {
    id: 'cordon', name: 'Cordón con madera',
    title: 'Bolsa de cordón con boquilla de madera',
    desc: 'Tejida con cordón satinado en punto cerrado, con boquilla de madera cosida a mano y dije de abeja.',
    views: [['cordon-1', 'De frente']],
    recolor: true,
  },
];

const real = { bag: 0, view: 0, color: null, light: false };

const imgCache = new Map();
function loadImg(src) {
  if (!imgCache.has(src)) imgCache.set(src, new Promise((ok, fail) => {
    const im = new Image();
    im.onload = () => ok(im); im.onerror = fail; im.src = src;
  }));
  return imgCache.get(src);
}

// Transiciones suaves entre fotos (si el navegador las soporta).
function smooth(fn) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return fn();
  document.startViewTransition(fn);
}

// Capa teñible de una bolsa: brillo normalizado del tejido (JPG) + recorte (PNG).
async function recolorLayer(bag) {
  if (bag.layer) return bag.layer;
  const [luz, mask] = await Promise.all([loadImg(`img/${bag.id}-luz.jpg`), loadImg(`img/${bag.id}-mask.png`)]);
  const w = luz.naturalWidth, h = luz.naturalHeight;
  const c = document.createElement('canvas'), m = document.createElement('canvas');
  c.width = m.width = w; c.height = m.height = h;
  const cx = c.getContext('2d', { willReadFrequently: true }), mx = m.getContext('2d', { willReadFrequently: true });
  cx.drawImage(luz, 0, 0); mx.drawImage(mask, 0, 0, w, h);
  const d = cx.getImageData(0, 0, w, h), a = mx.getImageData(0, 0, w, h).data;
  for (let i = 0; i < w * h; i++) d.data[i * 4 + 3] = a[i * 4];
  cx.putImageData(d, 0, 0);
  return bag.layer = new Layer(c, 'yarn');
}

const frame = $('#realFrame'), zoomEl = $('#realZoom'), cv = $('#realCanvas'), img = $('#realImg');
const moon = new MoonLight($('#moonCanvas'), { follow: frame });
if (moon.failed) $('#moonBtn').hidden = true;

// Lo que se ve ahora mismo (foto o foto teñida) es lo que ilumina la luna.
function feedMoon() {
  if (moon.failed) return;
  if (real.color && !cv.hidden) moon.setSource(cv);
  else if (img.complete && img.naturalWidth) moon.setSource(img);
}
img.addEventListener('load', feedMoon);

let paintSeq = 0;
async function paintReal() {
  const bag = REAL[real.bag], seq = ++paintSeq;
  if (!real.color) { cv.hidden = true; frame.classList.remove('busy'); feedMoon(); return; }
  frame.classList.add('busy');
  try {
    const [base, layer] = await Promise.all([loadImg(`img/${bag.views[0][0]}.jpg`), recolorLayer(bag)]);
    if (seq !== paintSeq) return;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0, cv.width, cv.height);
    layer.cache.clear();   // una sola versión teñida en memoria
    ctx.drawImage(layer.tinted(hexOf(real.color)), layer.x, layer.y);
    cv.hidden = false;
    feedMoon();
  } catch {
    real.color = null; cv.hidden = true;
    toast('No se pudo cargar la vista de color');
    renderReal();
  } finally {
    if (seq === paintSeq) frame.classList.remove('busy');
  }
}

function renderReal() {
  const bag = REAL[real.bag];
  $('#realTabs').innerHTML = REAL.map((b, i) =>
    `<button class="real-tab${i === real.bag ? ' on' : ''}" role="tab" aria-selected="${i === real.bag}" data-i="${i}"><img src="img/${b.views[0][0]}-sm.jpg" alt="" loading="lazy">${b.name}</button>`).join('');
  $('#realThumbs').innerHTML = bag.views.length > 1 ? bag.views.map(([src, label], i) =>
    `<button class="real-thumb${i === real.view ? ' on' : ''}" data-i="${i}" aria-label="${label}"><img src="img/${src}-sm.jpg" alt="" loading="lazy"><span>${label}</span></button>`).join('') : '';
  $('#realTitle').textContent = bag.title;
  $('#realDesc').textContent = bag.desc;

  const [src, label] = bag.views[real.view];
  if (!img.src.endsWith(`img/${src}.jpg`)) img.src = `img/${src}.jpg`;
  img.alt = `${bag.title}: ${label.toLowerCase()}`;

  $('#realColorBox').hidden = !bag.recolor;
  $('#realNoColor').hidden = !!bag.recolor;
  if (bag.recolor) {
    $('#realColors').innerHTML =
      `<button class="sw orig${real.color ? '' : ' on'}" style="background-image:url(img/${bag.views[0][0]}-sm.jpg)" data-id="" title="Original" aria-label="Color original"></button>` +
      COLORS.map(c => `<button class="sw${c.id === real.color ? ' on' : ''}" style="--c:${c.hex}" data-id="${c.id}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    $('#realColorName').textContent = real.color ? byId(COLORS, real.color).name : 'Original';
  }
  $('#realBadge').textContent = real.light ? 'Luz de luna' : real.color ? 'Simulación de color' : 'Foto real';
  $('#realHint').textContent = real.light ? 'Mueve el dedo: la luz recorre las puntadas' : 'Toca para acercar';
  $('#moonBtn').setAttribute('aria-pressed', real.light);
  frame.classList.toggle('moonlit', real.light);
  frame.classList.remove('zoomed');
  paintReal();
}

const update = (changes, animate = true) => {
  Object.assign(real, changes);
  animate ? smooth(renderReal) : renderReal();
};

$('#realTabs').onclick = e => {
  const b = e.target.closest('.real-tab');
  if (b) update({ bag: +b.dataset.i, view: 0, color: null });
};
$('#realThumbs').onclick = e => {
  const b = e.target.closest('.real-thumb');
  if (!b) return;
  const view = +b.dataset.i;
  update({ view, color: view ? null : real.color });   // el color se prueba sobre la foto de frente
};
$('#realColors').onclick = e => {
  const b = e.target.closest('.sw');
  if (!b) return;
  const color = b.dataset.id || null;
  update({ color, view: color ? 0 : real.view }, false);
};
$('#moonBtn').onclick = () => {
  real.light = !real.light;
  moon.setOn(real.light);
  if (real.light) $('#moonCanvas').hidden = false;
  else setTimeout(() => { if (!real.light) $('#moonCanvas').hidden = true; }, 500);
  renderReal();
};

// Acercar: un toque o clic amplía la foto en ese punto; al mover, se recorre.
function zoomAt(e) {
  const r = frame.getBoundingClientRect();
  zoomEl.style.setProperty('--zx', `${Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))}%`);
  zoomEl.style.setProperty('--zy', `${Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100))}%`);
}
frame.addEventListener('click', e => { if (real.light) return; zoomAt(e); frame.classList.toggle('zoomed'); });
frame.addEventListener('pointermove', e => { if (frame.classList.contains('zoomed')) zoomAt(e); });

// Añadir al pedido, con una miniatura de cómo se ve (teñida si eligieron color).
$('#addOrder').onclick = () => {
  const bag = REAL[real.bag];
  let thumb = `img/${bag.views[0][0]}-sm.jpg`;
  if (real.color && !cv.hidden) {
    const t = document.createElement('canvas');
    t.width = 240; t.height = 160;
    t.getContext('2d').drawImage(cv, 0, 0, 240, 160);
    thumb = t.toDataURL('image/jpeg', .8);
  }
  addToOrder({ bag: bag.id, name: bag.name, color: real.color, thumb });
  if (real.color) confetti([hexOf(real.color), '#ffffff', '#9ca1a8']);
};

// Enlace para compartir exactamente esta bolsa y color.
$('#shareBtn').onclick = async () => {
  const url = `${location.href.split('#')[0]}#b=${REAL[real.bag].id}${real.color ? '&c=' + real.color : ''}`;
  try { await navigator.clipboard.writeText(url); toast('Enlace copiado 🔗'); }
  catch { history.replaceState(null, '', url); toast('Enlace listo en la barra de direcciones'); }
};

(function fromLink() {
  const m = location.hash.match(/#b=([a-z]+)(?:&c=([a-z]+))?/);
  if (!m) return;
  const i = REAL.findIndex(b => b.id === m[1]);
  if (i < 0) return;
  real.bag = i;
  if (m[2] && REAL[i].recolor && COLORS.some(c => c.id === m[2])) real.color = m[2];
  setTimeout(() => $('#estudio').scrollIntoView(), 60);
})();

renderReal();

// ---------- Portada: fotos reales que se alternan, con su propia luz de luna ----------
(function hero() {
  const imgs = [...document.querySelectorAll('#heroPhoto img')];
  const heroMoon = new MoonLight($('#heroCanvas'), { follow: document.querySelector('.hero') });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  const show = () => {
    if (heroMoon.failed) return;
    const im = imgs[i];
    const go = () => { heroMoon.setSource(im); $('#heroCanvas').classList.add('ready'); };
    im.complete && im.naturalWidth ? go() : im.addEventListener('load', go, { once: true });
  };
  if (!heroMoon.failed) { heroMoon.setOn(true); show(); }
  if (imgs.length < 2 || still) return;
  setInterval(() => {
    $('#heroCanvas').classList.remove('ready');   // la luz se desvanece mientras cambia la foto
    imgs[i].classList.remove('on');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('on');
    setTimeout(show, 700);
  }, 5200);
})();
