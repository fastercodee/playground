<template>
  <div class="flex flex-col flex-nowrap h-full">
    <header
      class="py-5px px-2 border-gray-700 border-t text-12px flex flex-nowrap justify-between items-center"
    >
      CONSOLE
      <div>
        <q-btn dense round size="sm" class="mr-1" @click="console.clear()">
          <Icon icon="codicon:clear-all" width="2em" height="2em" />
        </q-btn>
        <q-btn dense round icon="close" size="sm" />
      </div>
    </header>
    <div class="overflow-y-auto h-full">
      <Console
        :data="console.value"
        :_get-list-link-async="_getListLinkAsync"
        :read-link-object-async="readLinkObjectAsync"
        :call-fn-link-async="callFnLinkAsync"
        :anchor="Anchor"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { listen, put } from "@fcanvas/communicate"
import { Icon } from "@iconify/vue"
import type { ComPreviewCore } from "app/preview/src/preview-core"
import { Console, DataAPI, Encode } from "vue-console-feed"
import type { Data } from "vue-console-feed"
import type {
  _getListLink,
  callFnLink,
  readLinkObject,
} from "vue-console-feed/encode"

import "vue-console-feed/style.css"
import type { ComPreviewVue } from "./Preview.types"

const console = new DataAPI(true)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HPromise<T extends (...args: any) => any> = (...args: Parameters<T>) => any

const _getListLinkAsync = ref<HPromise<typeof _getListLink>>()
const readLinkObjectAsync = ref<HPromise<typeof readLinkObject>>()
const callFnLinkAsync = ref<HPromise<typeof callFnLink>>()

const previewStore = usePreviewStore()

// eslint-disable-next-line functional/no-let
let init = true
watch(
  () => previewStore.channel,
  (channel) => {
    if (!channel) {
      if (!init) console.warn(Encode("Channel is not defined."))
      return
    }

    setupConsole(channel.port1)
    init = false
  }
)

function setupConsole(port1: MessagePort) {
  listen<ComPreviewCore, "console">(port1, "console", (opts) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    ;(console[opts.type] as unknown as Function)(...(opts.args as unknown[]))
  })

  function createAPIAsync(
    type: "_getListLink" | "readLinkObject" | "callFnLink"
  ) {
    return (link: Data.Link) => {
      window.console.log("call help %s", type, link)

      return put<ComPreviewVue, typeof type>(port1, type, link)
    }
  }

  _getListLinkAsync.value = createAPIAsync("_getListLink")
  readLinkObjectAsync.value = createAPIAsync("readLinkObject")
  callFnLinkAsync.value = createAPIAsync("callFnLink")
}
function Anchor(options: { text: string; href: string }) {
  return h(
    "a",
    {
      href: options.href,
    },
    [options.text]
  )
}
</script>
