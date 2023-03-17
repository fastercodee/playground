import { listen, put } from "@fcanvas/communicate"

import type { Communicate } from "./sw"
import regiser from "./sw?serviceworker"

addEventListener("message", async (event) => {
  const { port2 } = event.data

  port2.start()

  console.log("port: ", port2)

  const index = await put<Communicate>(port2, "get file", {
    url: location.href,
    headers: [],
  })

  console.log({ index })

  const cast = new BroadcastChannel("sw-fetch")
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const encoder = new TextEncoder()

  listen<Communicate>(cast, "get file", async (opts) => {
    put(port2, "get file", opts)

    const content = "hello world"
    const buffer = encoder.encode(content).buffer

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

  regiser()
})
