import type { File } from "./File"
import type { User } from "./User"

export interface Sketch<EUser extends boolean, EFiles extends boolean> {
  uid: number
  private: boolean
  name: string
  total_files_size: number
  updated_at: string
  created_at: string
  user: EUser extends true ? User : undefined
  files: EFiles extends true ? File[] : undefined
}
