import { extname } from "path";

export async function readFileWithoutExt(
  path: string,
  exts: string[]
): Promise<{ content: ArrayBuffer; ext: string; path: string }> {
  try {
    const ext = extname(path).slice(1)
    return {
      content: await Filesystem.readFile({
        path,
        directory: Directory.External,
      }).then(toBufferFile),
      ext,
      path
    }
  } catch (err) {
    if ((err as Error).message === "File does not exist.") {
      for (let i = 0; i < exts.length; i++) {
        try {
          return {
            content: await Filesystem.readFile({
              path: `${path}.${exts[i]}`,
              directory: Directory.External,
            }).then(toBufferFile),
            ext: exts[i],
            path: `${path}.${exts[i]}`,
          }
        } catch (err) {
          if (
            i < exts.length - 1 &&
            (err as Error).message === "File does not exist."
          )
            continue
        }
      }
    }

    throw err
  }
}
