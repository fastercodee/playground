import fs from "indexeddb-fs"

export async function initCurrent() {
  if (!(await fs.exists("/current"))) {
    fs.createDirectory("/current")
    return
  }

  if (await fs.isFile("/current")) {
    await fs.removeFile("/current")
    fs.createDirectory("/current")
  }
}
