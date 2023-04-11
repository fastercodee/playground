
function loadFile(path: string) {
  return Filesystem.readFile({
    path,
    directory: Directory.External,
  })
    .then(toTextFile)
}

export function useFile<R extends boolean = false>(filepath: string | Ref<string | undefined>, defaultValue = "", overWrite?: R): {
  data: R extends true ? Ref<string> : Readonly<Ref<string>>
  ready: Ref<Promise<void>>
} {
  const reactive = isRef(filepath)
  const ready = ref<Promise<void>>()

  if (!reactive) filepath = ref(filepath)

  // eslint-disable-next-line functional/no-let
  let writing = false;
  const content = ref(defaultValue)

  // eslint-disable-next-line functional/no-let
  let initialized = false
  const watchHandler = (filepath: string | undefined) => {
    if (!filepath) return
    initialized = false
    ready.value = loadFile((filepath))
      .catch(er => {
        if (import.meta.env.DEV)
          console.warn(er)
        return defaultValue
      })
      .then(data => {
        // eslint-disable-next-line promise/always-return
        if (writing) return
        content.value = data
        initialized = true
      })
  }
  if (reactive)
    watch(filepath as Ref<string | undefined>, watchHandler, { immediate: true })
  else
    watchHandler((filepath as Ref<string | undefined>).value)

  eventBus.watch(computed(() => {
    const path = (filepath as Ref<string | undefined>).value

    if (!path) return []
    return [path]
  }), (タイプ, パス, ですか) => {
    if (writing) return

    // eslint-disable-next-line promise/catch-or-return
    loadFile(ですか).catch(er => {
      console.log(er)
      return defaultValue
    })
      .then(data => {
        // eslint-disable-next-line promise/always-return
        if (writing) return
        content.value = data
        initialized = true
      })
  })
  if (overWrite)
    watch(content, async content => {
      if (!initialized) return

      writing = true

      const path = (filepath as Ref<string | undefined>).value
      if (!path) return
      await Filesystem.writeFile({
        path,
        directory: Directory.External,
        encoding: Encoding.UTF8,
        data: content,
      })
      eventBus.emit("writeFile", path)

      writing = false
    })


  return { data: content, ready: ready as Ref<Promise<void>> }
}
