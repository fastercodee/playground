/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { listen, ping, put } from "@fcanvas/communicate"
import { printfArgs } from "vue-console-feed/data-api"
import {
  _getListLink,
  callFnLink,
  clearLinkStore,
  Encode,
  readLinkObject,
} from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

import type { ComPreviewVue } from "../../src/components/sketch/Preview.types"

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

  // eslint-disable-next-line functional/no-let
  let hasScriptNoModule = false
  async function appendIndex() {
    const index = await put<Communicate>(port2!, "get file", {
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
        document.documentElement
          .querySelectorAll("script")
          .forEach((script) => {
            const newScript = document.createElement("script")

            for (let i = 0; i < script.attributes.length; i++) {
              const { name, value } = script.attributes[i]

              if (!value) continue
              newScript.setAttribute(name, value)
            }

            if (script.type !== "module") hasScriptNoModule = true

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

  appendIndex()

  listen(port2, "refresh", () => {
    if (hasScriptNoModule) return true
    else appendIndex()
    return false
  })

  setupConsole(port2)
}

regiser()
if (parent !== window) addEventListener("message", init)
else init()

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComPreviewCore = {
  console(
    opts:
      | {
          type:
            | "log"
            | "warn"
            | "info"
            | "debug"
            | "error"
            | /** */ "group"
            | "groupEnd"
            | /** */ "count"
            | "countReset"
            | "time"
            | "timeLog"
            | "timeEnd"
          args: ReturnType<typeof Encode>[]
        }
      | {
          type: "table"
          args: ReturnType<typeof Table>[]
        }
      | {
          type: "clear"
          args: []
        }
  ): void
}

function setupConsole(port2: MessagePort) {
  ;(["log", "warn", "info", "debug", "error"] as const).forEach((name) => {
    const cbRoot = console[name]
    // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
    ;(console as unknown as any)[name] = function (...args: unknown[]) {
      ping<ComPreviewCore, "console">(port2, "console", {
        type: name,
        args: printfArgs(args).map((item: unknown) => Encode(item, 2)),
      })

      cbRoot.apply(this, args)
    }
  })
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const { table } = console
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  console.table = function (value: unknown) {
    if (value !== null && typeof value === "object")
      ping<ComPreviewCore, "console">(port2, "console", {
        type: "table",
        args: [Table(value, 1)],
      })
    else
      ping<ComPreviewCore, "console">(port2, "console", {
        type: "log",
        args: [Encode(value, 1)],
      })
    return table.call(this, value)
  }
  ;(["group", "groupEnd"] as const).forEach((name) => {
    const cbRoot = console[name]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as unknown as any)[name] = function (value?: unknown) {
      ping<ComPreviewCore, "console">(port2, "console", {
        type: name,
        args: value !== undefined ? [Encode(value, 1)] : [],
      })

      cbRoot.call(this, value)
    }
  })
  ;(["count", "countReset", "time", "timeLog", "timeEnd"] as const).forEach(
    (name) => {
      const cbRoot = console[name]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(console as unknown as any)[name] = function (value?: unknown) {
        ping<ComPreviewCore, "console">(port2, "console", {
          type: name,
          args: value !== undefined ? [Encode(value + "", 1)] : [],
        })

        cbRoot.call(this, value as string)
      }
    }
  )
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const { clear } = console
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  console.clear = function () {
    ping<ComPreviewCore, "console">(port2, "console", {
      type: "clear",
      args: [],
    })

    clear.call(this)
  }
  // ========================

  // ===== error globals ====
  addEventListener("error", (event) => {
    ping<ComPreviewCore, "console">(port2, "console", {
      type: "error",
      args: [Encode(event.error, 1)],
    })
  })
  // ========================

  // ====== API Async ======
  listen<ComPreviewVue, "_getListLink">(port2, "_getListLink", _getListLink)
  listen<ComPreviewVue, "readLinkObject">(
    port2,
    "readLinkObject",
    readLinkObject
  )
  listen<ComPreviewVue, "callFnLink">(port2, "callFnLink", callFnLink)

  listen<ComPreviewVue, "clear">(port2, "clear", () => {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    console.clear()
    clearLinkStore()
  })
}
