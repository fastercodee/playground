import { basename, normalize } from "path-cross/posix"
import { Entry } from "src/logic/read-details"
import type { Match } from "src/logic/search-text"

interface TreeFile {
  entry: Entry<"file">
  matches: Match[]
}
interface TreeDir {
  fullPath: string
  children: Map<string, TreeDir | TreeFile>
}

type TreeResult = Map<string, TreeDir | TreeFile>

export function resultFlatToTree(result: Map<string, Match[]>) {
  const newMap: TreeResult = new Map()

  result.forEach((matches, fullPath) => {
    const names = normalize(fullPath).split("/")

    // eslint-disable-next-line functional/no-let
    let currentDirpath = ""
    const metaDir = names.slice(0, -1).reduce((currentMap, dirname) => {
      // eslint-disable-next-line functional/no-let
      let meta = currentMap.get(dirname)

      if (!meta) {
        // create filter dir
        currentMap.set(
          dirname,
          (meta = {
            fullPath: currentDirpath + "" + dirname,
            children: new Map(),
          })
        )
      }

      currentDirpath += dirname + "/"

      return (meta as TreeDir).children
    }, newMap)

    const entry = /* 偽 */ new Entry(
      "file",
      basename(fullPath),
      createFakeDirectory(fullPath)
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    metaDir.set(names.at(-1)!, { entry, matches })
  })

  return newMap
}
