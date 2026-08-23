const CACHE_NAME = 'hydrodispatch-pwa-v2.1.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg',
  '/images/plant_hero.jpg',
  '/images/electrolyzer_stacks.jpg',
  '/images/buffer_storage.jpg',
];

// Install: precache core application shell and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some precache assets failed, continuing installation:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-First strategy with network fallback & background update
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For backend API calls, attempt network first, gracefully fallback if offline
  if (url.port === '8000' || url.pathname.startsWith('/dispatch/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'Backend unreachable. Client-side physics twin active.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Non-GET requests should bypass cache
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache-First for static assets (JS, CSS, HTML, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately and update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            // Quietly ignore network failures in offline / airplane mode
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting navigation, fallback to root index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Offline resource unavailable', { status: 503 });
        });
    })
  );
});
