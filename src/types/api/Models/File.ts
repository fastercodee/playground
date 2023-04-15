import type { Sketch } from "./Sketch"

export interface File<ESketch extends boolean = false> {
  uid: number
  filePath: string
  data?: string
  hash: string
  size: number
  updated_at: string
  created_at: string
  sketch?: ESketch extends true ? Sketch<false, false> : undefined
}
