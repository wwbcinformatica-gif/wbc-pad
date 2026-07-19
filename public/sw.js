const CACHE = "wbc-notepad-v3"
const URLS = ["/", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(URLS))
  )
  self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Navigation: network first, cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    )
    return
  }

  // Supabase API requests: always network (no cache)
  if (url.hostname.endsWith("supabase.co")) {
    event.respondWith(fetch(event.request))
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchAndCache = fetch(event.request).then((response) => {
        if (event.request.method === "GET" && response.status === 200) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
      return cached || fetchAndCache
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})
