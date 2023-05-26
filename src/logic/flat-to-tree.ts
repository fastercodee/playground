import { normalize, relative } from "path"

export interface TreeFile<T> {
  fullPath: string
  matches: T
}
export interface TreeDir<T> {
  fullPath: string
  children: {
    dirs: Map<string, TreeDir<T>>
    files: Map<string, TreeFile<T>>
  }
}

export type TreeResult<T> = TreeDir<T>["children"]

export function flatToTree<T>(cwd: string, result: Map<string, T>) {
  const newMap: TreeResult<T> = {
    dirs: new Map(),
    files: new Map(),
  }

  result.forEach((matches, fullPath) => {
    const names = fullPath.startsWith(cwd + "/")
      ? relative(cwd, fullPath).split("/")
      : normalize(fullPath).split("/")

    // eslint-disable-next-line functional/no-let
    let currentDirpath = ""
    const metaDir = names.slice(0, -1).reduce((currentMap, dirname) => {
      // eslint-disable-next-line functional/no-let
      let meta = currentMap.dirs.get(dirname)

      if (!meta) {
        // create filter dir
        currentMap.dirs.set(
          dirname,
          (meta = {
            fullPath: currentDirpath + "" + dirname,
            children: {
              dirs: new Map(),
              files: new Map(),
            },
          })
        )
      }

      currentDirpath += dirname + "/"

      return (meta as TreeDir<T>).children
    }, newMap)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    metaDir.files.set(names.at(-1)!, { fullPath, matches })
  })

  return newMap
}
