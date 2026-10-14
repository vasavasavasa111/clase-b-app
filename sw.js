
const CACHE = 'clase-b-acc783bbf6', PHOTOS = 'clase-b-photos';
const SHELL = ['./', './index.html', './data.enc?v=acc783bbf6', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== PHOTOS).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// network first (so new builds arrive), cache when offline or the network is slow
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // a photo file never changes (its name is its content hash): cache first, kept across builds
  if (new URL(e.request.url).pathname.includes('/img/')) {
    e.respondWith(caches.open(PHOTOS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; });
  const slow = new Promise(res => setTimeout(res, 4000));
  e.respondWith(Promise.race([net, slow.then(() => caches.match(e.request))])
    .then(r => r || net)
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
