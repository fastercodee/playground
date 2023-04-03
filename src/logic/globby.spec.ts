import { globby } from "./globby"

async function cleanupFS() {
  const { files } = await Filesystem.readdir({
    path: "globby",
    directory: Directory.External,
  }).catch(() => ({ files: [] }))

  for (const file of files) {
    if (file.type === "file")
      await Filesystem.deleteFile({
        path: "globby/" + file.name,
        directory: Directory.External,
      })
    else
      await Filesystem.rmdir({
        path: "globby/" + file.name,
        directory: Directory.External,
        recursive: true,
      }).catch(() => false)
  }
}

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
      "globby/foo.js",
      "globby/bar.js",
      "globby/src/main.js",
    ])
  })

  test("ignore", async () => {
    const files: string[] = []

    for await (const file of await globby("globby/", ["*.js"], ["main.js"])) {
      files.push(file)
    }

    expect(files).toEqual(["globby/foo.js", "globby/bar.js"])
  })
})
