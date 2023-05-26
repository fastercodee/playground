import { basename, extname } from "path"

import MaterialIcons from "./Material-Theme-Icons.json"

export interface Options {
  readonly light: boolean
  readonly isOpen: boolean
  readonly isFolder: boolean
  readonly filepath: string
  readonly language?: keyof (typeof MaterialIcons)["languageIds"]
}

const icons = import.meta.glob("../icons/*.svg", { as: "url" })

async function getIconById(
  id: keyof typeof MaterialIcons.iconDefinitions
): Promise<string> {
  return icons[MaterialIcons.iconDefinitions[id].iconPath]().then(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res) => (res as any).default
  ) as Promise<string>
}

function getIconDefinitions({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  light,
  isOpen,
  isFolder,
  filepath,
  language,
}: Options): string {
  filepath = basename(filepath).toLowerCase()

  if (isFolder) {
    if (isOpen) {
      if (filepath in MaterialIcons.folderNamesExpanded) {
        return MaterialIcons.folderNamesExpanded[
          filepath as keyof typeof MaterialIcons.folderNamesExpanded
        ]
      }
    } else {
      if (filepath in MaterialIcons.folderNames) {
        return MaterialIcons.folderNames[
          filepath as keyof typeof MaterialIcons.folderNames
        ]
      }
    }

    return isOpen ? MaterialIcons.folderExpanded : MaterialIcons.folder
  } else {
    if (language && language in MaterialIcons.languageIds)
      return MaterialIcons.languageIds[language]

    const ext = extname(filepath).replace(/^\./, "")
    const ext2 = filepath.includes(".")
      ? basename(filepath).split(".").slice(-2).join(".")
      : ""

    if (filepath in MaterialIcons.fileNames) {
      return MaterialIcons.fileNames[
        filepath as keyof typeof MaterialIcons.fileNames
      ]
    }
    if (ext2 in MaterialIcons.fileExtensions) {
      return MaterialIcons.fileExtensions[
        ext2 as keyof typeof MaterialIcons.fileExtensions
      ]
    }
    if (ext in MaterialIcons.fileExtensions) {
      return MaterialIcons.fileExtensions[
        ext as keyof typeof MaterialIcons.fileExtensions
      ]
    }
    if (ext2 in MaterialIcons.iconDefinitions) return ext2

    if (ext in MaterialIcons.iconDefinitions) return ext

    return MaterialIcons.file
  }
}

export default function getIcon(options: Options): Promise<string> {
  const icon = getIconDefinitions(options)

  if (icon in MaterialIcons.iconDefinitions)
    return getIconById(icon as keyof typeof MaterialIcons.iconDefinitions)

  if (options.isFolder)
    return options.isOpen ? getIconById("_folder_open") : getIconById("_folder")
  else return getIconById("_file_unknown")
}
