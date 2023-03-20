import type { CopyOptions, CopyResult } from "@capacitor/filesystem"

function resolve(path: string): string {
  const posix = path.split("/").filter((item) => item !== ".")
  const newPosix: string[] = []

  posix.forEach((item) => {
    if (
      item === ".." &&
      newPosix.length > 0 &&
      newPosix[newPosix.length - 1] !== ".."
    ) {
      newPosix.pop()
    } else {
      newPosix.push(item)
    }
  })

  return newPosix.join("/")
}
function isPathParent(parent: string, children: string): boolean {
  parent = resolve(parent)
  children = resolve(children)
  const pathsA = parent.split("/")
  const pathsB = children.split("/")

  return (
    parent !== children &&
    pathsA.every((value, index) => value === pathsB[index])
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
; (Filesystem as unknown as any)._copy = async function copy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: any,
  options: CopyOptions,
  doRename = false
): Promise<CopyResult> {
  // eslint-disable-next-line functional/no-let
  let { toDirectory } = options
  const { to, from, directory: fromDirectory } = options

  if (!to || !from) {
    throw Error("Both to and from must be provided")
  }

  // If no "to" directory is provided, use the "from" directory
  if (!toDirectory) {
    toDirectory = fromDirectory
  }

  const fromPath = this.getPath(fromDirectory, from)
  const toPath = this.getPath(toDirectory, to)

  // Test that the "to" and "from" locations are different
  if (fromPath === toPath) {
    return {
      uri: toPath,
    }
  }

  if (isPathParent(fromPath, toPath)) {
    throw Error("To path cannot contain the from path")
  }

  // Check the state of the "to" location
  // eslint-disable-next-line functional/no-let
  let toObj
  try {
    toObj = await this.stat({
      path: to,
      directory: toDirectory,
    })
  } catch (e) {
    // To location does not exist, ensure the directory containing "to" location exists and is a directory
    const toPathComponents = to.split("/")
    toPathComponents.pop()
    const toPath = toPathComponents.join("/")

    // Check the containing directory of the "to" location exists
    if (toPathComponents.length > 0) {
      const toParentDirectory = await this.stat({
        path: toPath,
        directory: toDirectory,
      })

      if (toParentDirectory.type !== "directory") {
        throw new Error("Parent directory of the to path is a file")
      }
    }
  }

  // Cannot overwrite a directory
  if (toObj && toObj.type === "directory") {
    throw new Error("Cannot overwrite a directory with a file")
  }

  // Ensure the "from" object exists
  const fromObj = await this.stat({
    path: from,
    directory: fromDirectory,
  })

  // Set the mtime/ctime of the supplied path
  const updateTime = async (path: string, ctime: number, mtime: number) => {
    const fullPath: string = this.getPath(toDirectory, path)
    const entry = await this.dbRequest("get", [fullPath])
    entry.ctime = ctime
    entry.mtime = mtime
    await this.dbRequest("put", [entry])
  }

  const ctime = fromObj.ctime ? fromObj.ctime : Date.now()

  switch (fromObj.type) {
    // The "from" object is a file
    case "file": {
      // Read the file
      const file = await this.readFile({
        path: from,
        directory: fromDirectory,
      })

      // Optionally remove the file
      if (doRename) {
        await this.deleteFile({
          path: from,
          directory: fromDirectory,
        })
      }

      // Write the file to the new location
      const writeResult = await this.writeFile({
        path: to,
        directory: toDirectory,
        data: file.data,
      })
      eventBus.emit('write-file', to)

      // Copy the mtime/ctime of a renamed file
      if (doRename) {
        await updateTime(to, ctime, fromObj.mtime)
      }

      // Resolve promise
      return writeResult
    }
    case "directory": {
      if (toObj) {
        throw Error("Cannot move a directory over an existing object")
      }

      try {
        // Create the to directory
        await this.mkdir({
          path: to,
          directory: toDirectory,
          recursive: false,
        })

        // Copy the mtime/ctime of a renamed directory
        if (doRename) {
          await updateTime(to, ctime, fromObj.mtime)
        }
      } catch (e) {
        // ignore
      }

      // Iterate over the contents of the from location
      const contents = (
        await this.readdir({
          path: from,
          directory: fromDirectory,
        })
      ).files

      // eslint-disable-next-line functional/no-loop-statements
      for (const filename of contents) {
        // Move item from the from directory to the to directory
        await this._copy(
          {
            from: `${from}/${filename.name}`,
            to: `${to}/${filename.name}`,
            directory: fromDirectory,
            toDirectory,
          },
          doRename
        )
      }

      // Optionally remove the original from directory
      if (doRename) {
        await this.rmdir({
          path: from,
          directory: fromDirectory,
        })
      }
    }
  }
  return {
    uri: toPath,
  }
}
