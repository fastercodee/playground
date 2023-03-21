/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentInternalInstance } from "vue"

const store = new Map<string, Set<((...args: any) => void)>>()


interface Events {
  "writeFile": [string]
  deleteFile: [string]
  rmdir: [string]
  copyDir: [string]
}

function on(name: "*", cb: (type: keyof Events,
  ...args: Events[keyof Events]) => void, instance: ComponentInternalInstance | null): void
function on<N extends keyof Events>(name: N, cb: (...args: Events[N]) => void, instance: ComponentInternalInstance | null): void
function on<N extends keyof Events>(name: N, cb: (...args: Events[N]) => void, instance: ComponentInternalInstance | null) {
  // eslint-disable-next-line functional/no-let
  let listeners = store.get(name)

  if (!listeners) store.set(name, listeners = new Set())

  listeners.add(cb)

  onBeforeUnmount(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    listeners!.delete(cb)
  }, instance)
}
// eslint-disable-next-line functional/functional-parameters
function emit<N extends keyof Events>(name: N, ...args: Events[N]) {
  // eslint-disable-next-line n/no-callback-literal
  store.get(name)?.forEach(cb => cb(...args))
  store.get("*")?.forEach(cb => cb(name, ...args))
}

export const eventBus = { on, emit }


export class フォロワー {
  private たどる道 = new Set<string>()

  constructor(private readonly コールバック: (タイプ: keyof Events, パス: string, pathWatch: string) => void) {
    on("*", (タイプ: keyof Events, パス: string) => {
      switch (タイプ) {
        case "writeFile":
        case "deleteFile":
          for (const ですか of this.たどる道) {
            // pathWatch is file
            if (ですか === パス) {
              this.コールバック(タイプ, パス, ですか)
              break
            }
          }
          break

        case "copyDir":
        case "rmdir":
          for (const ですか of this.たどる道) {
            // pathWatch is file
            if (ですか.startsWith(パス + "/")) {
              this.コールバック(タイプ, パス, ですか)
              break
            }
          }
      }
    }, getCurrentInstance())
  }

  public addWatchFile(path: string) {
    this.たどる道.add(path)
  }
}


export { フォロワー as WatcherFs }