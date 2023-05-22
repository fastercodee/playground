import type { UnwrapRef } from "vue"

function loadFile(path: string) {
  return Filesystem.readFile({
    path,
    directory: Directory.External,
    encoding: Encoding.UTF8,
  }).then((res) => res.data)
}

const resolved = Promise.resolve()
const middleareDef = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (v: any) => v,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (v: any) => v,
}

type CbFileChange<T> = (newValue: T) => (Promise<void> | void)

interface UseFileReturn<T> {
  data: UnwrapRef<T>
  readonly ready: Promise<void> | null
}
interface OnFileChange<T> {
  (cb: CbFileChange<UnwrapRef<T>>, options?: { immediate: boolean }): void
}

export function useFile<T = string, R extends boolean = false, UseOnFileChange extends boolean = false>(
  filepath: string | Ref<string | undefined> | (() => string),
  defaultValue = "",
  overWrite?: R,
  middleare: R extends true ? {
    set: (value: UnwrapRef<T>) => string
    get: (value: string) => UnwrapRef<T>
  } : {
    get: (value: string) => UnwrapRef<T>
  } = middleareDef,
  useOnFileChange?: UseOnFileChange
): (R extends true ? UseFileReturn<T> : Readonly<UseFileReturn<T>>) & (UseOnFileChange extends true ? {
  readonly onFileChange: OnFileChange<T>
  // eslint-disable-next-line @typescript-eslint/ban-types
} : {}) {
  if (typeof filepath === "function") filepath = computed(filepath)

  const isReactive = isRef(filepath)

  if (!isReactive) filepath = ref(filepath)

  // eslint-disable-next-line functional/no-let
  let cbFileChange: CbFileChange<UnwrapRef<T>> | null = null
  const onFileChange = useOnFileChange ? (cb: CbFileChange<UnwrapRef<T>>, options?: { immediate: boolean }) => {
    cbFileChange = cb
    if (options?.immediate) cb(ret.data)
  } : undefined

  // eslint-disable-next-line functional/no-let
  let writing = false
  // eslint-disable-next-line functional/no-let
  let reading = false
  const ret = reactive<{
    data: T
    onFileChange?: typeof onFileChange,
    ready: null | Promise<void>
  }>({
    data: middleare.get(defaultValue) as T,
    ...useOnFileChange ? { onFileChange } : null,
    ready: null,
  })

  const watchHandler = (filepath: string | undefined) => {
    if (!filepath) {
      ret.data = middleare.get(defaultValue)
      return
    }
    ret.ready = loadFile(filepath)
      .catch((er) => {
        if (import.meta.env.DEV && er.message !== "File does not exist.")
          console.warn(er)
        return defaultValue
      })
      .then((data) => {
        if (writing) return
        reading = true
        if (import.meta.env.DEV)
          console.log("updatte editor because update file")
        ret.data = middleare.get(data)
        // eslint-disable-next-line no-void, promise/always-return
        void cbFileChange?.(ret.data)
        // eslint-disable-next-line promise/catch-or-return, promise/always-return, promise/no-nesting
        resolved.then(() => {
          reading = false
        })
        ret.ready = null
      })
  }
  if (isReactive)
    watch(filepath as Ref<string | undefined>, watchHandler, {
      immediate: true,
    })
  else watchHandler((filepath as Ref<string | undefined>).value)

  eventBus.watch((filepath as Ref<string | undefined>),
    (タイプ, パス, ですか) => {
      if (writing) return

      // eslint-disable-next-line promise/catch-or-return
      loadFile(ですか)
        .catch((er) => {
          if (import.meta.env.DEV && er.message !== "File does not exist.")
            console.warn(er)
          return defaultValue
        })
        .then((data) => {
          if (writing) return
          reading = true
          if (import.meta.env.DEV)
            console.log("updatte editor because update file")
          ret.data = middleare.get(data)
          // eslint-disable-next-line no-void, promise/always-return
          void cbFileChange?.(ret.data)
          // eslint-disable-next-line promise/catch-or-return, promise/always-return, promise/no-nesting
          resolved.then(() => {
            reading = false
          })
        })
    }
  )
  if (overWrite)
    watch(
      () => ret.data,
      async (content) => {
        if (reading) return

        writing = true

        const path = (filepath as Ref<string | undefined>).value
        if (!path) return
        console.log("write file %s", reading)
        await Filesystem.writeFile({
          path,
          directory: Directory.External,
          encoding: Encoding.UTF8,
          data: (middleare as {
            set: (value: UnwrapRef<T>) => string
            get: (value: string) => UnwrapRef<T>
          }).set(content),
          recursive: true,
        })
        await eventBus.emit("writeFile", path)
        await nextTick()
        writing = false
      },
      {
        deep: true,
      }
    )

  return ret as (R extends true ? UseFileReturn<T> : Readonly<UseFileReturn<T>>) & (UseOnFileChange extends true ? {
    readonly onFileChange: OnFileChange<T>
    // eslint-disable-next-line @typescript-eslint/ban-types
  } : {})
}
