import { dirname } from "path"

import type { Encoding } from "@capacitor/filesystem"

export
  async function writeFileRecursive(path: string, data: string, encoding?: Encoding) {
  const dir = dirname(path)

  if (dir)
    await Filesystem.mkdir({
      path: dir,
      directory: Directory.External,
      recursive: true,
    }).catch(() => false)


  await Filesystem.writeFile({
    path,
    directory: Directory.External,
    data,
    encoding
  })
  eventBus.emit("writeFile", path)
}
