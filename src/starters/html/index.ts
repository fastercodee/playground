export const files =
  Object.fromEntries(
    Object.entries(
      import.meta.glob("./template/**/*", { as: "raw", eager: true })
    )
      .map(([path, value]) => [path.replace("./template/", ""), value])
  )
