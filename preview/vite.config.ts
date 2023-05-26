import { createHash } from "crypto"
import fs from "fs"
import { basename, dirname, join, posix, relative } from "path"

import { buildSync } from "esbuild"
import type { PluginOption, ResolvedConfig } from "vite"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

function getAssetHash(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 8)
}

function vitePluginServiceWorker(): PluginOption {
  // eslint-disable-next-line functional/no-let
  let resolved: ResolvedConfig

  return {
    name: "vite-plugin-serviceworker",
    configResolved(config) {
      resolved = config
    },

    async transform(src, id) {
      if (id.endsWith("?serviceworker")) {
        id = id.replace(/\?serviceworker$/, "")

        if (resolved.command === "build") {
          const code = buildSync({
            entryPoints: [id],
            format: "esm",
            bundle: true,
            minify: process.env.NODE_ENV === "production",
            treeShaking: true,
            write: false,
            sourcemap:
              resolved.build.sourcemap !== "hidden" && resolved.build.sourcemap,
            define: {
              "process.env.isDev": JSON.stringify(false),
            },
            // sideEff
          }).outputFiles[0].text
          const filename = `${basename(id)}.${getAssetHash(
            Buffer.from(code)
          )}.js`
          this.emitFile({
            fileName: filename,
            type: "asset",
            source: code,
          })

          const filePublic = join(
            resolved.publicDir,
            relative(resolved.root, id).replace("/", "_")
          )

          // eslint-disable-next-line n/no-unsupported-features/node-builtins
          await fs.promises.unlink(filePublic).catch(() => false)

          return {
            code: `export default function registerServiceWorker() {
              return navigator.serviceWorker.register("/${filename}", { scope: '/' })
            }`,
            map: null,
          }
        }

        const code = buildSync({
          entryPoints: [id],
          format: "esm",
          bundle: true,
          minify: process.env.NODE_ENV === "production",
          treeShaking: true,
          write: false,
          sourcemap: true,
          define: {
            "process.env.isDev": JSON.stringify(true),
          },
          // sideEff
        }).outputFiles[0].text

        const filecache = join(
          resolved.publicDir,
          relative(resolved.root, id).replace("/", "_") + ".js"
        )
        this.addWatchFile(id)
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        await fs.promises.mkdir(dirname(filecache), { recursive: true })
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        await fs.promises.writeFile(filecache, code)

        // console.log({ id })
        return {
          code: `export default function registerServiceWorker() {
            return navigator.serviceWorker.register("/${posix.relative(
              resolved.root,
              relative(resolved.root, id).replace("/", "_")
            )}.js", { scope: '/' })
          }`,
          map: null,
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [vitePluginServiceWorker(), viteSingleFile()],
  build: {
  }
})
