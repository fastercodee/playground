/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { Directory, Encoding } from "@capacitor/filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@capacitor/filesystem/dist/esm/web"
import { listen } from "@fcanvas/communicate"
import type { Match, SearchOptions } from "src/logic/search-text"
import { searchText } from "src/logic/search-text"
import { toTextFile } from "src/logic/to-text-file"

const Filesystem = new FilesystemWeb()

Object.assign(self, { window: self, Filesystem, Directory, Encoding })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComSearchSingleFile = {
  // search single file
  "search-single-file"(path: string, searchOptions: SearchOptions): Match[]
}

const isWeb =
  import.meta.env.MODE === "development" ||
  import.meta.env.MODE === "spa" ||
  import.meta.env.MODE === "pwa"

if (isWeb) {
  listen<ComSearchSingleFile, "search-single-file">(
    self,
    "search-single-file",
    async (file, searchOptions) => {
      return [
        ...searchText(
          await Filesystem.readFile({
            path: file,
            directory: Directory.External,
          }).then(toTextFile),
          searchOptions
        ),
      ]
    }
  )
}
