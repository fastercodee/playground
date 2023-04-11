/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />

import { listen } from "@fcanvas/communicate"
import type { Match, SearchOptions } from "src/logic/search-text"
import { searchText } from "src/logic/search-text"

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComSearchInText = {
  "search-in-text"(text: string, searchOptions: SearchOptions): Match[]
}

listen<ComSearchInText, "search-in-text">(
  self,
  "search-in-text",
  async (text, searchOptions) => {
    return [...searchText(text, searchOptions)]
  }
)
