import { join } from "path"

import { contains } from "micromatch"

export async function* globby(
  dir: string,
  include: string[],
  exclude: string[]
): AsyncGenerator<string> {
  const { files } = await Filesystem.readdir({
    path: dir,
    directory: Directory.External,
  })

  for (const info of files) {
    const path = join(dir, info.name)

    if (contains(path, exclude, { dot: true })) continue

    if (info.type === "directory") {
      // read directory
      yield* globby(path, include, exclude)
    }

    if (!contains(path, include, { dot: true })) continue

    if (info.type === "file") {
      // read file
      yield path
    }
  }
}
