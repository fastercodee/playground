import type { File } from "../Models/File"
import type { Sketch } from "../Models/Sketch"

export interface Control<Body extends object, Response extends object> {
  body: Body
  response: Response
}

type MetaAndFiles<Require extends boolean = boolean> = Require extends true
  ? {
      meta: string[]
      files: File[]
    }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {}

type MetaAndHashes<Require extends boolean = boolean> = Require extends true
  ? {
      meta: string[]
      hashes: string[]
    }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {}

type FilePath = string
export interface SketchController {
  create: Control<
    {
      name?: string
      private?: 0 | 1
    } & MetaAndFiles<true>,
    {
      sketch: Sketch<true, false>
    }
  >

  get_file: Control<
    {
      uid: number
    },
    Blob
  >

  fetch: {
    first: Control<
      {
        uid: number
      } & MetaAndHashes,
      {
        sketch: Sketch<true, false>
        file_changes: Record<
          FilePath,
          {
            type: "U+"
            file: File
          }
        >
      }
    >
    next: Control<
      {
        uid: number
      } & MetaAndHashes & {
          deletes?: string[]
        },
      {
        sketch: Sketch<true, false>
        file_changes: Record<
          FilePath,
          | {
              type: "M" | "N" | "D"
              file: File
            }
          | {
              type: "U+"
              file: File
            }
          | {
              type: "U"
            }
        >
      }
    >
  }

  update: Control<
    {
      uid: number
      deletes?: string[]
    } & MetaAndFiles & {
        files: globalThis.File[]
      },
    {
      sketch: Sketch<true, false>
      files_added: Record<string, { uid: number; hash: string }>
    }
  >
  update_info: Control<
    {
      name?: string
      description?: string
      private?: "0" | "1"
    },
    {
      sketch: Sketch<true, false>
    }
  >
  fork: Control<
    {
      uid: number
      name?: string
    },
    {
      sketch: Sketch<true, false>
    }
  >

  delete: Control<
    {
      uid: number
    },
    {
      message: string
    }
  >
}
