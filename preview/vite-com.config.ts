import { resolve } from "path"

import def from "./vite.config"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(def as unknown as any).build.rollupOptions.input.main = resolve(__dirname, "pw-com.html")

export default def
