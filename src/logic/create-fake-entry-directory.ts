import { basename, dirname } from "path"

import type { Entry } from "./read-details"

export function createFakeDirectory(fullpath: string): Entry<"directory"> {
  return {
    type: "directory",
    name: basename(dirname(fullpath)),
    fullPath: dirname(fullpath),
    directory: null as unknown as Entry<"directory">,
    __is_entry: false as unknown as true,
  }
}
