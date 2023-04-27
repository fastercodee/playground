/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { listen } from "@fcanvas/communicate"
import { Directory, Encoding } from "@tachibana-shin/capacitor-filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@tachibana-shin/capacitor-filesystem/dist/esm/web"
import { isBinaryFile } from "arraybuffer-isbinary"
import { isNative } from "src/constants"
import type { Match, SearchOptions } from "src/logic/search-text"
import { searchText } from "src/logic/search-text"
import { uint8ToUTF8 } from "src/logic/text-buffer"

const Filesystem = new FilesystemWeb()

Object.assign(self, { window: self, Filesystem, Directory, Encoding })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComSearchSingleFile = {
  // search single file
  "search-single-file"(path: string, searchOptions: SearchOptions): Match[]
}

if (!isNative) {
  listen<ComSearchSingleFile, "search-single-file">(
    self,
    "search-single-file",
    async (file, searchOptions) => {
      const { data: base64 } = await Filesystem.readFile({
        path: file,
        directory: Directory.External,
      })

      const uint = base64ToUint8(base64)

      if (isBinaryFile(uint)) {
        console.warn("Can't find binary file at path %s", file)
        return []
      }

      return [
        ...searchText(
          uint8ToUTF8(uint),
          searchOptions
        ),
      ]
    }
  )
}
