

export async function loadFiles(template: string) {
  const { files } = await import(`./${template}`)

  return Object.fromEntries(Object.entries(files).map(([filepath, content]) => [filepath, (content as Uint8Array)]))
}

export function getListTemplates() {
  const templates = Object.entries(import.meta.glob("./*/meta.json5", { eager: true })).map(([filepath, item]) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(item as any).default as {
      name: string
      icon: string[]
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dir: filepath.split("/").at(-2)!
  }))
  return templates
}
