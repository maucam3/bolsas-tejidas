// Interfaz: diseños, configurador, carrito.

const $ = s => document.querySelector(s);
const money = n => '$' + n.toLocaleString('es');

let state = { ...PRESETS[0].cfg, acc: [...PRESETS[0].cfg.acc], monogram: '', name: PRESETS[0].name };
let cart = [];

// ---------- Utilidades ----------
function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(val));
  } catch { return null; }
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}

function confetti(colors) {
  const box = $('#confetti');
  for (let i = 0; i < 36; i++) {
    const s = document.createElement('span');
    s.style.background = colors[i % colors.length];
    s.style.left = 50 + (Math.random() - 0.5) * 30 + 'vw';
    s.style.setProperty('--dx', (Math.random() - 0.5) * 600 + 'px');
    s.style.setProperty('--dy', -(200 + Math.random() * 300) + 'px');
    s.style.setProperty('--r', Math.random() * 720 + 'deg');
    s.style.animationDelay = Math.random() * 0.15 + 's';
    box.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function encodeCfg(c) {
  return btoa(unescape(encodeURIComponent(JSON.stringify({ m: c.model, y: c.yarn, c: c.color, c2: c.color2, p: c.pattern, s: c.strap, a: c.acc, i: c.monogram }))));
}

function decodeCfg(str) {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(str))));
    return { model: o.m, yarn: o.y, color: o.c, color2: o.c2, pattern: o.p, strap: o.s, acc: o.a || [], monogram: o.i || '' };
  } catch { return null; }
}

// ---------- Diseños prestablecidos ----------
function renderPresets() {
  $('#presets').innerHTML = PRESETS.map((p, i) => {
    const c = { ...p.cfg, monogram: '' };
    return `<article class="preset" style="--tint:${hexOf(c.color)}">
      ${p.tag ? `<span class="badge">${p.tag}</span>` : ''}
      <div class="preset-art">${renderBag(c)}</div>
      <div class="preset-info">
        <div>
          <h3>${p.name}</h3>
          <p class="muted">${byId(MODELS, c.model).name} · ${byId(YARNS, c.yarn).name} · ${byId(STRAPS, c.strap).name}</p>
        </div>
        <span class="preset-price">${money(priceOf(c))}</span>
      </div>
      <div class="preset-actions">
        <button class="btn btn-ghost btn-sm" data-preset="${i}">Personalizar</button>
        <button class="btn btn-primary btn-sm" data-quick="${i}">Añadir</button>
      </div>
    </article>`;
  }).join('');
}

$('#presets').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.preset !== undefined) {
    const p = PRESETS[+b.dataset.preset];
    state = { ...p.cfg, acc: [...p.cfg.acc], monogram: '', name: p.name };
    $('#monogram').value = '';
    renderConfig(true);
    $('#taller').scrollIntoView({ behavior: 'smooth' });
  } else if (b.dataset.quick !== undefined) {
    const p = PRESETS[+b.dataset.quick];
    addToCart({ ...p.cfg, acc: [...p.cfg.acc], monogram: '', name: p.name });
  }
});

// ---------- Configurador ----------
function optCard(group, item, active, thumb) {
  return `<button class="opt ${active ? 'on' : ''}" data-group="${group}" data-value="${item.id}" aria-pressed="${active}">
    ${thumb ? `<span class="opt-thumb">${thumb}</span>` : ''}
    <span class="opt-name">${item.name}</span>
    ${item.desc ? `<span class="opt-desc">${item.desc}</span>` : ''}
    ${item.price !== undefined ? `<span class="opt-price">${item.price ? '+' + money(item.price) : 'Incluido'}</span>` : ''}
  </button>`;
}

