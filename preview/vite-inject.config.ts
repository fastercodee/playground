import { resolve } from "path"

import def from "./vite.config"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(def as unknown as any).build = {
  lib: {
    entry: resolve(__dirname, "src/__pw_inject-console.ts"),
    name: "__",
    fileName: "__pw_inject-console",
  },
}

export default def
