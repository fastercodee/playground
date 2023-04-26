/* eslint-disable camelcase */


import { basename, join, relative } from "path"

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

export
  type StatusChange = "M" | "D" | "U"

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


async function actionNextOpenSketch(
  uid_sketch_opening: number,
  onProgress: (action: "load_file", filePath: string) => void
): Promise<void> {
  const rootのsketch = `home/${uid_sketch_opening}`
  const path_hashes_client = `${rootのsketch}/.changes/hashes_client`
  const path_hashes_server = `${rootのsketch}/.changes/hashes_server`

  const entries_ashes_client: readonly [string, string][] = Object.entries(
    JSON.parse(
      await Filesystem.readFile({
        path: path_hashes_client,
        directory: Directory.External,
        encoding: Encoding.UTF8
      }).then(res => res.data)
        .catch(() => "{}")
    )
  )

  const res = await post<SketchController["fetch"]["next"]>("/sketch/fetch", {
    uid: uid_sketch_opening,
    meta: entries_ashes_client.map((item) => item[0]),
    hashes: entries_ashes_client.map((item) => item[1]),
  })

  const hashes_server: Record<string, { readonly uid: number; readonly hash: string }> = Object.fromEntries( entries_hashes_client.filter((filePath, status) => status !== "U"))
  for (const [filePath, change] of Object.entries(res.data.file_changes)) {
    switch (change.type) {
      case "M":
        hashes_server[filePath] = { uid: change.file.uid, hash: change.file.hash }
        break
      case "U+":
        onProgress("load_file", change.file.filePath)
        await saveFile(`${rootのsketch}/${change.file.filePath}`, change.file)
        break
      case "U":
        break
    }
  }
  await Filesystem.writeFile({
    path: path_hashes_server,
    directory: Directory.External,
    encoding: Encoding.UTF8,
    data: JSON.stringify(hashes_server),
  })
  eventBus.emit("writeFile", path_hashes_server)
}

// eslint-disable-next-line functional/no-let
let workerGetHashesClient: InstanceType<typeof GetHashesClientWorker> | null =
  null
async function forceUpdateHashesClient(
  uid_sketch_opening: number,

) {
  const rootのsketch = `home/${uid_sketch_opening}`
  const path_hashes_client = `${rootのsketch}/.changes/hashes_client`

  workerGetHashesClient?.terminate()
  workerGetHashesClient = null

  if ((await exists(rootのsketch)) === false) return

  if (isNative) {
    await Filesystem.writeFile({
      path: path_hashes_client,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(await getHashesClient(rootのsketch)),
    })
  } else {
    workerGetHashesClient = new GetHashesClientWorker()
    await Filesystem.writeFile({
      path: path_hashes_client,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(await await put<
        ComGetHashesClient,
        "get-hashes-client"
      >(workerGetHashesClient, "get-hashes-client", rootのsketch)),
    })

    workerGetHashesClient?.terminate()
    workerGetHashesClient = null
  }

  eventBus.emit("writeFile", path_hashes_client)
  console.log(await Filesystem.readFile({
    path: path_hashes_client,
    directory: Directory.External,
    encoding: Encoding.UTF8,

  }))
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
    const filepath = relative(rootのsketch.value, パス)

    if (filepath.startsWith(".changes/")) return // bypass folder .changes

    hashes_clientのFile.data[relative(rootのsketch.value, パス)] = await sha256File(パス)
  }, { dir: true })

  const changes_addedのFile = useFile<{
    [key in StatusChange]?: string[]
  }, true>(
    computed(() => `${rootのsketch.value}/.changes/changes_added`),
    "{}",
    true,
    {
      get: JSON.parse,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {
    const filepath = relative(rootのsketch.value, パス)

    if (filepath.startsWith(".changes/")) return // bypass folder .changes

    if (タイプ === "deleteFile" || タイプ === "rmdir") {
      // delete file
      changes_addedのFile.data.U?.splice(
        changes_addedのFile.data.U.indexOf(filepath) >>> 0,
        1
      )
      changes_addedのFile.data.M?.splice(
        changes_addedのFile.data.M.indexOf(filepath) >>> 0,
        1
      )
      return
    }

    if (タイプ === "copyDir" || タイプ === "writeFile") {
      // edit file
      changes_addedのFile.data.D?.splice(
        changes_addedのFile.data.D.indexOf(filepath) >>> 0,
        1
      )
      changes_addedのFile.data.M?.splice(
        changes_addedのFile.data.M.indexOf(filepath) >>> 0,
        1
      )
    }
  }, { dir: true })

  async function fetch(sketch_uid: number) {
    console.log("fetch: check hash")
    await forceUpdateHashesClient(sketch_uid)

    console.log("fetch: start download sketch")
    actionNextOpenSketch(sketch_uid, console.log.bind(console))

    uid_sketch_opening.value = sketch_uid
  }

  /// INFO: computed change
  const 変化 = computed(() => {

    const server = hashes_serverのFile.data
    const client = hashes_clientのFile.data

    const changes: Record<string, StatusChange> = {}

    Object.keys(server)
      .forEach(relativePath => {
        if (relativePath in client) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(rootのsketch.value, relativePath)] = "M"

          return
        }

        changes[relativePath] = "D"
      })
    Object.keys(client)
      .forEach(relativePath => {
        if (relativePath in server) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(rootのsketch.value, relativePath)] = "M"

          return
        }

        changes[join(rootのsketch.value, relativePath)] = "U"

      })

    return changes
  })

  async function undoChange(relativePath: string, status: StatusChange) {
    const server = hashes_serverのFile.data

    const uid = server[relativePath]?.uid

    if (status === "M" || status === "D") {
      if (uid === undefined)
        throw new Error("Some write process before this action misbehaving resulting in '.changes/hashes_server' not recording this file.")
    }

    const filePathToSav = `${rootのsketch.value}/${relativePath}`

    switch (status) {
      case "M":
      case "D": {
        await saveFileWithUID(filePathToSav, uid)
        delete server[relativePath]
        break
      }
      case "U":
        await Filesystem.deleteFile({
          path: filePathToSav,
          directory: Directory.External
        })
        eventBus.emit("deleteFile", filePathToSav)

        break
    }
  }

  async function addChange(relativePath: string, status: StatusChange) {
    // eslint-disable-next-line functional/no-let
    let arr = changes_addedのFile.data[status]

    if (!arr)
      changes_addedのFile.data[status] = arr = []

    arr.push(relativePath)
  }

  async function pushChanges() {
    // INFO: push changes

    const meta: string[] = []
    const files: globalThis.File[] = []
    await Promise.all(
      [
        ...changes_addedのFile.data.M ?? [],
        ...changes_addedのFile.data.U ?? []
      ]?.map(async relativePath => {
        meta.push(relativePath)
        files.push(
          new File([
            await Filesystem.readFile({
              path: `${rootのsketch.value}/${relativePath}`,
              directory: Directory.External,
            })
              .then(res => base64ToUint8(res.data))
          ], basename(relativePath))
        )
      })
    )


    await post<SketchController["update"]>("/sketch/update", {
      uid: uid_sketch_opening.value,
      deletes: changes_addedのFile.data.D ?? [],
      meta,
      files
    })
  }

  return { rootのsketch, fetch, forceUpdateHashesClient, 変化, undoChange, addChange, pushChanges }
})
