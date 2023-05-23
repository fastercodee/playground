import { resolveImportPkg } from "./resolve-import-pkg"

describe("resolve-import-pkg", () => {
  test("should resolve import", () => {
    expect(
      resolveImportPkg("vue", {
        dependencies: {
          vue: "3",
          "@vue/shared": "2",
        },
      })
    ).toBe("https://esm.sh/vue@3?dev&deps=vue@3,@vue/shared@2")
  })

  test("should resolve import with deps not found", () => {
    expect(resolveImportPkg("vue", {})).toBe("https://esm.sh/vue@latest?dev")
  })

  test("should resolve import with path", () => {
    expect(
      resolveImportPkg("vue/package.json", { dependencies: { vue: "2" } })
    ).toBe("https://esm.sh/vue@2/package.json?dev&deps=vue@2")
  })

  test("should resolve import package scope", () => {
    expect(
      resolveImportPkg("@vue/shared", { dependencies: { "@vue/shared": "2" } })
    ).toBe("https://esm.sh/@vue/shared@2?dev&deps=@vue/shared@2")
  })
})
