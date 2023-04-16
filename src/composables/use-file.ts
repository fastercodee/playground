import type { UnwrapRef } from "vue"

function loadFile(path: string) {
  return Filesystem.readFile({
    path,
    directory: Directory.External,
    encoding: Encoding.UTF8
  }).then(toTextFile)
}

const resolved = Promise.resolve()
const middleareDef = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (v: any) => v,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (v: any) => v
}

export function useFile<T = string, R extends boolean = false>(
  filepath: string | Ref<string | undefined> | (() => string),
  defaultValue = "",
  overWrite?: R,
  middleare: {
    set: (value: UnwrapRef<T>) => string,
    get: (value: string) => UnwrapRef<T>
  } = middleareDef
): R extends true ? {
  data: UnwrapRef<T>
  ready: Promise<void> | null
} : {
  readonly data: UnwrapRef<T>
  ready: Promise<void> | null
} {
  if (typeof filepath === "function")
    filepath = computed(filepath)

  const isReactive = isRef(filepath)

  if (!isReactive) filepath = ref(filepath)

  // eslint-disable-next-line functional/no-let
  let writing = false
  // eslint-disable-next-line functional/no-let
  let reading = false
  const ret = reactive<{
    data: T,
    ready: null | Promise<void>
  }>({
    data: middleare.get(defaultValue) as T,
    ready: null
  })

  const watchHandler = (filepath: string | undefined) => {
    if (!filepath) return
    ret.ready = loadFile(filepath)
      .catch((er) => {
        if (import.meta.env.DEV && er.message !== "File does not exist.") console.warn(er)
        return defaultValue
      })
      .then((data) => {
        // eslint-disable-next-line promise/always-return
        if (writing) return
        reading = true
        ret.data = middleare.get(data)
        // eslint-disable-next-line promise/catch-or-return, promise/always-return, promise/no-nesting
        resolved.then(() => { reading = false })
      })
  }
  if (isReactive)
    watch(filepath as Ref<string | undefined>, watchHandler, {
      immediate: true,
    })
  else watchHandler((filepath as Ref<string | undefined>).value)

  eventBus.watch(
    computed(() => {
      const path = (filepath as Ref<string | undefined>).value

      if (!path) return []
      return [path]
    }),
    (タイプ, パス, ですか) => {
      if (writing) return

      // eslint-disable-next-line promise/catch-or-return
      loadFile(ですか)
        .catch((er) => {
          if (import.meta.env.DEV && er.message !== "File does not exist.") console.warn(er)
          return defaultValue
        })
        .then((data) => {
          // eslint-disable-next-line promise/always-return
          if (writing) return
          reading = true
          ret.data = middleare.get(data)
          // eslint-disable-next-line promise/catch-or-return, promise/always-return, promise/no-nesting
          resolved.then(() => { reading = false })
        })
    }
  )
  if (overWrite)
    watch(() => ret.data, async (content) => {
      if (reading) return

      writing = true

      const path = (filepath as Ref<string | undefined>).value
      if (!path) return
      console.log("write file %s", reading)
      await Filesystem.writeFile({
        path,
        directory: Directory.External,
        encoding: Encoding.UTF8,
        data: middleare.set(content),
        recursive: true
      })
      await eventBus.emit("writeFile", path)
      writing = false
    }, {
      deep: true
    })

  return ret
}
