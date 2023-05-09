/* eslint-disable camelcase */


import { basename, join, relative } from "path"

import { put } from "@fcanvas/communicate"
import { some } from "micromatch"
import { defineStore } from "pinia"
import { isNative } from "src/constants"
import { TreeDir } from "src/logic/flat-to-tree"
import { globby } from "src/logic/globby"
import { sha256File } from "src/logic/sha256-file"
import { SketchController } from "src/types/api/Controller/SketchController"
import type { File } from "src/types/api/Models/File"
import { Sketch } from "src/types/api/Models/Sketch"
import { getHashesClient } from "src/workers/get-hashes-client"
import type { ComGetHashesClient } from "src/workers/get-hashes-client/worker"
import GetHashesClientWorker from "src/workers/get-hashes-client/worker?worker"
import type { Auth } from "vue-auth3"

export
  type StatusChange = "M" | "D" | "U"

const parseJSON = (str: string) => {
  try { return JSON.parse(str) } catch { return {} }
}

function exists(path: string) {
  return Filesystem.stat({
    path,
    directory: Directory.External,
  })
    .then(() => true)
    .catch(() => false)
}

async function getFileFromServer(auth: Auth, uid: number): Promise<Uint8Array> {
  return await auth.http({
    url: "/sketch/get_file",
    data: { uid },
    responseType: "arraybuffer",
  })
    .then((res) => new Uint8Array(res.data))
}
async function saveFileWithUID(auth: Auth, path: string, uid: number) {
  await Filesystem.writeFile({
    path,
    directory: Directory.External,
    data: uint8ToBase64(await getFileFromServer(auth, uid)),
    recursive: true
  })
  eventBus.emit("writeFile", path)
}

async function saveFile(auth: Auth, path: string, file: File) {
  if (file.data !== null) {
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
    await saveFileWithUID(auth, path, file.uid)
}


async function actionNextOpenSketch(
  auth: Auth,
  rootのsketch: string,
  uid_sketch_opening: number,
  onProgress: (action: "load_file", filePath: string) => void
): Promise<Sketch<true, false>> {
  const path_hashes_client = `${rootのsketch}/.changes/hashes_client`
  const path_hashes_server = `${rootのsketch}/.changes/hashes_server`

  const entries_hashes_client: readonly [string, string][] = Object.entries(
    parseJSON(
      await Filesystem.readFile({
        path: path_hashes_client,
        directory: Directory.External,
        encoding: Encoding.UTF8
      }).then(res => res.data)
        .catch(() => "{}")
    )
  )
  const entries_hashes_server: readonly [string, { readonly uid: number; readonly hash: string }][] = Object.entries(
    parseJSON(
      await Filesystem.readFile({
        path: path_hashes_server,
        directory: Directory.External,
        encoding: Encoding.UTF8
      }).then(res => res.data)
        .catch(() => "{}")
    )
  )

  const res = await auth.http({
    url: "/sketch/fetch",
    method: "post",
    data: {
      uid: uid_sketch_opening,
      meta: entries_hashes_client.map((item) => item[0]),
      hashes: entries_hashes_client.map((item) => item[1]),
      deletes: entries_hashes_server.filter(([relativePath]) => !(relativePath in entries_hashes_client)).map(([relativePath]) => relativePath)
    }
  }) as Omit<Awaited<ReturnType<typeof auth.http>>, "data"> & {
    data: SketchController["fetch"]["next"]["response"]
  }

  const hashes_server: Record<string, { readonly uid: number; readonly hash: string }> = {}
  for (const [filePath, change] of Object.entries(res.data.file_changes)) {
    if (change.type === "M" || change.type === "U+" || change.type === "N" || change.type === "D") {
      hashes_server[filePath] = { uid: change.file.uid, hash: change.file.hash }
    }

    switch (change.type) {
      case "U+":
        onProgress("load_file", change.file.filePath)
        await saveFile(auth, `${rootのsketch}/${change.file.filePath}`, change.file)
        break
      case "M":
        break
      case "U":
        break
      case "N":

    }
  }
  await Filesystem.writeFile({
    path: path_hashes_server,
    directory: Directory.External,
    encoding: Encoding.UTF8,
    data: JSON.stringify(hashes_server),
  })
  eventBus.emit("writeFile", path_hashes_server)

  return res.data.sketch
}

// eslint-disable-next-line functional/no-let
let workerGetHashesClient: InstanceType<typeof GetHashesClientWorker> | null =
  null
async function forceUpdateHashesClient(
  rootのsketch: string,
) {
  const path_hashes_client = `${rootのsketch}/.changes/hashes_client`
  const path_gitignore = `${rootのsketch}/.gitignore`

  workerGetHashesClient?.terminate()
  workerGetHashesClient = null

  if ((await exists(rootのsketch)) === false) return

  const ignore = [
    "/.changes/",
    ...parseGitIgnore(
      await Filesystem.readFile({
        path: path_gitignore,
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }).then(res => res.data).catch(() => "")
    )
  ]

  if (isNative) {
    await Filesystem.writeFile({
      path: path_hashes_client,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(await getHashesClient(rootのsketch, ignore)),
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
      >(workerGetHashesClient, "get-hashes-client", rootのsketch, ignore)),
    })

    workerGetHashesClient?.terminate()
    workerGetHashesClient = null
  }

  eventBus.emit("writeFile", path_hashes_client)
}


