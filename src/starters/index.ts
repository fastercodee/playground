

export async function loadFiles(template: string) {
  const { files } = await import(`./${template}/index.ts`)

  return files as Record<string, Uint8Array>
}

export function getListTemplates() {
  const templates = Object.entries(import.meta.glob("./*/meta.json5", { eager: true })).map(async ([filepath, item]) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(await (item as any)()).default as {
      name: string
      icon: string[]
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dir: filepath.split("/").at(-2)!
  }))
  return Promise.all(templates)
}
