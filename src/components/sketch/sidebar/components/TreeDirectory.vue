<template>
  <div>
    <TreeDirectoryMain
      :entry="entry"
      :opening="opening"
      :actions="contextmenu"
      :sib-directories="sibDirectories"
      :sib-files="sibFiles"
      @click="opening = !opening"
      @renamed="emit('renamed', $event)"
      @deleted="emit('deleted')"
    />

    <div v-if="opening">
      <!-- add dir -->
      <NewDirectory
        v-if="creating === 'directory'"
        type="directory"
        :style="{
          paddingLeft: 7 * deepLevel + 7 + 'px',
        }"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @save="createDirectory($event, true)"
        @cancel="creating = null"
      />
      <!-- /add dir -->
      <TreeDirectory
        v-for="(item, index) in decevier.directories"
        :key="index"
        :entry="item"
        :deep-level="deepLevel + 1"
        :style="{
          paddingLeft: 7 * deepLevel + 7 + 'px',
        }"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
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
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @save="createDirectory($event, false)"
        @cancel="creating = null"
      />
      <!-- /add file-->
      <div
        v-for="(item, index) in decevier.files"
        :key="index"
        :style="{
          paddingLeft: 19 + 7 + 7 * deepLevel + 'px',
        }"
      >
        <TreeDirectoryMain
          :entry="item"
          :opening="false"
          :sib-directories="decevier.directories"
          :sib-files="decevier.files"
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
  entry: Entry<"directory">
  deepLevel: number

  sibDirectories: Entry<"directory">[]
  sibFiles: Entry<"file">[]
}>()
const emit = defineEmits<{
  (name: "renamed", newName: string): void
  (name: "deleted"): void
}>()

const opening = ref(false)
const decevier = computedAsync(() => directoryDetails(props.entry))

const creating = ref<"file" | "directory" | null>(null)

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
      creating.value = "directory"
    },
  },
  {
    divider: true,
  },
]

function sortEntries(entries: Entry[]) {
  entries.sort((a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0))
}
async function createDirectory(name: string, isDir: boolean) {
  creating.value = null
  if (isDir) {
    await Filesystem.mkdir({
      path: `${props.entry.fullPath()}/${name}`,
      directory: Directory.External,
    })
    decevier.value.directories.push(await readDetails(name, props.entry))
    sortEntries(decevier.value.directories)
  } else {
    await Filesystem.writeFile({
      path: `${props.entry.fullPath()}/${name}`,
      data: "",
      encoding: Encoding.UTF8,
      directory: Directory.External,
    })
    decevier.value.files.push(await readDetails(name, props.entry))
    sortEntries(decevier.value.files)
  }

  console.log("create item: %s", name)
}
function onChildRenamed(item: Entry, entries: Entry[], newName: string) {
  item.name = newName
  sortEntries(entries)
}
</script>
