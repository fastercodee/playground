import { join, relative } from "path"

import { resolverImport } from "src/logic/compiler/resolver-import"

export async function respondWith(
  rootのsketch: string,
  tsconfigのFile: ReturnType<typeof useFile<string>>,
  url: URL
): Promise<{
  content: ArrayBuffer
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
      content: utf8ToUint8(resolveByImport.contents).buffer,
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
