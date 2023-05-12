/// <reference types="@types/serviceworker" />

import { put } from "@fcanvas/communicate"
addEventListener("install", () => {
  self.skipWaiting()
})

addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Communicate = {
  "get file": (opts: {
    url: string
    headers: [string, string][]
  }) => Promise<null | {
    content: ArrayBufferLike | null
    init: ResponseInit
  }>
}

const cast = new BroadcastChannel("sw-fetch")

addEventListener("fetch", (event) => {
  const request = event.request
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const url = new URL(request.url)

  if (
    request.method.toLowerCase() === "get" &&
    url.origin === location.origin &&
    url.pathname !== "/" &&
    !url.pathname.startsWith("/@vite/") &&
    !url.pathname.startsWith("/node_modules/") &&
    (!process.env.isDev ||
      (!url.pathname.startsWith("/src/preview-core.ts") &&
        url.search !== "?serviceworker" &&
        !url.pathname.startsWith("/src/sw.ts"))) &&
    /^https?:$/g.test(url.protocol)
  ) {

    const response = put<Communicate>(cast, "get file", {
      url: request.url,
      headers: [...request.headers.entries()],
    })
      .then((response) =>
        response
          ? new Response(response.content, response.init)
          : fetch(event.request)
      )
      .catch((err) => {
        return new Response(err.message, {
          status: 408,
          statusText: "Request timeout",
        })
      })

    event.respondWith(response)
    return
  }

  event.respondWith(fetch(event.request))
})
