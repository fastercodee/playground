export interface Entry<Type extends "file" | "dir" = "file" | "dir"> {
  type: Type
  name: string
  fullPath: string
  directory: Entry<"dir">
}
