<template>
  <FileTreeItemFile
    v-if="!dir"
    :filepath="filepath"
    :fs="fs"
    :padding-left="paddingLeft"
  />
  <FileTree
    v-else
    :filepath="filepath"
    :fs="fs"
    :show="show"
    :padding-left="paddingLeft + 8"
  />
</template>

<script lang="ts" setup>
import type { FS } from "src/modules/fs"

import FileTree from "./FileTree.vue"
import FileTreeItemFile from "./FileTreeItemFile.vue"

defineProps<{
  dir: boolean
  filepath: string
  fs: FS
  show?: true

  paddingLeft: number
}>()
</script>
