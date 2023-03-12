import { defineStore } from "pinia"
import type { Entry } from "src/types/Entry"

export const useClipboardFS = defineStore("clipboard-fs", () => {
  const action = ref<null | {
    entry: Entry
    action: "mv" | "cp"
  }>(null)

  function cut(entry: Entry) {
    action.value = {
      entry,
      action: "mv",
    }
  }
  function copy(entry: Entry) {
    action.value = {
      entry,
      action: "cp",
    }
  }
  async function paste(toEntry: Entry<"directory">) {
    if (!action.value) return console.warn("action is empty")

    if (toEntry.fullPath().startsWith(action.value.entry.fullPath())) {
      // is end point is children of target
      throw new Error(
        "Can't run action because end point is children of target."
      )
    }

    const fn = action.value.action === "cp" ? "copy" : "rename"
    if (toEntry.name === action.value.entry.name) {
      // to sibling
      // scan name
      // eslint-disable-next-line functional/no-loop-statements
      for (let i = 1; i < 1e3; i++) {
        const newName =
          action.value.entry.name + " copy" + (i === 1 ? "" : ` ${i}`)
        const pathSave = toEntry.directory.fullPath() + "/" + newName

        if (
          await Filesystem.stat({
            path: pathSave,
            directory: Directory.External,
          }).catch(() => false)
        ) {
          continue
        }

        await Filesystem[fn]({
          from: action.value.entry.fullPath(),
          to: pathSave,
          directory: Directory.External,
        })
      }
    } else {
      await Filesystem[fn]({
        from: action.value.entry.fullPath(),
        to: toEntry.fullPath() + "/" + action.value.entry.name,
        directory: Directory.External,
      })
    }
  }

  function isEntryCuting(entry: Entry) {
    return action.value?.action === "mv" && action.value.entry === entry
  }

  return {
    action,
    cut,
    copy,
    paste,
    isEntryCuting,
  }
})
