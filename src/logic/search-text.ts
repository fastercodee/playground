import escapeRegex from "escape-string-regexp"

export interface SearchOptions {
  search: string
  caseSensitive: boolean
  wholeWord: boolean
  regexp: boolean
}
// export interface Pos {
//   line: number
//   column: number
// }
export type Pos = number
export interface Match {
  index: number
  match: string
  before: string
  after: string
  posStart: Pos
  posEnd: Pos
}
export type SearchResult = Generator<Match, void, unknown>

const rNotWord = /[\n]/i
const maxLengthPesduso = 30

function getStringBeforeMatch(
  text: string,
  lengthMatch: number,
  index: number
): string {
  // eslint-disable-next-line functional/no-let
  let words = ""
  for (let i = 1; i <= maxLengthPesduso; i++) {
    const char = text[index - i]

    if (!char) break
    if (rNotWord.test(char)) break

    words = char + words
  }

  return words
}
function getStringAfterMatches(
  text: string,
  lengthMatch: number,
  index: number
): string {
  // eslint-disable-next-line functional/no-let
  let words = ""
  for (let i = 0; i <= maxLengthPesduso; i++) {
    const char = text[index + lengthMatch + i]

    if (!char) break
    if (rNotWord.test(char)) break

    words += char
  }

  return words
}

export function* searchText(
  text: string,
  options: SearchOptions
): SearchResult {
  // search
  const regular =
    (options.wholeWord ? "(?<=[^a-zA-Z0-9]|^)" : "") +
    (options.regexp ? options.search : escapeRegex(options.search)) +
    (options.wholeWord ? "(?=[^a-zA-Z0-9]|$)" : "")

  const regex = new RegExp(regular, options.caseSensitive ? "g" : "gi")

  for (const match of text.matchAll(regex)) {
    const { length: lengthMatch } = match[0]
    const { index = -1 } = match
    // const allOfBefore = text.slice(0, index + 1)

    // const posStart = {
    //   line: (allOfBefore.match(/\n/g)?.length ?? 0) + 1,
    //   column: index - allOfBefore.lastIndexOf("\n")
    // }
    const posStart = index
    // const lastIndexNewLine = match[0].lastIndexOf("\n")
    // const posEnd = {
    //   line: posStart.line + (match[0].match(/\n/g)?.length ?? 0),
    //   column:
    //     lastIndexNewLine === -1
    //       ? posStart.column + match[0].length
    //       : match[0].length - lastIndexNewLine
    // }
    const posEnd = index + lengthMatch

    yield {
      index,
      match: match[0],
      before: getStringBeforeMatch(text, lengthMatch, match.index ?? -1),
      after: getStringAfterMatches(text, lengthMatch, match.index ?? -1),
      posStart,
      posEnd,
    }
  }
}
