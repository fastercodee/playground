<template>
  <header class="py-2 px-3 text-[12px] flex justify-between">
    HEADER
    <div>
      <Icon icon="codicon:new-file" class="w-[16px] h-[16px] mr-2" />
      <Icon icon="codicon:new-folder" class="w-[16px] h-[16px]" />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <TreeDirectory
      v-if="entryCurrent"
      :entry="entryCurrent"
      :deep-level="0"
      :sib-directories="[]"
      :sib-files="[]"
    />
    <span v-else>loading entry...</span>
  </main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import type { Entry } from "src/types/Entry"

async function init() {
  await Filesystem.mkdir({
    path: "current/src",
    recursive: true,
    directory: Directory.External
  }).catch(() => false)

  await Filesystem.writeFile({
    path: "current/index.html",
    data: "hello index.html",
    encoding: Encoding.UTF8,
    directory: Directory.External
  })
  await Filesystem.writeFile({
    path: "current/src/main.js",
    data: 'console.log("hello main.js")',
    encoding: Encoding.UTF8,
    directory: Directory.External
  })
}

const entryCurrent = computedAsync(
  async () => {
    const entryRoot: Entry<"directory"> = {
      fullPath: () => "",
      name: "",
      type: "directory",
      directory: null as unknown as any,
    }
    // entryRoot.directory = entryRoot

    try {
      return await readDetails<"directory">("current", entryRoot)
    } catch {
      await init()
      return await readDetails<"directory">("current", entryRoot)
    }
  },
  undefined,
  {
    onError(e) {
      console.error(e)
    },
  }
)
</script>
