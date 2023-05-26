<template>
  <div class="flex flex-col flex-nowrap fit">
    <PreviewNavBar
      v-model:src="srcIFrame"
      :loading="iframeLoading"
      @click:reload="iframeReload"
      @click:back="iframeBack"
      @click:forward="iframeForward"
      @click:hard-reload="iframeHardReload"
    />
    <template v-if="comLoaded">
      <iframe
        v-if="sketchStore.rootのsketch"
        :src="srcIFrame"
        class="min-h-0 fit bg-white"
        @load="iframeLoading = false"
      />
      <div v-else class="fit" />
    </template>
    <div v-else class="fit flex items-center justify-center">
      Wait for a second...
    </div>
  </div>

  <Teleport to="body">
    <iframe
      v-if="sketchStore.rootのsketch"
      :src="`${srcIFrame}/__pw-com.html`"
      ref="iframeRef"
      @load="onLoad"
      class="hidden"
    />
  </Teleport>
</template>

<script lang="ts" setup>
import { extname, join } from "path"

import { listen, ping } from "@fcanvas/communicate"
import { ComCom } from "app/preview/src/com"
import type { Communicate } from "app/preview/src/sw"
import { contentType } from "mime-types"

import { ComPreviewVue } from "./Preview.types"
import { respondWith } from "./respond-with"

const iframeRef = ref<HTMLIFrameElement>()
const previewStore = usePreviewStore()
const sketchStore = useSketchStore()
const watchFs = new WatcherFs()

// ====== status =======
const iframeLoading = ref(true)
// ====== /status ======

const srcIFrame = ref(
  process.env.GITPOD_WORKSPACE_URL
    ? process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9999-")
    : process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-9999.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : "https://preview-fcanvas.github.io"
)

// eslint-disable-next-line functional/no-let
let listenerGetFile: null | (() => void) = null
onUnmounted(() => {
  previewStore.setChannel(null)
  listenerGetFile?.()
})

watchFs.コールバックを設定(async (type, path, pathMatch) => {
  const port1 = previewStore.channel?.port1

  if (!port1) return

  window.console.log("send request refresh:", { type, path, pathMatch })

  if (!iframeRef.value) {
    window.console.warn(
      "[refresh iframe]: can't refresh iframe because not found."
    )
    return
  }

  iframeReload()

  // const forceReload = await put<ComPreviewVue>(port1, {
  //   name: "refresh",
  //   targetOrigin: "*",
  // })

  // if (forceReload) {
  //   iframeRef.value.src = ""
  //   iframeRef.value.src = srcIFrame.value
  // }
})
function iframeReload() {
  const port1 = previewStore.channel?.port1

  if (!port1) return

  iframeLoading.value = true
  ping<ComPreviewVue>(port1, "reload")
}
function iframeBack() {
  const port1 = previewStore.channel?.port1

  if (!port1) return

  ping<ComPreviewVue>(port1, "back")
}
function iframeForward() {
  const port1 = previewStore.channel?.port1

  if (!port1) return

  ping<ComPreviewVue>(port1, "forward")
}
function iframeHardReload() {
  if (!iframeRef.value) return

  iframeLoading.value = true
  comLoaded.value = false

  const { src } = iframeRef.value
  iframeRef.value.src = ""
  iframeRef.value.src = src
}

function setup() {
  const { port1, port2 } = previewStore.setChannel(new MessageChannel())

  listenerGetFile?.()

  watchFs.clear()

  port1.start()

  listenerGetFile = listen<Communicate>(port1, "get file", async (options) => {
    console.log("Request file %s", options.url)
    const url = new URL(options.url)

    // loadfile *.* example *.ts, *.js, eslint
    try {
      if (!sketchStore.rootのsketch) throw new Error("no sketch")

      const res = await respondWith(sketchStore.rootのsketch, sketchStore, url)

      console.log("%c resolved: ", "color:red", res.content)
      watchFs.addWatchFile(res.path)

      return {
        transfer: [res.content],
        return: {
          content: res.content,
          init: {
            status: 200,
            headers: {
              "content-type": contentType(res.ext) || "text/plain",
            },
          },
        },
      }
    } catch (err) {
      window.console.error({ err })
      if ((err as Error).message === "File does not exist.") {
        // static file
        // check in /public
        try {
          const content = await Filesystem.readFile({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            path: join(sketchStore.rootのsketch!, "public", url.pathname),
            directory: Directory.External,
          }).then((res) => base64ToUint8(res.data).buffer)

          return {
            transfer: [content],
            return: {
              content,
              init: {
                status: 200,
                headers: {
                  "content-type":
                    contentType(extname(url.pathname)) || "text/plain",
                },
              },
            },
          }
        } catch {
          return {
            content: null,
            init: {
              status: 404,
            },
          }
        }
      }
      return {
        content: null,
        init: {
          status: 503,
        },
      }
    }
  })

  return { port1, port2 }
}
const comLoaded = ref(false)
async function onLoad() {
  if (!iframeRef.value) return

  const { port1, port2 } = setup()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ;(iframeRef.value as HTMLIFrameElement)!.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )
  listen<ComCom>(
    port1,
    "service load",
    () => {
      comLoaded.value = true
    },
    {
      once: true,
    }
  )
}

watch(
  () => sketchStore.rootのsketch,
  (root) => {
    comLoaded.value = false
    if (!root) return

    onLoad()
  },
  { immediate: true }
)
</script>
