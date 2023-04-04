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

.parent-editor {
  // 0.25, 0.8
  $bg-selection-match: #99eeff38;
  $bg-matchingBracket: #626c8a40;
  :deep(.cm-selectionBackground) {
    // current section
    background-color: $bg-selection-match;
  }
  :deep(.cm-activeLine) {
    @apply bg-transparent relative;
    &:before {
      content: "";
      @apply absolute w-full h-full top-0 left-0 z--1 border border-gray-400 border-opacity-20;
    }
  }
  :deep(.cm-matchingBracket) {
    // match braket
    background-color: $bg-matchingBracket;
  }
  :deep(.cm-selectionMatch) {
    // match equal section example <h1></h1> all "h1"
    background-color: $bg-selection-match;
  }
}
</style>
