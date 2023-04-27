
/* eslint-env webworker */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />

import { listen } from "@fcanvas/communicate"
import { Directory, Encoding } from "@tachibana-shin/capacitor-filesystem/dist/esm/definitions"
import { FilesystemWeb } from "@tachibana-shin/capacitor-filesystem/dist/esm/web"
import { isNative } from "src/constants"

import { getHashesClient } from "."

const Filesystem = new FilesystemWeb()

Object.assign(self, { window: self, Filesystem, Directory, Encoding })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComGetHashesClient = {
  // search single file
  "get-hashes-client"(cwd: string, exclude: string[]): Record<string, string>
}

if (!isNative) {
  listen<ComGetHashesClient, "get-hashes-client">(
    self,
    "get-hashes-client",
    getHashesClient
  )
}
