<!-- eslint-disable vue/no-useless-template-attributes -->
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
      <template
        v-for="[, metaItem] in meta.children.dirs"
        :key="metaItem.fullPath"
      >
        <SearchTreeDirectory
          v-if="existsMatch(metaItem)"
          :meta="metaItem"
          :deep-level="deepLevel + 1"
          @click:close="emit('click:close-item', metaItem.fullPath, true)"
          @click:replace="
            replaceMultiMatchesTree(metaItem.children, replace).then(() =>
              emit('click:close-item', metaItem.fullPath, true)
            )
          "
          @click:close-item="
            (full: string, isDir: boolean) => emit('click:close-item', full, isDir)
          "
        />
      </template>
      <template
        v-for="[, { fullPath, matches }] in meta.children.files"
        v-memo="[fullPath, matches.length, deepLevel]"
        :key="fullPath"
      >
        <SearchFlat
          v-if="matches.length > 0"
          mode-tree
          :fullpath="fullPath"
          :matches="matches"
          :style-main="{
            paddingLeft: 8 + 7 * deepLevel + 'px',
          }"
          @click:close-match="emit('click:close-match', fullPath, $event)"
          @click:replace-match="
            (fullPath: string, match: Match) => replaceMatch(fullPath, match, replace)
          "
          @click:close="emit('click:close-item', fullPath, false)"
          @click:replace="
            replaceMatches(fullPath, matches, replace).then(() =>
              emit('click:close-item', fullPath, false)
            )
          "
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia"
import type { TreeDir } from "src/logic/flat-to-tree"
import {
  replaceMatch,
  replaceMatches,
  replaceMultiMatchesTree,
} from "src/logic/replace-ctx-file"
import type { Match } from "src/logic/search-text"

defineProps<{
  meta: TreeDir<Match[]>
  deepLevel: number

  onlyChild?: boolean
}>()
const emit = defineEmits<{
  (name: "click:close"): void
  (name: "click:replace"): void
  (name: "click:close-match", fullPath: string, match: Match): void
  (name: "click:close-item", fullPath: string, isDir: boolean): void
}>()

const searchStore = useSearchStore()

const { replace } = storeToRefs(searchStore)

const opening = ref(true)

function existsMatch(dir: TreeDir<Match[]>): boolean {
  for (const [, { matches }] of dir.children.files) {
    if (matches.length > 0) return true
  }

  for (const [, _] of dir.children.dirs) {
    if (existsMatch(_)) return true
  }

  return false
}
</script>
