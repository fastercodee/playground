const store = new Map<string, Set<((...args: any) => void)>>()


interface Events {
  "write-file": [string]
}

function on<N extends keyof Events>(name: N, cb: (...args: Events[N]) => void) {
  let listeners = store.get(name)

  if (!listeners) store.set(name, listeners = new Set())

  listeners.add(cb)

  onBeforeUnmount(() => {
    listeners!.delete(cb)
  })
}
function emit<N extends keyof Events>(name: N, ...args: Events[N]) {
  store.get(name)?.forEach(cb => cb(...args))
}

export const eventBus = { on, emit }