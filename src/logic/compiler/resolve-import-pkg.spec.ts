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
})
