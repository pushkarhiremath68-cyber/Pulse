/* ==========================================================================
   PULSE MUSIC SERVICE WORKER
   Designed by Pushkar Hiremath
   ========================================================================== */

const CACHE_NAME = 'pulse-music-cache-v10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './src/style.css',
  './src/main.js',
  './src/musicService.js',
  './src/visualizer.js',
  './src/supabaseClient.js',
  './pulse-logo.png',
  './pulse-logo.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Pulse SW] Non-critical cache error:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // NEVER intercept downloads, streaming API, or external media
  if (
    url.includes('/downloads/') ||
    url.includes('/api/') ||
    url.endsWith('.apk') ||
    url.endsWith('.exe') ||
    url.endsWith('.dmg') ||
    url.endsWith('.AppImage') ||
    url.endsWith('.ipa') ||
    url.includes('youtube.com') ||
    url.includes('googlevideo.com') ||
    url.includes('supabase.co') ||
    url.includes('apple.com') ||
    url.includes('invidious') ||
    url.includes('puffyan.us') ||
    url.includes('tux.pizza') ||
    url.includes('fdn.fr') ||
    url.includes('ggtyler.dev') ||
    url.includes('nerdvpn.de') ||
    url.includes('artemislena.eu') ||
    url.includes('privacyredirect.com') ||
    url.includes('accounts.google.com')
  ) {
    return;
  }

  // Network-First strategy: fetch latest code from server, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (event.request.method === 'GET' && networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone).catch(() => {});
          });
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
