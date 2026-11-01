// Laboratorio: configurador con capas recoloreadas + herramienta "Prueba con tu foto".

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

const SAME = { id: 'same', name: 'Igual que la bolsa' };
const LEATHER = [
  { id: 'camel', name: 'Camel', hex: '#b0773f' },
  { id: 'chocolate', name: 'Chocolate', hex: '#5b3a26' },
  { id: 'negro', name: 'Negro', hex: '#2b2522' },
  { id: 'natural', name: 'Natural', hex: '#d8c09a' },
];
const CORK = [
  { id: 'natural', name: 'Natural', hex: '#c49a6c' },
  { id: 'tostado', name: 'Tostado', hex: '#8f6440' },
];
const STRAP_TYPES = [{ id: 'cordon', name: 'Cordón trenzado' }, { id: 'tejida', name: 'Asa tejida' }, { id: 'piel', name: 'Piel' }];
const BASE_TYPES = [{ id: 'tejida', name: 'Tejida' }, { id: 'piel', name: 'Piel' }, { id: 'corcho', name: 'Corcho' }];
const ACCS = [{ id: 'borla', name: 'Borla', tint: true }, { id: 'pompon', name: 'Pompón', tint: true }, { id: 'concha', name: 'Dije de concha', tint: false }];

const state = {
  view: 'front', yarn: 'algodon', color: 'terracota',
  strap: 'cordon', strapColor: 'same',
  base: 'piel', baseColor: 'camel',
  acc: new Set(['borla']), accColor: 'crudo',
};

const strapPalette = () => state.strap === 'piel' ? LEATHER : [SAME, ...COLORS];
const basePalette = () => state.base === 'piel' ? LEATHER : state.base === 'corcho' ? CORK : [SAME, ...COLORS];
const accPalette = () => [SAME, ...COLORS];
const pick = (list, id) => list.find(c => c.id === id) || list[0];
const hexIn = (list, id) => id === 'same' ? hexOf(state.color) : pick(list, id).hex;

function roleHex(role) {
  if (role === 'yarn') return hexOf(state.color);
  if (role === 'strap') return hexIn(strapPalette(), state.strapColor);
  if (role === 'base') return hexIn(basePalette(), state.baseColor);
  return hexIn(accPalette(), state.accColor);
}

// ---------- Capas ----------

const layers = new Map();
function layer(key, build, role) {
  if (!layers.has(key)) layers.set(key, new Layer(build(), role));
  return layers.get(key);
}

function viewLayers(view = state.view) {
  const { yarn, strap, base } = state;
  if (view === 'close') return [layer(`close:${yarn}`, () => buildClose(yarn), 'yarn')];
  if (view === 'bottom') return [
    layer('bgB', () => buildBackground(true), 'fixed'),
    layer(`ring:${yarn}`, () => buildBottomRing(yarn), 'yarn'),
    layer(`baseB:${base}:${base === 'tejida' ? yarn : ''}`, () => buildBottomBase(base, yarn), 'base'),
    ...(base === 'piel' ? [layer('feet', buildFeet, 'fixed')] : []),
  ];
  return [
    layer('bg', () => buildBackground(), 'fixed'),
    layer(`strapB:${strap}`, () => buildStrap(strap, true), 'strap'),
    layer(`body:${yarn}`, () => buildBody(yarn), 'yarn'),
    layer(`baseF:${base}`, () => buildBaseFront(base), 'base'),
    layer(`strapF:${strap}`, () => buildStrap(strap, false), 'strap'),
    ...(strap === 'piel' ? [layer('rings', buildRings, 'fixed')] : []),
    ...ACCS.filter(a => state.acc.has(a.id)).map(a => layer(`acc:${a.id}`, () => buildAccessory(a.id), a.tint ? 'acc' : 'fixed')),
  ];
}

const stage = $('#stage'), sctx = stage.getContext('2d');
const TAGS = { front: 'Vista de frente', bottom: 'Vista de la base', close: 'De cerca' };

function paint() {
  const t0 = performance.now();
  sctx.clearRect(0, 0, W, H);
  for (const L of viewLayers()) if (!L.empty) sctx.drawImage(L.tinted(roleHex(L.role)), L.x, L.y);
  $('#stageTag').textContent = state.view === 'close' ? `De cerca · ${byId(YARNS, state.yarn).name}` : TAGS[state.view];
  $('#perf').textContent = `Imagen de prueba · teñida en ${Math.max(1, Math.round(performance.now() - t0))} ms`;
}

