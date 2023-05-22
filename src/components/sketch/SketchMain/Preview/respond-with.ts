import { join, relative } from "path"

import { allowCompile } from "src/logic/compiler/compiler-file"
import { resolverImport } from "src/logic/compiler/resolver-import"

export async function respondWith(
  rootのsketch: string,
  tsconfigのFile: ReturnType<typeof useFile<string>>,
  url: URL
): Promise<{
  content: ArrayBuffer
  ext: `.${string}`
  path: string
}> {
  const { pathname, searchParams } = url

  if (pathname.startsWith("/cdn_modules/")) {
    const content = utf8ToUint8(
      `export * from "https://esm.sh/${pathname.slice(
        "/cdn_modules/".length
      )}?dev"`
    )

    return {
      content: content.buffer,
      ext: ".js",
      path: pathname.slice("/cdn_modules/".length),
    }
  }

  const requireImport = searchParams.has("import")

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
      ext: ("." + resolveByImport.loader) as `.${string}`,
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

  if (!requireImport && !rExecTS.test(res.path)) return res

  if (allowCompile.includes(res.ext.slice(1))) {
    await tsconfigのFile.ready
    res.content = await compilerFile(
      res.content,
      "./" + relative(rootのsketch, res.path),
      res.ext,
      searchParams,
      tsconfigのFile.data
    )
    res.ext = ".js"
  }

  return res
}
