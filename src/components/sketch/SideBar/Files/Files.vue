<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    HEADER
    <div>
      <Icon
        icon="codicon:new-file"
        class="w-16px h-16px mr-2"
        @click="treeRef?.addFile()"
      />
      <Icon
        icon="codicon:new-folder"
        class="w-16px h-16px mr-2"
        @click="treeRef?.addFolder()"
      />
      <Icon
        v-if="clipboardFSStore.action"
        icon="material-symbols:content-paste"
        class="w-16px h-16px"
        @click="paste"
      />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <template v-if="sketchStore.fetching">
      <q-skeleton type="rect" v-for="_ in 10" :key="_" class="my-4 mx-4 h-15px" />
    </template>
    <template v-else>
      <TreeDirectory
        v-if="entryCurrent"
        class="mx--8px"
        ref="treeRef"
        :entry="entryCurrent"
        :deep-level="0"
        :sib-directories="[]"
        :sib-files="[]"
        only-child
        @load="onLoad"
        @error="onError"
      />
      <span v-else>loading entry...</span>
    </template>
  </main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useClipboardFS } from "src/stores/clipboard-fs"
import type { Entry } from "src/types/Entry"

import TreeDirectory from "./components/TreeDirectory.vue"

const clipboardFSStore = useClipboardFS()
const sketchStore = useSketchStore()

async function init() {
  await Filesystem.mkdir({
    path: "home/-1/src",
    recursive: true,
    directory: Directory.External,
  }).catch(() => false)

  await Filesystem.writeFile({
    path: "home/-1/index.html",
    data: `
<h1>Hello h1</h1>
\\<script src="/src/main.js"><\\/script>
    `.replace(/\\/g, ""),
    encoding: Encoding.UTF8,
    directory: Directory.External,
  })
  await Filesystem.writeFile({
    path: "home/-1/src/main.js",
    data: `
setInterval(() => {
  document.querySelector("h1").textContent = new Date().toString();
}, 1000)
    `,
    encoding: Encoding.UTF8,
    directory: Directory.External,
  })
}

const entryCurrent = computedAsync(
  async () => {
    const entryRoot: Entry<"directory"> = createFakeDirectory("")
    // entryRoot.directory = entryRoot

    try {
      return await readDetails<"directory">(sketchStore.rootのsketch, entryRoot)
    } catch {
      await init()
      return await readDetails<"directory">(sketchStore.rootのsketch, entryRoot)
    }
  },
  undefined,
  {
    onError(e) {
      console.error(e)
    },
  }
)

const treeRef = ref<typeof TreeDirectory>()
async function paste() {
  const path = await clipboardFSStore.paste(
    entryCurrent.value as Entry<"directory">
  )

  treeRef.value?.onChildAdded(path)
}

function onLoad() {
  console.log("on load files")
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onError(err: any) {
  console.error(err)
}
</script>
