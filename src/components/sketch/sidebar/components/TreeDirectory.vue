<template>
  <div>
    <TreeDirectoryMain
      :entry="entry"
      :opening="opening"
      :actions="contextmenu"
      @click="opening = !opening"
      @renamed="emit('renamed')"
      @deleted="emit('deleted')"
    />

    <div v-if="opening">
      <!-- add dir -->
      <NewDirectory
        v-if="creating === 'dir'"
        type="dir"
        :style="{
          paddingLeft: 7 * deepLevel + 7 + 'px',
        }"
        @save="createDirectory($event, true)"
        @cancel="creating = null"
      />
      <!-- /add dir -->
      <TreeDirectory
        v-for="item in decevier.directories"
        :key="item.fullPath"
        :entry="item"
        :deep-level="deepLevel + 1"
        :style="{
          paddingLeft: 7 * deepLevel + 7 + 'px',
        }"
        @renamed="onChildRenamed(item, decevier.directories, $event)"
        @deleted="
          decevier.files.splice(decevier.directories.indexOf(item) >>> 0, 1)
        "
      />

      <!-- add file -->
      <NewDirectory
        v-if="creating === 'file'"
        type="file"
        :style="{
          paddingLeft: 19 + 7 + 7 * deepLevel + 'px',
        }"
        @save="createDirectory($event, false)"
        @cancel="creating = null"
      />
      <!-- /add file-->
      <div
        v-for="item in decevier.files"
        :key="item.fullPath"
        :style="{
          paddingLeft: 19 + 7 + 7 * deepLevel + 'px',
        }"
      >
        <TreeDirectoryMain
          :entry="item"
          :opening="false"
        @renamed="onChildRenamed(item, decevier.files, $event)"
          @deleted="
            decevier.files.splice(decevier.files.indexOf(item) >>> 0, 1)
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Entry } from "src/types/Entry"

const props = defineProps<{
  entry: Entry<"dir">
  deepLevel: number
}>()
const emit = defineEmits<{
  (name: "renamed", newName: string): void
  (name: "deleted"): void
}>()

const opening = ref(false)
const decevier = computedAsync(() => directoryDetails(props.entry))

const creating = ref<"file" | "dir" | null>(null)

const contextmenu = [
  {
    icon: "codicon:new-file",
    name: "Add file",
    onClick() {
      opening.value = true
      creating.value = "file"
    },
  },
  {
    icon: "codicon:new-folder",
    name: "Add folder",
    onClick() {
      opening.value = true
      creating.value = "dir"
    },
  },
  {
    divider: true,
  },
]

async function createDirectory(name: string, isDir: boolean) {
  creating.value = null
  if (isDir) {
    await fs.mkdir(`${props.entry.fullPath}/${name}`)
    decevier.value.directories.push(await readDetails(name, props.entry))
  } else {
    await fs.writeFile(`${props.entry.fullPath}/${name}`, "")
    decevier.value.files.push(await readDetails(name, props.entry))
  }

  console.log("create item: %s", name)
}
function onChildRenamed(item: Entry, entries: Entry[], newName: string) {

  
}
</script>
