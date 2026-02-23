const CACHE_VERSION = 'v4'
const STATIC_CACHE = `depxtech-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `depxtech-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `depxtech-images-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
]

// Max entries per cache to prevent unbounded growth
const MAX_DYNAMIC_ENTRIES = 50
const MAX_IMAGE_ENTRIES = 100

// Max response size to cache (5MB)
const MAX_CACHE_SIZE = 5 * 1024 * 1024

// ─── Lifecycle Events ────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== IMAGE_CACHE
          )
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Message Handling ────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})

// ─── Fetch Strategy Helpers ──────────────────────────────────────────

/**
 * Limit cache size by removing the oldest entries when exceeding maxEntries.
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    await cache.delete(keys[0])
    return trimCache(cacheName, maxEntries)
  }
}

/**
 * Network-first strategy: try the network, fall back to cache.
 * Caches successful responses for future offline use.
 * Only caches responses under MAX_CACHE_SIZE.
 */
async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Check response size before caching
      const contentLength = response.headers.get('content-length')
      const size = contentLength ? parseInt(contentLength, 10) : 0

      // Only cache if size is known and under limit, or if size is unknown but likely small (HTML/JSON)
      const contentType = response.headers.get('content-type') || ''
      const isTextContent = contentType.includes('text/') || contentType.includes('application/json')

      if ((size > 0 && size < MAX_CACHE_SIZE) || (size === 0 && isTextContent)) {
        const cache = await caches.open(cacheName)
        cache.put(request, response.clone())
        trimCache(cacheName, maxEntries)
      }
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Cache-first strategy: serve from cache if available, otherwise fetch.
 * Used for immutable assets (hashed filenames).
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Stale-while-revalidate: return cache immediately, update in background.
 * Used for images so they load fast but stay fresh.
 */
async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, response.clone())
          trimCache(cacheName, maxEntries)
        })
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
}

// ─── Fetch Event ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin and GET requests
  if (request.method !== 'GET') return

  // Don't cache images, videos, audio, or large media files
  if (
    request.destination === 'image' ||
    request.destination === 'video' ||
    request.destination === 'audio' ||
    url.pathname.endsWith('.pdf') ||
    url.pathname.endsWith('.zip') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.mp3')
  ) {
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  // Skip caching for API routes and auth-related paths
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return
  }

  // Next.js build assets (hashed filenames) -> cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Next.js data requests and server components -> network-first
  if (url.pathname.startsWith('/_next/data/') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES))
    return
  }

  // Navigation requests (HTML pages) -> network-first
  // Only cache allowed routes: /, /en/, /en/trade/, /en/account/, /en/offers/, /en/products/
  if (request.mode === 'navigate') {
    const localePattern = /^\/(en|zh-CN|zh-TW|ar|nl|fr|de|it|ja|ko|pl|pt|ru|es|sv)(\/|$)/
    const allowedBaseRoutes = ['/account', '/trade', '/offers', '/products']

    let isAllowedRoute = false

    // Check if it's root "/"
    if (url.pathname === '/' || url.pathname === '') {
      isAllowedRoute = true
    }
    // Check if it's a locale root like "/en/" or locale + allowed route
    else if (localePattern.test(url.pathname)) {
      const pathAfterLocale = url.pathname.replace(localePattern, '/')
      // Allow locale root (e.g., "/en/" -> "/")
      if (pathAfterLocale === '/' || pathAfterLocale === '') {
        isAllowedRoute = true
      }
      // Check if locale + allowed route (e.g., "/en/trade")
      else {
        isAllowedRoute = allowedBaseRoutes.some(route => pathAfterLocale.startsWith(route))
      }
    }

    if (isAllowedRoute) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES))
    } else {
      // For non-allowed routes, show offline message
      event.respondWith(
        fetch(request).catch(() =>
          new Response('You are offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          })
        )
      )
    }
    return
  }

  // Static assets (fonts, CSS, JS without _next hash) -> cache-first
  if (
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Everything else -> network-first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES))
})
