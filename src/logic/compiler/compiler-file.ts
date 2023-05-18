import { extname, join, resolve } from "path"

import { build, initialize, Loader, Plugin } from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

import { resolverImport } from "./resolver-import"

function addQuery(url: URL, query: string, val: string) {
  url.searchParams.set(query, val)

  return url.pathname + url.search.replace(/=$|=(?=&)/g, "")
}
const rExec = /\.(?:m|c)?j|tsx?$/

function plugin(
  contents: ArrayBuffer,
  ext: string,
  searchParams: URLSearchParams
): Plugin {
  return {
    name: "plugin-resolve",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        const path = !args.path.startsWith("/")
          ? resolve("/", args.importer ? args.importer + "/.." : "", args.path)
          : join("/", args.path)

        const url = new URL(path, "http://localhost")

        console.log("resolve %s", args.path, rExec.test(url.pathname))

        return {
          path: rExec.test(url.pathname)
            ? path
            : addQuery(
                url,
                "import",
                getLoaderByExtension(extname(url.pathname), url.searchParams) ??
                  ""
              ),
          external: !url.searchParams.has("resolve"),
        }
      })

      build.onLoad({ filter: /.*/ }, (args) => {
        console.log("load file %s", args.path)
        const url = new URL(args.path, "http://localhost")
        if (url.searchParams.has("resolve")) {
          const resolveByImport = resolverImport(url)

          return (
            resolveByImport ?? {
              contents: new Uint8Array(contents),
              loader: getLoaderByExtension(ext, searchParams) as Loader,
            }
          )
        }
      })
    },
  }
}

// eslint-disable-next-line functional/no-let
let inited = false
export async function compilerFile(
  content: ArrayBuffer,
  pathname: string,
  ext: string,
  searchParams: URLSearchParams,
  tsconfigRaw: string
):Promise<ArrayBuffer> {
  if (!inited) {
    if (!process.env.TEST)
      await initialize({
        wasmURL,
      })
    inited = true
  }

  searchParams.set("resolve", "")
  const result = await build({
    entryPoints: [pathname + "?" + searchParams],
    bundle: true,
    write: false,
    plugins: [plugin(content, ext, searchParams)],
    define: {
      global: "window",
    },
    format: "esm",
    sourcemap: "inline",
    tsconfig: tsconfigRaw,
  })

  console.log({ result })

  return result.outputFiles[0].contents.buffer
}
