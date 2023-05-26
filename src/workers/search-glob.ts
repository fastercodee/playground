/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { listen, ping } from "@fcanvas/communicate"
import {
  Directory,
  Encoding,
} from "@tachibana-shin/capacitor-filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@tachibana-shin/capacitor-filesystem/dist/esm/web"
import { isBinaryFile } from "arraybuffer-isbinary"
import { isNative } from "src/constants"
import { base64ToUint8 } from "src/logic/base64-buffer"
import { globby } from "src/logic/globby"
import type { Match, SearchOptions } from "src/logic/search-text"
import { searchText } from "src/logic/search-text"
import { uint8ToUTF8 } from "src/logic/text-buffer"

const Filesystem = new FilesystemWeb()

Object.assign(self, { window: self, Filesystem, Directory, Encoding })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, functional/no-mixed-types
export type ComSearchGlob = {
  "search-on-spa"(
    cwd: string,
    include: string[],
    exclude: string[],
    uid: string,
    searchOptions: SearchOptions
  ): void
  // moved to search-single-file
  // "search-in-text"(
  //   text: string,
  //   searchOptions: SearchOptions
  // ): Match[]

  [name: `search-return-${string}`]: (opts: {
    file: null | string
    matches: Match[]
  }) => void
}

if (!isNative) {
  listen<ComSearchGlob, "search-on-spa">(
    self,
    "search-on-spa",
    async (cwd, include, exclude, uid, searchOptions) => {
      if (include.length === 0) {
        // if empty default scan all files
        include.push("**/*")
      }

      for await (const file of await globby(cwd, include, exclude)) {
        const { data: base64 } = await Filesystem.readFile({
          path: file,
          directory: Directory.External,
        })

        const uint = base64ToUint8(base64)

        if (isBinaryFile(uint)) {
          console.warn("Can't find binary file at path %s", file)
          continue
        }

        const matches = [...searchText(uint8ToUTF8(uint), searchOptions)]
        if (matches.length === 0) continue

        ping<ComSearchGlob, `search-return-${string}`>(
          self,
          `search-return-${uid}`,
          {
            file,
            matches,
          }
        )
      }
    }
  )
}
// else {
//   listen<ComSearchGlob, "search-in-text">(
//     self,
//     "search-in-text",
//     async (text, searchOptions) => {
//       return [...searchText(text, searchOptions)]
//     }
//   )
// }
