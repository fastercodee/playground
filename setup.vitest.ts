import "fake-indexeddb/auto"

export async function cleanupFS() {
  const { files } = await Filesystem.readdir({
    path: "",
    directory: Directory.External,
  }).catch(() => ({ files: [] }))

  for (const file of files) {
    if (file.type === "file")
      await Filesystem.deleteFile({
        path: file.name,
        directory: Directory.External,
      })
    else
      await Filesystem.rmdir({
        path: file.name,
        directory: Directory.External,
        recursive: true,
      }).catch(() => false)
  }
}
