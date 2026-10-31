// Catálogo y dibujo de bolsas en SVG.

const COLORS = [
  { id: 'crudo', name: 'Crudo', hex: '#efe4cf' },
  { id: 'arena', name: 'Arena', hex: '#d9b98c' },
  { id: 'terracota', name: 'Terracota', hex: '#c4623f' },
  { id: 'mostaza', name: 'Mostaza', hex: '#d9a420' },
  { id: 'salvia', name: 'Salvia', hex: '#8fa58a' },
  { id: 'oliva', name: 'Oliva', hex: '#5f6b3a' },
  { id: 'mar', name: 'Mar', hex: '#2f7f86' },
  { id: 'cielo', name: 'Cielo', hex: '#8fbcd4' },
  { id: 'indigo', name: 'Índigo', hex: '#2e3a6b' },
  { id: 'rosa', name: 'Rosa palo', hex: '#e3a9a4' },
  { id: 'fucsia', name: 'Fucsia', hex: '#c2306f' },
  { id: 'lavanda', name: 'Lavanda', hex: '#a99bc9' },
  { id: 'carbon', name: 'Carbón', hex: '#2b2a2a' },
  { id: 'blanco', name: 'Blanco', hex: '#faf8f3' },
];

const MODELS = [
  { id: 'tote', name: 'Tote', desc: 'Amplia, para el día a día', price: 48, days: 5 },
  { id: 'balde', name: 'Balde', desc: 'Redondeada y relajada', price: 52, days: 6 },
  { id: 'luna', name: 'Media luna', desc: 'Curva y elegante', price: 44, days: 4 },
  { id: 'sobre', name: 'Sobre', desc: 'Clutch con solapa', price: 36, days: 3 },
];

const YARNS = [
  { id: 'algodon', name: 'Algodón', desc: 'Suave, liviano y fresco', price: 0, days: 0 },
  { id: 'yute', name: 'Yute', desc: 'Rústico y muy resistente', price: 6, days: 1 },
  { id: 'macrame', name: 'Macramé', desc: 'Nudos con textura marcada', price: 10, days: 2 },
  { id: 'trapillo', name: 'Trapillo', desc: 'Grueso, de tela reciclada', price: 4, days: 0 },
  { id: 'rafia', name: 'Rafia', desc: 'Brillo natural, look playero', price: 8, days: 1 },
];

const PATTERNS = [
  { id: 'liso', name: 'Liso' },
  { id: 'rayas', name: 'Rayas' },
  { id: 'zigzag', name: 'Zigzag' },
  { id: 'rombos', name: 'Rombos' },
  { id: 'degradado', name: 'Degradado' },
  { id: 'bloque', name: 'Bloque' },
];

const STRAPS = [
  { id: 'mano', name: 'De mano', desc: 'Asa corta tejida', price: 0 },
  { id: 'hombro', name: 'Al hombro', desc: 'Asa larga tejida', price: 5 },
  { id: 'cuero', name: 'Cuero', desc: 'Cuero vegetal cosido', price: 14 },
  { id: 'cadena', name: 'Cadena', desc: 'Eslabones dorados', price: 12 },
  { id: 'aro', name: 'Aro de bambú', desc: 'Asa circular', price: 9 },
];

const ACCESSORIES = [
  { id: 'borla', name: 'Borla', icon: '〰', price: 4 },
  { id: 'pompon', name: 'Pompón', icon: '✺', price: 3 },
  { id: 'concha', name: 'Dije de concha', icon: '🐚', price: 6 },
  { id: 'boton', name: 'Botón de madera', icon: '◉', price: 3 },
  { id: 'flecos', name: 'Flecos', icon: '⫶', price: 7 },
  { id: 'forro', name: 'Forro interior', icon: '▤', price: 8 },
];

