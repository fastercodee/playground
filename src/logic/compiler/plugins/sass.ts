import { extname } from "path"

import { compileStringAsync } from "sass-browser"

export function compileSass(filename: string, code: string) {
  return compileStringAsync(code, {
    sourceMap: true,
    syntax: extname(filename).slice(1) as Syntax,
    sourceMapIncludeSources: true,
    importers: [
      {
        findFileUrl: (url) => {
          if (url.includes("://")) return new URL(url, "http://localhost")

          const v = new URL(url, "http://localhost")
          v.searchParams.set("import", "scss")

          return v
        },
      },
    ],
  })
}
