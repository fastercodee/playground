import { join } from "path"

import { contains, isMatch } from "micromatch"

function match(path: string, pattern: string[]) {
  return pattern.some((item) => {
    if (item.startsWith("/")) {
      if (item.endsWith("/")) item += "**/*"
      else if (!item.endsWith("*"))
        return isMatch(path, [item, item + "/**/*"], { dot: true })
      return isMatch(path, item, { dot: true })
    }
    return contains(path, item, { dot: true })
  })
}

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
    if (match(path, exclude)) continue

    if (info.type === "directory") {
      // read directory
      yield* globby(fullPath, include, exclude, path)
    }

    if (!match(path, include)) continue

    if (info.type === "file") {
      // read file
      yield fullPath
    }
  }
}