const PRESETS = [
  { name: 'Atardecer Caribe', tag: 'Más vendida', cfg: { model: 'tote', yarn: 'algodon', color: 'terracota', color2: 'mostaza', pattern: 'rayas', strap: 'hombro', acc: ['borla'] } },
  { name: 'Brisa de Mar', tag: 'Nueva', cfg: { model: 'balde', yarn: 'macrame', color: 'crudo', color2: 'mar', pattern: 'rombos', strap: 'aro', acc: ['concha'] } },
  { name: 'Bosque Andino', cfg: { model: 'luna', yarn: 'yute', color: 'oliva', color2: 'arena', pattern: 'bloque', strap: 'cuero', acc: ['boton'] } },
  { name: 'Noche de Gala', tag: 'Edición limitada', cfg: { model: 'sobre', yarn: 'rafia', color: 'carbon', color2: 'mostaza', pattern: 'liso', strap: 'cadena', acc: ['boton'] } },
  { name: 'Fresa Silvestre', cfg: { model: 'tote', yarn: 'trapillo', color: 'rosa', color2: 'fucsia', pattern: 'zigzag', strap: 'mano', acc: ['pompon'] } },
  { name: 'Campo de Lavanda', cfg: { model: 'balde', yarn: 'algodon', color: 'lavanda', color2: 'blanco', pattern: 'degradado', strap: 'hombro', acc: ['flecos', 'borla'] } },
];

// Geometría de cada modelo (viewBox 0 0 300 365)
const GEO = {
  tote: {
    body: 'M55,150 L245,150 L262,330 Q150,342 38,330 Z',
    rim: [52, 146, 196, 18], anchors: [[92, 150], [208, 150]],
    bottom: () => 334, range: [46, 254],
    button: [150, 186], tassel: [232, 176], pompom: [66, 300], shell: [72, 176], mono: [150, 262],
  },
  balde: {
    body: 'M64,145 L236,145 C266,210 266,292 228,330 Q150,350 72,330 C34,292 34,210 64,145 Z',
    rim: [61, 141, 178, 18], anchors: [[96, 145], [204, 145]],
    bottom: x => 338 - Math.pow((x - 150) / 85, 2) * 14, range: [80, 220],
    button: [150, 182], tassel: [228, 172], pompom: [70, 298], shell: [78, 172], mono: [150, 258],
  },
  luna: {
    body: 'M35,170 L265,170 A115,150 0 0 1 35,170 Z',
    rim: [32, 165, 236, 16], anchors: [[62, 170], [238, 170]],
    bottom: x => 170 + 150 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 150) / 115, 2))) + 2, range: [70, 230],
    button: [150, 202], tassel: [236, 198], pompom: [84, 278], shell: [64, 198], mono: [150, 258],
  },
  sobre: {
    body: 'M40,185 L260,185 L260,315 Q150,323 40,315 Z',
    flap: 'M38,183 L262,183 L262,192 L150,266 L38,192 Z',
    rim: null, anchors: [[54, 186], [246, 186]],
    bottom: () => 318, range: [48, 252],
    button: [150, 256], tassel: [246, 206], pompom: [56, 296], shell: [56, 206], mono: [150, 296],
  },
};

const byId = (list, id) => list.find(x => x.id === id) || list[0];
const hexOf = id => byId(COLORS, id).hex;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255, a = Math.abs(amt);
  const ch = v => Math.round(v + (t - v) * a);
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

function accentOf(c) {
  const base = hexOf(c.color);
  if (c.color !== c.color2) return hexOf(c.color2);
  return shade(base, lum(base) > 0.55 ? -0.4 : 0.45);
}

