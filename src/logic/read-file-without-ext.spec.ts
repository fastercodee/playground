import setGlobalVars from "indexeddbshim"

setGlobalVars(self)

describe("readFileWithoutExt", async () => {
  beforeEach(async () => {
    await Filesystem.rmdir({
      path: "current",
      directory: Directory.External,
      recursive: true,
    }).catch(() => false)
    await Filesystem.mkdir({
      path: "current",
      directory: Directory.External,
    })
  })

  test("should exact file path exists", async () => {
    await Promise.all([
      Filesystem.writeFile({
        path: "current/main",
        data: "hello main",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }),
      Filesystem.writeFile({
        path: "current/main.ts",
        data: "hello main.ts",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }),
      Filesystem.writeFile({
        path: "current/main.js",
        data: "hello main.js",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }),
    ])

    const { content, ext } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main")
    expect(ext).toBeUndefined()
  })
  test("should path ext 1 exists", async () => {
    await Promise.all([
      Filesystem.writeFile({
        path: "current/main.ts",
        data: "hello main.ts",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }),
      Filesystem.writeFile({
        path: "current/main.js",
        data: "hello main.js",
        directory: Directory.External,
        encoding: Encoding.UTF8,
      }),
    ])

    const { content, ext } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main.ts")
    expect(ext).toBe("ts")
  })
  test("should path ext 2 exists", async () => {
    await Filesystem.writeFile({
      path: "current/main.js",
      data: "hello main.js",
      directory: Directory.External,
      encoding: Encoding.UTF8,
    })

    const { content, ext } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main.js")
    expect(ext).toBe("js")
  })
})
