export async function readFileWithoutExt(
  path: string,
  exts: string[]
): Promise<{ content: ArrayBuffer; ext: string | undefined }> {
  try {
    return {
      content: await Filesystem.readFile({
        path,
        directory: Directory.External,
      }).then(toBufferFile),
      ext: undefined,
    }
  } catch (err) {
    if ((err as Error).message === "File does not exist.") {
      // eslint-disable-next-line functional/no-loop-statements
      for (let i = 0; i < exts.length; i++) {
        try {
          return {
            content: await Filesystem.readFile({
              path: `${path}.${exts[i]}`,
              directory: Directory.External,
            }).then(toBufferFile),
            ext: exts[i],
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
