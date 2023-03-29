/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />

import { listen, ping } from "@fcanvas/communicate"
import { globby } from "src/logic/globby"
import type { Match, SearchOptions } from "src/logic/search-text";
import { searchText } from "src/logic/search-text"

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComSearchGlob = {
  "search-on-spa"(cwd: string, include: string[], exclude: string[], searchOptions: SearchOptions): void
  "search-in-text"(text: string, searchOptions: SearchOptions): void

  "search-return"(match: Match[]): void
}

if (import.meta.env.MODE === "spa" || import.meta.env.MODE === "pwa") {
  listen<ComSearchGlob, "search-on-spa">(self, "search-on-spa", async (cwd, include, exclude, searchOptions) => {
    for await (
      const file of await globby(cwd, include, exclude)
    ) {
      ping<ComSearchGlob, "search-return">(self, "search-return", [
        ...searchText(
          await Filesystem.readFile({
            path: file,
            directory: Directory.External,
            encoding: Encoding.UTF8
          }).then(toTextFile),
          searchOptions
        )
      ])
    }
  })
} else {
  listen<ComSearchGlob, "search-in-text">(self, "search-in-text", async (text, searchOptions) => {
    ping<ComSearchGlob, "search-return">(self, "search-return", [
      ...searchText(
        text,
        searchOptions
      )
    ])
  })
}


export type { }
