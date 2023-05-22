import { resolve } from "path"

import def from "./vite.config"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(def as unknown as any).build.lib.entry = resolve(__dirname, "src/inject-console.ts")

export default def
