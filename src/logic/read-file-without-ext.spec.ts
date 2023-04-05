import { cleanupFS } from "app/setup.vitest"

describe("readFileWithoutExt", async () => {
  beforeEach(async () => {
    await cleanupFS()
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

    const { content, ext, path } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main")
    expect(path).toBe("current/main")
    expect(ext).toBe("")
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

    const { content, ext, path } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main.ts")
    expect(path).toBe("current/main.ts")
    expect(ext).toBe("ts")
  })
  test("should path ext 2 exists", async () => {
    await Filesystem.writeFile({
      path: "current/main.js",
      data: "hello main.js",
      directory: Directory.External,
      encoding: Encoding.UTF8,
    })

    const { content, ext, path } = await readFileWithoutExt("current/main", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main.js")
    expect(path).toBe("current/main.js")
    expect(ext).toBe("js")
  })
  test("should exact file path in ext exists", async () => {
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

    const { content, ext, path } = await readFileWithoutExt("current/main.ts", [
      "ts",
      "js",
    ])

    expect(new TextDecoder().decode(content)).toBe("hello main.ts")
    expect(path).toBe("current/main.ts")
    expect(ext).toBe("ts")
  })
})
