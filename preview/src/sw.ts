/// <reference types="@types/serviceworker" />

import { put } from "@fcanvas/communicate"

addEventListener("install", () => {
  self.skipWaiting()
})

addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(clients.claim())
})

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Communicate = {
  "get file": (opts: {
    url: string
    headers: [string, string][]
  }) => Promise<null | {
    content: ArrayBuffer | null
    init: ResponseInit
  }>
}

const cast = new BroadcastChannel("sw-fetch")

addEventListener("fetch", (event: FetchEvent) => {
  const request = event.request
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const url = new URL(request.url)

  if (
    request.method.toLowerCase() === "get" &&
    url.origin === location.origin &&
    url.pathname !== "/__pw-com.html" &&
    url.pathname !== "/__pw_inject-console.js" &&
    (!process.env.isDev ||
      (!url.pathname.startsWith("/@vite/") &&
        !url.pathname.startsWith("/node_modules/") &&
        !url.pathname.startsWith("/src/preview-core.ts") &&
        url.search !== "?serviceworker" &&
        !url.pathname.startsWith("/src/sw.ts") &&
        !url.pathname.startsWith("/src/com.ts") &&
        !url.pathname.startsWith("/src/__pw_inject-console.ts"))) &&
    /^https?:$/g.test(url.protocol)
  ) {
    // eslint-disable-next-line no-async-promise-executor
    const response = new Promise<Response>(async (resolve) => {
      resolve(
        await put<Communicate>(
          cast,
          { name: "get file", timeout: 120_000 },
          {
            url: request.url,
            headers: [...request.headers.entries()],
          }
        )
          .then((response) => {
            if (url.pathname === "/" && response?.content) {
              // eslint-disable-next-line n/no-unsupported-features/node-builtins
              const code = new TextEncoder().encode(
                `<script type="module" src="${
                  process.env.isDev
                    ? "/src/__pw_inject-console.ts"
                    : "/__pw_inject-console.js"
                }"></script>`
              )
              const end = response.content

              const uint = new Uint8Array(code.byteLength + end.byteLength)

              uint.set(code, 0)
              uint.set(new Uint8Array(end), code.byteLength)

              response.content = uint.buffer
            }

            return response
              ? new Response(response.content, response.init)
              : fetch(event.request)
          })
          .catch((err) => {
            console.error(err)
            return new Response(err.message, {
              status: 408,
              statusText: "Request timeout",
            })
          })
      )
    })

    event.respondWith(response)
    return
  }

  event.respondWith(fetch(event.request))
})
