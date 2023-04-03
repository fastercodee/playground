import { basename, dirname, extname } from "path"

import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { history as exHistory } from "@codemirror/commands"
import { esLint } from "@codemirror/lang-javascript"
import { jsonParseLinter } from "@codemirror/lang-json"
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

async function loadLinter(name: string) {
  switch (name) {
    case "javascript": {
      const config = {
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

      return linter(
        esLint(
          new eslint.Linter(),
          JSON.parse(
            await loadWatchFile("current/.elintrc.json", JSON.stringify(config))
          )
        )
      )
    }
    case "json": {
      return linter(jsonParseLinter())
    }
    default:
      return linter(() => [])
  }
}

export const useSeasonEdit = defineStore("season-edit", () => {
  const editor = shallowRef<EditorView | null>(null)
  const language = new Compartment()
  const linter = new Compartment()
  // eslint-disable-next-line functional/no-let
  let onChanged: null | ((text: string) => void) = null
  // eslint-disable-next-line functional/no-let
  let _formatWorker: Worker | null = null

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

  // eslint-disable-next-line functional/no-let
  let entryChanging: Entry<"file"> | null = null
  async function openFile(entry: Entry<"file">) {
    entry = toRaw(entry)
    if (currentEntry.value === entry) return
    onChanged = null
    console.log("open file")
    // save current season - backup
    saveCurrentSeason()
    // find from season exists?

    const insert = await Filesystem.readFile({
      path: entry.fullPath,
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
    const ext = extname(entry.name).slice(1)
    const checkLang = (langMap as unknown as Record<string, string>)[ext] ?? [
      ext,
    ]

    console.log({ checkLang })

    for (const name of checkLang) {
      if (name in langs) {
        console.log(loadLinter(name))
        editor.value?.dispatch({
          effects: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion
            language.reconfigure(loadLanguage(name as unknown as any)!),
            linter.reconfigure((await loadLinter(name)) ?? extensionNOOP),
          ],
        })
        break
      }
    }

    if (!seasons.has(entry)) seasons.add(entry)

    history.push(entry)
    if (history.length > 100) history.splice(0, 100 - history.length)

    onChanged = debounce(async (text) => {
      if (entryChanging === entry) return
      entryChanging = entry
      await Filesystem.writeFile({
        path: entry.fullPath,
        directory: Directory.External,
        data: text,
        encoding: Encoding.UTF8,
      })
      eventBus.emit("writeFile", entry.fullPath)
      entryChanging = null
    }, 1000)
  }
  function closeFile(entry: Entry<"file">) {
    entry = toRaw(entry)
    if (currentEntry.value && editor.value)
      onChanged?.(editor.value.state.doc + "")
    onChanged = null

    seasons.delete(entry)

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
      path: currentEntry.value.fullPath,
      data: text,
      directory: Directory.External,
      encoding: Encoding.UTF8,
    })
    eventBus.emit("writeFile", currentEntry.value.fullPath)

    console.info("saved file %s", currentEntry.value.fullPath)
  }

  function isCurrent(entry: Entry<"file">) {
    return currentEntry.value === toRaw(entry)
  }

  // ========= extension ========
  async function openMatch(fullpath: string, match: Match) {
    if (currentEntry.value?.fullPath === fullpath) {
      // is current path
    } else {
      // open file
      // await openFile(await)
      // TODO: 偽
      const entry = /* 偽 */ new Entry(
        "file",
        basename((fullpath)),
        {
          type: "directory",
          name: basename(dirname(fullpath)),
          fullPath: dirname(fullpath),
          directory: null as unknown as Entry<"directory">,
        }
      )

      await openFile(entry)

      console.log(entry)
    }
  }

  return {
    createEditor,
    seasons,
    editor,
    openFile,
    closeFile,
    saveFile,
    isCurrent,

    openMatch
  }
})
