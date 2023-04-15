/* eslint-disable camelcase */

import { defineStore } from "pinia";
import { api, post } from "src/boot/axios";
import type { SketchController } from "src/types/api/Controller/SketchController";
import type { File } from "src/types/api/Models/File";

function exists(path: string): Promise<boolean> {
  return Filesystem.stat({
    path,
    directory: Directory.External,
  }).then(() => true).catch(() => false)
}
async function saveFile(root: string, file: File) {
  if (file.data)
    await writeFileRecursive(`${root}/${file.filePath}`, file.data, Encoding.UTF8)
  else
    // need load
    await writeFileRecursive(`${root}/${file.filePath}`,
      await api.post("/sketch/get_file", {
        uid: file.uid
      }, {
        responseType: "arraybuffer",
      })
        .then(res => new Uint8Array(res.data))
        .then(uint8ToBase64)
    )
}


export const useSketchStore = defineStore("sketch", () => {
  const uid_sketch_opening = ref<number>(-1)
  const rootのsketch = computed(() => `home/${uid_sketch_opening.value}`)

  const hashes_serverのFile = useFile<Record<string, string>, true>(computed(() => `${rootのsketch.value}/.changes/hashes_server`), "{}", true, {
    get: JSON.parse,
    set: JSON.stringify
  })
  const hashes_clientのFile = useFile<Record<string, string>, true>(computed(() => `${rootのsketch.value}/.changes/hashes_client`), "{}", true, {
    get: JSON.parse,
    set: JSON.stringify
  })

  async function actionFirstOpenSketch(onProgress: (action: "load_file", filePath: string) => void): Promise<void> {
    // download first sketch fullied

    const res = await post<SketchController["fetch"]["first"]>("/fetch", {
      uid: uid_sketch_opening.value,
    })

    const { files } = res.data.sketch
    const sketch = { ...res.data.sketch, files: undefined }
    delete sketch.files

    // not exists yet
    await Filesystem.mkdir({
      path: rootのsketch.value,
      directory: Directory.External,
      recursive: true,
    })
    for (const file of files) {
      onProgress("load_file", file.filePath)

      await saveFile(rootのsketch.value, file)
    }

    // save hash
    const hashes = JSON.stringify(Object.fromEntries(files.map(file => [file.filePath, file.hash])))
    await Promise.all([
      writeFileRecursive(
        `${rootのsketch}/.changes/hashes_server`,
        hashes,
        Encoding.UTF8
      ),
      writeFileRecursive(
        `${rootのsketch}/.changes/hashes_client`,
        hashes,
        Encoding.UTF8
      )
    ])
  }
  async function actionNextOpenSketch(onProgress: (action: "load_file", filePath: string) => void): Promise<void> {
    await hashes_clientのFile.ready
    const hashes_client = Object.entries(hashes_clientのFile.data.value)

    const res = await post<SketchController["fetch"]["next"]>("/fetch", {
      uid: uid_sketch_opening.value,
      meta: hashes_client.map(item => item[0]),
      hashes: hashes_client.map(item => item[1]),
    })

    for (const [filePath, change] of Object.entries(res.data.file_changes)) {
      switch (change.type) {
        case "M":
        case "U+":
          await hashes_serverのFile.ready
          hashes_serverのFile.data.value[filePath] = change.file.hash
        // eslint-disable-next-line no-duplicate-case, no-fallthrough
        case "U+":
          onProgress("load_file", change.file.filePath)
          await saveFile(rootのsketch.value, change.file)
          hashes_clientのFile.data.value[filePath] = change.file.hash
          break
        case "U":
          break
      }
    }
  }
  async function fetch(sketch_uid: number) {
    uid_sketch_opening.value = sketch_uid

    if (await exists(`home/${sketch_uid}`)) {
      // exists already
      // New user opens sketch for the first time
      actionNextOpenSketch(console.log.bind(console))
    } else {
      actionFirstOpenSketch(console.log.bind(console))
    }
  }

  return { rootのsketch, fetch }
})
