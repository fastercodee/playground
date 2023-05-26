/* eslint-disable camelcase */
import { relative } from "path"

import { base64ToUint8 } from "src/logic/base64-buffer"
import { globby } from "src/logic/globby"
import { sha256File } from "src/logic/sha256-file"

Object.assign(self, { base64ToUint8 })

export async function getHashesClient(cwd: string, exclude: string[]) {
  const hashes_client = Object.create(null)

  for await (const filePath of globby(cwd, ["**/*"], exclude)) {
    hashes_client[relative(cwd, filePath)] = await sha256File(filePath)
  }

  return hashes_client
}
