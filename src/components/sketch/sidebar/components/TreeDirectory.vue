<template>
  <div>
    <TreeDirectoryMain
      v-if="!onlyChild"
      :entry="entry"
      :opening="opening"
      :actions="contextmenu"
      :sib-directories="sibDirectories"
      :sib-files="sibFiles"
      :style="{
        paddingLeft: deepLevel * 7 + 8 + 'px',
      }"
      @click="opening = !opening"
      @renamed="emit('renamed', $event)"
      @deleted="emit('deleted')"
      @child-added="onChildAdded"
    />

    <div v-if="opening && decevier">
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
        v-for="item in decevier.directories"
        :key="item.name"
        :entry="item"
        :deep-level="deepLevel + 1"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @renamed="onChildRenamed(item, decevier!.directories, $event)"
        @deleted="
          decevier!.directories.splice(
            decevier!.directories.indexOf(item) >>> 0,
            1
          )
        "
        @child-added="onChildAdded"
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
      <TreeDirectoryMain
        v-for="item in decevier.files"
        :key="item.name"
        :style="{
          paddingLeft: 19 + 8 + 7 + 7 * deepLevel + 'px',
        }"
        :class="{
          'bg-[rgba(100,100,100,0.2)]': seasonEditStore.isCurrent(item),
        }"
        :entry="item"
        :opening="false"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @click="seasonEditStore.openFile(item)"
        @renamed="onChildRenamed(item, decevier!.files, $event)"
        @deleted="
          decevier!.files.splice(decevier!.files.indexOf(item) >>> 0, 1)
        "
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSeasonEdit } from "src/stores/season-edit"
import type { Entry } from "src/types/Entry"

const props = defineProps<{
  entry: Entry<"directory">
  deepLevel: number

  sibDirectories: Entry<"directory">[]
  sibFiles: Entry<"file">[]

  onlyChild?: boolean
}>()
const emit = defineEmits<{
  (name: "renamed", newName: string): void
  (name: "deleted"): void
  (
    name: "child-added",
    info: {
      parent: boolean
      name: string
    }
  ): void
  (name: "load"): void
  (name: "error", event: any): void
}>()

const seasonEditStore = useSeasonEdit()

const opening = ref(props.onlyChild)
const decevier = ref<{
  files: Entry<"file">[]
  directories: Entry<"directory">[]
} | null>(null) // computedAsync(() => directoryDetails(props.entry))

async function loadDecevier() {
  if (!decevier.value) decevier.value = await directoryDetails(props.entry)
}
watch(opening, (opening) => {
  if (opening) loadDecevier()
})
if (props.onlyChild) {
  loadDecevier()
    .then(() => emit("load"))
    .catch((err) => emit("error", err))
}

const creating = ref<"file" | "directory" | null>(null)

const contextmenu = [
  {
    icon: "codicon:new-file",
    name: "Add file",
    onClick: addFile,
  },
  {
    icon: "codicon:new-folder",
    name: "Add folder",
    onClick: addFolder,
  },
  {
    divider: true,
  },
]

function addFile() {
  opening.value = true
  creating.value = "file"
}
function addFolder() {
  opening.value = true
  creating.value = "directory"
}

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    decevier.value!.directories.push(await readDetails(name, props.entry))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sortEntries(decevier.value!.directories)
  } else {
    const path = `${props.entry.fullPath()}/${name}`
    await Filesystem.writeFile({
      path,
      data: "",
      encoding: Encoding.UTF8,
      directory: Directory.External,
    })
    eventBus.emit('write-file', path)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    decevier.value!.files.push(await readDetails(name, props.entry))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sortEntries(decevier.value!.files)
  }

  console.log("create item: %s", name)
}
function onChildRenamed(item: Entry, entries: Entry[], newName: string) {
  item.name = newName
  sortEntries(entries)
}
async function onChildAdded(info: { parent: boolean; name: string }) {
  if (info.parent) {
    return emit("child-added", info)
  }

  const entry = await readDetails(info.name, props.entry)
  if (!decevier.value) await loadDecevier()
  const entries =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    entry.type === "file" ? decevier.value!.files : decevier.value!.directories

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entries.push(entry as unknown as any)
  sortEntries(entries)
  opening.value = true
}

defineExpose({ onChildAdded, addFile, addFolder })
</script>
