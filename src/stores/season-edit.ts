import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete"
import {
  defaultKeymap,
  history as exHistory,
  historyKeymap,
} from "@codemirror/commands"
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
import { Compartment, EditorSelection, EditorState } from "@codemirror/state"
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
import { defineStore } from "pinia"
import { debounce } from "quasar"
import type { Entry } from "src/logic/fs"
// import { vscodeDark } from "@uiw/codemirror-theme-vscode/esm"
// import { xcodeDark } from "@uiw/codemirror-theme-xcode/esm"

export const useSeasonEdit = defineStore("season-edit", () => {
  const editor = shallowRef<EditorView | null>(null)
  const language = new Compartment()
  // eslint-disable-next-line functional/no-let
  let onChanged: null | ((text: string) => void) = null

  function createEditor(editorRef: HTMLDivElement) {
    editor.value = new EditorView({
      parent: editorRef,
      state: EditorState.create({
        doc: "",
        extensions: [
          EditorView.lineWrapping,
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          exHistory(),
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
          language.of(
            javascript({
              typescript: true,
            })
          ),
          tokyoNight,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChanged?.(editor.value?.state.doc + "")
            }
          }),
        ],
      }),
    })
  }

  const seasons = shallowReactive(new Set<Entry<"file">>())
  const selectionStore = new WeakMap<Entry<"file">, string>()
  const history: Entry<"file">[] = []
  const currentEntry = shallowRef<Entry<"file"> | null>(null)

  function saveCurrentSeason() {
    if (!currentEntry.value || !editor.value) {
      console.info(
        "Can't save current seasion because currentEntry or editor is null",
        { entry: currentEntry.value, editor: editor.value }
      )
      return
    }

    selectionStore.set(
      currentEntry.value,
      editor.value.state.selection.toJSON()
    )
  }

  async function openFile(entry: Entry<"file">) {
    entry = toRaw(entry)
    if (currentEntry.value === entry) return
    onChanged = null
    console.log("open file")
    // save current season - backup
    saveCurrentSeason()
    // find from season exists?

    const insert = await Filesystem.readFile({
      path: entry.fullPath(),
      directory: Directory.External,
      encoding: Encoding.UTF8,
    }).then((res) => res.data)
    console.log({ insert })

    currentEntry.value = entry
    editor.value?.dispatch({
      changes: {
        from: 0,
        to: editor.value.state.doc.length,
        insert,
      },
      selection: selectionStore.has(entry)
        ? EditorSelection.fromJSON(selectionStore.get(entry))
        : undefined,
    })
    if (!seasons.has(entry)) seasons.add(entry)

    history.push(entry)
    if (history.length > 100) history.splice(0, 100 - history.length)

    onChanged = debounce((text) => {
      Filesystem.writeFile({
        path: entry.fullPath(),
        directory: Directory.External,
        data: text,
        encoding: Encoding.UTF8,
      })
    }, 1000)
  }
  function closeFile(entry: Entry<"file">) {
    entry = toRaw(entry)
    if (currentEntry.value && editor.value)
      onChanged?.(editor.value.state.doc + "")
    onChanged = null

    seasons.delete(entry)
    // eslint-disable-next-line functional/no-loop-statements
    for (let i = 0; i < history.length; i++) {
      if (history[i] === entry) {
        history.splice(i, 1)
        i--
      }
    }

    if (currentEntry.value === entry) {
      // out
      if (history.length === 0) return

      openFile(history[history.length - 1])
    }
  }

  async function saveFile(text: string) {
    if (!currentEntry.value) return

    await Filesystem.writeFile({
      path: currentEntry.value.fullPath(),
      data: text,
      directory: Directory.External,
      encoding: Encoding.UTF8,
    })

    console.info("saved file %s", currentEntry.value.fullPath())
  }

  function isCurrent(entry: Entry<"file">) {
    return currentEntry.value === toRaw(entry)
  }

  return {
    createEditor,
    seasons,
    editor,
    openFile,
    closeFile,
    saveFile,
    isCurrent,
  }
})
