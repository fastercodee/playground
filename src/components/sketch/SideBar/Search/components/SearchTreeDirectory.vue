<template>
  <div>
    <SearchFlatMain
      v-if="!onlyChild"
      type="directory"
      mode-tree
      :opening="opening"
      :fullpath="meta.fullPath"
      :count="meta.children.dirs.size + meta.children.files.size"
      :style="{
        paddingLeft: deepLevel * 7 + 'px',
      }"
      @click="opening = !opening"
      @click:close="emit('click:close')"
      @click:replace="emit('click:replace')"
    />

    <div v-if="onlyChild || opening">
      <SearchTreeDirectory
        v-for="[name, metaItem] in meta.children.dirs"
        v-memo="[metaItem, deepLevel]"
        :key="metaItem.fullPath"
        :meta="metaItem"
        :deep-level="deepLevel + 1"
        @click:close="meta.children.dirs.delete(name)"
        @click:replace="replaceMultiMatches(metaItem.children)"
      />
      <SearchFlat
        v-for="[name, { fullPath, matches }] in meta.children.files"
        v-memo="[fullPath, matches, deepLevel]"
        mode-tree
        :key="fullPath"
        :fullpath="fullPath"
        :matches="matches"
        :style-main="{
          paddingLeft: 8 + 7 * deepLevel + 'px',
        }"
        @click:close-item="matches.splice(matches.indexOf($event) >>> 0, 1)"
        @click:replace-item="replaceMatch"
        @click:close="meta.children.files.delete(name)"
        @click:replace="replaceMatches(fullPath, matches)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TreeDir } from "src/logic/flat-to-tree"

import {
  replaceMatch,
  replaceMatches,
  replaceMultiMatches,
} from "../logic/replace-fns"

defineProps<{
  meta: TreeDir
  deepLevel: number

  onlyChild?: boolean
}>()
const emit = defineEmits<{
  (name: "click:close"): void
  (name: "click:replace"): void
}>()

const opening = ref(true)
</script>
