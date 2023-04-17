
/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />

import { Directory, Encoding } from "@capacitor/filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@capacitor/filesystem/dist/esm/web"
import { listen } from "@fcanvas/communicate"
import { isNative } from "src/constants"

import { getHashesClient } from "."

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
    getHashesClient
  )
}
