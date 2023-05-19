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
        v-for="(item, name) in decevier.directories"
        :key="name"
        :entry="item"
        :deep-level="deepLevel + 1"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @renamed="onChildRenamed(item, decevier!.directories, $event)"
        @deleted="delete decevier.directories[name]"
        @child-added="onChildAdded"
      />

      <!-- add file -->
      <NewDirectory
        v-if="creating === 'file'"
        type="file"
        :style="{
          paddingLeft: 16 + 7 + 7 * deepLevel + 'px',
        }"
        :sib-directories="decevier.directories"
        :sib-files="decevier.files"
        @save="createDirectory($event, false)"
        @cancel="creating = null"
      />
      <!-- /add file-->
      <TreeDirectoryMain
        v-for="(item, name) in decevier.files"
        :key="name"
        :style="{
          paddingLeft: 17 + 8 + 7 + 7 * deepLevel + 'px',
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
        @deleted="delete decevier.files[name]"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { basename } from "path"

import { useSeasonEdit } from "src/stores/season-edit"
import type { Entry } from "src/types/Entry"

const props = defineProps<{
  entry: Entry<"directory">
  deepLevel: number

  sibDirectories: Record<string, Entry<"directory">>
  sibFiles: Record<string, Entry<"file">>

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (name: "error", event: any): void
}>()

const seasonEditStore = useSeasonEdit()

const opening = ref(props.onlyChild)
const decevier = ref<{
  files: Record<string, Entry<"file">>
  directories: Record<string, Entry<"directory">>
} | null>(null) // computedAsync(() => directoryDetails(props.entry))

async function loadDecevier(force = false) {
  if (!force && decevier.value) return

  decevier.value =
    props.deepLevel === 0
      ? await directoryDetails(props.entry).then((res) => {
          delete res.directories[".changes"]
          return res
        })
      : await directoryDetails(props.entry)
}
watch(opening, (opening) => {
  if (opening) loadDecevier()
})
watch(
  () => props.entry,
  () => {
    if (props.onlyChild || opening.value) {
      decevier.value = null
      loadDecevier()
        .then(() => emit("load"))
        .catch((err) => emit("error", err))
    }
  },
  { immediate: true }
)
eventBus.watch(
  computed(() => props.entry.fullPath),
  async (タイプ, パス) => {
    if (タイプ === "rmdir") return

    if (タイプ === "copyDir") {
      // check
      if (decevier.value && basename(パス) in decevier.value.directories) return
    } else {
      if (decevier.value && basename(パス) in decevier.value.files) return
    }

    await loadDecevier(true)
  },
  { dir: true, deep: false }
)

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

function sortEntries(entries: Record<string, Entry<"file" | "directory">>) {
  Object.keys(entries)
    .sort()
    .forEach((key) => {
      const val = entries[key]
      delete entries[key]
      entries[key] = val
    })
}
async function createDirectory(name: string, isDir: boolean) {
  creating.value = null
  const path = `${props.entry.fullPath}/${name}`
  if (isDir) {
    await Filesystem.mkdir({
      path,
      directory: Directory.External,
    })
    eventBus.emit("copyDir", path)
  } else {
    await Filesystem.writeFile({
      path,
      data: "",
      encoding: Encoding.UTF8,
      directory: Directory.External,
      recursive: true
    })
    eventBus.emit("writeFile", path)
  }

  console.log("create item: %s", name)
}
function onChildRenamed(
  item: Entry<"file" | "directory">,
  entries: Record<string, Entry<"file" | "directory">>,
  newName: string
) {
  item.name = newName
  sortEntries(entries)
}
async function onChildAdded(info: { parent: boolean; name: string }) {
  if (info.parent) {
    return emit("child-added", info)
  }

  opening.value = true
}

defineExpose({ onChildAdded, addFile, addFolder })
</script>
