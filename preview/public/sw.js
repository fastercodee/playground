self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

const cast = new BroadcastChannel("sw-fetch")
self.addEventListener("fetch", async (event) => {
  console.log({ event })
  if (event.request.method.toLowerCase() === "get") {
    const { content, opts } = await put(cast, "get content", {
      url: event.request.url,
      headers: event.request.headers.entries(),
    })

    event.respondWith(new Request(content, opts))
  } else {
    event.respondWith(await fetch(event.request))
  }
})
