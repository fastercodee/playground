import { basename, dirname, extname } from "path"

import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history as exHistory } from "@codemirror/commands"
import { esLint } from "@codemirror/lang-javascript"
import { jsonParseLinter } from "@codemirror/lang-json"
import { vue } from "@codemirror/lang-vue"
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language"
import { linter, lintGutter } from "@codemirror/lint"
import { highlightSelectionMatches } from "@codemirror/search"
import type { Extension } from "@codemirror/state"
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
import { put } from "@fcanvas/communicate"
import { colorPicker } from "@replit/codemirror-css-color-picker"
import interact from "@replit/codemirror-interact"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link/esm"
import { langs, loadLanguage } from "@uiw/codemirror-extensions-langs/esm"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night/esm"
import langMap from "lang-map/lib/lang.json"
import { defineStore } from "pinia"
import { getSupportInfo } from "prettier"
import { debounce } from "quasar"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as eslint from "src/logic/linter"
import { Entry } from "src/logic/read-details"
import type { Match } from "src/logic/search-text"
import type { Format } from "src/workers/format"
import FormatWorker from "src/workers/format?worker"
// import Linter from "eslint4b-prebuilt";

// import { vscodeDark } from "@uiw/codemirror-theme-vscode/esm"
// import { xcodeDark } from "@uiw/codemirror-theme-xcode/esm"

const extensionNOOP: Extension = []
const eslintrcDefault = {
  // eslint configuration
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: false,
  },
  rules: {
    semi: ["error", "never"],
  },
}

async function loadLinter(name: string, config: Record<string, unknown>) {
  switch (name) {
    case "javascript": {
      return linter(esLint(new eslint.Linter(), config))
    }
    case "json": {
      return linter(jsonParseLinter())
    }
    default:
      return linter(() => [])
  }
}

