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
        v-for="[name, metaItem] in meta.children.dirs"
        :key="metaItem.fullPath"
      >
        <SearchTreeDirectory
          v-if="existsMatch(metaItem)"
          :meta="metaItem"
          :deep-level="deepLevel + 1"
          @click:close="meta.children.dirs.delete(name)"
          @click:replace="
            replaceMultiMatchesTree(metaItem.children, replace).then(() =>
              meta.children.dirs.delete(name)
            )
          "
        />
      </template>
      <template
        v-for="[name, { fullPath, matches }] in meta.children.files"
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
          @click:close-item="matches.splice(matches.indexOf($event) >>> 0, 1)"
          @click:replace-item="
            (fullPath, match) =>
              replaceMatch(fullPath, match, replace).then(() =>
                matches.splice(matches.indexOf(match) >>> 0, 1)
              )
          "
          @click:close="meta.children.files.delete(name)"
          @click:replace="
            replaceMatches(fullPath, matches, replace).then(() =>
              meta.children.files.delete(name)
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

defineProps<{
  meta: TreeDir
  deepLevel: number

  onlyChild?: boolean
}>()
const emit = defineEmits<{
  (name: "click:close"): void
  (name: "click:replace"): void
}>()

const searchStore = useSearchStore()

const { replace } = storeToRefs(searchStore)

const opening = ref(true)

function existsMatch(dir: TreeDir): boolean {
  for (const [, { matches }] of dir.children.files) {
    if (matches.length > 0) return true
  }

  for (const [, _] of dir.children.dirs) {
    if (existsMatch(_)) return true
  }

  return false
}
</script>
