self.options = {
    "domain": "5gvci.com",
    "zoneId": 10264503
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

// --- Caching Logic ---
const CACHE_NAME = 'packsapeka-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/sitemap.xml',
  '/robots.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});