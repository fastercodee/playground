import { join, relative } from "path"

import { contentType } from "mime-types"
import { resolverImport } from "src/logic/compiler/resolver-import"
import type { WatcherFs } from "src/logic/event-bus"

async function resolverUrl(
  rootのsketch: string,
  tsconfigのFile: ReturnType<typeof useFile<string>>,
  url: URL
): Promise<{
  content: ArrayBufferLike
  ext: string
  path: string
}> {
  const { pathname, searchParams } = url

  if (pathname === "/")
    return await Filesystem.readFile({
      path: `${rootのsketch}/index.html`,
      directory: Directory.External,
    }).then((res) => {
      return {
        content: base64ToUint8(res.data).buffer,
        ext: ".html",
        path: `${rootのsketch}/index.html`,
      }
    })

  const resolveByImport = resolverImport(url)
  if (resolveByImport)
    return {
      content: utf8ToUint8(resolveByImport.contents),
      ext: resolveByImport.loader,
      path: join(rootのsketch, pathname),
    }

  const res = await readFileWithoutExt(join(rootのsketch, pathname), [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    // " Gcss",
    // "text"
  ])

  if (!res) throw new Error("File does not exist.")

  if (
    [
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
    ].includes(res.ext.slice(1))
  ) {
    await tsconfigのFile.ready
    res.content = await compilerFile(
      res.content,
      relative(rootのsketch,res.path),
      res.ext,
      searchParams,
      tsconfigのFile.data
    )
  }

  return res
}

export async function respondWith(
  rootのsketch: string,
  tsconfigのFile: ReturnType<typeof useFile<string>>,
  watchFs: WatcherFs,
  opts: { url: string; headers: [string, string][] }
) {
  const url = new URL(opts.url)

  console.log("Request file %s", url)

  // loadfile *.* example *.ts, *.js, eslint
  try {
    if (!rootのsketch) throw new Error("no sketch")

    const res = await resolverUrl(rootのsketch, tsconfigのFile, url)

    watchFs.addWatchFile(res.path)

    return {
      transfer: [res.content],
      return: {
        content: res.content,
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
