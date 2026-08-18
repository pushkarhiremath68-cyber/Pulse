/* ==========================================================================
   PULSE MUSIC SERVICE WORKER (CACHE PURGED & UNREGISTERED FOR FRESH LOADS)
   ========================================================================== */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Always fetch live from network
  event.respondWith(fetch(event.request));
});
