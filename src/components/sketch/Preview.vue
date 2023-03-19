<template>
  <iframe
    :src="srcIFrame"
    class="w-full border border-light-600"
    @load="onLoad"
  />
</template>

<script lang="ts" setup>
import { basename, join } from "path"

import { listen } from "@fcanvas/communicate"
import type { Communicate } from "app/preview/src/sw"

const srcIFrame = process.env.GITPOD_WORKSPACE_URL
  ? process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9999-")
  : process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-9999.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : "https://preview-fcanvas.github.io"

// eslint-disable-next-line functional/no-let
let channel: MessageChannel | undefined, listener: (() => void) | undefined
onBeforeUnmount(() => {
  channel?.port1.close()
  channel?.port2.close()
  listener?.()
})

function onLoad(event: Event) {
  channel?.port1.close()
  channel?.port2.close()
  const iframe = event.target as HTMLIFrameElement

  channel = new MessageChannel()
  const { port1, port2 } = channel

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  iframe.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )

  port1.start()
  listener = listen<Communicate>(port1, "get file", async (opts) => {
    const { pathname } = new URL(opts.url)

    console.log("Request file %s", pathname)

    // loadfile *.* example *.ts, *.js, eslint
    try {
      const res = await readFileWithoutExt(join("current", pathname), [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        // " Gcss",
        // "text"
      ])

      if (!res) throw new Error("File does not exist.")

      const content = res.ext
        ? await compilerFile(
            res.content,
            basename(pathname),
            res.ext,
            await Filesystem.readFile({
              path: join("current", "tsconfig.json"),
              directory: Directory.External,
            }).then((res) => res.data)
          )
        : res.content

      return {
        transfer: [content],
        return: {
          content,
          init: {
            status: 200,
          },
        },
      }
    } catch (err) {
      if ((err as Error).message === "File does not exist.")
        return {
          content: null,
          init: {
            status: 404,
          },
        }
      console.error({ err })
      return {
        content: null,
        init: {
          status: 503,
        },
      }
    }
  })
}
</script>
