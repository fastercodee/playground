<template>
  <div class="flex flex-col flex-nowrap w-full h-full">
    <SeasonManager />
    <div ref="editorRef" class="h-full w-full min-h-0 parent-editor" />
  </div>
</template>

<script lang="ts" setup>
// import { oneDarkTheme } from "@codemirror/theme-one-dark"
import { useSeasonEdit } from "src/stores/season-edit"
// import { vscodeDark } from "@uiw/codemirror-theme-vscode/esm"
// import { xcodeDark } from "@uiw/codemirror-theme-xcode/esm"

const seasonEditStore = useSeasonEdit()

const editorRef = ref<HTMLDivElement>()

watch(
  editorRef,
  (editorRef) => {
    if (!editorRef) return

    seasonEditStore.createEditor(editorRef)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.parent-editor :deep(.cm-editor) {
  height: 100%;
}
</style>