function renderOptions() {
  $('#optModel').innerHTML = MODELS.map(m => optCard('model', { ...m, price: undefined },state.model === m.id, renderBag({ ...state, model: m.id, acc: [], monogram: '' }))).join('');

  $('#optYarn').innerHTML = YARNS.map(y => {
    const sw = `<svg viewBox="0 0 60 60"><defs>${texturePattern(y.id, 'yt-' + y.id)}</defs><rect width="60" height="60" fill="${hexOf(state.color)}"/><rect width="60" height="60" fill="url(#yt-${y.id})"/></svg>`;
    return optCard('yarn', y, state.yarn === y.id, sw);
  }).join('');

  const sw = (group, cur) => COLORS.map(c => `<button class="sw ${cur === c.id ? 'on' : ''}" data-group="${group}" data-value="${c.id}" style="--c:${c.hex}" title="${c.name}" aria-label="${c.name}" aria-pressed="${cur === c.id}"></button>`).join('');
  $('#optColor').innerHTML = sw('color', state.color);
  $('#optColor2').innerHTML = sw('color2', state.color2);
  $('#colorName').textContent = byId(COLORS, state.color).name;
  $('#color2Name').textContent = byId(COLORS, state.color2).name;

  $('#optPattern').innerHTML = PATTERNS.map(p => {
    const mini = renderPatternChip(p.id);
    return `<button class="chip ${state.pattern === p.id ? 'on' : ''}" data-group="pattern" data-value="${p.id}" aria-pressed="${state.pattern === p.id}">${mini}<span>${p.name}</span></button>`;
  }).join('');

  $('#optStrap').innerHTML = STRAPS.map(s => optCard('strap', s, state.strap === s.id, renderBag({ ...state, strap: s.id, acc: [], monogram: '' }))).join('');

  $('#optAcc').innerHTML = ACCESSORIES.map(a => {
    const on = state.acc.includes(a.id);
    return `<button class="acc ${on ? 'on' : ''}" data-group="acc" data-value="${a.id}" aria-pressed="${on}">
      <span class="acc-ico">${a.icon}</span><span class="acc-name">${a.name}</span><span class="opt-price">+${money(a.price)}</span><span class="tick">✓</span>
    </button>`;
  }).join('');
}

function renderPatternChip(id) {
  const base = hexOf(state.color), sec = hexOf(state.color2);
  const g = { mono: [20, 26] };
  const d = designLayer({ pattern: id }, 'pc-' + id + '-', base, sec, g);
  return `<svg viewBox="0 0 40 40" class="chip-art"><defs>${d.defs}</defs><g transform="scale(.4)"><rect width="100" height="100" fill="${base}"/>${d.layer.replace(/height="(220|200)"/, 'height="100"').replace(/y="130"/, 'y="0"')}</g></svg>`;
}

function renderPreview(animate) {
  $('#stage').innerHTML = renderBag(state, { swing: true }) +
    `<div class="lens"><div class="lens-in">${renderBag(state)}</div></div><span class="lens-hint">🔍 Pasa el cursor para ver el tejido</span>`;
  if (animate) {
    const g = $('#stage .bag-swing');
    g.classList.remove('wiggle');
    void g.getBoundingClientRect();
    g.classList.add('wiggle');
  }
  $('#price').textContent = money(priceOf(state));
  const d = daysOf(state);
  $('#days').textContent = `Lista en ${d}–${d + 2} días`;
  $('#designName').textContent = state.name || 'Diseño personalizado';

  const accNames = state.acc.map(id => byId(ACCESSORIES, id).name);
  const rows = [
    ['Modelo', byId(MODELS, state.model).name],
    ['Hilo', byId(YARNS, state.yarn).name],
    ['Colores', `<i class="dot" style="--c:${hexOf(state.color)}"></i>${byId(COLORS, state.color).name} <i class="dot" style="--c:${hexOf(state.color2)}"></i>${byId(COLORS, state.color2).name}`],
    ['Patrón', byId(PATTERNS, state.pattern).name],
    ['Correa', byId(STRAPS, state.strap).name],
    ['Extras', accNames.length || state.monogram ? [...accNames, state.monogram ? `Iniciales “${escapeXml(state.monogram)}”` : ''].filter(Boolean).join(', ') : 'Ninguno'],
  ];
  $('#summary').innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('');

  $('#mbarArt').innerHTML = renderBag(state);
  $('#mbarPrice').textContent = money(priceOf(state));
  $('#mbarName').textContent = state.name || 'Diseño personalizado';
}

