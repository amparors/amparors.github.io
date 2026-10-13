// Guarda os arquivos do app no celular para abrir mesmo sem internet.
// Ao mudar algum arquivo, aumente o número da versão.
const CACHE = 'amparo-rs-v10';
const ARQUIVOS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'img/simbolo.png',
  'img/nome.png',
  'fonts/nunito.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Primeiro tenta a internet (versão mais nova); sem internet, usa a cópia guardada.
self.addEventListener('fetch', (ev) => {
  const pedido = ev.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(pedido)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE).then((c) => c.put(pedido, copia));
        return resposta;
      })
      .catch(() => caches.match(pedido, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
