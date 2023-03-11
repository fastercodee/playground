<template>
  <div class="cursor-pointer">
    <div
      class="py-[3px] flex items-center relative before:absolute before:w-full before:h-full before:left-0 before:top-0 before:z-[-1] hover:before:content-DEFAULT hover:before:bg-dark-600"
      :class="{
        hidden: renaming,
        'before:content-DEFAULT !before:bg-dark-300':
          filepath === editorStore.currentSelect
      }"
      :style="{
        paddingLeft: paddingLeft + 20 + 'px'
      }"
      @click="onClick"
    >
      <Icon
        v-if="loading"
        icon="eos-icons:loading"
        class="w-[1.25rem] h-[1.25rem] ml-[-1.25rem]"
      />
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath
          })
        "
      />
      <span class="text-[14px] pl-2">{{ filename }}</span>
    </div>

    <RenameFileOrDir
      v-if="renaming"
      :dir="false"
      :default-value="filename"
      @save="rename"
      @blur="renaming = false"
      :style="{
        paddingLeft: paddingLeft + 'px'
      }"
    />

    <Menu :menu="menu" context-menu />
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname, join } from "path"

import { Icon } from "@iconify/vue"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import Menu from "src/components/ui/Menu.vue"
import type { FS } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { computed, ref } from "vue"

import RenameFileOrDir from "./RenameFileOrDir.vue"

const props = defineProps<{
  filepath: string
  fs: FS

  paddingLeft: number
}>()

const editorStore = useEditorStore()

const filename = computed(() => basename(props.filepath))
const renaming = ref(false)
const loading = ref(false)

function onClick() {
  editorStore.currentSelect = props.filepath

  editorStore.currentFile = props.filepath
}

const menu = [
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
    onClick: () => unlink()
  }
]

async function rename(newFileName: string) {
  const newPath = join(dirname(props.filepath), newFileName)

  console.log("rename %s => %s", props.filepath, newPath)

  loading.value = true
  await props.fs.rename(props.filepath, newPath)

  loading.value = false
}
async function unlink() {
  loading.value = true
  await props.fs.unlink(props.filepath)
}
</script>