// Barra flotante en móvil: aparece cuando la vista previa sale de pantalla dentro del taller
const seen = new Map();
const io = new IntersectionObserver(entries => {
  for (const en of entries) seen.set(en.target, en.isIntersecting);
  document.body.classList.toggle('show-mbar', seen.get($('.steps')) && !seen.get($('#stage')));
});
io.observe($('#stage'));
io.observe($('.steps'));
$('#mbarArt').addEventListener('click', () => $('#stage').scrollIntoView({ behavior: 'smooth', block: 'center' }));
$('#mbarAdd').addEventListener('click', () => $('#addCart').click());

// Lupa sobre la vista previa
const ZOOM = 3;
$('#stage').addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const stage = $('#stage'), lens = stage.querySelector('.lens'), inner = stage.querySelector('.lens-in');
  const svg = stage.querySelector('.bag-svg');
  if (!lens || !svg) return;
  const sr = stage.getBoundingClientRect(), br = svg.getBoundingClientRect();
  const x = e.clientX - sr.left, y = e.clientY - sr.top;
  lens.style.transform = `translate(${x - 70}px, ${y - 70}px)`;
  inner.style.width = br.width * ZOOM + 'px';
  inner.style.transform = `translate(${-(e.clientX - br.left) * ZOOM + 70}px, ${-(e.clientY - br.top) * ZOOM + 70}px)`;
  stage.classList.add('zooming');
});
$('#stage').addEventListener('pointerleave', () => $('#stage').classList.remove('zooming'));

function renderConfig(animate) {
  renderOptions();
  renderPreview(animate);
}

document.querySelector('.steps').addEventListener('click', e => {
  const b = e.target.closest('[data-value]');
  if (!b) return;
  const { group, value } = b.dataset;
  if (group === 'acc') {
    state.acc = state.acc.includes(value) ? state.acc.filter(x => x !== value) : [...state.acc, value];
  } else {
    state[group] = value;
  }
  state.name = 'Diseño personalizado';
  renderConfig(true);
});

$('#monogram').addEventListener('input', e => {
  state.monogram = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ&.]/g, '').slice(0, 3);
  e.target.value = state.monogram;
  state.name = 'Diseño personalizado';
  renderPreview(false);
});

$('#surprise').addEventListener('click', () => {
  const color = pick(COLORS).id;
  let color2 = pick(COLORS).id;
  if (color2 === color) color2 = pick(COLORS).id;
  const acc = ACCESSORIES.filter(() => Math.random() < 0.3).map(a => a.id);
  state = {
    model: pick(MODELS).id, yarn: pick(YARNS).id, color, color2,
    pattern: pick(PATTERNS).id, strap: pick(STRAPS).id, acc,
    monogram: state.monogram, name: pick(['Sorpresa del taller', 'Golpe de suerte', 'Hallazgo único', 'Inspiración del día']),
  };
  renderConfig(true);
  confetti([hexOf(color), hexOf(color2), '#e2bd5c']);
});

$('#shareBtn').addEventListener('click', async () => {
  const url = location.href.split('#')[0] + '#d=' + encodeCfg(state);
  try {
    await navigator.clipboard.writeText(url);
    toast('Enlace del diseño copiado 🔗');
  } catch {
    history.replaceState(null, '', url);
    toast('Enlace listo en la barra de direcciones');
  }
});

$('#addCart').addEventListener('click', () => {
  addToCart({ ...state, acc: [...state.acc] });
  confetti([hexOf(state.color), hexOf(state.color2)]);
});

