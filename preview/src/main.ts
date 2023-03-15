import { listen } from "@fcanvas/communicate"

// eslint-disable-next-line promise/catch-or-return
navigator.serviceWorker
  .register("/sw.js", {
    type: "module",
  })
  // eslint-disable-next-line promise/always-return
  .then(() => {
    const cast = new BroadcastChannel("sw-fetch")
    listen(cast, "get content", () => {
      return {
        content: "hello content ",
        opts: {
          status: 200,
        },
      }
    })
  })

document.querySelector("script")?.remove()