function texturePattern(yarn, id) {
  const D = 'rgba(40,25,15,.28)', L = 'rgba(255,255,255,.24)';
  const t = {
    algodon: [12, 10, `<path d="M0,1 L6,8 L12,1" fill="none" stroke="${D}" stroke-width="1.6"/><path d="M0,3.2 L6,10 L12,3.2" fill="none" stroke="${L}" stroke-width="1"/>`],
    yute: [14, 14, `<rect width="14" height="14" fill="rgba(120,80,30,.08)"/><path d="M0,2.3H7M0,4.7H7M7,9.3H14M7,11.7H14M9.3,0V7M11.7,0V7M2.3,7V14M4.7,7V14" stroke="${D}" stroke-width="1.3"/><path d="M0,1H7M8,8H14M1,7V14M8,0V7" stroke="${L}" stroke-width=".8"/>`],
    macrame: [20, 20, `<path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="${D}" stroke-width="2.2"/><path d="M0,11.5 L10,1.5 L20,11.5" fill="none" stroke="${L}" stroke-width="1"/><circle cx="10" cy="10" r="2.6" fill="${D}"/><circle cx="0" cy="0" r="2.6" fill="${D}"/><circle cx="20" cy="0" r="2.6" fill="${D}"/><circle cx="0" cy="20" r="2.6" fill="${D}"/><circle cx="20" cy="20" r="2.6" fill="${D}"/>`],
    trapillo: [16, 16, `<ellipse cx="4" cy="4" rx="4" ry="3.3" fill="${L}" stroke="${D}" stroke-width="1.4"/><ellipse cx="12" cy="4" rx="4" ry="3.3" fill="${L}" stroke="${D}" stroke-width="1.4"/><ellipse cx="0" cy="12" rx="4" ry="3.3" fill="${L}" stroke="${D}" stroke-width="1.4"/><ellipse cx="8" cy="12" rx="4" ry="3.3" fill="${L}" stroke="${D}" stroke-width="1.4"/><ellipse cx="16" cy="12" rx="4" ry="3.3" fill="${L}" stroke="${D}" stroke-width="1.4"/>`],
    rafia: [10, 8, `<path d="M0,1H10" stroke="${D}" stroke-width="1.8"/><path d="M0,4.5H10" stroke="${L}" stroke-width="1.4"/><path d="M0,6.5H10" stroke="rgba(255,255,255,.12)" stroke-width=".8"/>`, 'rotate(28)'],
  }[yarn] || [12, 10, ''];
  const [w, h, inner, tf] = t;
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${tf ? ` patternTransform="${tf}"` : ''}>${inner}</pattern>`;
}

function designLayer(c, p, base, sec, g) {
  switch (c.pattern) {
    case 'rayas':
      return {
        defs: `<pattern id="${p}d" width="300" height="34" patternUnits="userSpaceOnUse"><rect y="6" width="300" height="11" fill="${sec}"/><rect y="21" width="300" height="3" fill="${sec}"/></pattern>`,
        layer: `<rect width="300" height="365" fill="url(#${p}d)"/>`,
      };
    case 'zigzag':
      return {
        defs: `<pattern id="${p}d" width="40" height="46" patternUnits="userSpaceOnUse"><path d="M0,18 L10,8 L20,18 L30,8 L40,18 L40,28 L30,18 L20,28 L10,18 L0,28 Z" fill="${sec}"/></pattern>`,
        layer: `<rect width="300" height="365" fill="url(#${p}d)"/>`,
      };
    case 'rombos':
      return {
        defs: `<pattern id="${p}d" width="44" height="44" patternUnits="userSpaceOnUse" x="128"><path d="M22,4 L40,22 L22,40 L4,22 Z" fill="${sec}"/><path d="M22,14 L30,22 L22,30 L14,22 Z" fill="${base}"/></pattern>`,
        layer: `<rect width="300" height="365" fill="url(#${p}d)"/>`,
      };
    case 'degradado':
      return {
        defs: `<linearGradient id="${p}d" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="${sec}" stop-opacity="0"/><stop offset="1" stop-color="${sec}"/></linearGradient>`,
        layer: `<rect y="130" width="300" height="220" fill="url(#${p}d)"/>`,
      };
    case 'bloque': {
      const y = g.mono[1] - 6;
      return { defs: '', layer: `<rect y="${y}" width="300" height="200" fill="${sec}"/><rect y="${y - 14}" width="300" height="5" fill="${sec}"/>` };
    }
    default:
      return { defs: '', layer: '' };
  }
}

function strapPath(a, b, h) {
  const k = h * 1.33;
  return `M${a[0]},${a[1]} C${a[0]},${a[1] - k} ${b[0]},${b[1] - k} ${b[0]},${b[1]}`;
}

function drawStrap(c, g, base) {
  const [a, b] = g.anchors;
  const knit = shade(base, -0.18);
  switch (c.strap) {
    case 'hombro': {
      const d = strapPath([a[0] - 14, a[1]], [b[0] + 14, b[1]], 140);
      return `<path d="${d}" fill="none" stroke="${knit}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="10" stroke-dasharray="2 4"/>`;
    }
    case 'cuero': {
      const d = strapPath(a, b, 95);
      return `<path d="${d}" fill="none" stroke="#7d4a2c" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a46a43" stroke-width="7"/><path d="${d}" fill="none" stroke="#f3e3c8" stroke-width="1.1" stroke-dasharray="4 4"/>`;
    }
    case 'cadena': {
      const d = strapPath([a[0] - 10, a[1]], [b[0] + 10, b[1]], 125);
      return `<path d="${d}" fill="none" stroke="#8f6c1f" stroke-width="9" stroke-dasharray="12 4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#e2bd5c" stroke-width="6" stroke-dasharray="12 4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff3c4" stroke-width="1.5" stroke-dasharray="6 10" stroke-dashoffset="-2"/>`;
    }
    case 'aro': {
      const cy = a[1] - 38;
      return `<circle cx="150" cy="${cy}" r="60" fill="none" stroke="#9c6b38" stroke-width="13"/><circle cx="150" cy="${cy}" r="60" fill="none" stroke="#d3a066" stroke-width="9"/><circle cx="150" cy="${cy}" r="60" fill="none" stroke="#7d5126" stroke-width="9" stroke-dasharray="1.5 22" opacity=".7"/><path d="M110,${cy - 44} A60,60 0 0 1 150,${cy - 60}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    default: {
      const d = strapPath(a, b, 82);
      return `<path d="${d}" fill="none" stroke="${knit}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="11" stroke-dasharray="2 4"/>`;
    }
  }
}

