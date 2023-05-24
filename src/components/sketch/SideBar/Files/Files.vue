<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    <div class="min-h-0 truncate">{{ entryCurrent?.name ?? "HEADER" }}</div>
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
  <MainFileLoading v-if="sketchStore.fetching" />
  <main v-else-if="sketchStore.rootのsketch" class="min-h-0 h-full select-none">
    <TreeDirectory
      v-if="entryCurrent"
      class="mx--8px"
      ref="treeRef"
      :entry="entryCurrent"
      :deep-level="0"
      :sib-directories="{}"
      :sib-files="{}"
      only-child
      @load="onLoad"
      @error="onError"
    />
    <span v-else>loading entry...</span>
  </main>
  <MainOpenSketch v-else />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useClipboardFS } from "src/stores/clipboard-fs"
import type { Entry } from "src/types/Entry"

import TreeDirectory from "./components/TreeDirectory.vue"

const clipboardFSStore = useClipboardFS()
const sketchStore = useSketchStore()

const entryCurrent = computedAsync(
  async () => {
    if (!sketchStore.dirnameSketch) return

    const entryRoot: Entry<"directory"> = createFakeDirectory("home")
    // entryRoot.directory = entryRoot
    return await readDetails<"directory">(sketchStore.dirnameSketch, entryRoot)
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
