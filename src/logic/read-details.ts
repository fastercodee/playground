import { フォロワー } from "./event-bus"

// eslint-disable-next-line no-use-before-define
const entryStore = new Map<string, Entry<"directory" | "file">>()
const watcher = new フォロワー((タイプ, パス, ですか) => {
  if (タイプ === "copyDir" || タイプ === "writeFile") return

  watcher.deleteWatchFile(ですか)
  entryStore.delete(ですか)
})
export class Entry<Type extends "directory" | "file"> {
  public readonly __is_entry = true

  constructor(
    public type: Type,
    public name: string,
    public directory: Entry<"directory">
  ) {
    const { fullPath } = this
    const inCache = entryStore.get(fullPath) as Entry<Type> | undefined
    if (import.meta.env.DEV)
      Object.assign(this, {
        __r_fake: !directory.__is_entry,
        __fake: !directory.__is_entry,
      })

    if (inCache) {
      if (directory.__is_entry) inCache.directory = directory

      if (import.meta.env.DEV) {
        Object.assign(inCache, { __fake: !inCache.directory.__is_entry })
      }
      ;[inCache.type, inCache.name] = [this.type, this.name]
      return inCache
    }

    entryStore.set(fullPath, this)
    watcher.addWatchFile(fullPath)
  }

  get fullPath(): string {
    const dir = this.directory.fullPath

    if (dir === "") return this.name
    return dir + "/" + this.name
  }
}

if (import.meta.env.DEV) Object.assign(window, { Filesystem })

export async function readDetails<
  Type extends "directory" | "file" = "directory" | "file"
>(name: string, directory: Entry<"directory">): Promise<Entry<Type>> {
  const fullPath =
    directory.fullPath === "" ? name : directory.fullPath + "/" + name
  const stat = await Filesystem.stat({
    path: fullPath,
    directory: Directory.External,
  })

  return new Entry(stat.type as Type, name, directory)
}

export async function directoryDetails(entry: Entry<"directory">) {
  const files: Entry<"file">[] = []
  const directories: Entry<"directory">[] = []

    ; (
      await Promise.all(
        (
          await Filesystem.readdir({
            path: entry.fullPath,
            directory: Directory.External,
          })
        ).files.map((item) => new Entry(item.type, item.name, entry))
      )
    ).forEach((item) => {
      if (item.type === "file") files.push(item as Entry<"file">)
      else directories.push(item as Entry<"directory">)
    })

  return { files, directories }
}
