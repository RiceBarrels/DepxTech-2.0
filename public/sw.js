const CACHE_VERSION = 'v6'
const STATIC_CACHE = `depxtech-static-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
]

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
          .filter((key) => key !== STATIC_CACHE)
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

// ─── Fetch Event ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Cache-first for static assets only (manifest, icons, fonts)
  if (
    STATIC_ASSETS.includes(url.pathname) ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Everything else: network only, no caching
})

// ─── Push Notification Handlers ──────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, url, tag } = data

  event.waitUntil(
    self.registration.showNotification(title || 'DepxTech', {
      body: body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'depxtech-notification',
      data: { url: url || '/account/inbox' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/account/inbox'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
