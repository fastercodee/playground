import type { TreeDir } from "src/logic/flat-to-tree"
import type { Match } from "src/logic/search-text"

/**
 * When edits are made then:
 * - record file
 * - update CodeMirror 6 doc if it's open
 * Instead of splitting it into a logical file we should put it in the session-edit store
 */

/**
 * After the search we need to monitor the file to make sure the changes are reflected correctly in the search results
 */

export async function replaceMatch(
  fullPath: string,
  match: Match,
  replaceWith: string
): Promise<void> {
  const currentData = await Filesystem.readFile({
    path: fullPath,
    directory: Directory.External,
    encoding: Encoding.UTF8
  }).then(res=>res.data)

  const newText =
    currentData.slice(0, match.index) /** heading */ +
    replaceWith +
    currentData.slice(match.index + match.match.length) /** footing */

  await Filesystem.writeFile({
    path: fullPath,
    directory: Directory.External,
    encoding: Encoding.UTF8,
    data: newText,
  })
  eventBus.emit("writeFile", fullPath)
}
export async function replaceMatches(
  fullPath: string,
  matches: Match[],
  replaceWith: string
): Promise<void> {
  const currentData = await Filesystem.readFile({
    path: fullPath,
    directory: Directory.External,
    encoding: Encoding.UTF8
  }).then(res=>res.data)

  // eslint-disable-next-line functional/no-let
  let newText = ""
  // eslint-disable-next-line functional/no-let
  let currentPointer = 0
  matches.forEach((match) => {
    newText += currentData.slice(currentPointer, match.index) + replaceWith
    currentPointer = match.index + match.match.length
  })
  newText += currentData.slice(currentPointer)

  await Filesystem.writeFile({
    path: fullPath,
    directory: Directory.External,
    encoding: Encoding.UTF8,
    data: newText,
  })
  eventBus.emit("writeFile", fullPath)
  // ok
}
export async function replaceMultiMatchesTree(
  { files, dirs }: TreeDir["children"],
  replaceWith: string
): Promise<void> {
  for (const [, { fullPath, matches }] of files) {
    await replaceMatches(fullPath, matches, replaceWith)
  }

  for (const [, { children }] of dirs) {
    await replaceMultiMatchesTree(children, replaceWith)
  }
}
export async function replaceMultiMatches(
  files: Map<string, Match[]>,
  replaceWith: string
): Promise<void> {
  console.log({ files, replaceWith })
  for (const [fullPath, matches] of files) {
    await replaceMatches(fullPath, matches, replaceWith)
  }
}
