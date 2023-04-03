import { defineStore } from "pinia"
import type { Entry } from "src/types/Entry"

export const useClipboardFS = defineStore("clipboard-fs", () => {
  const action = ref<null | {
    entry: Entry<"file" | "directory">
    action: "mv" | "cp"
    emit?: (name: "deleted") => void
  }>(null)

  function cut(
    entry: Entry<"file" | "directory">,
    emit: (name: "deleted") => void
  ) {
    action.value = {
      entry,
      action: "mv",
      emit,
    }
  }
  function copy(entry: Entry<"file" | "directory">) {
    action.value = {
      entry,
      action: "cp",
    }
  }
  function cancelAction(entry: Entry<"file" | "directory">) {
    if (action.value?.entry === entry) action.value = null
  }
  async function paste(toEntry: Entry<"directory">): Promise<{
    parent: boolean
    name: string
  }> {
    if (!action.value) throw new Error("action is empty")

    if (toEntry.fullPath.startsWith(action.value.entry.fullPath)) {
      // is end point is children of target
      throw new Error(
        "Can't run action because end point is children of target."
      )
    }

    const fn = action.value.action === "cp" ? "copy" : "rename"
    if (toEntry.name === action.value.entry.name) {
      // to sibling
      // scan name

      for (let i = 1; i < 1e3; i++) {
        const newName =
          action.value.entry.name + " copy" + (i === 1 ? "" : ` ${i}`)
        const pathSave = toEntry.directory.fullPath + "/" + newName

        if (
          await Filesystem.stat({
            path: pathSave,
            directory: Directory.External,
          }).catch(() => false)
        ) {
          continue
        }

        await Filesystem[fn]({
          from: action.value.entry.fullPath,
          to: pathSave,
          directory: Directory.External,
        })
        // type toEntry === type action.value.entry is directory
        if (fn === "copy") {
          // write directory
          eventBus.emit("copyDir", pathSave)
        } else {
          // write directory
          eventBus.emit("copyDir", pathSave)
          eventBus.emit("rmdir", action.value.entry.fullPath)
        }
        action.value = null
        return { parent: true, name: newName }
      }
      throw new Error("Maxium scan new name")
    } else {
      const to = toEntry.fullPath + "/" + action.value.entry.name
      await Filesystem[fn]({
        from: action.value.entry.fullPath,
        to,
        directory: Directory.External,
      })
      // type toEntry === type action.value.entry is file
      if (fn === "copy") {
        // write directory
        eventBus.emit("writeFile", to)
      } else {
        // write directory
        eventBus.emit("writeFile", to)
        eventBus.emit("deleteFile", action.value.entry.fullPath)
      }
      if (fn === "rename") action.value?.emit?.("deleted")
      const { name } = action.value.entry
      action.value = null
      return { parent: false, name }
    }
  }

  function isEntryCuting(entry: Entry<"file" | "directory">) {
    return action.value?.action === "mv" && action.value.entry === entry
  }

  return {
    action,
    cut,
    copy,
    cancelAction,
    paste,
    isEntryCuting,
  }
})
