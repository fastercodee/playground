import { globby } from "./globby"

async function cleanupFS() {
  const { files } = await Filesystem.readdir({
    path: "",
    directory: Directory.External
  })

  for (const file of files) {
    if (file.type === 'file')
      await Filesystem.deleteFile({
        path: file.name,
        directory: Directory.External
      })
    else
      await Filesystem.rmdir({
        path: file.name,
        directory: Directory.External,
        recursive: true
      })
  }
}

describe("globby", async () => {
  await cleanupFS()
  // init files

  await Filesystem.writeFile({
    path: "foo.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8
  })
  await Filesystem.writeFile({
    path: "bar.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8
  })
  await Filesystem.mkdir({
    path: "src",
    directory: Directory.External
  })
  await Filesystem.writeFile({
    path: "src/main.js",
    directory: Directory.External,
    data: "",
    encoding: Encoding.UTF8
  })

  test("include", async () => {
    const files: string[] = []

    for await (const file of await globby("", ["*.js"], [])) {
      files.push(file)
    }

    expect(files).toEqual(["foo.js", "bar.js", "src/main.js"])
  })

  test("ignore", async () => {
    const files: string[] = []

    for await (const file of await globby("", ["*.js"], ['main.js'])) {
      files.push(file)
    }

    expect(files).toEqual(["foo.js", "bar.js"])

  })
})
