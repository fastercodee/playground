/* eslint-disable camelcase */
import { relative } from "path"

import { createHash } from "sha256-uint8array"
import { base64ToUint8 } from "src/logic/base64-buffer"
import { globby } from "src/logic/globby"

export async function getHashesClient(cwd: string) {
  const hashes_client = Object.create(null)

  for await (const filePath of globby(cwd, ["**/*"], ["/.changes/"])) {
    const buffer = await Filesystem.readFile({
      path: filePath,
      directory: Directory.External,
    }).then(({ data }) => base64ToUint8(data))

    const hash = createHash().update(buffer).digest("hex")
    hashes_client[relative(cwd, filePath)] = hash
  }

  return hashes_client
}