// Service worker: guarda la tienda para que abra sin internet.
const CACHE = 'lc-v5';
const SHELL = ['./', 'index.html', 'styles.css', 'colores.js', 'luz.js', 'app.js', 'estudio.js', 'prototipo/recolor.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/mark-96.png', 'img/logo.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero (para ver siempre la última versión) y, sin conexión, lo guardado.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
