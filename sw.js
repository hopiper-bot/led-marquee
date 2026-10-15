// LED 跑馬燈 Service Worker — 離線快取
const CACHE = 'led-marquee-v5';
const CACHE_PREFIX = 'led-marquee-';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      const hadOldCache = keys.some(k => k.startsWith(CACHE_PREFIX) && k !== CACHE);
      return Promise.all(
        keys
          .filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE)
          .map(k => caches.delete(k))
      ).then(() => self.clients.claim())
        .then(() => hadOldCache ? self.clients.matchAll({ type: 'window' }) : [])
        .then(clients => Promise.all(
          clients.map(client =>
            Promise.resolve(client.navigate(client.url)).catch(() => null)
          )
        ));
    })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const isPageRequest = e.request.mode === 'navigate' ||
    new URL(e.request.url).pathname.endsWith('/index.html');

  // 首頁使用網路優先，避免已安裝的 App 永遠停在舊版；離線時才讀快取。
  if (isPageRequest) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(resp => {
        if (!resp.ok) throw new Error('Page update failed');
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }))
  );
});
