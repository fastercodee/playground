import type { UnwrapRef } from "vue"

function loadFile(path: string) {
  return Filesystem.readFile({
    path,
    directory: Directory.External,
  }).then(toTextFile)
}

const middleareDef = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (v: any) => v,
  set: (v: any) => v
}

export function useFile<T = string, R extends boolean = false>(
  filepath: string | Ref<string | undefined>,
  defaultValue = "",
  overWrite?: R,
  middleare: {
    set: (value: UnwrapRef<T>) => string,
    get: (value: string) => UnwrapRef<T>
  } = middleareDef
): {
  data: R extends true ? Ref<UnwrapRef<T>> : Readonly<Ref<UnwrapRef<T>>>
  ready: Ref<Promise<void>>
} {
  const reactive = isRef(filepath)
  const ready = ref<Promise<void>>()

  if (!reactive) filepath = ref(filepath)

  // eslint-disable-next-line functional/no-let
  let writing = false
  const content = ref(middleare.get(defaultValue) as T)

  // eslint-disable-next-line functional/no-let
  let initialized = false
  const watchHandler = (filepath: string | undefined) => {
    if (!filepath) return
    initialized = false
    ready.value = loadFile(filepath)
      .catch((er) => {
        if (import.meta.env.DEV) console.warn(er)
        return defaultValue
      })
      .then((data) => {
        // eslint-disable-next-line promise/always-return
        if (writing) return
        content.value = middleare.get(data)
        initialized = true
      })
  }
  if (reactive)
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
          console.log(er)
          return defaultValue
        })
        .then((data) => {
          // eslint-disable-next-line promise/always-return
          if (writing) return
          content.value = middleare.get(data)
          initialized = true
        })
    }
  )
  if (overWrite)
    watch(content, async (content) => {
      if (!initialized) return

      writing = true

      const path = (filepath as Ref<string | undefined>).value
      if (!path) return
      await Filesystem.writeFile({
        path,
        directory: Directory.External,
        encoding: Encoding.UTF8,
        data: middleare.set(content),
      })
      eventBus.emit("writeFile", path)

      writing = false
    }, {
      flush: "post",
      deep: true
    })

  return { data: content, ready: ready as Ref<Promise<void>> }
}
