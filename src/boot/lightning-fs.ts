import FS from "@isomorphic-git/lightning-fs"
import type { Entry } from "src/types/Entry"

export const fs = new FS("root").promises
export async function readDetails<Type extends "file" | "dir" = "file" | "dir">(
  name: string,
  directory: Entry<"dir">
): Promise<Entry<Type>> {
  const fullPath = directory.fullPath() + "/" + name

  return {
    type: (await fs.lstat(fullPath)).type as Type,
    name,
    fullPath() {
      return directory.fullPath() + "/" + this.name
    },
    directory,
  }
}

export async function directoryDetails(entry: Entry<"dir">) {
  const files: Entry<"file">[] = []
  const directories: Entry<"dir">[] = []

  ;(
    await Promise.all(
      (
        await fs.readdir(entry.fullPath())
      ).map((name) => readDetails(name, entry))
    )
  ).forEach((item) => {
    if (item.type === "file") files.push(item as Entry<"file">)
    else directories.push(item as Entry<"dir">)
  })

  return { files, directories }
}
Object.assign(window, { fs })
