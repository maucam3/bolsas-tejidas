// Interfaz general: pedido, efectos al bajar por la página y app instalable.

const $ = s => document.querySelector(s);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  if (still) return;
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

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Pedido ----------
// Sin precios todavía: Lilián los confirma. El envío del pedido es una demostración.
let order = (store('lc-pedido') || []).filter(i => i && i.bag && i.name);

function addToOrder(item) {
  const same = order.find(i => i.bag === item.bag && i.color === item.color);
  if (same) same.qty++;
  else order.push({ ...item, qty: 1, id: Date.now() + Math.random() });
  saveOrder();
  const btn = $('#cartOpen');
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  toast(`“${item.name}” añadida a tu pedido`);
}

function saveOrder() { store('lc-pedido', order); renderOrder(); }

function renderOrder() {
  const count = order.reduce((n, i) => n + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').classList.toggle('show', count > 0);
  $('#checkout').disabled = !order.length;
  $('#cartItems').innerHTML = order.length ? order.map(i => {
    const c = i.color && byId(COLORS, i.color);
    return `<div class="ci">
      <img class="ci-art" src="${esc(i.thumb)}" alt="">
      <div class="ci-info">
        <b>${esc(i.name)}</b>
        <span class="muted">${c ? `<i class="dot" style="--c:${c.hex}"></i>En ${esc(c.name)} (simulación)` : 'Color original'}</span>
        <div class="qty">
          <button data-dec="${i.id}" aria-label="Quitar una">−</button><span>${i.qty}</span><button data-inc="${i.id}" aria-label="Añadir una">+</button>
          <button class="link" data-del="${i.id}">Quitar</button>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="empty"><p>Tu pedido está vacío.</p><p class="muted">Elige una bolsa en el estudio y aparecerá aquí.</p></div>`;
}

$('#cartItems').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const find = id => order.find(i => String(i.id) === id);
  if (b.dataset.inc) find(b.dataset.inc).qty++;
  if (b.dataset.dec) { const it = find(b.dataset.dec); it.qty--; if (!it.qty) order = order.filter(x => x !== it); }
  if (b.dataset.del) order = order.filter(x => String(x.id) !== b.dataset.del);
  saveOrder();
});

const openCart = open => document.body.classList.toggle('cart-open', open);
$('#cartOpen').addEventListener('click', () => openCart(true));
$('#cartClose').addEventListener('click', () => openCart(false));
$('#scrim').addEventListener('click', () => openCart(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

$('#checkout').addEventListener('click', () => {
  order = [];
  saveOrder();
  openCart(false);
  confetti(['#0a62b4', '#00a3e6', '#ffffff', '#9ca1a8']);
  toast('Esto es una demostración: todavía no se envían pedidos reales');
});

renderOrder();

// ---------- Efectos al bajar por la página ----------
// Los elementos .reveal aparecen al entrar en pantalla; las ventanas abren sus postigos.
const revealer = new IntersectionObserver(entries => {
  for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); revealer.unobserve(en.target); }
}, { threshold: .25 });
document.querySelectorAll('.reveal, .window').forEach(el => revealer.observe(el));

// El hilo del proceso: se teje mientras bajas y va "cosiendo" cada paso.
(function thread() {
  const list = $('.process'), svg = $('#thread');
  if (!list || !svg) return;
  const steps = [...list.children];
  let len = 1;

  function layout() {
    const box = list.getBoundingClientRect();
    const pts = steps.map(li => {
      const r = li.querySelector('.pn').getBoundingClientRect();
      return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
    });
    const vertical = pts.length > 1 && Math.abs(pts[1][0] - pts[0][0]) < 20;
    let d;
    if (vertical) {
      // Una columna: el hilo baja por el margen izquierdo, pasando por cada número como un botón cosido.
      const x = pts[0][0];
      d = `M${x - 18},${pts[0][1] - 70} Q${x},${pts[0][1] - 50} ${x},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const y0 = pts[i - 1][1], y1 = pts[i][1], m = (y0 + y1) / 2;
        d += ` C${x + 16},${m - 20} ${x - 16},${m + 20} ${x},${y1}`;
      }
    } else {
      // Varias columnas: arcos por encima de las tarjetas, de número en número.
      d = `M${pts[0][0] - 40},${pts[0][1] - 110} Q${pts[0][0] - 10},${pts[0][1] - 90} ${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        const lift = Math.min(y0, y1) - 125;
        d += ` C${x0 + 30},${lift} ${x1 - 30},${lift} ${x1},${y1}`;
      }
    }
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
    len = svg.querySelector('.draw').getTotalLength();
    // Posición de cada número a lo largo del hilo, para "encender" el paso cuando llega.
    steps.forEach((li, i) => { li.dataset.at = i / Math.max(1, steps.length - 1) * .92 + .04; });
    tick();
  }

  function tick() {
    const r = list.getBoundingClientRect(), vh = innerHeight;
    const p = still ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .25)));
    const draw = svg.querySelector('.draw');
    draw.style.strokeDasharray = len;
    draw.style.strokeDashoffset = len * (1 - p);
    steps.forEach(li => li.classList.toggle('on', p >= +li.dataset.at));
  }

  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  layout();
})();

// ---------- App instalable ----------
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js'));

const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (!standalone) $('#installBtn').hidden = false; });
addEventListener('appinstalled', () => { installEvt = null; $('#installBtn').hidden = true; toast('¡Listo! Lilián Cuevas ya está en tu pantalla de inicio'); });
if (isIOS && !standalone) $('#installBtn').hidden = false;
$('#installBtn').onclick = async () => {
  if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; $('#installBtn').hidden = true; }
  else toast('En Safari: toca Compartir ⬆ y luego "Agregar a inicio"');
};
