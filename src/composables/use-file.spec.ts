import { cleanupFS, readFile, writeFile } from "app/setup.vitest"

import { useFile } from "./use-file"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe("use-file", () => {
  beforeEach(cleanupFS)

  test("should work", async () => {
    await writeFile("text.txt", "foo")

    const { data, ready } = useFile("text.txt")
    await ready.value

    expect(data.value).toEqual("foo")
  })

  test("should work when file does not exist", async () => {
    const { data, ready } = useFile("text.txt", "default")
    await ready.value
    expect(data.value).toEqual("default")
  })

  test("reactive file change", async () => {
    await writeFile("text.txt", "foo")

    const { data, ready } = useFile("text.txt")
    await ready.value

    expect(data.value).toEqual("foo")

    await writeFile("text.txt", "bar")
    eventBus.emit("writeFile", "text.txt")
    await sleep(100)

    expect(data.value).toEqual("bar")
  })

  test("reactive filepath change", async () => {
    await writeFile("text.txt", "foo")
    await writeFile("text2.txt", "bar")

    const file = ref("text.txt")
    const { data, ready } = useFile(file)
    await ready.value

    expect(data.value).toEqual("foo")

    file.value = "text2.txt"
    await nextTick()
    await ready.value

    expect(data.value).toEqual("bar")
  })

  test("reactive file change queue", async () => {
    await writeFile("text.txt", "foo")

    const { data, ready } = useFile("text.txt")
    await ready.value

    expect(data.value).toEqual("foo")

    const fn = vi.fn()
    watch(data, fn, { flush: "sync" })

    await Promise.all([
      writeFile("text.txt", "bar").then(() =>
        eventBus.emit("writeFile", "text.txt")),
      writeFile("text.txt", "bar2").then(() =>
        eventBus.emit("writeFile", "text.txt")),
      writeFile("text.txt", "bar3").then(() =>
        eventBus.emit("writeFile", "text.txt")),
      writeFile("text.txt", "bar4").then(() =>
        eventBus.emit("writeFile", "text.txt"))
    ])

    await sleep(600)
    expect(data.value).toEqual("bar4")
    expect(fn.mock.calls.length).toBe(1)
  })

  test("auto save file on changes content", async () => {
    await writeFile("text.txt", "foo")

    const { data, ready } = useFile("text.txt", undefined, true)
    await ready.value

    expect(data.value).toEqual("foo")

    data.value = "bar"

    await nextTick()
    await sleep(100)

    expect(await readFile("text.txt")).toBe("bar")
  })
})
