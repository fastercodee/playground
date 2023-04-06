<template>
  <div>
    <SearchFlatMain
      v-if="!onlyChild"
      type="directory"
      mode-tree
      :opening="opening"
      :fullpath="meta.fullPath"
      :style="{
        paddingLeft: deepLevel * 7 + 'px',
      }"
      @click="opening = !opening"
    />

    <div v-if="onlyChild || opening">
      <SearchTreeDirectory
        v-for="[, metaItem] in meta.children.dirs"
        :key="metaItem.fullPath"
        :meta="metaItem"
        :deep-level="deepLevel + 1"
      />
      <SearchFlat
        v-for="[, { fullPath, matches }] in meta.children.files"
        mode-tree
        :key="fullPath"
        :fullpath="fullPath"
        :matches="matches"
        :style-main="{
          paddingLeft: 8 + 7 * deepLevel + 'px',
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TreeDir } from "src/logic/flat-to-tree"

defineProps<{
  meta: TreeDir
  deepLevel: number

  onlyChild?: boolean
}>()

const opening = ref(true)
</script>
