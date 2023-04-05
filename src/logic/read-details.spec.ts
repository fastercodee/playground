import { cleanupFS } from "app/setup.vitest"

describe("read-details", async () => {
  await cleanupFS()
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const directory = { fullPath: "" } as any
    const out = await readDetails("test-dir", directory)

    expect(out.fullPath).toEqual("test-dir")
    expect(out.type).toEqual("directory")
    expect(out.name).toEqual("test-dir")
    expect(out.directory).toBe(directory)
  })
})
