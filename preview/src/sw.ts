/// <reference types="@types/serviceworker" />
importScripts(
  "https://unpkg.com/@fcanvas/communicate@1.1.0-rc.37/dist/index.browser.global.js"
)
// export { c as listen, i as ping, i as pit, d as put, a as uuid }
// export default null

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
    content: ArrayBuffer
    init: ResponseInit
  }>
}

const { put } = fCom
const cast = new BroadcastChannel("sw-fetch")
addEventListener("fetch", async (event) => {
  console.log({ event })
  const request = event.request

  if (request.method.toLowerCase() === "get") {
    const response = await put<Communicate>(cast, "get file", {
      url: request.url,
      headers: [...request.headers.entries()],
    })

    if (response) {
      event.respondWith(new Response(response.content, response.init))
      return
    }
  }

  event.respondWith(await fetch(event.request))
})
