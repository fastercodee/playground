import { listen, ping, put } from "@fcanvas/communicate"

import { ComPreviewVue } from "../../src/components/sketch/SketchMain/Preview/Preview.types"

import { ComPreviewCore } from "./__pw_inject-console"
import type { Communicate } from "./sw"
import regiser from "./sw?serviceworker"

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComCom = {
  "service load": () => void
}

async function init(event?: MessageEvent<{ port2: MessagePort }>) {
  console.log(event)
  const port2 = event?.data.port2
  if (!port2) {
    document.body.textContent = "MessageChannel not found"
    return
  }
  port2.start()

  console.log("port: ", port2)

  const cast = new BroadcastChannel("sw-fetch")
  const castMain = new BroadcastChannel("sw-main")

  listen<Communicate>(cast, "get file", async (opts) => {
    console.log("Request file %s", opts.url)

    return await put<Communicate>(
      port2,
      { name: "get file", timeout: 120_000, targetOrigin: "*" },
      opts
    )
  })
  ping<ComCom>(port2, "service load")

  // TODO: this should events forward to main
  listen<ComPreviewVue>(port2, "reload", () =>
    ping<ComPreviewVue>(castMain, "reload")
  )
  listen<ComPreviewVue>(port2, "back", () =>
    ping<ComPreviewVue>(castMain, "back")
  )
  listen<ComPreviewVue>(port2, "forward", () =>
    ping<ComPreviewVue>(castMain, "forward")
  )

  // console
  listen<ComPreviewCore, "console">(castMain, "console", (opts) => {
    console.log({ opts })
    ping<ComPreviewCore, "console">(port2, "console", opts)
  })

  listen<ComPreviewVue, "_getListLink">(port2, "_getListLink", (opts) =>
    put<ComPreviewVue, "_getListLink">(castMain, "_getListLink", opts)
  )
  listen<ComPreviewVue, "readLinkObject">(port2, "readLinkObject", (opts) =>
    put<ComPreviewVue, "readLinkObject">(castMain, "readLinkObject", opts)
  )
  listen<ComPreviewVue, "callFnLink">(port2, "callFnLink", (opts) =>
    put<ComPreviewVue, "callFnLink">(castMain, "callFnLink", opts)
  )
  listen<ComPreviewVue>(port2, "clear", () =>
    ping<ComPreviewVue>(castMain, "clear")
  )
}

regiser()
if (parent !== window) addEventListener("message", init)
else init()
