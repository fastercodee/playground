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

const transformNameToDirname = (name: string) => name.replace(/[\\/:*?"<>|]/g, "_");

type QuestionSketchname = (name: string) => Promise<{ action: "replace" } | { action: "new", val: string }>

const EMPTY_OBJ = {}
async function pullOrClone(
  auth: Auth,
  dirnameSave: false,
  uid_sketch_opening: number,
  question: QuestionSketchname,
  onProgress: (action: "load_file", filePath: string) => void
): Promise<{ dirname: string; sketch: Sketch<true, false> }>
async function pullOrClone(
  auth: Auth,
  dirnameSave: string,
  uid_sketch_opening: number,
  question: null,
  onProgress: (action: "load_file", filePath: string) => void
): Promise<{ dirname: string; sketch: Sketch<true, false> }>
async function pullOrClone(
  auth: Auth,
  dirnameSave: false | string,
  uid_sketch_opening: number,
  question: null | QuestionSketchname,
  onProgress: (action: "load_file", filePath: string) => void
): Promise<{ dirname: string; sketch: Sketch<true, false> }> {
  const isNew = !dirnameSave
  // eslint-disable-next-line functional/no-let
  let path_hashes_client: string | void
  // eslint-disable-next-line functional/no-let
  let path_hashes_server: string | void
  if (dirnameSave) {
    path_hashes_client = `home/${dirnameSave}/.changes/hashes_client`
    path_hashes_server = `home/${dirnameSave}/.changes/hashes_server`
  }

  const entries_hashes_client: readonly [string, string][] = path_hashes_client ? Object.entries(
    parseJSON(
      await Filesystem.readFile({
        path: path_hashes_client,
        directory: Directory.External,
        encoding: Encoding.UTF8
      }).then(res => res.data)
        .catch(() => "{}")
    )
  ) : []
  const entries_hashes_server: readonly [string, { readonly uid: number; readonly hash: string }][] = path_hashes_server ? Object.entries(
    parseJSON(
      await Filesystem.readFile({
        path: path_hashes_server,
        directory: Directory.External,
        encoding: Encoding.UTF8
      }).then(res => res.data)
        .catch(() => "{}")
    )
  ) : []

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
  if (!dirnameSave) {
    // first fetch name
    dirnameSave = transformNameToDirname(res.data.sketch.name)
    // check dirname exists
    if (await exists(`home/${dirnameSave}`)) {
      // question user rename or overwrite
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const answer = await question!(dirnameSave)
      if (answer.action === "replace") {
        await Filesystem.rmdir({
          path: `home/${dirnameSave}`,
          directory: Directory.External,
          recursive: true
        })
      } else {
        dirnameSave = answer.val;
      }
    }
  }
  path_hashes_client = `home/${dirnameSave}/.changes/hashes_client`
  path_hashes_server = `home/${dirnameSave}/.changes/hashes_server`
  const path_metadata = `home/${dirnameSave}/.changes/metadata`

  await Filesystem.mkdir({
    path: `home/${dirnameSave}`,
    directory: Directory.External,
    recursive: true
  }).catch(() => 0)

  const hashes_server: Record<string, { readonly uid: number; readonly hash: string }> = {}
  for (const [filePath, change] of Object.entries(res.data.file_changes)) {
    if (change.type === "M" || change.type === "U+" || change.type === "N" || change.type === "D") {
      hashes_server[filePath] = { uid: change.file.uid, hash: change.file.hash }
    }

    switch (change.type) {
      case "U+":
        onProgress("load_file", change.file.filePath)
        await saveFile(auth, `home/${dirnameSave}/${change.file.filePath}`, change.file)
        break
      case "M":
        break
      case "U":
        break
      case "N":

    }
  }
  await Promise.all([
    Filesystem.writeFile({
      path: path_hashes_server,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(hashes_server),
    }),
    isNew ? Filesystem.writeFile({
      path: path_hashes_client,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(Object.fromEntries(Object.entries(hashes_server).map(([filePath, { hash }]) => [filePath, hash]))),
    }) : 0,
    Filesystem.writeFile({
      path: path_metadata,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      data: JSON.stringify(res.data.sketch),
    })
  ])
  eventBus.emit("writeFile", path_hashes_server)

  return { dirname: dirnameSave, sketch: res.data.sketch }
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


  const 参照コンテナ = useFile<
    Record<string, string>,
    true
  >("var/参照コンテナ", "{}", true, {
    get: parseJSON,
    set: JSON.stringify,
  });

  const dirnameSketch = ref<string | void>()
  const sketchInfo = shallowRef<Readonly<Sketch<true, false>>>()
  const fetching = ref(false)
  const rootのsketch = computed(() => dirnameSketch.value ? `home/${dirnameSketch.value}` : undefined)

  const hashes_serverのFile = useFile<Record<string, { uid: number; hash: string }>, true>(
    computed(() => rootのsketch.value ? `${rootのsketch.value}/.changes/hashes_server` : undefined),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  const hashes_clientのFile = useFile<Record<string, string>, true>(
    computed(() => rootのsketch.value ? `${rootのsketch.value}/.changes/hashes_client` : undefined),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {

    if (fetching.value) return
    if (!sketchInfo.value || !rootのsketch.value) {
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
    computed(() => rootのsketch.value ? `${rootのsketch.value}/.changes/changes_added` : undefined),
    "{}",
    true,
    {
      get: parseJSON,
      set: JSON.stringify,
    }
  )
  eventBus.watch(rootのsketch, async (タイプ, パス) => {
    if (fetching.value) return
    if (!sketchInfo.value || !rootのsketch.value) {
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
    computed(() => rootのsketch.value ? `${rootのsketch.value}/.gitignore` : undefined),
    "",
    false,
    {
      get: text => ["/.changes/**/*", ...parseGitIgnore(text)]
    }
  )

  /**
   * nếu thứ này được mở bằng cách nhấn open sketch local nó phải tìm kiếm chính xác `sketch_uid` từ thư mục gốc `home`
   * nếu nó tìm thấy nó phải kiểm tra xem cái này có liên kết với cloud không thông qua `metadata`
   *
   * nếu nó mở từ fetch nó phải cưỡng chế tải xuống
   */
  async function openSketch<Local extends boolean>(
    sketch_uid: Local extends true ? string : number,
    openFromLocal: Local,
    quesSketchNameSavIfExists: Local extends true ? void : QuestionSketchname) {
    fetching.value = true

    try {
      if (openFromLocal) {
        if (!(await exists(`home/${sketch_uid}`))) throw new Error("sketch_not_exists")

        const metadata = await Filesystem.readFile({
          path: `home/${sketch_uid}/.changes/metadata`,
          directory: Directory.External,
          encoding: Encoding.UTF8,
        }).then(res => parseJSON(res.data)).catch(() => ({}))

        if (typeof metadata.uid === "number") {
          // eslint-disable-next-line no-throw-literal
          throw {
            code: "sketch_is_online",
            uid: metadata.uid
          }
        }

        await forceUpdateHashesClient(`home/${sketch_uid}`);
        sketchInfo.value = undefined
        dirnameSketch.value = sketch_uid + ""

        return
      }

      await 参照コンテナ.ready
      // eslint-disable-next-line functional/no-let
      let dirnamePhysical: string | void = 参照コンテナ.data[sketch_uid + ""];

      if (dirnamePhysical) {
        try {
          const metadata = await Filesystem.readFile({
            path: `home/${dirnamePhysical}/.changes/metadata`,
            directory: Directory.External,
            encoding: Encoding.UTF8
          }).then(res => parseJSON(res.data) as Sketch<true, false>)
            .catch(() => {
              // eslint-disable-next-line no-throw-literal, functional/no-throw-statements
              throw "not_found"
            });

          if (metadata.uid === sketch_uid) {
            // yes sketch exists on memory -> pull
          } else {
            // no wrong data -> fetch
            // eslint-disable-next-line no-throw-literal
            throw "not_found"
          }
        } catch (err) {
          if (err === "not_found") {
            dirnamePhysical = undefined
          } else throw err;
        }
      }

      console.warn({ dirnamePhysical })
      /** dirnamePhysical is void -> not exists on cloud */
      if (dirnamePhysical) {
        await forceUpdateHashesClient(`home/${dirnamePhysical}`);

        console.log("fetch: start pull sketch");

        const { dirname, sketch } = await pullOrClone(
          auth,
          dirnamePhysical,
          (sketch_uid) as number,
          null,
          console.log.bind(console)
        );
        console.log({ dirname })

        sketchInfo.value = sketch;
        参照コンテナ.data[sketch_uid + ""] = dirname
        dirnameSketch.value = dirname
      } else {
        // not exists by roulink

        const { sketch, dirname } = await pullOrClone(
          auth,
          false,
          (sketch_uid) as number,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          quesSketchNameSavIfExists!,
          console.log.bind(console)
        );

        sketchInfo.value = sketch;
        参照コンテナ.data[sketch_uid + ""] = dirname
        dirnameSketch.value = dirname

      }
    } finally {
      fetching.value = false
    }
  }
  /** @description - this function call by after create sketch (sketch data readu on client) */
  async function fetchAfterPublish(info: Sketch<true, false>) {
    await 参照コンテナ.ready
    console.log(`fetch: renaming ${dirnameSketch.value} to ${info.uid}`)
    // rename
    const dirname = transformNameToDirname(info.name)
    await Filesystem.rename({
      from: `home/${dirnameSketch.value}`,
      to: `home/${dirname}`,
      directory: Directory.External
    })
    参照コンテナ.data[info.uid] = dirname
  }

  /// INFO: computed change
  const 変化 = computed<Record<string, StatusChange>>(() => {
    const dir = rootのsketch.value
    if (!dir) return EMPTY_OBJ
    const server = sketchInfo.value ? hashes_serverのFile.data : {}
    const client = hashes_clientのFile.data

    if (!server || !client) return {}

    const changes: Record<string, StatusChange> = {}

    Object.keys(server)
      .forEach(relativePath => {
        if (relativePath in client) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(dir, relativePath)] = "M"

          return
        }

        changes[join(dir, relativePath)] = "D"
      })
    Object.keys(client)
      .forEach(relativePath => {
        if ((relativePath in server)) {
          if (server[relativePath].hash !== client[relativePath])
            changes[join(dir, relativePath)] = "M"

          return
        }

        changes[join(dir, relativePath)] = "U"
      })

    return changes
  })

  const 追加された変更 = computed<typeof 変化.value>(() => {
    const dir = rootのsketch.value
    if (!dir) return EMPTY_OBJ

    if (!hashes_serverのFile.data || !hashes_clientのFile.data) return EMPTY_OBJ

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
              !(relativePath in hashes_serverのFile.data) ||
              !(relativePath in hashes_clientのFile.data)
            ) return
            break
          case "D":
            // check server exists and client not exists
            if (
              !(relativePath in hashes_serverのFile.data) ||
              (relativePath in hashes_clientのFile.data)
            ) return
            break
          case "U":
            // check sever not exits client exists
            if (
              (relativePath in hashes_serverのFile.data) ||
              !(relativePath in hashes_clientのFile.data)
            ) return
            break
        }

        stages[join(dir, relativePath)] = status as keyof typeof changes_addedのFile.data
      })
    }

    return stages
  })
  console.warn({ hashes_serverのFile, hashes_clientのFile, changes_addedのFile })

  async function undoChange(fullPath: string, status: StatusChange) {
    if (!rootのsketch.value) return

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
    if (!rootのsketch.value) return

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
    if (!rootのsketch.value) return

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
    if (!sketchInfo.value || !rootのsketch.value) throw new Error("[push]: sketchInfo not loaded.")

    const form = new FormData()
    form.append("uid", sketchInfo.value.uid + "")
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
    }) as Omit<Awaited<ReturnType<typeof auth.http>>, "data"> & {
      data: SketchController["update"]["response"]
    }

    changes_addedのFile.data.D?.forEach(relativePath => {
      delete hashes_serverのFile.data[relativePath]
    })
    changes_addedのFile.data.M?.forEach(relativePath => {
      hashes_serverのFile.data[relativePath].hash = hashes_clientのFile.data[relativePath]
    })
    changes_addedのFile.data.U?.forEach(relativePath => {
      hashes_serverのFile.data[relativePath] = data.files_added[relativePath]
    })

    changes_addedのFile.data = {}
  }

  async function publish(
    name: string,
    isPrivate: boolean,
  ): Promise<Sketch<true, false>> {
    if (!rootのsketch.value) throw new Error("[publish]: sketch not loaded.")

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
    }) as Omit<Awaited<ReturnType<typeof auth.http>>, "data"> & {
      data: SketchController["create"]["response"]
    }

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
    }) as Omit<Awaited<ReturnType<typeof auth.http>>, "data"> & {
      data: SketchController["update_info"]["response"]
    }

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

  async function fork(name?: string) {
    if (!sketchInfo.value) throw new Error("Sketch info not ready")


    const { data: { sketch } } = await auth.http({
      url: "/sketch/fork",
      method: "post",
      data: {
        uid: sketchInfo.value.uid,
        name,
      },
    }) as Omit<Awaited<ReturnType<typeof auth.http>>, "data"> & {
      data: SketchController["fork"]["response"]
    }



    try {
      console.log(`fetch: coping ${dirnameSketch.value} to ${sketch.uid}`)
      // rename
      const dirname = transformNameToDirname(sketch.name)

      await 参照コンテナ.ready
      await Filesystem.copy({
        from: `home/${dirnameSketch.value}`,
        to: `home/${dirname}`,
        directory: Directory.External
      })
      参照コンテナ.data[sketch.uid] = dirname

      return sketch
    } finally {
      fetching.value = false
    }

  }


  return {
    rootのsketch, changes_addedのFile,
    openSketch, sketchInfo, fetching, forceUpdateHashesClient, fetchAfterPublish, 変化, 追加された変更, gitignoreのFile, undoChange, undoChanges, addChange, addChanges, removeChange, removeChanges, pushChanges,
    publish, updateInfo, deleteSketch, fork
  }
})
