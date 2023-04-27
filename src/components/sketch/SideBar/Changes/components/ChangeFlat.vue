<template>
  <ChangeBaseMain
    :opening="false"
    type="file"
    :fullpath="fullpath"
    :staged="staged"
    :status="status"
    :mode-tree="modeTree"
    @click:undo="sketchStore.undoChange(fullpath, status)"
    @click:add="sketchStore.addChange(fullpath, status)"
    @click:remove-stage="sketchStore.removeChange(fullpath, status)"
  />
</template>

<script lang="ts" setup>
import { StatusChange } from "src/stores/sketch"

defineProps<{
  fullpath: string
  staged?: boolean
  status: StatusChange
  modeTree?: boolean
}>()

const sketchStore = useSketchStore()
</script>
