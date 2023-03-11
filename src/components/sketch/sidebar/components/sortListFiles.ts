import sortArray from "sort-array"

type Info = Record<string, boolean>

export function sortListFiles(list: Info): Info {
  const dirs: string[] = []
  const files: string[] = []

  for (const name in list) {
    if (list[name] === true) {
      dirs.push(name)
    } else {
      files.push(name)
    }
  }

  return {
    ...Object.fromEntries(
      sortArray(dirs, {
        order: "asc"
      }).map((name) => [name, true])
    ),
    ...Object.fromEntries(
      sortArray(files, {
        order: "asc"
      }).map((name) => [name, false])
    )
  }
}
