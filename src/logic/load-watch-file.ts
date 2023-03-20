export async function loadWatchFile(
  path: string,
  defaultValue: string
): Promise<string> {
  return await Filesystem.readFile({
    path,
    directory: Directory.External,
  })
    .then((res) => res.data)
    .catch(() => defaultValue)
}
