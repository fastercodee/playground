<template>
  <iframe
    src="https://9999-fcanvas-playground-7b9jc2vskd4.ws-us90.gitpod.io/"
    class="w-full border border-light-600"
    @load="onLoad"
  />
</template>

<script lang="ts" setup>
import { join } from "path"

import { listen } from "@fcanvas/communicate"
import type { Communicate } from "app/preview/src/sw"

function onLoad(event: Event) {
  const iframe = event.target as HTMLIFrameElement

  const { port1, port2 } = new MessageChannel()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  iframe.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )

  port1.start()
  listen<Communicate>(port1, "get file", async (opts) => {
    const path = new URL(opts.url).pathname

    if (path === "/") {
      // load index.html

      const buffer = await Filesystem.readFile({
        path: join("current", "index.html"),
        directory: Directory.External,
      }).then(toBufferFile)

      return {
        transfer: [buffer],
        return: {
          content: buffer,
          init: {
            status: 200,
          },
        },
      }
    }

    if (path.includes(".")) {
      // loadfile *.* example *.ts, *.js

      const buffer = await Filesystem.readFile({
        path: join("current", path),
        directory: Directory.External,
      }).then(toBufferFile)

      return {
        transfer: [buffer],
        return: {
          content: buffer,
          init: {
            status: 200,
          },
        },
      }
    }

    return null
  })
}
</script>
