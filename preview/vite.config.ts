import { createHash } from "crypto"
import fs from "fs"
import { basename, dirname, join, posix, relative } from "path"

import { buildSync } from "esbuild"
import type { PluginOption, ResolvedConfig } from "vite"
import { defineConfig, transformWithEsbuild } from "vite"

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
          const { code } = await transformWithEsbuild(src, id, {
            format: "esm",
            minify: process.env.NODE_ENV === "production",
            treeShaking: true,
            sourcemap:
              resolved.build.sourcemap !== "hidden" && resolved.build.sourcemap,
            // sideEff
          })
          const fileName = posix.join(
            resolved.build.assetsDir,
            `${basename(id)}.${getAssetHash(Buffer.from(code))}.js`
          )
          const hash = this.emitFile({
            fileName,
            type: "asset",
            source: code,
          })
          return {
            code: `export default function registerServiceWorker() {
              return navigator.serviceWorker.register("__VITE_ASSET__${hash}__")
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
          // sideEff
        }).outputFiles[0].text

        const filecache = join(
          resolved.cacheDir,
          resolved.base,
          relative(resolved.root, id)
        )
        this.addWatchFile(id)
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        await fs.promises.mkdir(dirname(filecache), { recursive: true })
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        await fs.promises.writeFile(filecache, code)

        // console.log({ id })
        return {
          code: `export default function registerServiceWorker() {
            return navigator.serviceWorker.register("${
              resolved.base
            }${posix.relative(resolved.root, filecache)}")
          }`,
          map: null,
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [vitePluginServiceWorker()],
})