function drawStrapFront(c, g) {
  const [a, b] = g.anchors;
  if (c.strap === 'cuero') {
    return [a, b].map(([x, y]) => `<rect x="${x - 9}" y="${y - 6}" width="18" height="22" rx="3" fill="#7d4a2c"/><circle cx="${x}" cy="${y + 8}" r="2.4" fill="#e2bd5c"/>`).join('');
  }
  if (c.strap === 'cadena') {
    return [[a[0] - 10, a[1]], [b[0] + 10, b[1]]].map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="6" fill="none" stroke="#c99f3c" stroke-width="3"/>`).join('');
  }
  if (c.strap === 'aro') {
    const cy = a[1] - 38;
    return [118, 182].map(x => `<rect x="${x - 7}" y="${cy + 48}" width="14" height="22" rx="4" fill="${shade(hexOf(c.color), -0.25)}"/>`).join('');
  }
  return '';
}

function drawAccessories(c, g, acc, base) {
  const has = id => c.acc.includes(id);
  let out = '';
  if (has('flecos')) {
    const [x0, x1] = g.range;
    for (let x = x0; x <= x1; x += 6) {
      const y = g.bottom(x) - 3;
      const sway = ((x * 7) % 5) - 2;
      out += `<path d="M${x},${y} q${sway},14 ${sway * 0.6},28" fill="none" stroke="${acc}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
  }
  if (has('boton')) {
    const [x, y] = g.button;
    out += `<circle cx="${x}" cy="${y + 1.5}" r="12" fill="rgba(0,0,0,.18)"/><circle cx="${x}" cy="${y}" r="12" fill="#b07a45" stroke="#7b5129" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="rgba(0,0,0,.15)"/>` +
      `<path d="M${x - 3},${y - 3} L${x + 3},${y + 3} M${x + 3},${y - 3} L${x - 3},${y + 3}" stroke="${acc}" stroke-width="2"/>`;
  }
  if (c.monogram) {
    const [x, y] = g.mono;
    const fill = lum(base) > 0.5 ? shade(acc === base ? base : acc, -0.1) : acc;
    out += `<text x="${x}" y="${y}" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="34" fill="${fill}" stroke="${base}" stroke-width="4" paint-order="stroke" letter-spacing="2">${escapeXml(c.monogram)}</text>`;
  }
  if (has('pompon')) {
    const [x, y] = g.pompom;
    let fluff = '';
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2;
      fluff += `<path d="M${x},${y + 30} l${(Math.cos(ang) * 17).toFixed(1)},${(Math.sin(ang) * 17).toFixed(1)}" stroke="${shade(acc, -0.15)}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    out += `<path d="M${x},${y} v14" stroke="${shade(acc, -0.3)}" stroke-width="2"/><circle cx="${x}" cy="${y + 30}" r="16" fill="${acc}"/>${fluff}<circle cx="${x - 5}" cy="${y + 25}" r="5" fill="rgba(255,255,255,.25)"/>`;
  }
  if (has('concha')) {
    const [x, y] = g.shell;
    out += `<path d="M${x},${y} v16" stroke="#c9a98a" stroke-width="1.6"/>` +
      `<g transform="translate(${x},${y + 44})"><path d="M0,0 C-16,-2 -18,-20 0,-28 C18,-20 16,-2 0,0 Z" fill="#f6e9dc" stroke="#c9a98a" stroke-width="1.5"/>` +
      `<path d="M0,-1 L-9,-21 M0,-1 L-4,-25 M0,-1 L4,-25 M0,-1 L9,-21" stroke="#d6b79a" stroke-width="1.2"/><rect x="-5" y="-2" width="10" height="5" rx="2" fill="#e8cdb3"/></g>`;
  }
  if (has('borla')) {
    const [x, y] = g.tassel;
    let strands = '';
    for (let i = -5; i <= 5; i++) {
      strands += `<path d="M${x},${y + 26} q${i * 0.8},14 ${i * 1.7},34" fill="none" stroke="${i % 2 ? shade(acc, -0.15) : acc}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    out += `<path d="M${x},${y} v14" stroke="${shade(acc, -0.3)}" stroke-width="2"/><circle cx="${x}" cy="${y + 20}" r="7" fill="${acc}"/>${strands}<rect x="${x - 7}" y="${y + 24}" width="14" height="5" rx="2" fill="${shade(acc, -0.3)}"/>`;
  }
  return out;
}

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[ch]));
}

