import { listen } from "@fcanvas/communicate"
import type {
  CursorOptions,
  CursorResult,
  FileInfoOptions,
  Options,
} from "prettier"
import { check, format, formatWithCursor } from "prettier"
import parserAngular from "prettier/parser-angular"
import parserBabel from "prettier/parser-babel"
import parserEspress from "prettier/parser-espree"
import parserFlow from "prettier/parser-flow"
import parserGraphql from "prettier/parser-graphql"
import parserHtml from "prettier/parser-html"
import parserMarkdown from "prettier/parser-markdown"
import parserMeriyah from "prettier/parser-meriyah"
import parserPostCss from "prettier/parser-postcss"
import parserTypescript from "prettier/parser-typescript"
import parserYaml from "prettier/parser-yaml"

function pformat(source: string, options: Options) {
  return format(source, {
    ...options,
    plugins: [
      parserAngular,
      parserBabel,
      parserEspress,
      parserFlow,
      parserGraphql,
      parserHtml,
      parserMarkdown,
      parserMeriyah,
      parserPostCss,
      parserTypescript,
      parserYaml,
    ],
  })
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pformatWithCursor(
  source: string,
  options: CursorOptions
): CursorResult {
  return formatWithCursor(source, {
    ...options,
    plugins: [
      parserAngular,
      parserBabel,
      parserEspress,
      parserFlow,
      parserGraphql,
      parserHtml,
      parserMarkdown,
      parserMeriyah,
      parserPostCss,
      parserTypescript,
      parserYaml,
    ],
  })
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pcheck(source: string, options?: FileInfoOptions) {
  return check(source, {
    ...options,
    plugins: [
      parserAngular,
      parserBabel,
      parserEspress,
      parserFlow,
      parserGraphql,
      parserHtml,
      parserMarkdown,
      parserMeriyah,
      parserPostCss,
      parserTypescript,
      parserYaml,
    ],
  })
}

export type Format = (opts: { code: string; options: Options }) => string

listen<Format>(self, "format", ({ code, options }) => {
  return pformat(code, options)
})
