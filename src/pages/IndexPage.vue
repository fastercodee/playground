<template>
  <div ref="editorRef" class="h-full" />
</template>

<script lang="ts" setup>
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language"
import { lintKeymap } from "@codemirror/lint"
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search"
import { EditorState } from "@codemirror/state"
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view"
// import { oneDarkTheme } from "@codemirror/theme-one-dark"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night/esm"
// import { vscodeDark } from "@uiw/codemirror-theme-vscode/esm"
// import { xcodeDark } from "@uiw/codemirror-theme-xcode/esm"
import * as fs from "indexeddb-fs"

window.fs = fs

const initialText = 'console.log("hello, world")'

const editorRef = ref<HTMLDivElement>()
watch(
  editorRef,
  (editorRef) => {
    if (!editorRef) return

    new EditorView({
      parent: editorRef,
      state: EditorState.create({
        doc: initialText,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,
          ]),
          javascript({
            typescript: true,
          }),
          tokyoNight,
        ],
      }),
    })
  },
  { immediate: true }
)
</script>
