import { basename, extname, join, resolve } from "path"

import { build, initialize, Loader, Plugin, PluginBuild } from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

import { compileVue } from "./plugins/vue"
import { resolverImport } from "./resolver-import"

function addQuery(url: URL, query: string, val: string) {
  url.searchParams.set(query, val)

  return url.pathname + url.search.replace(/=$|=(?=&)/g, "")
}
export const rExecTS = /\.(?:m|c)?j|tsx?$/

function plugin(contents: ArrayBuffer, currentPath: string): Plugin {
  return {
    name: "plugin-resolve",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (!args.path.startsWith(".") && !args.path.startsWith("/"))
          // TODO: this is resolve package
          return {
            path: "/cdn_modules/" + args.path,
            external: true,
          }

        const path = !args.path.startsWith("/")
          ? resolve("/", args.importer ? args.importer + "/.." : "", args.path)
          : join("/", args.path)

        const url = new URL(path, "http://localhost")

        console.log("resolve %s", args.path, rExecTS.test(url.pathname))

        const ext = extname(url.pathname)

        return {
          path: rExecTS.test(url.pathname)
            ? path
            : addQuery(
                url,
                "import",
                getLoaderByExtension(ext, url.searchParams) ?? ext
              ),
          namespace: args.path === currentPath ? "current" : undefined,
          external: args.path !== currentPath,
        }
      })

      build.onLoad({ filter: /.*/, namespace: "current" }, async (args) => {
        console.log("load file %s", args.path)
        const url = new URL(args.path, "http://localhost")

        const importAs = url.searchParams.has("url")
          ? "url"
          : url.searchParams.get("import")

        const resolveByImport = resolverImport(url)
        if (resolveByImport) return resolveByImport
        if (importAs === ".vue") {
          const result = await compileVue(
            basename(url.pathname),
            uint8ToUTF8(new Uint8Array(contents))
          )
          if (result)
            return {
              contents:
                (result.css
                  ? `(() => {const style = document.createElement('style'); style.innerHTML = ${JSON.stringify(
                      result.css
                    )}; document.head.appendChild(style)})();\n`
                  : "") + result.js,
              loader: result.isTS ? "ts" : "js",
            }
        }

        return {
          contents: new Uint8Array(contents),
          loader: getLoaderByExtension(
            extname(url.pathname),
            url.searchParams
          ) as Loader,
        }
      })
    },
  }
}

export const allowCompile = [
  "js",
  "json",
  "jsx",
  "ts",
  "tsx",
  "cjs",
  "cjsx",
  "mjs",
  "mjsx",
  "cts",
  "ctsx",
  "mts",
  "mtsx",
  "vue",
  "svelte",
]
// eslint-disable-next-line functional/no-let
let inited = false
export async function compilerFile(
  content: ArrayBuffer,
  pathname: string,
  ext: string,
  searchParams: URLSearchParams,
  tsconfigRaw: string
): Promise<ArrayBuffer> {
  if (!inited) {
    if (!process.env.TEST)
      await initialize({
        wasmURL,
      })
    inited = true
  }

  const search = searchParams.toString()
  const result = await build({
    entryPoints: [pathname + (search ? `?${search}` : "")],
    bundle: true,
    write: false,
    plugins: [plugin(content, pathname + (search ? `?${search}` : ""))],
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
