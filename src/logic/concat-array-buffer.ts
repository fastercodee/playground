export function concatArrayBuffer(
  arrayBuffer1: ArrayBuffer,
  arrayBuffer2: ArrayBuffer
) {
  const result = new Uint8Array(
    arrayBuffer1.byteLength + arrayBuffer2.byteLength
  )

  result.set(new Uint8Array(arrayBuffer1), 0)
  result.set(new Uint8Array(arrayBuffer2), arrayBuffer1.byteLength)

  return result.buffer
}
