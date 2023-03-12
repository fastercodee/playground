<template>
  <header class="py-2 px-3 text-[12px] flex justify-between">
    HEADER
    <div>
      <Icon icon="codicon:new-file" class="w-[16px] h-[16px] mr-2" />
      <Icon icon="codicon:new-folder" class="w-[16px] h-[16px]" />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <TreeDirectory v-if="entryCurrent" :entry="entryCurrent" :deep-level="0" />
    <span v-else>loading entry...</span>
  </main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import type { Entry } from "src/types/Entry"

async function init() {
  await fs.mkdir("/current")
  await fs.mkdir("/current/src")

  await fs.writeFile("/current/index.html", "hello index.html")
  await fs.writeFile("/current/src/main.js", 'console.log("hello main.js")')
}

const entryCurrent = computedAsync(async () => {
  const entryRoot: Entry<"dir"> = {
    fullPath: () => '',
    name: "",
    type: "dir",
    directory: null as unknown as any,
  }
  // entryRoot.directory = entryRoot

  try {
    return await readDetails<"dir">("current", entryRoot)
  } catch {
    await init()
    return await readDetails<"dir">("current", entryRoot)
  }
})
</script>
