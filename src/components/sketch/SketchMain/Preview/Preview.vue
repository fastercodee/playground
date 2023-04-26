<template>
  <iframe
    :src="srcIFrame"
    class="w-full h-full border border-light-600 bg-white"
    ref="iframeRef"
    @load="onLoad"
  />
</template>

<script lang="ts" setup>
import { basename, join } from "path"

import { listen, put } from "@fcanvas/communicate"
import type { Communicate } from "app/preview/src/sw"

const iframeRef = ref<HTMLIFrameElement>()
const previewStore = usePreviewStore()
const sketchStore = useSketchStore()

const srcIFrame = process.env.GITPOD_WORKSPACE_URL
  ? process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9999-")
  : process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-9999.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : "https://preview-fcanvas.github.io"

const mimeMap = {
  js: "text/javascript",
  jsx: "text/javascript",
  ts: "text/javascript",
  tsx: "text/javascript",
  html: "text/html",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  wav: "audio/wav",
  aac: "audio/aac",
  m4a: "audio/x-m4a",
  m4b: "audio/x-m4b",
  m4p: "audio/x-m4p",
  m4r: "audio/x-m4r",
  m4v: "video/x-m4v",
  flac: "audio/x-flac",
  aif: "audio/x-aiff",
  aiff: "audio/x-aiff",
  aiffc: "audio/x-aiff",
  m3u: "audio/x-mpegurl",
  m3u8: "audio/x-mpegurl",
  mov: "video/quicktime",
  mp2: "video/mpeg",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  mpega: "video/mpeg",
  mpeg2: "video/mpeg",
  mpeg4: "video/mpeg",
  mpegv: "video/mpeg",
  mpeg4v: "video/mpeg",
  mpeg4a: "video/mpeg",
  mpeg4b: "video/mpeg",
  mpeg4p: "video/mpeg",
  mpeg4r: "video/mpeg",
}

const tsconfigのFile = useFile(
  () => `${sketchStore.rootのsketch}/tsconfig.json`,
  "{}"
)

// eslint-disable-next-line functional/no-let
let listener: null | (() => void) = null
onUnmounted(() => {
  previewStore.setChannel(null)
  listener?.()
})

const watchFs = new WatcherFs()

function setup() {
  const { port1, port2 } = previewStore.setChannel(new MessageChannel())

  listener?.()
  watchFs.clear()

  port1.start()

  listener = listen<Communicate>(port1, "get file", async (opts) => {
    const { pathname } = new URL(opts.url)

    window.console.log("Request file %s", pathname)

    // loadfile *.* example *.ts, *.js, eslint
    try {
      const res =
        pathname === "/"
          ? await Filesystem.readFile({
              path: `${sketchStore.rootのsketch}/index.html`,
              directory: Directory.External,
            }).then((res) => {
              return {
                content: base64ToUint8(res.data).buffer,
                ext: "html",
                path: `${sketchStore.rootのsketch}/index.html`,
              }
            })
          : await readFileWithoutExt(join(sketchStore.rootのsketch, pathname), [
              "ts",
              "tsx",
              "js",
              "jsx",
              "json",
              // " Gcss",
              // "text"
            ])

      watchFs.addWatchFile(res.path)

      if (!res) throw new Error("File does not exist.")

      const content = ["ts", "jsx", "tsx"].includes(res.ext)
        ? (await tsconfigのFile.ready,
          await compilerFile(
            res.content,
            basename(pathname),
            res.ext,
            tsconfigのFile.data
          ))
        : res.content
console.log({ content, }, `${sketchStore.rootのsketch}/index.html`)
      return {
        transfer: [content],
        return: {
          content,
          init: {
            status: 200,
            headers: {
              "content-type":
                mimeMap[res.ext as keyof typeof mimeMap] || "text/plain",
            },
          },
        },
      }
    } catch (err) {
      window.console.error({ err })
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

  watchFs.コールバックを設定(async (type, path, pathMatch) => {
    window.console.log("send request refresh:", { type, path, pathMatch })

    if (!iframeRef.value) {
      window.console.warn(
        "[refresh iframe]: can't refresh iframe because not found."
      )
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
  })

  return port2
}
async function onLoad(event: Event) {
  const port2 = setup()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ;(event.target as HTMLIFrameElement)!.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )
}
</script>
