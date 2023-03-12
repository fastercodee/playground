// eslint-disable-next-line functional/no-mixed-types
export interface Entry<Type extends "directory" | "file"= "directory" | "file"> {
  type: Type
  name: string
  fullPath: () => string
  directory: Entry<"directory">
}
