export const files =
  Object.fromEntries(
    Object.entries(
      import.meta.glob("./template/**/*", { eager: true, query: "arraybuffer" })
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(([path, value]) => [path.replace("./template/", "").replace("._", "."), (value as any).default])
  )
