import type { TreeDir } from "src/logic/flat-to-tree";
import type { Match } from "src/logic/search-text";


/**
 * When edits are made then:
 * - record file
 * - update CodeMirror 6 doc if it's open
 * Instead of splitting it into a logical file we should put it in the session-edit store
 */


export function replaceMatch(fullPath: string, match: Match) {

}
export function replaceMatches(fullPath: string, matches: Match[]) { }
export function replaceMultiMatches(children: TreeDir["children"]) { }
