import { createHash } from "sha256-uint8array"

export async function sha256File(filePath: string): Promise<string> {
  const buffer = await Filesystem.readFile({
    path: filePath,
    directory: Directory.External,
  }).then(({ data }) => base64ToUint8(data))

  const hash = createHash().update(buffer).digest("hex")

  return hash
}
