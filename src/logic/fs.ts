// eslint-disable-next-line functional/no-classes
export class Entry<Type extends "directory" | "file"> {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly type: Type,
    public readonly name: string,
    public readonly directory: Entry<"directory">
  ) {}

  public fullPath(): string {
    if (this.directory.fullPath() === "") return this.name
    return this.directory.fullPath() + "/" + this.name
  }
}
window.fs = Filesystem
export async function readDetails<
  Type extends "directory" | "file" = "directory" | "file"
>(name: string, directory: Entry<"directory">): Promise<Entry<Type>> {
  const fullPath =
    directory.fullPath() === "" ? name : directory.fullPath() + "/" + name
  const stat = await Filesystem.stat({
    path: fullPath,
    directory: Directory.External,
  })

  return new Entry(stat.type as Type, name, directory)
}

export async function directoryDetails(entry: Entry<"directory">) {
  const files: Entry<"file">[] = []
  const directories: Entry<"directory">[] = []

  ;(
    await Promise.all(
      (
        await Filesystem.readdir({
          path: entry.fullPath(),
          directory: Directory.External,
        })
      ).files.map((item) => new Entry(item.type, item.name, entry))
    )
  ).forEach((item) => {
    if (item.type === "file") files.push(item as Entry<"file">)
    else directories.push(item as Entry<"directory">)
  })

  return { files, directories }
}
