import { basename, join } from "path";

import { contentType } from "mime-types"
import type { WatcherFs } from "src/logic/event-bus";

export function useRespondWith(watchFs: WatcherFs) {
  const sketchStore = useSketchStore()

  const tsconfigのFile = useFile(
    () => `${sketchStore.rootのsketch}/tsconfig.json`,
    "{}"
  )


  return async (opts: {
    url: string;
    headers: [string, string][];
  }) => {
    const { pathname } = new URL(opts.url)

    window.console.log("Request file %s", pathname)

    // loadfile *.* example *.ts, *.js, eslint
    try {
      if (!sketchStore.rootのsketch) throw new Error("no sketch")
      const res =
        pathname === "/"
          ? await Filesystem.readFile({
            path: `${sketchStore.rootのsketch}/index.html`,
            directory: Directory.External,
          }).then((res) => {
            return {
              content: base64ToUint8(res.data).buffer,
              ext: "html",
              path: `${sketchStore.rootのsketch}/index.html`,
            }
          })
          : await readFileWithoutExt(join(sketchStore.rootのsketch, pathname), [
            "ts",
            "tsx",
            "js",
            "jsx",
            "json",
            // " Gcss",
            // "text"
          ])

      watchFs.addWatchFile(res.path)

      if (!res) throw new Error("File does not exist.")

      const content = ["ts", "jsx", "tsx"].includes(res.ext)
        ? (await tsconfigのFile.ready,
          await compilerFile(
            res.content,
            basename(pathname),
            res.ext,
            tsconfigのFile.data
          ))
        : res.content
      console.log({ content }, `${sketchStore.rootのsketch}/index.html`)
      return {
        transfer: [content],
        return: {
          content,
          init: {
            status: 200,
            headers: {
              "content-type": contentType(`.${res.ext}`) || "text/plain",
            },
          },
        },
      }
    } catch (err) {
      window.console.error({ err })
      if ((err as Error).message === "File does not exist.")
        return {
          content: null,
          init: {
            status: 404,
          },
        }
      return {
        content: null,
        init: {
          status: 503,
        },
      }
    }
  }
}
