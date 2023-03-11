<template>
  <div class="select-none cursor-pointer">
    <template v-if="!show">
      <div
        class="py-[3px] flex items-center relative before:absolute before:w-full before:h-full before:left-0 before:top-0 before:z-[-1] hover:before:content-DEFAULT hover:before:bg-dark-600"
        :class="{
          hidden: renaming,
          'before:content-DEFAULT !before:bg-dark-300':
            filepath === editorStore.currentSelect
        }"
        @click="onClick"
      >
        <Icon
          v-if="loading"
          icon="eos-icons:loading"
          class="w-[1.25rem] h-[1.25rem]"
        />
        <Icon
          v-else
          icon="material-symbols:chevron-right"
          class="text-[1.2rem]"
          :class="{
            'transform rotate-90': opened
          }"
        />
        <img
          class="w-[1.2rem] h-[1.2rem]"
          :src="
            getIcon({
              light: false,
              isFolder: true,
              isOpen: opened,
              filepath
            })
          "
        />
        <span class="text-[14px] pl-2 truncate">{{ filename }}</span>
      </div>

      <RenameFileOrDir
        v-if="renaming"
        :dir="false"
        :default-value="filename"
        @save="rename"
        @blur="renaming = false"
      />
    </template>

    <Menu :menu="menu" context-menu v-if="!show" />

    <div v-show="opened">
      <template
        v-for="(isDir, filepath) in adding
          ? sortListFiles({ '': adding === 'dir', ...files })
          : files"
        :key="filepath"
      >
        <RenameFileOrDir
          v-if="filepath === ''"
          :style="{
            paddingLeft: (paddingLeft ?? 0) + 'px'
          }"
          :dir="isDir"
          :siblings="siblings"
          @save="createNewFile($event, isDir)"
          @blur="adding = false"
        />
        <FileTreeMixture
          v-else
          :padding-left="paddingLeft ?? 0"
          :dir="isDir"
          :filepath="filepath"
          :fs="fs"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname, join } from "path"

import { Icon } from "@iconify/vue"
import { throttle } from "quasar"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"

import FileTreeMixture from "./FileTreeMixture.vue"
import RenameFileOrDir from "./RenameFileOrDir.vue"
import { sortListFiles } from "./sortListFiles"

const props = defineProps<{
  filepath: string
  show?: true

  paddingLeft?: number
}>()
const emit = defineEmits<{
  (name: "rename", value: string): void
  (name: "unlink"): void
}>()

const filename = computed(() => basename(props.filepath))
const renaming = ref(false)
const loading = ref(false)
const opened = ref(props.show ?? false)

const files = ref<Record<string, boolean>>({})
const siblings = computed(() =>
  Object.keys(files.value).map((file) => basename(file))
)
const adding = ref<false | "file" | "dir">(false)

function onClick() {
  editorStore.currentSelect = props.filepath
  opened.value = !opened.value
}

const menu = [
  {
    icon: "mdi-note-add-outline",
    name: "New File",
    onClick: createFile
  },
  {
    icon: "material-symbols:create-new-folder-outline",
    name: "New Folder",
    onClick: createDir
  },
  {
    divider: true
  },
  {
    icon: "material-symbols:content-cut-rounded",
    name: "Cut",
    sub: "⌘X"
  },
  {
    icon: "material-symbols:content-copy-outline",
    name: "Copy",
    sub: "⌘C"
  },
  {
    icon: "material-symbols:content-paste",
    name: "Paste",
    sub: "⌘V"
  },
  {
    divider: true
  },
  {
    icon: "material-symbols:drive-file-rename-outline-outline",
    name: "Rename",
    onClick() {
      renaming.value = true
    }
  },
  {
    icon: "material-symbols:delete-outline",
    name: "Delete",
    onClick: unlink
  }
]

const watcher = watch(opened, (state) => {
  if (state) {
    reloadDir()
    watcher()
  }
})

// =========== actions =============
async function rename(newFileName: string) {
  const newPath = join(dirname(props.filepath), newFileName)

  console.log("rename %s => %s", props.filepath, newPath)

  loading.value = true
  await fs.rename(props.filepath, newPath)
  loading.value = false

  emit("rename", newPath)
}
async function createNewFile(newFileName: string, isDir: boolean) {
  const newPath = join(props.filepath, newFileName)

  loading.value = true
  if (isDir) await fs.mkdir(newPath)
  else await fs.writeFile(newPath, "")
  loading.value = false

  files.value = sortListFiles({
    ...files.value,
    [newPath]: isDir
  })
}
const reloadDir = throttle(async function () {
  try {
    const filesName = await fs.readdir(props.filepath)

    files.value = sortListFiles(
      Object.fromEntries(
        await Promise.all(
          filesName.map(async (name) => {
            const path = join(props.filepath, name)

            const isDir = (await fs.lstat(path)).isDirectory()

            return [path, isDir]
          })
        )
      )
    )
  } catch (err) {
    console.warn(err)
  } finally {
    loading.value = false
  }
}, 1e3)
async function unlink() {
  loading.value = true
  await props.fs.unlink(props.filepath)

  emit("unlink")
}
async function createFile() {
  opened.value = true
  adding.value = "file"
}
async function createDir() {
  opened.value = true
  adding.value = "dir"
}
// =================================

if (opened.value) {
  reloadDir()
  watcher()
}

async function handlerDirChange(filepath: string, exists: boolean) {
  if (dirname(filepath) === props.filepath) {
    console.log("this event for me %s", props.filepath)

    if (exists) {
      if (!(filepath in files.value))
        files.value = sortListFiles({
          ...files.value,
          [filepath]: (await fs.lstat(filepath)).isDirectory()
        })
    } else {
      delete files.value[filepath]
    }
  }
}

const handlerWrite = (file: string) => handlerDirChange(file, true)
const handlerUnlink = (file: string) => handlerDirChange(file, false)

fs.events.on("write", handlerWrite)
fs.events.on("unlink", handlerUnlink)
onBeforeUnmount(() => {
  fs.events.off("write", handlerWrite)
  fs.events.off("unlink", handlerUnlink)
})

defineExpose({
  createFile,
  createDir,
  reloadDir
})
</script>
