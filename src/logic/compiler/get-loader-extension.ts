import { Loader } from "esbuild-wasm"

export type LoaderCustom = Loader | "url" | "css-module" | "svelte" | "vue"

const regLoader: Record<string, LoaderCustom> = {
  "\\.svg|png|jpe?g|gie?f|webp": "url",
  "\\.module\\.css": "css-module",
  "\\.svelte": "svelte",
  "\\.vue": "vue"
}
const baseLoader = [
  ...new Set<LoaderCustom>([
    "base64",
    "binary",
    "copy",
    "css",
    "dataurl",
    "default",
    "empty",
    "file",
    "js",
    "json",
    "jsx",
    "text",
    "ts",
    "tsx",
    ...Object.values(regLoader),
  ]),
]

export function getLoaderByExtension(
  ext: string,
  searchParams: URLSearchParams,
  pathname: string = ext,
): LoaderCustom | undefined {
  const loaderByQuery = baseLoader.find((item) => searchParams.has(item))

  if (loaderByQuery) return loaderByQuery

  switch (ext) {
    case ".ts":
    case ".cts":
    case ".mts":
      return "ts"
    case ".tsx":
    case ".ctsx":
    case ".mtcx":
      return "tsx"

    case ".js":
    case ".mjs":
    case ".cjs":
      return "js"

    case ".jsx":
    case ".mjsx":
    case ".cjsx":
      return "jsx"
  }

  for (const regLoaderKey in regLoader) {
    if (pathname.match(regLoaderKey)) return regLoader[regLoaderKey]
  }

  return baseLoader.includes(ext.slice(1) as LoaderCustom)
    ? (ext.slice(1) as LoaderCustom)
    : undefined
}
