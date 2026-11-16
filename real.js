// Bolsas reales: fotos de verdad, vistas de cada una y cambio de color sobre la foto.
// Los textos solo describen lo que se ve en las fotos; nombres y precios reales están pendientes.

const REAL = [
  {
    id: 'negra', name: 'Negra con madera',
    title: 'Bolsa negra con boquilla de madera',
    desc: 'Tejido negro que combina hilo mate e hilo brillante, con boquilla de madera y broche de esferas. Se puede llevar con o sin cadena.',
    views: [['negra-1', 'De frente'], ['negra-2', 'Con cadena'], ['negra-3', 'De cerca']],
    recolor: true,
  },
  {
    id: 'rayas', name: 'Rayas con dorado',
    title: 'Bolsa de rayas con boquilla dorada',
    desc: 'Tejido en tono crema con franjas en naranja, dorado y plata, boquilla dorada y dije de abeja. En las fotos: sola, con cadena gruesa y con cadena larga.',
    views: [['rayas-1', 'Sola'], ['rayas-2', 'Cadena gruesa'], ['rayas-3', 'Cadena larga']],
  },
  {
    id: 'cordon', name: 'Cordón con madera',
    title: 'Bolsa de cordón con boquilla de madera',
    desc: 'Tejido de cordón en punto cerrado, con boquilla de madera cosida a mano y dije de abeja.',
    views: [['cordon-1', 'De frente'], ['cordon-2', 'De cerca']],
    recolor: true,
  },
];

const real = { bag: 0, view: 0, color: null };

const imgCache = new Map();
function loadImg(src) {
  if (!imgCache.has(src)) imgCache.set(src, new Promise((ok, fail) => {
    const im = new Image();
    im.onload = () => ok(im); im.onerror = fail; im.src = src;
  }));
  return imgCache.get(src);
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

let paintSeq = 0;
async function paintReal() {
  const bag = REAL[real.bag], seq = ++paintSeq;
  const frame = $('#realFrame'), cv = $('#realCanvas');
  if (!real.color) { cv.hidden = true; frame.classList.remove('busy'); return; }
  frame.classList.add('busy');
  try {
    const [base, layer] = await Promise.all([loadImg(`img/${bag.views[0][0]}.jpg`), recolorLayer(bag)]);
    if (seq !== paintSeq) return;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0, cv.width, cv.height);
    layer.cache.clear();   // una sola versión teñida en memoria
    ctx.drawImage(layer.tinted(hexOf(real.color)), layer.x, layer.y);
    cv.hidden = false;
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
  $('#realThumbs').innerHTML = bag.views.map(([src, label], i) =>
    `<button class="real-thumb${i === real.view ? ' on' : ''}" data-i="${i}" aria-label="${label}"><img src="img/${src}-sm.jpg" alt="" loading="lazy"><span>${label}</span></button>`).join('');
  $('#realTitle').textContent = bag.title;
  $('#realDesc').textContent = bag.desc;

  const [src, label] = bag.views[real.view];
  const img = $('#realImg');
  img.src = `img/${src}.jpg`;
  img.alt = `${bag.title}: ${label.toLowerCase()}`;

  $('#realColorBox').hidden = !bag.recolor;
  if (bag.recolor) {
    $('#realColors').innerHTML =
      `<button class="sw orig${real.color ? '' : ' on'}" style="background-image:url(img/${bag.views[0][0]}-sm.jpg)" data-id="" title="Original" aria-label="Color original"></button>` +
      COLORS.map(c => `<button class="sw${c.id === real.color ? ' on' : ''}" style="--c:${c.hex}" data-id="${c.id}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    $('#realColorName').textContent = real.color ? byId(COLORS, real.color).name : 'Original';
  }
  $('#realBadge').textContent = real.color ? 'Simulación de color' : 'Foto real';
  $('#realFrame').classList.remove('zoomed');
  paintReal();
}

$('#realTabs').onclick = e => {
  const b = e.target.closest('.real-tab');
  if (!b) return;
  Object.assign(real, { bag: +b.dataset.i, view: 0, color: null });
  renderReal();
};
$('#realThumbs').onclick = e => {
  const b = e.target.closest('.real-thumb');
  if (!b) return;
  real.view = +b.dataset.i;
  if (real.view) real.color = null;   // el color se prueba sobre la foto de frente
  renderReal();
};
$('#realColors').onclick = e => {
  const b = e.target.closest('.sw');
  if (!b) return;
  real.color = b.dataset.id || null;
  if (real.color) real.view = 0;
  renderReal();
};

// Acercar: un toque o clic amplía la foto en ese punto; al mover, se recorre.
const frame = $('#realFrame'), zoomEl = $('#realZoom');
function zoomAt(e) {
  const r = frame.getBoundingClientRect();
  zoomEl.style.setProperty('--zx', `${Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))}%`);
  zoomEl.style.setProperty('--zy', `${Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100))}%`);
}
frame.addEventListener('click', e => { zoomAt(e); frame.classList.toggle('zoomed'); });
frame.addEventListener('pointermove', e => { if (frame.classList.contains('zoomed')) zoomAt(e); });

// Portada: las fotos reales se van alternando.
(function heroPhotos() {
  const imgs = [...document.querySelectorAll('#heroPhoto img')];
  if (imgs.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('on');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('on');
  }, 4200);
})();

renderReal();
