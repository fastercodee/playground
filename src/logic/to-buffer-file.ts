import type { ReadFileResult } from "@capacitor/filesystem"

export function toBufferFile({ data }: ReadFileResult): ArrayBuffer {
  if (isBase64(data)) {
    return base64ToUint8(data).buffer
  }

  return new TextEncoder().encode(data).buffer
}
