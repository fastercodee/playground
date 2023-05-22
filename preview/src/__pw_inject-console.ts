import { listen, ping } from "@fcanvas/communicate"
import { printfArgs } from "vue-console-feed/data-api"
import {
  _getListLink,
  callFnLink,
  clearLinkStore,
  Encode,
  readLinkObject,
} from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

import type { ComPreviewVue } from "../../src/components/sketch/SketchMain/Preview/Preview.types"

const swMain = new BroadcastChannel("sw-main")

listen<ComPreviewVue>(swMain, "reload", () => location.reload())
listen<ComPreviewVue>(swMain, "back", () => history.back())
listen<ComPreviewVue>(swMain, "forward", () => history.forward())

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
  load: () => void
  unload: () => void
}
;(["log", "warn", "info", "debug", "error"] as const).forEach((name) => {
  const cbRoot = console[name]
  // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (...args: unknown[]) {
    ping<ComPreviewCore, "console">(swMain, "console", {
      type: name,
      args: printfArgs(args).map((item: unknown) => Encode(item, 2)),
    })

    if (import.meta.env.DEV) cbRoot.apply(this, args)
  }
})
// eslint-disable-next-line n/no-unsupported-features/node-builtins
const { table } = console
// eslint-disable-next-line n/no-unsupported-features/node-builtins
console.table = function (value: unknown) {
  if (value !== null && typeof value === "object")
    ping<ComPreviewCore, "console">(swMain, "console", {
      type: "table",
      args: [Table(value, 1)],
    })
  else
    ping<ComPreviewCore, "console">(swMain, "console", {
      type: "log",
      args: [Encode(value, 1)],
    })
  return table.call(this, value)
}
;(["group", "groupEnd"] as const).forEach((name) => {
  const cbRoot = console[name]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (value?: unknown) {
    ping<ComPreviewCore, "console">(swMain, "console", {
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
      ping<ComPreviewCore, "console">(swMain, "console", {
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
  ping<ComPreviewCore, "console">(swMain, "console", {
    type: "clear",
    args: [],
  })

  clear.call(this)
}
// ========================

// ===== error globals ====
addEventListener("error", (event) => {
  ping<ComPreviewCore, "console">(swMain, "console", {
    type: "error",
    args: [Encode(event.error, 1)],
  })
})
// ========================

// ====== API Async ======
listen<ComPreviewVue, "_getListLink">(swMain, "_getListLink", _getListLink)
listen<ComPreviewVue, "readLinkObject">(
  swMain,
  "readLinkObject",
  readLinkObject
)
listen<ComPreviewVue, "callFnLink">(swMain, "callFnLink", callFnLink)

listen<ComPreviewVue, "clear">(swMain, "clear", () => {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  console.clear()
  clearLinkStore()
})
