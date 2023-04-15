import { cleanupFS, readFile } from "app/setup.vitest"

import { writeFileRecursive } from "./write-file-recursive"

describe("write-file-recursive", () => {
  beforeEach(cleanupFS)

  test("write file of root", async () => {
    await writeFileRecursive("test.txt", "test")

    expect(await readFile("test.txt")).toBe("test")
  })

  test("write file of directory exists", async () => {
    await Filesystem.mkdir({
      path: "test",
      directory: Directory.External
    })

    await writeFileRecursive("test/test.txt", "test")

    expect(await readFile("test/test.txt")).toBe("test")
  })

  test("write file of directory does not exist", async () => {
    await writeFileRecursive("test/test.txt", "test")

    expect(await readFile("test/test.txt")).toBe("test")
  })

  test("write file of directory of directory does not exist", async () => {
    await writeFileRecursive("test/test/test.txt", "test")

    expect(await readFile("test/test/test.txt")).toBe("test")
  })
})
