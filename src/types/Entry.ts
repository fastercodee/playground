// eslint-disable-next-line functional/no-mixed-types
export interface Entry<
  Type extends "directory" | "file" = "directory" | "file"
> {
  readonly type: Type
  name: string
  get fullPath(): string
  readonly directory: Entry<"directory">
}
