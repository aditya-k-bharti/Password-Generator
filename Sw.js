// ============================================
//  PassNova — sw.js
//  Service Worker — Offline Support & Caching
//  Phase E (PWA)
// ============================================

const CACHE_NAME     = 'passnova-v1';
const OFFLINE_URL    = '/index.html';

// Files to cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/PasswordGen.css',
  '/PasswordGen.js',
  '/copy.png',
  '/manifest.json'
];

// External assets to cache on first fetch
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/fonts/bootstrap-icons.woff2',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/fonts/bootstrap-icons.woff'
];

// ── Install: precache app shell ──
self.addEventListener('install', (event) => {
  console.log('[SW] Installing PassNova Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching app shell...');
        // Cache local assets first (must succeed)
        return cache.addAll(PRECACHE_ASSETS)
          .then(() => {
            // Cache external assets individually — don't fail install if CDN is slow
            return Promise.allSettled(
              EXTERNAL_ASSETS.map(url =>
                fetch(url, { mode: 'cors' })
                  .then(res => { if (res.ok) cache.put(url, res); })
                  .catch(() => console.warn('[SW] Could not cache external asset:', url))
              )
            );
          });
      })
      .then(() => {
        console.log('[SW] Install complete.');
        // Activate immediately without waiting for old SW to finish
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

// ── Activate: clean up old caches ──
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating PassNova Service Worker...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete. Claiming clients...');
        // Take control of all open tabs immediately
        return self.clients.claim();
      })
  );
});

// ── Fetch: Cache-First for local, Network-First for external ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.protocol === 'moz-extension:') return;

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Offline fallback — serve cached index.html
          return caches.match(OFFLINE_URL)
            .then(cached => {
              if (cached) return cached;
              // Absolute last resort fallback
              return new Response(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>PassNova - Offline</title>
                  <style>
                    body { font-family: sans-serif; background: linear-gradient(135deg,#667eea,#764ba2);
                           display:flex; align-items:center; justify-content:center;
                           min-height:100vh; margin:0; color:#fff; text-align:center; }
                    .box { padding: 2rem; }
                    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                    p { opacity: 0.8; }
                    button { margin-top: 1.5rem; padding: 0.8rem 2rem; background: rgba(255,255,255,0.2);
                             border: 1px solid rgba(255,255,255,0.3); border-radius: 12px;
                             color: #fff; font-size: 1rem; cursor: pointer; }
                  </style>
                </head>
                <body>
                  <div class="box">
                    <h1>🔐 PassNova</h1>
                    <p>You're offline and the app hasn't been cached yet.</p>
                    <p>Please connect to the internet and reload once.</p>
                    <button onclick="location.reload()">Try Again</button>
                  </div>
                </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        })
    );
    return;
  }

  // Local assets: Cache-First strategy
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          // Not in cache — fetch and cache for next time
          return fetch(request)
            .then(response => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              return response;
            })
            .catch(() => {
              // Offline and not cached — return nothing gracefully
              console.warn('[SW] Local asset not available offline:', request.url);
            });
        })
    );
    return;
  }

  // External assets (CDN — Bootstrap Icons): Cache-First, fallback to network
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdn.')) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request, { mode: 'cors' })
            .then(response => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => {
              console.warn('[SW] External asset unavailable offline:', request.url);
            });
        })
    );
    return;
  }

  // All other requests: Network-First
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// ── Message: force update from UI ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Forced skip waiting...');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] PassNova Service Worker script loaded — cache:', CACHE_NAME);