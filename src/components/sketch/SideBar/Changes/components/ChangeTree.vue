<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div>
    <ChangeBaseMain
      v-if="!onlyChild"
      type="directory"
      :opening="opening"
      staged
      mode-tree
      :fullpath="meta.fullPath"
      :style="{
        paddingLeft: deepLevel * 7 + 'px',
      }"
      @click="opening = !opening"
      @click:add="sketchStore.addChanges(meta)"
      @click:undo="sketchStore.undoChanges(meta)"
      @click:remove-stage="sketchStore.removeChanges(meta)"
    />

    <div v-if="onlyChild || opening">
      <ChangeTree
        v-for="[, metaItem] in meta.children.dirs"
        :key="metaItem.fullPath"
        :meta="metaItem"
        :deep-level="deepLevel + 1"
        :staged="staged"
      />

      <ChangeFlat
        v-for="[, { fullPath, matches: status }] in meta.children.files"
        v-memo="[fullPath, status, deepLevel]"
        :key="fullPath"
      mode-tree
        :staged="staged"
        type="file"
        :fullpath="fullPath"
        :status="status"
        :style="{
          paddingLeft: 16 + 7 + 7 * deepLevel + 'px',
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TreeDir } from "src/logic/flat-to-tree"
import { StatusChange } from "src/stores/sketch"

defineProps<{
  meta: TreeDir<StatusChange>
  deepLevel: number

  staged?: boolean

  onlyChild?: boolean
}>()

const sketchStore = useSketchStore()

const opening = ref(true)
</script>