// ---------- Carrito ----------
function addToCart(cfg) {
  cart.push({ cfg, qty: 1, id: Date.now() + Math.random() });
  saveCart();
  renderCart();
  const btn = $('#cartOpen');
  btn.classList.remove('bump');
  void btn.offsetWidth;
  btn.classList.add('bump');
  toast(`“${cfg.name || 'Tu diseño'}” añadida al carrito`);
}

function saveCart() { store('trama-cart', cart); }

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').classList.toggle('show', count > 0);
  const total = cart.reduce((n, i) => n + priceOf(i.cfg) * i.qty, 0);
  $('#cartTotal').textContent = money(total);
  $('#checkout').disabled = !cart.length;
  $('#cartItems').innerHTML = cart.length ? cart.map(i => `
    <div class="ci">
      <div class="ci-art">${renderBag(i.cfg)}</div>
      <div class="ci-info">
        <b>${escapeXml(i.cfg.name || 'Diseño personalizado')}</b>
        <span class="muted">${byId(MODELS, i.cfg.model).name} · ${byId(YARNS, i.cfg.yarn).name} · ${byId(COLORS, i.cfg.color).name}</span>
        <div class="qty">
          <button data-dec="${i.id}" aria-label="Quitar una">−</button><span>${i.qty}</span><button data-inc="${i.id}" aria-label="Añadir una">+</button>
          <button class="link" data-del="${i.id}">Eliminar</button>
        </div>
      </div>
      <span class="ci-price">${money(priceOf(i.cfg) * i.qty)}</span>
    </div>`).join('') : `<div class="empty"><p>Tu carrito está vacío.</p><p class="muted">Diseña una bolsa en el taller y aparecerá aquí.</p></div>`;
}

$('#cartItems').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const find = id => cart.find(i => String(i.id) === id);
  if (b.dataset.inc) find(b.dataset.inc).qty++;
  if (b.dataset.dec) { const it = find(b.dataset.dec); it.qty--; if (!it.qty) cart = cart.filter(x => x !== it); }
  if (b.dataset.del) cart = cart.filter(x => String(x.id) !== b.dataset.del);
  saveCart();
  renderCart();
});

const openCart = open => document.body.classList.toggle('cart-open', open);
$('#cartOpen').addEventListener('click', () => openCart(true));
$('#cartClose').addEventListener('click', () => openCart(false));
$('#scrim').addEventListener('click', () => openCart(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

$('#checkout').addEventListener('click', () => {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  cart = [];
  saveCart();
  renderCart();
  openCart(false);
  confetti(COLORS.map(c => c.hex));
  toast(`¡Pedido simulado de ${n} bolsa${n > 1 ? 's' : ''}! (esto es una demo)`);
});

// ---------- Hero: la bolsa va cambiando de diseño ----------
let heroIdx = 0;
function heroTick() {
  const p = PRESETS[heroIdx % PRESETS.length];
  const el = $('#heroBag');
  el.classList.add('fade');
  setTimeout(() => {
    el.innerHTML = renderBag({ ...p.cfg, monogram: '' }, { swing: true });
    $('#heroTag').innerHTML = `<span style="--c:${hexOf(p.cfg.color)}"></span>${p.name}`;
    el.classList.remove('fade');
  }, heroIdx ? 350 : 0);
  heroIdx++;
}

// ---------- Arranque ----------
(function init() {
  const m = location.hash.match(/#d=(.+)/);
  const shared = m && decodeCfg(m[1]);
  if (shared && GEO[shared.model]) {
    state = { ...shared, name: 'Diseño compartido' };
    $('#monogram').value = state.monogram;
  }
  cart = (store('trama-cart') || []).filter(i => i && i.cfg && GEO[i.cfg.model]);
  renderPresets();
  renderConfig(false);
  renderCart();
  heroTick();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(heroTick, 3800);
  if (shared) setTimeout(() => $('#taller').scrollIntoView(), 50);
})();
