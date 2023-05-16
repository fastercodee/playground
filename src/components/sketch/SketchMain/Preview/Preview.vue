<template>
  <iframe
    v-if="sketchStore.rootのsketch"
    :src="srcIFrame"
    class="w-full h-full border border-light-600 bg-white"
    ref="iframeRef"
    @load="onLoad"
  />
  <div v-else class="w-full h-full border border-gray-700" />
</template>

<script lang="ts" setup>
import { listen, put } from "@fcanvas/communicate"
import type { Communicate } from "app/preview/src/sw"

import { useRespondWith } from "./respond-with"

const iframeRef = ref<HTMLIFrameElement>()
const previewStore = usePreviewStore()
const sketchStore = useSketchStore()
const watchFs = new WatcherFs()
const respondWith = useRespondWith(watchFs)

const srcIFrame = process.env.GITPOD_WORKSPACE_URL
  ? process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9999-")
  : process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-9999.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : "https://preview-fcanvas.github.io"

// eslint-disable-next-line functional/no-let
let listener: null | (() => void) = null
onUnmounted(() => {
  previewStore.setChannel(null)
  listener?.()
})

function setup() {
  const { port1, port2 } = previewStore.setChannel(new MessageChannel())

  listener?.()
  watchFs.clear()

  port1.start()

  listener = listen<Communicate>(port1, "get file", respondWith)

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
async function onLoad() {
  if (!iframeRef.value) return

  const port2 = setup()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ;(iframeRef.value as HTMLIFrameElement)!.contentWindow!.postMessage(
    { port2 },
    { transfer: [port2], targetOrigin: "*" }
  )
}

watch(
  () => sketchStore.rootのsketch,
  (root) => {
    if (!root) return

    onLoad()
  },
  { immediate: true }
)
</script>
