// ===================== b0b.dev SERVICE WORKER — OFFLINE SHELL =====================
// Caches core application assets so the site remains functional even if:
// - All CDNs are blocked/down
// - Network is intermittent
// - The origin server is temporarily unreachable
//
// Strategy: Network-first with cache fallback
// - Always tries network first (gets latest content)
// - Falls back to cache if network fails
// - Tile requests are cached opportunistically (cache what loads, serve from cache if provider dies)

var CACHE_NAME = 'b0b-shell-v1';
var TILE_CACHE = 'b0b-tiles-v1';

// Core assets to pre-cache on install — the skeleton that must always work
var CORE_ASSETS = [
  '/',
  '/_page/map',
  '/_page/tools',
  '/_page/report'
];

// Tile CDN domains — cache tiles opportunistically
var TILE_DOMAINS = [
  'basemaps.cartocdn.com',
  'tile.openstreetmap.org',
  'server.arcgisonline.com',
  'tile.opentopomap.org',
  'tiles.stadiamaps.com'
];

self.addEventListener('install', function(event) {
  console.log('[SW] Installing — pre-caching core assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS).catch(function(err) {
        // Don't fail install if auth blocks some pages — they'll be cached on first authenticated visit
        console.log('[SW] Some assets require auth — will cache on first visit');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activated');
  // Clean old caches if version bumped
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME && name !== TILE_CACHE;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests (POST for CSP reports, login, etc.)
  if (event.request.method !== 'GET') return;

  // Check if this is a tile request
  var isTile = TILE_DOMAINS.some(function(domain) {
    return url.hostname.indexOf(domain) !== -1;
  });

  if (isTile) {
    // Tiles: network-first, cache opportunistically, serve from cache if dead
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(TILE_CACHE).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || new Response('', { status: 408 });
        });
      })
    );
    return;
  }

  // Same-origin page/asset requests: network-first with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;
          // If page request fails and nothing cached, return offline notice
          if (event.request.headers.get('accept') && event.request.headers.get('accept').indexOf('text/html') !== -1) {
            return new Response(
              '<html><body style="background:#0a0a0a;color:#ff6600;font-family:Courier New,monospace;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">' +
              '<div><h1 style="color:#00ff41">b0b.dev</h1><p>OFFLINE MODE — network unreachable</p><p style="font-size:0.7rem;color:#555">Cached content may be available. Reload when connection restores.</p></div>' +
              '</body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('', { status: 408 });
        });
      })
    );
  }
});
