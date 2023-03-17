/// <reference types="@types/serviceworker" />
import { put } from "@fcanvas/communicate"
// self.addEventListener("install", (event) => {
//   self.skipWaiting()
// })

// self.addEventListener("activate", (event) => {
//   event.waitUntil(clients.claim())
// })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Communicate = {
  "get file": (opts: {
    url: string
    headers: [string, string][]
  }) => Promise<null | {
    content: ArrayBufferLike
    init: ResponseInit
  }>
}

const cast = new BroadcastChannel("sw-fetch")

addEventListener("fetch", (event) => {
  console.log({ event })
  const request = event.request
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const url = new URL(request.url)

  if (
    request.method.toLowerCase() === "get" &&
    url.origin === location.origin &&
    url.pathname !== "/" &&
    !url.pathname.startsWith("/@vite/") &&
    !url.pathname.startsWith("/node_modules/") &&
    /^https?:$/g.test(url.protocol)
  ) {
    console.log("send request")

    const response = put(cast, "get file", {
      url: request.url,
      headers: [...request.headers.entries()],
    }).then((response) =>
      response
        ? new Response(response.content, response.init)
        : fetch(event.request)
    )

    event.respondWith(response)
    return
  }

  event.respondWith(fetch(event.request))
})
