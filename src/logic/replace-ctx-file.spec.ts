import { cleanupFS, readFile, writeFile } from "app/setup.vitest"

import type { TreeDir } from "./flat-to-tree"
import { searchText } from "./search-text"

async function searchFile(path: string, query: string) {
  return [...searchText(await readFile(path), {
    search: query,
    caseSensitive: false,
    wholeWord: false,
    regexp: false,
  })]
}

describe("replace-ctx-file", () => {
  beforeEach(cleanupFS)

  test("replaceMatch", async () => {
    await writeFile("text.txt", "hello world")

    const matches = await searchFile("text.txt", "o")

    await replaceMatch("text.txt", matches[0], "O")

    expect(await readFile("text.txt")).toEqual("hellO world")
  })

  test("replaceMatches", async () => {
    await writeFile("text.txt", "hello world")

    const matches = await searchFile("text.txt", "o")

    await replaceMatches("text.txt", matches, "O")

    expect(await readFile("text.txt")).toEqual("hellO wOrld")
  })

  test("replaceMultiMatches", async () => {
    await writeFile("text.txt", "hello world")
    await writeFile("text2.txt", "hello bozz")
    await Filesystem.mkdir({
      path: "src",
      directory: Directory.External
    })
    await writeFile("src/text3.txt", "hello world")

    const matches: TreeDir["children"] = {
      files: new Map([
        ["text.txt", {
          fullPath: "text.txt",
          matches: await searchFile("text.txt", "o")
        }],
        ["text2.txt", {
          fullPath: "text2.txt",
          matches: await searchFile("text2.txt", "o")
        }]
      ]),
      dirs: new Map([
        ["src", {
          fullPath: "src",
          children: {
            dirs: new Map(),
            files: new Map([
              ["text3.txt", {
                fullPath: "src/text3.txt",
                matches: await searchFile("src/text3.txt", "o")
              }]
            ]),
          }
        }]
      ])
    };

    await replaceMultiMatches(matches, "O")

    expect(await readFile("text.txt")).toEqual("hellO wOrld")
    expect(await readFile("text2.txt")).toEqual("hellO bOzz")
    expect(await readFile("src/text3.txt")).toEqual("hellO wOrld")
  })
})
