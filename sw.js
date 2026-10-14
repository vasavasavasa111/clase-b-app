
const CACHE = 'clase-b-bbe21e4c8c';
const SHELL = ['./', './index.html', './data.enc?v=bbe21e4c8c', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// network first (so new builds arrive), cache when offline or the network is slow
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; });
  const slow = new Promise(res => setTimeout(res, 4000));
  e.respondWith(Promise.race([net, slow.then(() => caches.match(e.request))])
    .then(r => r || net)
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