export const useSeasonEdit = defineStore("season-edit", () => {
  const sketchStore = useSketchStore()

  const editor = shallowRef<EditorView | null>(null)
  const language = new Compartment()
  const linter = new Compartment()
  // eslint-disable-next-line functional/no-let
  let onChanged: null | ((text: string) => void) = null
  // eslint-disable-next-line functional/no-let
  let _formatWorker: InstanceType<typeof FormatWorker> | null = null

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
            {
              key: "Shift-Alt-f",
              preventDefault: true,
              run: (target: EditorView) => {
                console.log("Format ")
                if (!currentEntry.value) return false
                _formatWorker?.terminate()
                const ext = extname(currentEntry.value.name)

                const parser = getSupportInfo().languages.find((item) => {
                  return item.extensions?.some(
                    (extTest: string) => ext === extTest
                  )
                })?.parsers

                console.log(
                  ext,
                  getSupportInfo().languages,
                  parser,
                  target.state.selection.toJSON()
                )

                _formatWorker = new FormatWorker()
                // eslint-disable-next-line promise/catch-or-return
                put<Format>(_formatWorker, "format", {
                  code: target.state.doc + "",
                  options: {
                    parser: parser?.[0],
                    singleQuote: false,
                    semi: false,
                  },
                }).then((insert) => {
                  target.dispatch({
                    changes: {
                      from: 0,
                      to: target.state.doc.length,
                      insert: insert as string,
                    },
                  })
                  // eslint-disable-next-line promise/always-return
                  _formatWorker?.terminate()
                })
                //         parser:
                // parser.value.parsers[0] === "babel"
                //   ? "babel-flow"
                //   : parser.value.parsers[0],

                return true
              },
            },
            // ...closeBracketsKeymap,
            // ...defaultKeymap,
            // ...searchKeymap,
            // ...historyKeymap,
            // ...foldKeymap,
            // ...completionKeymap,
            // ...lintKeymap,
            // ...vscodeKeymap,
          ]),
          hyperLink,
          interact({
            rules: [
              // a rule for a number dragger
              {
                // the regexp matching the value
                regexp: /-?\b\d+\.?\d*\b/g,
                // set cursor to "ew-resize" on hover
                cursor: "ew-resize",
                // change number value based on mouse X movement on drag
                onDrag: (text, setText, e) => {
                  const newVal = Number(text) + e.movementX
                  if (isNaN(newVal)) return
                  setText(newVal.toString())
                },
              },
            ],
          }),
          colorPicker,
          language.of(extensionNOOP),
          tokyoNight,

          linter.of(extensionNOOP),
          lintGutter(),

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
  const currentFileのFile = useFile(
    computed(() => currentEntry.value?.fullPath),
    "",
    true,
    undefined,
    true
  )

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

  const eslintrcのFile = useFile(
    () => `${sketchStore.rootのsketch}/.elintrc.json`,
    JSON.stringify(eslintrcDefault)
  )

  currentFileのFile.onFileChange(
    (data) => {
      if (!currentEntry.value || !editor.value) return

      // saveCurrentSeason()
      editor.value.dispatch({
        changes: {
          from: 0,
          to: editor.value.state.doc.length,
          insert: data,
        },
        selection: selectionStore.has(currentEntry.value)
          ? EditorSelection.fromJSON(selectionStore.get(currentEntry.value))
          : undefined,
      })
    },
    { immediate: true }
  )
  // eslint-disable-next-line functional/no-let
  let entryChanging: Entry<"file"> | null = null
  async function openFile(entry: Entry<"file">) {
    if (toRaw(currentEntry.value) === toRaw(entry)) return
    onChanged = null
    console.log("open file")
    // save current season - backup
    saveCurrentSeason()
    // find from season exists?

    currentEntry.value = entry
    await nextTick()
    await currentFileのFile.ready

    const ext = extname(entry.name).slice(1)
    if (ext === "vue") {
      editor.value?.dispatch({
        effects: [
          language.reconfigure(vue()),
          linter.reconfigure(extensionNOOP),
        ],
      })
    } else {
      const checkLang = (langMap as unknown as Record<string, string>)[ext] ?? [
        ext,
      ]

      console.log({ checkLang })

      for (const name of checkLang) {
        if (name in langs) {
          editor.value?.dispatch({
            effects: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion
              language.reconfigure(loadLanguage(name as unknown as any)!),
              linter.reconfigure(
                (await loadLinter(name, JSON.parse(eslintrcのFile.data))) ??
                  extensionNOOP
              ),
            ],
          })
          break
        }
      }
    }

    if (!seasons.has(entry)) seasons.add(entry)

    history.push(entry)
    if (history.length > 100) history.splice(0, 100 - history.length)

    onChanged = debounce(async (text) => {
      if (toRaw(entryChanging) === toRaw(entry)) return
      if (toRaw(currentEntry.value) !== toRaw(entry)) return

      entryChanging = entry
      currentFileのFile.data = text
      await nextTick()
      await currentFileのFile.writing
      entryChanging = null
    }, 1000)
  }

  async function closeFile(entry: Entry<"file">) {
    if (currentEntry.value && editor.value) {
      const data = editor.value.state.doc + ""
      await onChanged?.(data)
    }
    onChanged = null

    seasons.delete(entry)

    for (let i = 0; i < history.length; i++) {
      if (toRaw(history[i]) === toRaw(entry)) {
        history.splice(i, 1)
        i--
      }
    }

    if (toRaw(currentEntry.value) === toRaw(entry)) {
      // out
      if (history.length === 0) {
        currentEntry.value = null
        return
      }

      openFile(history[history.length - 1])
    } else {
      currentEntry.value = null
    }
  }

  function isCurrent(entry: Entry<"file">) {
    return toRaw(currentEntry.value) === toRaw(entry)
  }

  // ========= extension ========
  async function openMatch(fullpath: string, match: Match) {
    if (currentEntry.value?.fullPath === fullpath) {
      // is current path
    } else {
      // open file
      // await openFile(await)
      // TODO: 偽
      const entry = /* 偽 */ reactive(
        new Entry(
          "file",
          basename(fullpath),
          createFakeDirectory(dirname(fullpath))
        )
      )

      await openFile(entry)

      console.log(entry)
    }

    editor.value?.dispatch({
      selection: EditorSelection.create([
        EditorSelection.range(match.posStart, match.posEnd),
        EditorSelection.cursor(match.posStart + 1),
      ]),
    })
  }

  return {
    createEditor,
    currentEntry,
    seasons,
    editor,
    openFile,
    closeFile,
    isCurrent,

    openMatch,
  }
})
