import { listen, put } from "@fcanvas/communicate"

import type { Communicate } from "./sw"
import regiser from "./sw?serviceworker"

// eslint-disable-next-line functional/no-let
let listenParent: (() => void) | undefined
async function init(event?: MessageEvent<{ port2: MessagePort }>) {
  console.log(event)
  const port2 = event?.data.port2
  if (!port2) return

  port2.start()

  console.log("port: ", port2)

  const cast = new BroadcastChannel("sw-fetch")

  listenParent?.()
  listenParent = listen<Communicate>(cast, "get file", async (opts) => {
    console.log("Request file %s", opts.url)

    const res = await put(port2, "get file", opts)

    // console.log({ res })

    // const content = "hello world"
    // const buffer = encoder.encode(content).buffer

    return {
      transfer: [res.content],
      return: res,
    }
  })

  const index = await put<Communicate>(port2, "get file", {
    url: location.href,
    headers: [],
  })
  // index is content file index.html
  /** @description - parse index.html and apply DOM */
  // eslint-disable-next-line no-labels
  parseIndex: {
    // eslint-disable-next-line no-labels
    if (!index) break parseIndex

    if (index.content) {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const html = new TextDecoder("utf-8").decode(index.content)
      console.log({ html })
      document.documentElement.innerHTML = html
      document.documentElement.querySelectorAll("script").forEach((script) => {
        const newScript = document.createElement("script")

        // eslint-disable-next-line functional/no-loop-statements
        for (let i = 0; i < script.attributes.length; i++) {
          const { name, value } = script.attributes[i]

          if (!value) continue
          newScript.setAttribute(name, value)
        }

        newScript.innerHTML = script.innerHTML

        script.replaceWith(newScript)
      })
    } else {
      document.documentElement.innerHTML = "<h1>404 - Not Found</h1>"
    }
  }
  /** @end */

  console.log({ index })
}

regiser()
if (parent !== window) addEventListener("message", init)
else init()
