import type { ReadFileResult } from "@capacitor/filesystem"

export function toTextFile({ data }: ReadFileResult): string {
  // if (isBase64(data)) return new TextDecoder().decode(base64ToUint8(data))
  return data
}