export const useSketchStore = defineStore("sketch", () => {
  const auth = useAuth()
  const route = useRoute()

  const uid_sketch_opening = ref<number | void>(route.params.uid ? parseInt(route.params.uid as string) : undefined)
  const sketchInfo = shallowRef<Readonly<Sketch<true, false>>>()
  const fetching = ref(true)
  const rootのsketch = computed(() => `home/${uid_sketch_opening.value}`)

  const hashes_serverのFile = useFile<Record<string, { uid: number; hash: string }>, true>(
    computed(() => `${rootのsketch.value}/.changes/hashes_server`),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  const hashes_clientのFile = useFile<Record<string, string>, true>(
    computed(() => `${rootのsketch.value}/.changes/hashes_client`),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {
    if (fetching.value) return
    if (!sketchInfo.value) {
      console.warn("[fs/watch]: Stop updating the hashes due to the offline sketch.")
      return
    }

    const filepath = relative(rootのsketch.value, パス)

    await gitignoreのFile.ready
    if (some("/" + filepath, gitignoreのFile.data)) return

    if (タイプ === "deleteFile" || タイプ === "rmdir") {
      delete hashes_clientのFile.data[relative(rootのsketch.value, パス)]
    } else
      hashes_clientのFile.data[relative(rootのsketch.value, パス)] = await sha256File(パス)
  }, { dir: true })

  const changes_addedのFile = useFile<{
    [key in StatusChange]?: string[]
  }, true>(
    computed(() => `${rootのsketch.value}/.changes/changes_added`),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {
    if (fetching.value) return
    if (!sketchInfo.value) {
      console.warn("[fs/watch]: Stop updating the hashes due to the offline sketch.")
      return
    }

    const filepath = relative(rootのsketch.value, パス)

    await gitignoreのFile.ready
    if (some("/" + filepath, gitignoreのFile.data)) return

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

  const gitignoreのFile = useFile<string[], false>(
    computed(() => `${rootのsketch.value}/.gitignore`),
    "",
    false,
    {
      get: text => ["/.changes/**/*", ...parseGitIgnore(text)]
    }
  )

  async function fetch(sketch_uid: number, online = true) {
    fetching.value = true
    try {
      console.log("fetch: check hash")
      await forceUpdateHashesClient(`home/${sketch_uid}`)

      if (online) {
        console.log("fetch: start download sketch")
        const info = await actionNextOpenSketch(auth, `home/${sketch_uid}`, sketch_uid, console.log.bind(console))
        sketchInfo.value = info
      } else {
        sketchInfo.value = undefined
      }

      uid_sketch_opening.value = sketch_uid
    } finally {
      fetching.value = false
    }
  }
  /** @description - this function call by after create sketch (sketch data readu on client) */
  async function fetchOffline(info: Sketch<true, false>) {

    fetching.value = true
    try {
      console.log(`fetch: renaming ${uid_sketch_opening.value} to ${info.uid}`)
      // rename
      await Filesystem.rename({
        from: `home/${uid_sketch_opening.value}`,
        to: `home/${info.uid}`,
        directory: Directory.External
      })

      await fetch(info.uid)
    } finally {
      fetching.value = false
    }

  }

  /// INFO: computed change
  const 変化 = computed<Record<string, StatusChange>>(() => {
    const server = sketchInfo.value ? hashes_serverのFile.data : {}
    const client = hashes_clientのFile.data

    if (!server || !client) return {}

    const changes: Record<string, StatusChange> = {}

    Object.keys(server)
      .forEach(relativePath => {
        if (relativePath in client) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(rootのsketch.value, relativePath)] = "M"

          return
        }

        changes[join(rootのsketch.value, relativePath)] = "D"
      })
    Object.keys(client)
      .forEach(relativePath => {
        if ((relativePath in server)) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(rootのsketch.value, relativePath)] = "M"

          return
        }

        changes[join(rootのsketch.value, relativePath)] = "U"
      })

    return changes
  })

  const 追加された変更 = computed(() => {
    if (!hashes_serverのFile.data || !hashes_clientのFile.data) return

    const stages: typeof 変化.value = {}

    for (const status in changes_addedのFile.data) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      changes_addedのFile.data[
        status as keyof typeof changes_addedのFile.data
      ]!.forEach((relativePath) => {
        // validate change 
        switch (status) {
          case "M":
            // check exists on all
            if (
              relativePath in hashes_serverのFile.data ||
              relativePath in hashes_clientのFile.data
            ) return
            break
          case "D":
            // check server exists and client not exists
            if (
              relativePath in hashes_serverのFile.data ||
              !(relativePath in hashes_clientのFile.data)
            ) return
            break
          case "U":
            // check sever not exits client exists
            if (
              !(relativePath in hashes_serverのFile.data) ||
              (relativePath in hashes_clientのFile.data)
            ) return
            break
        }

        stages[join(rootのsketch.value, relativePath)] = status as keyof typeof changes_addedのFile.data
      })
    }

    return stages
  })

  async function undoChange(fullPath: string, status: StatusChange) {
    if (!sketchInfo.value) return

    const server = hashes_serverのFile.data
    const relativePath = relative(rootのsketch.value, fullPath)

    const uid = server[relativePath]?.uid

    if (status === "M" || status === "D") {
      if (uid === undefined)
        throw new Error("Some write process before this action misbehaving resulting in '.changes/hashes_server' not recording this file.")
    }

    switch (status) {
      case "M":
      case "D": {
        await saveFileWithUID(auth, fullPath, uid)
        break
      }
      case "U":
        await Filesystem.deleteFile({
          path: fullPath,
          directory: Directory.External
        })
        eventBus.emit("deleteFile", fullPath)

        break
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isFlat = (dir: any, flat = false): dir is typeof 変化.value => {
    return flat
  }
  function undoChanges<Flat extends boolean = false>(dir: Flat extends true ? typeof 変化.value : TreeDir<StatusChange>, flat?: Flat) {
    if (isFlat(dir, flat)) {
      Object.entries(dir).forEach(([fullPath, status]) => undoChange(fullPath, status))

      return
    }

    dir.children.files.forEach(({ fullPath, matches: status }) => {
      undoChange(fullPath, status)
    })
    dir.children.dirs.forEach(meta => undoChanges(meta))
  }

  function addChange(fullPath: string, status: StatusChange) {
    const relativePath = relative(rootのsketch.value, fullPath)
    // eslint-disable-next-line functional/no-let
    let arr = changes_addedのFile.data[status]

    if (!arr)
      changes_addedのFile.data[status] = arr = []

    arr.push(relativePath)
  }

  function addChanges<Flat extends boolean = false>(dir: Flat extends true ? typeof 変化.value : TreeDir<StatusChange>, flat?: Flat) {
    if (isFlat(dir, flat)) {
      Object.entries(dir).forEach(([fullPath, status]) => addChange(fullPath, status))

      return
    }

    dir.children.files.forEach(({ fullPath, matches: status }) => {
      addChange(fullPath, status)
    })
    dir.children.dirs.forEach(meta => addChanges(meta))
  }

  function removeChange(fullPath: string, status: StatusChange) {
    const relativePath = relative(rootのsketch.value, fullPath);
    const arr = changes_addedのFile.data[status];
    if (arr) {
      const index = arr.indexOf(relativePath);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  }

  function removeChanges<Flat extends boolean = false>(dir: Flat extends true ? typeof 変化.value : TreeDir<StatusChange>, flat?: Flat) {
    if (isFlat(dir, flat)) {
      Object.entries(dir).forEach(([fullPath, status]) => removeChange(fullPath, status))

      return
    }

    dir.children.files.forEach(({ fullPath, matches: status }) => {
      removeChange(fullPath, status)
    })
    dir.children.dirs.forEach(meta => removeChanges(meta))
  }

  async function pushChanges() {
    // INFO: push changes

    const form = new FormData()
    form.append("uid", uid_sketch_opening.value + "")
    changes_addedのFile.data.D?.forEach(relativePath => form.append("deletes[]", relativePath))

    await Promise.all(
      [
        ...changes_addedのFile.data.M ?? [],
        ...changes_addedのFile.data.U ?? []
      ]?.map(async relativePath => {
        form.append("meta[]", relativePath)
        form.append("files[]", new File([
          await Filesystem.readFile({
            path: `${rootのsketch.value}/${relativePath}`,
            directory: Directory.External,
          })
            .then(res => base64ToUint8(res.data))
        ], basename(relativePath)))
      })
    )


    const { data } = await auth.http({
      url: "/sketch/update",
      method: "post",
      data: form,
    })

    changes_addedのFile.data.D?.forEach(relativePath => {
      delete hashes_serverのFile.data[relativePath]
    })
    changes_addedのFile.data.M?.forEach(relativePath => {
      hashes_serverのFile.data[relativePath].hash = hashes_clientのFile.data[relativePath]
    })
    changes_addedのFile.data.U?.forEach(relativePath => {
      hashes_serverのFile.data[relativePath] = data.files_added[relativePath] as { uid: number; hash: string }
    })

    changes_addedのFile.data = {}
  }

  async function createSketch(
    name: string,
    isPrivate: boolean,
  ): Promise<Sketch<true, false>> {
    const form = new FormData()

    form.set("name", name)
    form.set("private", isPrivate ? "1" : "0")

    // meta, files
    await gitignoreのFile.ready
    for await (const fullPath of await globby(
      rootのsketch.value,
      ["**/*"],
      gitignoreのFile.data
    )) {
      form.append("meta[]", relative(rootのsketch.value, fullPath))
      form.append("files[]", new File([
        await Filesystem.readFile({
          path: fullPath,
          directory: Directory.External,
        })
          .then(res => base64ToUint8(res.data))
      ], basename(fullPath)))
    }



    const { data: { sketch } } = await auth.http({
      url: "/sketch/create",
      method: "post",
      data: form,
      responseType: "json"
    })

    changes_addedのFile.data = {}
    return sketch
  }

  async function updateInfo(info: {
    name?: string,
    description?: string,
    private?: "0" | "1",
  }) {
    if (!sketchInfo.value) throw new Error("Sketch info not ready")

    const { data: { sketch } } = await auth.http({
      url: "/sketch/update_info",
      method: "post",
      data: {
        uid: sketchInfo.value.uid,
        ...info
      },
    })

    sketchInfo.value = sketch

    return sketch
  }

  async function deleteSketch() {
    if (!sketchInfo.value) throw new Error("Sketch info not ready")

    await auth.http({
      url: "/sketch/delete",
      method: "post",
      data: {
        uid: sketchInfo.value.uid,
      },
    })

    await Filesystem.rmdir({
      path: `home/${sketchInfo.value.uid}`,
      directory: Directory.External,
      recursive: true
    })
  }


  return {
    rootのsketch, changes_addedのFile,
    fetch, fetchOffline, sketchInfo, fetching, forceUpdateHashesClient, 変化, 追加された変更, gitignoreのFile, undoChange, undoChanges, addChange, addChanges, removeChange, removeChanges, pushChanges,
    createSketch, updateInfo, deleteSketch
  }
})
