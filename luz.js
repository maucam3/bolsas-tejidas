// Luz de luna: ilumina una foto real con una luz que sigue al dedo o al mouse.
// El relieve de cada puntada se calcula de la propia foto (las partes claras sobresalen),
// así que funciona con cualquier foto y también con la versión teñida.

const MOON_VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const MOON_FRAG = `
precision mediump float;
uniform sampler2D tex;
uniform vec2 px;        // tamaño de un pixel de la foto
uniform vec2 cover;     // recorte tipo object-fit: cover
uniform vec2 light;     // posición de la luz (0-1 dentro del lienzo)
uniform float aspect;   // ancho/alto del lienzo
uniform float power;    // 0 apagada, 1 encendida
varying vec2 uv;

float lum(vec2 q) { return dot(texture2D(tex, q).rgb, vec3(.299, .587, .114)); }

void main() {
  vec2 t = (uv - .5) * cover + .5;
  vec3 base = texture2D(tex, t).rgb;

  // Relieve: diferencia de brillo a dos escalas (puntada y fibra).
  vec2 a = px * 3., b = px * 1.2;
  float hx = (lum(t + vec2(a.x, 0.)) - lum(t - vec2(a.x, 0.))) * .7 + (lum(t + vec2(b.x, 0.)) - lum(t - vec2(b.x, 0.))) * .5;
  float hy = (lum(t + vec2(0., a.y)) - lum(t - vec2(0., a.y))) * .7 + (lum(t + vec2(0., b.y)) - lum(t - vec2(0., b.y))) * .5;
  vec3 n = normalize(vec3(-hx * 5., -hy * 5., 1.));

  vec2 d = (light - uv) * vec2(aspect, 1.);
  vec3 L = normalize(vec3(d, .45));
  float fall = exp(-dot(d, d) * 2.0);
  float diff = max(dot(n, L), 0.);
  vec3 H = normalize(L + vec3(0., 0., 1.));
  float spec = pow(max(dot(n, H), 0.), 36.) * fall;

  vec3 moon = vec3(.86, .93, 1.);
  vec3 lit = base * (.42 + 1.25 * diff * fall * moon) + spec * .6 * moon;
  gl_FragColor = vec4(mix(base, lit, power), 1.);
}`;

class MoonLight {
  constructor(canvas, { follow = canvas, auto = true } = {}) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) { this.failed = true; return; }
    this.gl = gl;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, MOON_VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, MOON_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { this.failed = true; return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = Object.fromEntries(['tex', 'px', 'cover', 'light', 'aspect', 'power'].map(k => [k, gl.getUniformLocation(prog, k)]));

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_2D, k, v);

    this.light = [.25, .8];       // arriba a la izquierda, donde está la luna
    this.target = [.25, .8];
    this.power = 0;
    this.on = false;
    this.auto = auto && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.idleSince = 0;

    // La luz sigue al puntero dentro de `follow`.
    const move = e => {
      if (!this.on) return;
      const r = canvas.getBoundingClientRect();
      this.target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      this.idleSince = performance.now();
      this.kick();
    };
    follow.addEventListener('pointermove', move);
    follow.addEventListener('pointerdown', move);

    new ResizeObserver(() => this.resize()).observe(canvas);
    // Fuera de pantalla no se dibuja (ahorra batería).
    this.visible = true;
    new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; this.kick(); }).observe(canvas);
    this.resize();
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(this.canvas.clientWidth * dpr), h = Math.round(this.canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.kick();
  }

  setSource(el) {
    if (this.failed) return;
    const gl = this.gl;
    const w = el.naturalWidth || el.width, h = el.naturalHeight || el.height;
    if (!w || !h) return;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el);
    this.size = [w, h];
    this.kick();
  }

  setOn(on) { this.on = on; this.idleSince = 0; this.kick(); }

  kick() { if (!this.raf && !this.failed && this.visible) this.raf = requestAnimationFrame(t => this.frame(t)); }

  frame(t) {
    this.raf = 0;
    if (!this.size) return;
    // Sin puntero un rato: la luz da vueltas despacio, como la luna.
    if (this.on && this.auto && t - this.idleSince > 2500) {
      const k = t / 4200;
      this.target = [.5 + Math.cos(k) * .32, .55 + Math.sin(k * 1.3) * .28];
    }
    const ease = .12;
    this.light[0] += (this.target[0] - this.light[0]) * ease;
    this.light[1] += (this.target[1] - this.light[1]) * ease;
    this.power += ((this.on ? 1 : 0) - this.power) * .1;

    const gl = this.gl, { width: cw, height: ch } = this.canvas;
    gl.viewport(0, 0, cw, ch);
    const ca = cw / ch, ta = this.size[0] / this.size[1];
    gl.uniform2f(this.u.cover, ca < ta ? ca / ta : 1, ca < ta ? 1 : ta / ca);
    gl.uniform2f(this.u.px, 1 / this.size[0], 1 / this.size[1]);
    gl.uniform2f(this.u.light, this.light[0], this.light[1]);
    gl.uniform1f(this.u.aspect, ca);
    gl.uniform1f(this.u.power, this.power);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const moving = Math.abs(this.target[0] - this.light[0]) + Math.abs(this.target[1] - this.light[1]) > .001;
    const fading = Math.abs((this.on ? 1 : 0) - this.power) > .005;
    if (moving || fading || (this.on && this.auto)) this.kick();
  }
}
