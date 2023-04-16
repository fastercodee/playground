import { cleanupFS } from "app/setup.vitest"

import { globby } from "./globby"

describe("globby", async () => {
  await cleanupFS()
  // init files

  await Filesystem.writeFile({
    path: "globby/foo.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8,
  })
  await Filesystem.writeFile({
    path: "globby/bar.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8,
  })
  await Filesystem.writeFile({
    path: "globby/src/main.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8,
    recursive: true
  })

  test("exclude with start /", async () => {
    const files: string[] = []

    for await (const file of await globby("globby/", ["*.js"], ["/*.js"])) {
      files.push(file)
    }

    expect(files).toEqual(["globby/src/main.js"])
  })
})
