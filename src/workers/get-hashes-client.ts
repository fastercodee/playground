/* eslint-disable camelcase */
/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />
import { relative } from "path"

import { Directory, Encoding } from "@capacitor/filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@capacitor/filesystem/dist/esm/web"
import { listen } from "@fcanvas/communicate"
import { createHash } from "sha256-uint8array"
import { isNative } from "src/constants"
import {base64ToUint8} from "src/logic/base64-buffer"
import { globby } from "src/logic/globby"

const Filesystem = new FilesystemWeb()

Object.assign(self, { window: self, Filesystem, Directory, Encoding })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComGetHashesClient = {
  // search single file
  "get-hashes-client"(cwd: string): Record<string, string>
}


if (!isNative) {
  listen<ComGetHashesClient, "get-hashes-client">(
    self,
    "get-hashes-client",
    async (cwd: string) => {
      const hashes_client = Object.create(null)

      for await (const filePath of globby(cwd, ["**/*"], ["/.changes/"])) {
        const buffer = await Filesystem.readFile({
          path: filePath,
          directory: Directory.External
        }).then(({ data }) => base64ToUint8(data))

        const hash = createHash().update(buffer).digest("hex")
        hashes_client[relative(cwd, filePath)] = hash
      }

      return hashes_client
    }
  )
}