let bagSeq = 0;
function renderBag(c, opts = {}) {
  const g = GEO[c.model] || GEO.tote;
  const p = 'b' + (++bagSeq) + '-';
  const base = hexOf(c.color), sec = hexOf(c.color2), acc = accentOf(c);
  const design = designLayer(c, p, base, sec, g);

  const defs = `
    <clipPath id="${p}clip"><path d="${g.body}"/></clipPath>
    ${texturePattern(c.yarn, p + 'tex')}
    ${design.defs}
    <linearGradient id="${p}shade" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".75" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
    <linearGradient id="${p}top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".12" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <pattern id="${p}rib" width="5" height="10" patternUnits="userSpaceOnUse"><path d="M2.5,0V10" stroke="rgba(0,0,0,.28)" stroke-width="1.6"/></pattern>`;

  const fill = `<rect width="300" height="365" fill="${base}"/>${design.layer}<rect width="300" height="365" fill="url(#${p}tex)"/>`;
  const body = `<g clip-path="url(#${p}clip)">${fill}<rect width="300" height="365" fill="url(#${p}shade)"/><rect y="${g.anchors[0][1]}" width="300" height="200" fill="url(#${p}top)"/></g>` +
    `<path d="${g.body}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>`;

  let rim = '';
  if (g.rim) {
    const [x, y, w, h] = g.rim;
    rim = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${shade(base, -0.14)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#${p}rib)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" stroke="rgba(0,0,0,.15)"/>`;
  }
  let flap = '';
  if (g.flap) {
    const flapFill = c.pattern === 'liso' || c.pattern === 'degradado' ? shade(base, -0.05) : sec;
    flap = `<path d="${g.flap}" transform="translate(0,4)" fill="rgba(0,0,0,.18)"/><path d="${g.flap}" fill="${flapFill}"/><path d="${g.flap}" fill="url(#${p}tex)"/><path d="${g.flap}" fill="url(#${p}shade)"/><path d="${g.flap}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>`;
  }

  const groundY = Math.max(...[g.range[0], 150, g.range[1]].map(x => g.bottom(x))) + (c.acc.includes('flecos') ? 30 : 8);
  return `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" class="bag-svg" role="img" aria-label="Vista previa de la bolsa">
    <defs>${defs}</defs>
    <ellipse cx="150" cy="${Math.min(groundY, 372)}" rx="105" ry="7" fill="rgba(60,35,20,.14)"/>
    <g class="${opts.swing ? 'bag-swing' : ''}">
      ${drawStrap(c, g, base)}${body}${rim}${flap}${drawStrapFront(c, g)}${drawAccessories(c, g, acc, base)}
    </g>
  </svg>`;
}

function priceOf(c) {
  let p = byId(MODELS, c.model).price + byId(YARNS, c.yarn).price + byId(STRAPS, c.strap).price;
  for (const id of c.acc) p += byId(ACCESSORIES, id).price;
  if (c.monogram) p += 5;
  return p;
}

function daysOf(c) {
  return byId(MODELS, c.model).days + byId(YARNS, c.yarn).days + Math.ceil(c.acc.length / 2) + (c.monogram ? 1 : 0);
}
