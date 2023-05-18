import { getListTemplates, loadFiles } from "."

describe("starters", () => {
  test("getListTemplates", async () => {
    const templates = await getListTemplates(

    )
    expect(Array.isArray(templates)).toBe(true)

    expect(templates[0].name).toBeTypeOf("string")
    expect(templates[0].dir).toBeTypeOf("string")
    expect(Array.isArray(templates[0].icon)).toBeTruthy()
  })

  test("loadFiles", async () => {
    const files = await loadFiles("html")

    expect(files).toBeTypeOf("object")
  })


  // ================ test data files ================

  test("should all templates exists /index.html", async () => {
    const templates = await getListTemplates()

    await Promise.all(
      templates.map(async item => {
        expect((await loadFiles(item.dir))["index.html"][Symbol.toStringTag]).toBe("Uint8Array")
      })
    )
  })
})
