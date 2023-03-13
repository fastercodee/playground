import { EditorSelection } from "@codemirror/state"
import type { EditorView } from "@codemirror/view"
import { defineStore } from "pinia"
import type { Entry } from "src/logic/fs"

export const useSeasonEdit = defineStore("season-edit", () => {
  const editor = shallowRef<EditorView | null>(null)

  const seasons = shallowReactive<
    {
      entry: Entry<"file">
      selection: string
    }[]
  >([])
  const currentEntry = shallowRef<Entry<"file"> | null>(null)

  function saveCurrentSeason() {
    if (!currentEntry.value || !editor.value) {
      console.info(
        "Can't save current seasion because currentEntry or editor is null",
        { entry: currentEntry.value, editor: editor.value }
      )
      return
    }
    seasons.push({
      entry: currentEntry.value,
      selection: editor.value?.state.selection.toJSON(),
    })
  }

  async function openFile(entry: Entry<"file">) {
    // save current season - backup
    saveCurrentSeason()
    // find from season exists?
    const info = seasons.find((item) => item.entry === entry)

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
      selection: info ? EditorSelection.fromJSON(info.selection) : undefined,
    })
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
    return currentEntry.value === entry
  }

  return {
    editor,
    openFile,
    saveFile,
    isCurrent,
  }
})
