export enum Area {
  area_1,
  area_2,
  area_3,
}

export enum AreaComponent {
  Editor,
  Console,
  Preview
}
export const AreaComponentSize = 3

export enum Mode {
  columns,
  rows,
  bottom,
  right,
  top,
  left,
}
export const ModeSize = 6// as unknown as Record<Mode, number>
