/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentInternalInstance } from "vue"

const store = new Map<string, Set<((...args: any) => void)>>()


interface Events {
  "write-file": [string]
}

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
}

export const eventBus = { on, emit }
