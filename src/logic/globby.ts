import { join } from "path"

import { contains } from "micromatch"

export async function* globby(
  dir: string,
  include: string[],
  exclude: string[],
  parent = "/"
): AsyncGenerator<string> {
  const { files } = await Filesystem.readdir({
    path: dir,
    directory: Directory.External,
  })

  for (const info of files) {
    const path = join(parent, info.name)
    const fullPath = join(dir, info.name)

    if (contains(path, exclude, { dot: true })) continue

    if (info.type === "directory") {
      // read directory
      yield* globby(fullPath, include, exclude, path)
    }

    if (!contains(path, include, { dot: true })) continue

    if (info.type === "file") {
      // read file
      yield fullPath
    }
  }
}
