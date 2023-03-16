import { listen } from "@fcanvas/communicate"

import type { Communicate } from "./sw"

// eslint-disable-next-line promise/catch-or-return
navigator.serviceWorker
  .register("/src/sw")
  // eslint-disable-next-line promise/always-return
  .then(() => {
    const cast = new BroadcastChannel("sw-fetch")
    const buffer = new ArrayBuffer(50)

    listen<Communicate>(cast, "get file", async () => {
      return null
      return {
        transfer: [buffer],
        return: {
          content: buffer,
          init: {
            status: 200,
          },
        },
      }
    })
  })

document.querySelector("script")?.remove()
