/* eslint-disable camelcase */


import { relative } from "path"

import { put } from "@fcanvas/communicate"
import { defineStore } from "pinia"
import { api, post } from "src/boot/axios"
import { isNative } from "src/constants"
import { sha256File } from "src/logic/sha256-file"
import type { SketchController } from "src/types/api/Controller/SketchController"
import type { File } from "src/types/api/Models/File"
import { getHashesClient } from "src/workers/get-hashes-client"
import type { ComGetHashesClient } from "src/workers/get-hashes-client/worker"
import GetHashesClientWorker from "src/workers/get-hashes-client/worker?worker"

function exists(path: string) {
  return Filesystem.stat({
    path,
    directory: Directory.External,
  })
    .then(() => true)
    .catch(() => false)
}

async function getFileFromServer(uid: number): Promise<Uint8Array> {
  return await api
        .post(
          "/sketch/get_file",
          {
        uid,
          },
          {
            responseType: "arraybuffer",
          }
        )
        .then((res) => new Uint8Array(res.data))
}
async function saveFileWithUID(path: string, uid: number) {
  await Filesystem.writeFile({
    path,
    directory: Directory.External,
    data: uint8ToBase64(await getFileFromServer(uid)),
    recursive: true
  })
  eventBus.emit("writeFile", path)
}

async function saveFile(path: string, file: File) {
  if (file.data !== undefined) {
    await Filesystem.writeFile({
      path,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: file.data,
    })
    eventBus.emit("writeFile", path)
  }
  // need load
  else
    await saveFileWithUID(path, file.uid)
}


export const useSketchStore = defineStore("sketch", () => {
  const uid_sketch_opening = ref<number>(-1)
  const rootのsketch = computed(() => `home/${uid_sketch_opening.value}`)

  const hashes_serverのFile = useFile<Record<string, { uid: number; hash: string }>, true>(
    computed(() => `${rootのsketch.value}/.changes/hashes_server`),
    "{}",
    true,
    {
      get: JSON.parse,
      set: JSON.stringify,
    }
  )
  const hashes_clientのFile = useFile<Record<string, string>, true>(
    computed(() => `${rootのsketch.value}/.changes/hashes_client`),
    "{}",
    true,
    {
      get: JSON.parse,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {
    hashes_clientのFile.data[relative(rootのsketch.value, パス)] = await sha256File(パス)
  }, { dir: true })

  async function actionNextOpenSketch(
    onProgress: (action: "load_file", filePath: string) => void
  ): Promise<void> {
    await hashes_clientのFile.ready
    const entries_ashes_client = Object.entries(hashes_clientのFile.data)

    const res = await post<SketchController["fetch"]["next"]>("/sketch/fetch", {
      uid: uid_sketch_opening.value,
      meta: entries_ashes_client.map((item) => item[0]),
      hashes: entries_ashes_client.map((item) => item[1]),
    })

    const hashes_server: typeof hashes_serverのFile.data = {}
    for (const [filePath, change] of Object.entries(res.data.file_changes)) {
      switch (change.type) {
        case "M":
          // save to temporacy wait undo
          await hashes_serverのFile.ready
          hashes_server[filePath] = { uid: change.file.uid, hash: change.file.hash }
          break
        case "U+":
          onProgress("load_file", change.file.filePath)
          await saveFile(`${rootのsketch.value}/${change.file.filePath}`, change.file)
          break
        case "U":
          break
      }
    }
  }
  async function fetch(sketch_uid: number) {
    uid_sketch_opening.value = sketch_uid
    console.log("fetch: check hash")
    await forceUpdateHashesClient()

    console.log("fetch: start download sketch")
    actionNextOpenSketch(console.log.bind(console))
  }

  // eslint-disable-next-line functional/no-let
  let workerGetHashesClient: InstanceType<typeof GetHashesClientWorker> | null =
    null
  async function forceUpdateHashesClient() {
    workerGetHashesClient?.terminate()
    workerGetHashesClient = null

    if ((await exists(rootのsketch.value)) === false) return

    if (isNative) {
      hashes_clientのFile.data = await getHashesClient(rootのsketch.value)
    } else {
      workerGetHashesClient = new GetHashesClientWorker()
      await hashes_clientのFile.ready
      hashes_clientのFile.data = await put<
        ComGetHashesClient,
        "get-hashes-client"
      >(workerGetHashesClient, "get-hashes-client", rootのsketch.value)

      workerGetHashesClient?.terminate()
      workerGetHashesClient = null
    }
  }

  return { rootのsketch, fetch, forceUpdateHashesClient }
})
