/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { Directory, Encoding } from "@capacitor/filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@capacitor/filesystem/dist/esm/web"
import { listen } from "@fcanvas/communicate"
import { isNative } from "src/constants"
import type { Match, SearchOptions } from "src/logic/search-text"
import { searchText } from "src/logic/search-text"

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
      return [
        ...searchText(
          await Filesystem.readFile({
            path: file,
            directory: Directory.External,
            encoding: Encoding.UTF8
          }).then(res=>res.data),
          searchOptions
        ),
      ]
    }
  )
}
