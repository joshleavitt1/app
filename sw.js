const CACHE_VERSION = 'mvp-v1';
const CACHE_NAME = `mathmonsters-${CACHE_VERSION}`;
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './html/battle.html',
  './html/home.html',
  './html/register.html',
  './html/signin.html',
  './html/welcome.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/ui/app.js',
  './js/engine/battle.js',
  './js/engine/questions.js',
  './js/state/save.js',
  './js/types.js',
  './content/content.json',
  './images/brand/logo.png',
  './images/hero/shellfin_evolution_1.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(OFFLINE_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (requestURL.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
