const CACHE = "wbc-notepad-v1"

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (event.request.method === "GET" && response.status === 200) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
    }).catch(() => caches.match("/"))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
})
