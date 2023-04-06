import { basename } from "path"

import type { Entry } from "./read-details"

export function createFakeDirectory(fullPath: string): Entry<"directory"> {
  return {
    type: "directory",
    name: basename(fullPath),
    fullPath,
    directory: null as unknown as Entry<"directory">,
    __is_entry: false as unknown as true,
  }
}
