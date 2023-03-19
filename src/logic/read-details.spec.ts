import setGlobalVars from "indexeddbshim"

setGlobalVars(self)

describe("read-details", async () => {
  await Filesystem.rmdir({
    path: "test-dir",
    recursive: true,
    directory: Directory.External,
  }).catch(() => false)
  await Filesystem.deleteFile({
    path: "test-file",
  }).catch(() => false)

  await Filesystem.mkdir({
    path: "test-dir",
    recursive: true,
    directory: Directory.External,
  })
  await Filesystem.writeFile({
    path: "test-dir/file-child",
    directory: Directory.External,
    data: "",
  })
  await Filesystem.writeFile({
    path: "test-file",
    directory: Directory.External,
    data: "",
  })

  test("read one item", async () => {
    const directory = { fullPath: () => "" } as any
    const out = await readDetails("test-dir", directory)

    expect(out.fullPath()).toEqual("test-dir")
    expect(out.type).toEqual("directory")
    expect(out.name).toEqual("test-dir")
    expect(out.directory).toBe(directory)
  })
})
