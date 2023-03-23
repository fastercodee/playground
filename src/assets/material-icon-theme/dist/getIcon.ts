import { basename, extname } from "path"

import MaterialIcons from "./material-icons.json"

export interface Options {
  readonly light: boolean
  readonly isOpen: boolean
  readonly isFolder: boolean
  readonly filepath: string
  readonly language?: keyof (typeof MaterialIcons)["languageIds"]
}

function getIconById(id: keyof typeof MaterialIcons.iconDefinitions): string {
  return (
    "/src/assets/material-icon-theme/" +
    MaterialIcons.iconDefinitions[id].iconPath
  )
}

function getIconDefinitions({
  light,
  isOpen,
  isFolder,
  filepath,
  language,
}: Options): string {
  filepath = basename(filepath).toLowerCase()

  if (isFolder) {
    if (light) {
      if (isOpen) {
        if (filepath in MaterialIcons.light.folderNamesExpanded) {
          return MaterialIcons.light.folderNamesExpanded[
            filepath as keyof typeof MaterialIcons.light.folderNamesExpanded
          ]
        }
      } else {
        if (filepath in MaterialIcons.light.folderNames) {
          return MaterialIcons.light.folderNames[
            filepath as keyof typeof MaterialIcons.light.folderNames
          ]
        }
      }
    }

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

    if (light) {
      if (filepath in MaterialIcons.light.fileNames) {
        return MaterialIcons.light.fileNames[
          filepath as keyof typeof MaterialIcons.light.fileNames
        ]
      }
      if (ext2 in MaterialIcons.light.fileExtensions) {
        return MaterialIcons.light.fileExtensions[
          ext2 as keyof typeof MaterialIcons.light.fileExtensions
        ]
      }
      if (ext in MaterialIcons.light.fileExtensions) {
        return MaterialIcons.light.fileExtensions[
          ext as keyof typeof MaterialIcons.light.fileExtensions
        ]
      }
    }

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

export default function getIcon(options: Options): string {
  const icon = getIconDefinitions(options)

  if (icon in MaterialIcons.iconDefinitions)
    return getIconById(icon as keyof typeof MaterialIcons.iconDefinitions)

  if (options.isFolder)
    return options.isOpen ? getIconById("folder-open") : getIconById("folder")
  else return getIconById("file")
}
