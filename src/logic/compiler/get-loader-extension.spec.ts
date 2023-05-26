describe("get-loader-extension", () => {
  test("should get loader by extension", () => {
    expect(getLoaderByExtension(".ts", new URLSearchParams())).toBe("ts")
    expect(getLoaderByExtension(".tsx", new URLSearchParams())).toBe("tsx")
    expect(getLoaderByExtension(".cts", new URLSearchParams())).toBe("ts")
    expect(getLoaderByExtension(".css", new URLSearchParams())).toBe("css")
  })

  test("should get loader by query", () => {
    expect(getLoaderByExtension(".ts", new URLSearchParams("?js"))).toBe("js")
    expect(getLoaderByExtension(".ts", new URLSearchParams("?url"))).toBe("url")
  })

  test("should get loader by extension custom", () => {
    expect(getLoaderByExtension(".jpeg", new URLSearchParams())).toBe("url")
  })

  test("should get loader by extension custom two dot", () => {
    expect(
      getLoaderByExtension(".css", new URLSearchParams(), "/style.module.css")
    ).toBe("css-module")
  })

  test("should get loader svelte", () => {
    expect(getLoaderByExtension(".svelte", new URLSearchParams())).toBe(
      "svelte"
    )
  })

  test("should get loader vue", () => {
    expect(getLoaderByExtension(".vue", new URLSearchParams())).toBe("vue")
  })
})

export {}
