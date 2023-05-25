import { basename, extname, join, resolve } from "path"

import { build, initialize, Loader, Plugin } from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

import { LoaderCustom } from "./get-loader-extension"
import { resolverImport } from "./resolver-import"

function addImportAs(url: URL, val: LoaderCustom | `.${string}`) {
  url.searchParams.set("import", val)

  return url.pathname + url.search.replace(/=$|=(?=&)/g, "")
}
export function getImportAs(url: URL): LoaderCustom | `.${string}` | null {
  return url.searchParams.has("url")
    ? "url"
    : (url.searchParams.get("import") as LoaderCustom | `.${string}` | null)
}
export const rExecTS = /\.(?:m|c)?j|tsx?$/

function plugin(
  contents: ArrayBuffer,
  currentPath: string,
  isSolid: boolean
): Plugin {
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

        const ext = extname(url.pathname) as `.${string}`

        return {
          path: rExecTS.test(url.pathname)
            ? path
            : addImportAs(
                url,
                getLoaderByExtension(ext, url.searchParams, url.pathname) ?? ext
              ),
          namespace: args.path === currentPath ? "current" : undefined,
          external: args.path !== currentPath,
        }
      })

      build.onLoad({ filter: /.*/, namespace: "current" }, async (args) => {
        console.log("load file %s", args.path)
        const url = new URL(args.path, "http://localhost")

        const importAs = getImportAs(url)

        const resolveByImport = resolverImport(url, importAs)
        if (resolveByImport) return resolveByImport
        if (importAs === "vue") {
          const result = await import("./plugins/vue").then(({ compileVue }) =>
            compileVue(
              basename(url.pathname),
              uint8ToUTF8(new Uint8Array(contents))
            )
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
        if (importAs === "css-module") {
          const result = await import("./plugins/css-module").then(
            ({ compileCSSModule }) =>
              compileCSSModule("", uint8ToUTF8(new Uint8Array(contents)))
          )

          return {
            contents:
              `(() => {const style = document.createElement('style'); style.innerHTML = ${JSON.stringify(
                result.css
              )}; document.head.appendChild(style)})();\n` + result.js,
            loader: "js",
          }
        }
        if (importAs === "svelte") {
          const result = await import("./plugins/svelte").then(
            ({ compileSvelte }) =>
              compileSvelte(
                basename(url.pathname),
                uint8ToUTF8(new Uint8Array(contents))
              )
          )

          return { contents: result.js, loader: "js" }
        }

        return {
          contents: new Uint8Array(
            isSolid
              ? concatArrayBuffer(
                  utf8ToUint8('import h from "solid-js/h";'),
                  contents
                )
              : contents
          ),
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
export const allowEndFile = ["module.css"]
// eslint-disable-next-line functional/no-let
let inited = false
export async function compilerFile(
  content: ArrayBuffer,
  pathname: string,
  ext: string,
  searchParams: URLSearchParams,
  sketchStore: ReturnType<typeof useSketchStore>
): Promise<ArrayBuffer> {
  if (!inited) {
    if (!process.env.TEST)
      await initialize({
        wasmURL,
      })
    inited = true
  }

  const search = searchParams.toString()
  const jsxConfig =
    (await sketchStore.getJSXConfig()) ??
    (await getDataAsync(sketchStore.packageのFile)).tsconfig?.compilerOptions
  const isSolid = jsxConfig?.jsxImportSource === "solid-js"

  const result = await build({
    entryPoints: [pathname + (search ? `?${search}` : "")],
    bundle: true,
    write: false,
    plugins: [
      plugin(content, pathname + (search ? `?${search}` : ""), isSolid),
    ],
    define: {
      global: "window",
      "import.meta.env.DEV": JSON.stringify(true),
    },
    jsxDev: true,
    jsx: jsxConfig?.jsx ?? "automatic",
    jsxImportSource: jsxConfig?.jsxImportSource,
    jsxFactory: jsxConfig?.jsxFactory,
    jsxFragment: jsxConfig?.jsxFragment,
    format: "esm",
    sourcemap: "inline",
    tsconfig: await getDataAsync(sketchStore.tsconfigのFile),
  })

  console.log({ result })

  return result.outputFiles[0].contents.buffer
}
