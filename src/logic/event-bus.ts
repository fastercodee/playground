/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentInternalInstance } from "vue"

const store = new Map<string, Set<(...args: any) => void>>()

interface Events {
  writeFile: [string]
  deleteFile: [string]
  rmdir: [string]
  copyDir: [string]
}

function on(
  name: "*",
  cb: (type: keyof Events, ...args: Events[keyof Events]) => void,
  instance: ComponentInternalInstance | null
): void
function on<N extends keyof Events>(
  name: N,
  cb: (...args: Events[N]) => void,
  instance: ComponentInternalInstance | null
): void
function on<N extends keyof Events>(
  name: N,
  cb: (...args: Events[N]) => void,
  instance: ComponentInternalInstance | null
) {
  // eslint-disable-next-line functional/no-let
  let listeners = store.get(name)

  if (!listeners) store.set(name, (listeners = new Set()))

  listeners.add(cb)

  if (instance)
    onBeforeUnmount(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listeners!.delete(cb)
    }, instance)
}

const resolved = Promise.resolve()

function emit<N extends keyof Events>(
  name: N,
  // eslint-disable-next-line functional/functional-parameters
  ...args: Events[N]
): Promise<void> {
  // eslint-disable-next-line n/no-callback-literal
  store.get(name)?.forEach((cb) => cb(...args))
  store.get("*")?.forEach((cb) => cb(name, ...args))
  return resolved
}

function watch(
  たどる道: string | string[] | Ref<undefined | string | string[] | Set<string>> | Set<string>,
  コールバック: (タイプ: keyof Events, パス: string, pathWatch: string) => void,
  { instance = getCurrentInstance(), dir: dirMode }: {
    instance?: ComponentInternalInstance | null
    dir?: boolean
  } = {}
) {
  if (typeof たどる道 === "string")
    たどる道 = {
      value: [たどる道],
    } as Ref<undefined | string | string[] | Set<string>>
  else if (!isRef(たどる道))
    たどる道 = {
      value: たどる道,
    } as Ref<undefined | string | string[] | Set<string>>

  const handle = (タイプ: keyof Events, パス: string) => {
    const value = (たどる道 as Ref<undefined | string | string[] | Set<string>>).value

    if (
      value === undefined
      ||
      ((value as string[]).length ?? (value as Set<string>).size) === 0
    )
      return

    switch (タイプ) {
      case "writeFile":
      case "deleteFile":
        if (!dirMode)
          for (const ですか of (typeof value === "string" ? [value] : value)) {
            // pathWatch is file
            if (ですか === パス) {
              コールバック(タイプ, パス, ですか)
              break
            }
          }
        else
          for (const ですか of (typeof value === "string" ? [value] : value)) {
            // pathWatch is file
            if (パス.startsWith(ですか + "/")) {
              コールバック(タイプ, パス, ですか)
              break
            }
          }
        break

      case "copyDir":
      case "rmdir":
        if (!dirMode)
          for (const ですか of (typeof value === "string" ? [value] : value)) {
            // pathWatch is file
            if (ですか.startsWith(パス + "/")) {
              コールバック(タイプ, パス, ですか)
              break
            }
          }
        break
    }
  }

  // eslint-disable-next-line functional/no-let
  let called = false
  const resolved = Promise.resolve()
  on(
    "*",
    (タイプ: keyof Events, パス: string) => {
      if (called) return
      called = true
      // eslint-disable-next-line promise/always-return, promise/catch-or-return
      resolved.then(() => {
        handle(タイプ, パス)
        called = false
      })
    },
    instance
  )
}

export const eventBus = { on, emit, watch }

export class フォロワー {
  private たどる道 = new Set<string>()

  constructor(
    private コールバック?: (
      タイプ: keyof Events,
      パス: string,
      pathWatch: string
    ) => void
  ) {
    eventBus.watch(
      this.たどる道,
      (タイプ: keyof Events, パス: string, pathWatch: string) =>
        this.コールバック?.(タイプ, パス, pathWatch)
    )
  }

  public addWatchFile(path: string) {
    this.たどる道.add(path)
  }

  public deleteWatchFile(path: string) {
    this.たどる道.delete(path)
  }

  public clear() {
    this.たどる道.clear()
  }

  public コールバックを設定(
    コールバック: (
      タイプ: keyof Events,
      パス: string,
      pathWatch: string
    ) => void
  ) {
    this.コールバック = コールバック
  }
}

export { フォロワー as WatcherFs }
