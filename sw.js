/* Omatoimitreenit – service worker
   Strategia: network-first samalle originille (jotta päivitykset näkyvät heti),
   offline-varalla välimuisti. Supabase-kutsut, fontit ja CDN-skripti menevät
   aina suoraan verkkoon (ei välimuistia). */

const CACHE = 'omatoimi-v1';
const CORE = [
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // Supabase-kirjoitukset/auth suoraan verkkoon
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // CDN, fontit, Supabase suoraan verkkoon

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
