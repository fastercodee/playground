import { normalize } from "path-cross/posix"
import type { Match } from "src/logic/search-text"

export interface TreeFile {
  fullPath: string
  matches: Match[]
}
export interface TreeDir {
  fullPath: string
  children: {
    dirs: Map<string, TreeDir>
    files: Map<string, TreeFile>
  }
}

export type TreeResult = TreeDir["children"]

export function flatToTree(result: Map<string, Match[]>) {
  const newMap: TreeResult = {
    dirs: new Map(),
    files: new Map()
  }

  result.forEach((matches, fullPath) => {
    const names = normalize(fullPath).split("/")

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
              files: new Map()
            }
          })
        )
      }

      currentDirpath += dirname + "/"

      return (meta as TreeDir).children
    }, newMap)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    metaDir.files.set(names.at(-1)!, { fullPath, matches })
  })

  return newMap
}
