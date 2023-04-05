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
  await Filesystem.mkdir({
    path: "globby/src",
    directory: Directory.External,
  })
  await Filesystem.writeFile({
    path: "globby/src/main.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8,
  })

  test("include", async () => {
    const files: string[] = []

    for await (const file of await globby("globby/", ["*.js"], [])) {
      files.push(file)
    }

    expect(files).toEqual([
      "globby/bar.js",
      "globby/foo.js",
      "globby/src/main.js",
    ])
  })

  test("ignore", async () => {
    const files: string[] = []

    for await (const file of await globby("globby/", ["*.js"], ["main.js"])) {
      files.push(file)
    }

    expect(files).toEqual(["globby/bar.js", "globby/foo.js"])
  })
})
