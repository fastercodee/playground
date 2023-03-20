<template>
  <iframe
    :src="srcIFrame"
    class="w-full border border-light-600"
    ref="iframeRef"
    @load="onLoad"
  />
</template>

<script lang="ts" setup>
import { basename, join } from "path"

import { listen, put } from "@fcanvas/communicate"
import type { Communicate } from "app/preview/src/sw"
import { debounce } from "quasar"

const iframeRef = ref<HTMLIFrameElement>()

const srcIFrame = process.env.GITPOD_WORKSPACE_URL
  ? process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9999-")
  : process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-9999.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : "https://preview-fcanvas.github.io"

const channel = new MessageChannel()
const { port1, port2 } = channel

port1.start()

const listener = listen<Communicate>(port1, "get file", async (opts) => {
  const { pathname } = new URL(opts.url)

  console.log("Request file %s", pathname)

  // loadfile *.* example *.ts, *.js, eslint
  try {
    const res =
      pathname === "/"
        ? await Filesystem.readFile({
            path: "current/index.html",
            directory: Directory.External,
          }).then((res) => {
            return { content: toBufferFile(res), ext: "html" }
          })
        : await readFileWithoutExt(join("current", pathname), [
            "ts",
            "tsx",
            "js",
            "jsx",
            "json",
            // " Gcss",
            // "text"
          ])

    if (!res) throw new Error("File does not exist.")

    const content = ["ts", "jsx", "tsx"].includes(res.ext)
      ? await compilerFile(
          res.content,
          basename(pathname),
          res.ext,

          await loadWatchFile("current/tsconfig.json", "{}")
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
    console.error({ err })
    if ((err as Error).message === "File does not exist.")
      return {
        content: null,
        init: {
          status: 404,
        },
      }
    return {
      content: null,
      init: {
        status: 503,
      },
    }
  }
})
onBeforeUnmount(() => {
  channel.port1.close()
  channel.port2.close()
  listener?.()
})

async function refreshIFrame() {
  if (!iframeRef.value) {
    console.warn("[refresh iframe]: can't refresh iframe because not found.")
    return
  }

  const forceReload = await put(port1, {
    name: "refresh",
    targetOrigin: "*",
  })

  if (forceReload) {
    iframeRef.value.src = ""
    iframeRef.value.src = srcIFrame
  }
}
eventBus.on("write-file", debounce(refreshIFrame, 1_000))

async function onLoad() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  iframeRef.value!.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )
}
</script>
