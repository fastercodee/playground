import { Loader } from "esbuild-wasm"

import { LoaderCustom } from "./get-loader-extension"

export function resolverImport(
  { searchParams, pathname }: URL,
  importAs: LoaderCustom | `.${string}` | null
):
  | {
      contents: string
      loader: Loader
    }
  | undefined {
  searchParams.delete("import")
  searchParams.delete("resolve")
  searchParams.delete("url")

  const query = searchParams.toString()

  switch (importAs) {
    case "url":
      return {
        contents: `export default ${JSON.stringify(
          pathname + (query ? `?${query}` : "")
        )}`,
        loader: "js",
      }
    case "css":
      return {
        contents: `const style = document.createElement('link'); style.rel = 'stylesheet'; style.type = 'text/css'; style.href = ${JSON.stringify(
          pathname + (query ? `?${query}` : "")
        )}; document.head.appendChild(style)`,
        loader: "js",
      }
  }
}
