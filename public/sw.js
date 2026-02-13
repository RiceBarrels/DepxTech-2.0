// DepxTech Service Worker v4
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `depxtech-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `depxtech-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `depxtech-images-${CACHE_VERSION}`;
const DEFAULT_LOCALE = 'en';
const OFFLINE_URL = `/${DEFAULT_LOCALE}/offline`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  `/${DEFAULT_LOCALE}`,
  `/${DEFAULT_LOCALE}/offline`,
  '/manifest.webmanifest',
  '/favicon.ico',
  '/lightLogo.svg',
  '/darkLogo.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Max age for different cache types (in seconds)
const CACHE_MAX_AGE = {
  static: 7 * 24 * 60 * 60, // 7 days
  dynamic: 24 * 60 * 60, // 1 day
  images: 30 * 24 * 60 * 60, // 30 days
};

// Max items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;
const MAX_IMAGE_CACHE_ITEMS = 100;

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old version caches
            return (
              cacheName.startsWith('depxtech-') &&
              !cacheName.includes(CACHE_VERSION)
            );
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Helper: Limit cache size
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// Helper: Check if response is valid
function isValidResponse(response) {
  return response && response.status === 200 && response.type !== 'error';
}

// Helper: Check if response is a redirect
function isRedirect(response) {
  return response && response.status >= 300 && response.status < 400;
}

// Helper: Cache with timestamp
async function cacheWithTimestamp(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  const headers = new Headers(response.headers);
  headers.append('sw-cached-at', Date.now().toString());
  const cachedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
  await cache.put(request, cachedResponse);
}

// Helper: Check if cache is stale
function isCacheStale(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  const age = (Date.now() - parseInt(cachedAt)) / 1000;
  return age > maxAge;
}

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API routes - always fetch from network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip authentication related requests
  if (url.pathname.startsWith('/auth/') || url.hostname.includes('clerk')) {
    return;
  }

  // Skip Supabase requests
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Skip Next.js HMR and dev requests
  if (url.pathname.includes('_next/webpack-hmr') || url.pathname.includes('__nextjs')) {
    return;
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // For images
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|avif)$/i)
  ) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // For static assets (CSS, JS, fonts)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(handleDynamicRequest(request));
});

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  const url = new URL(request.url);

  // Don't cache the root path as it always redirects based on locale/OAuth
  if (url.pathname === '/' || url.pathname === '') {
    return fetch(request);
  }

  try {
    // Try network first (follow redirects automatically)
    const networkResponse = await fetch(request);

    // Don't cache redirect responses - let them pass through
    if (isRedirect(networkResponse)) {
      return networkResponse;
    }

    if (isValidResponse(networkResponse)) {
      // Cache the final response using the final URL (after redirects)
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Try offline page for current locale, then fall back to default
    const segments = url.pathname.split('/');
    const locale = segments[1] || DEFAULT_LOCALE;
    const localeOffline = await caches.match(`/${locale}/offline`);
    if (localeOffline) return localeOffline;
    return caches.match(OFFLINE_URL);
  }
}

// Handle image requests (cache first, stale-while-revalidate)
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);

  // Return cache immediately if available
  if (cachedResponse && !isCacheStale(cachedResponse, CACHE_MAX_AGE.images)) {
    return cachedResponse;
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    if (isValidResponse(networkResponse)) {
      await cacheWithTimestamp(IMAGE_CACHE, request, networkResponse.clone());
      await trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ITEMS);
      return networkResponse;
    }
    // If network fails but we have stale cache, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a placeholder or nothing
    return new Response('', { status: 404 });
  }
}

// Handle static assets (cache first with background update)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (isValidResponse(response)) {
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (isValidResponse(networkResponse)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Handle dynamic requests (stale-while-revalidate)
async function handleDynamicRequest(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (isValidResponse(networkResponse)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
      return networkResponse;
    }
    throw new Error('Network response not ok');
  }).catch(() => null);

  // Return cached response immediately if available
  if (cachedResponse) {
    fetchPromise; // Update in background
    return cachedResponse;
  }

  // Wait for network response
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response('', { status: 404 });
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }

  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('depxtech-'))
            .map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from DepxTech',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'DepxTech', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[SW] Service Worker script loaded, version:', CACHE_VERSION);