// Las capas nuevas tardan un poco en "tejerse" la primera vez: avisamos y luego pintamos.
let pending = 0;
function render() {
  const id = ++pending;
  const needsBuild = !layersReady();
  if (!needsBuild) { paint(); $("#labStage").classList.remove("busy"); return; }
  $('#labStage').classList.add('busy');
  setTimeout(() => {
    if (id !== pending) return;
    paint();
    $('#labStage').classList.remove('busy');
    warm();
  }, 30);
}
function layersReady() {
  const { yarn, strap, base, view } = state;
  const keys = view === 'close' ? [`close:${yarn}`]
    : view === 'bottom' ? [`ring:${yarn}`, `baseB:${base}:${base === 'tejida' ? yarn : ''}`]
    : [`body:${yarn}`, `strapF:${strap}`, `strapB:${strap}`, `baseF:${base}`, ...[...state.acc].map(a => `acc:${a}`)];
  return keys.every(k => layers.has(k));
}
// Prepara en segundo plano las otras vistas para que cambiar sea instantáneo.
function warm() {
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  for (const v of ['front', 'bottom', 'close']) idle(() => viewLayers(v));
}

// ---------- Controles ----------

function chips(el, list, isOn, onPick) {
  el.innerHTML = list.map(o => `<button class="chip${isOn(o.id) ? ' on' : ''}" data-id="${o.id}" aria-pressed="${isOn(o.id)}">${o.name}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (b) onPick(b.dataset.id); };
}

function swatches(el, list, current, onPick) {
  el.innerHTML = list.map(c => {
    const hex = c.id === 'same' ? hexOf(state.color) : c.hex;
    return `<button class="sw${c.id === 'same' ? ' same' : ''}${c.id === current ? ' on' : ''}" style="--c:${hex}" data-id="${c.id}" title="${c.name}" aria-label="${c.name}">${c.id === 'same' ? '=' : ''}</button>`;
  }).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (b) onPick(b.dataset.id); };
}

function setView(v) {
  state.view = v;
  $$('.views button').forEach(b => { const on = b.dataset.view === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
}

function ui() {
  chips($('#yarns'), YARNS, id => id === state.yarn, id => { state.yarn = id; update(); });
  $('#yarnDesc').textContent = byId(YARNS, state.yarn).desc;
  swatches($('#colors'), COLORS, state.color, id => { state.color = id; update(); });
  $('#colorName').textContent = byId(COLORS, state.color).name;

  chips($('#straps'), STRAP_TYPES, id => id === state.strap, id => {
    state.strap = id; state.strapColor = id === 'piel' ? 'camel' : 'same';
    if (state.view !== 'front') setView('front');
    update();
  });
  swatches($('#strapColors'), strapPalette(), state.strapColor, id => { state.strapColor = id; if (state.view !== 'front') setView('front'); update(); });
  $('#strapColorName').textContent = pick(strapPalette(), state.strapColor).name;

  chips($('#bases'), BASE_TYPES, id => id === state.base, id => {
    state.base = id; state.baseColor = id === 'piel' ? 'camel' : id === 'corcho' ? 'natural' : 'same';
    setView('bottom'); update();
  });
  swatches($('#baseColors'), basePalette(), state.baseColor, id => { state.baseColor = id; setView('bottom'); update(); });
  $('#baseColorName').textContent = pick(basePalette(), state.baseColor).name;

  chips($('#accs'), ACCS, id => state.acc.has(id), id => {
    state.acc.has(id) ? state.acc.delete(id) : state.acc.add(id);
    setView('front'); update();
  });
  swatches($('#accColors'), accPalette(), state.accColor, id => { state.accColor = id; setView('front'); update(); });
  $('#accColorName').textContent = pick(accPalette(), state.accColor).name;
}

function update() { ui(); render(); }

$$('.views button').forEach(b => b.onclick = () => { setView(b.dataset.view); render(); });

update();

// ---------- Prueba con tu foto ----------

const photo = { w: 0, h: 0, orig: null, soft: null, lum: null, clicks: [], mask: null, out: null, color: 'terracota' };
const pc = $('#photo'), pctx = pc.getContext('2d');
const MAX_SIDE = 1000;

function loadPhoto(src) {
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
    pc.width = w; pc.height = h;
    pctx.drawImage(img, 0, 0, w, h);
    const d = pctx.getImageData(0, 0, w, h);
    const rgb = new Float32Array(w * h * 3), lum = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const r = d.data[i * 4], g = d.data[i * 4 + 1], b = d.data[i * 4 + 2];
      rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
      lum[i] = Math.round(lumOf(r, g, b));
    }
    Object.assign(photo, { w, h, orig: d, soft: boxBlur(boxBlur(rgb, w, h, 3, 6), w, h, 3, 6), lum, clicks: [], mask: null, out: null });
    $('#drop').hidden = true; $('#cmp').hidden = false;
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    refreshPhoto();
    $('#foto').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  img.onerror = () => toast('No se pudo abrir esa imagen');
  img.src = src;
}

function rebuildMask() {
  if (!photo.clicks.length) { photo.mask = null; return; }
  const tol = +$('#tol').value, n = photo.w * photo.h, union = new Uint8Array(n);
  for (const c of photo.clicks) {
    const m = floodSelect(photo.soft, photo.w, photo.h, c.x, c.y, tol);
    for (let i = 0; i < n; i++) if (m[i]) union[i] = 255;
  }
  photo.mask = refineMask(union, photo.w, photo.h);
}

function recolorPhoto() {
  const { w, h, orig, lum, mask } = photo;
  if (!mask) { photo.out = null; return; }
  let sum = 0, cnt = 0;
  for (let i = 0; i < w * h; i++) if (mask[i] > 128) { sum += toLin(lum[i]); cnt++; }
  const lut = makeLut(hexOf(photo.color), sum / Math.max(1, cnt));
  const out = new ImageData(w, h), o = out.data, s = orig.data;
  for (let i = 0; i < w * h; i++) {
    const a = mask[i] / 255, j = i * 4, l = lum[i] * 3;
    o[j] = s[j] + (lut[l] - s[j]) * a;
    o[j + 1] = s[j + 1] + (lut[l + 1] - s[j + 1]) * a;
    o[j + 2] = s[j + 2] + (lut[l + 2] - s[j + 2]) * a;
    o[j + 3] = 255;
  }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').putImageData(out, 0, 0);
  photo.out = c;
}

const origCanvas = document.createElement('canvas');
function drawPhoto() {
  const { w, h } = photo;
  if (origCanvas.width !== w || origCanvas.height !== h) { origCanvas.width = w; origCanvas.height = h; }
  origCanvas.getContext('2d').putImageData(photo.orig, 0, 0);
  pctx.clearRect(0, 0, w, h);
  if (!photo.out) { pctx.drawImage(origCanvas, 0, 0); return; }
  pctx.drawImage(photo.out, 0, 0);
  const split = +$('#split').value / 100;
  if (split > 0) {
    pctx.save(); pctx.beginPath(); pctx.rect(0, 0, w * split, h); pctx.clip();
    pctx.drawImage(origCanvas, 0, 0); pctx.restore();
  }
  $('#splitLine').style.left = `${split * 100}%`;
}

function refreshPhoto() {
  rebuildMask(); recolorPhoto(); drawPhoto(); photoUi();
}

function photoUi() {
  const has = !!photo.mask;
  $('#undo').disabled = !photo.clicks.length;
  $('#clearSel').disabled = !photo.clicks.length;
  $('#savePhoto').disabled = !has;
  const split = +$('#split').value;
  $('#splitLine').hidden = !has || split === 0 || split === 100;
  $('#tagBefore').hidden = !has || split === 0;
  $('#tagAfter').hidden = !has || split === 100;
  $('#cmpHint').hidden = has;
  swatches($('#photoColors'), COLORS, photo.color, id => { photo.color = id; recolorPhoto(); drawPhoto(); photoUi(); });
  $('#photoColorName').textContent = byId(COLORS, photo.color).name;
}

pc.addEventListener('click', e => {
  const r = pc.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * photo.w), y = Math.floor((e.clientY - r.top) / r.height * photo.h);
  if (x < 0 || y < 0 || x >= photo.w || y >= photo.h) return;
  photo.clicks.push({ x, y });
  refreshPhoto();
});

$('#file').onchange = e => { const f = e.target.files[0]; if (f) loadPhoto(URL.createObjectURL(f)); e.target.value = ''; };
$('#pickPhoto').onclick = () => $('#file').click();
$('#undo').onclick = () => { photo.clicks.pop(); refreshPhoto(); };
$('#clearSel').onclick = () => { photo.clicks = []; refreshPhoto(); };
$('#tol').oninput = e => { $('#tolVal').textContent = e.target.value; };
$('#tol').onchange = () => { if (photo.clicks.length) refreshPhoto(); };
$('#split').oninput = () => { if (photo.orig) { drawPhoto(); photoUi(); } };

// Foto de ejemplo: la bolsa de prueba en hilo crudo, aplanada como si fuera una foto.
$('#samplePhoto').onclick = () => {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  c.width = W; c.height = H;
  const saved = state.color, savedStrap = state.strapColor;
  state.color = 'crudo'; state.strapColor = state.strap === 'piel' ? state.strapColor : 'same';
  const prevView = state.view; state.view = 'front';
  // Fondo de estudio que contrasta con el hilo claro (así la selección no se "escapa").
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#9fb0b6'); bg.addColorStop(1, '#7d8f96');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  for (const L of viewLayers('front')) if (!L.empty && L !== layers.get('bg')) x.drawImage(L.tinted(roleHex(L.role)), L.x, L.y);
  state.color = saved; state.strapColor = savedStrap; state.view = prevView;
  loadPhoto(c.toDataURL('image/jpeg', .92));
};

$('#savePhoto').onclick = () => {
  if (!photo.out) return;
  const a = document.createElement('a');
  a.download = `bolsa-${photo.color}.jpg`;
  a.href = photo.out.toDataURL('image/jpeg', .92);
  a.click();
};

const drop = $('#drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) loadPhoto(URL.createObjectURL(f)); });
