/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { listen, ping } from "@fcanvas/communicate"
import { globby } from "src/logic/globby"
import type { Match, SearchOptions } from "src/logic/search-text";
import { searchText } from "src/logic/search-text"
import { toTextFile } from "src/logic/to-text-file";

Object.assign(
  self,
  { window: self, Filesystem, Directory, Encoding },
)

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, functional/no-mixed-types
export type ComSearchGlob = {
  "search-on-spa"(cwd: string, include: string[], exclude: string[], uid: string, searchOptions: SearchOptions): void
  "search-in-text"(text: string, uid: string, searchOptions: SearchOptions): void

  [name: `search-return-${string}`]: (opts: {
    file: null | string
    matches: Match[]
  }) => void
}

if (import.meta.env.MODE === "development" || import.meta.env.MODE === "spa" || import.meta.env.MODE === "pwa") {
  listen<ComSearchGlob, "search-on-spa">(self, "search-on-spa", async (cwd, include, exclude, uid, searchOptions) => {
    if (include.length === 0) {
      // if empty default scan all files
      include.push("**/*")
    }

    for await (
      const file of await globby(cwd, include, exclude)
    ) {
      ping<ComSearchGlob, `search-return-${string}`>(self, `search-return-${uid}`, {
        file,
        matches: [
          ...searchText(
            await Filesystem.readFile({
              path: file,
              directory: Directory.External,
              encoding: Encoding.UTF8
            }).then(toTextFile),
            searchOptions
          )
        ]
      })
    }
  })
} else {
  listen<ComSearchGlob, "search-in-text">(self, "search-in-text", async (text, uid, searchOptions) => {
    ping<ComSearchGlob, `search-return-${string}`>(self, `search-return-${uid}`, {
      file: null,
      matches: [
        ...searchText(
          text,
          searchOptions
        )
      ]
    })
  })
}


export type { }
