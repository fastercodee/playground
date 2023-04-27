// eslint-disable-next-line functional/no-let
let decoderUtf8: TextDecoder | null = null;
export function uint8ToUTF8(uint8: Uint8Array): string {
  decoderUtf8 ??= new TextDecoder("utf-8");
  return decoderUtf8.decode(uint8);
}

// eslint-disable-next-line functional/no-let
let encoderUtf8: TextEncoder | null = null;
export function utf8ToUint8(utf8: string): Uint8Array {
  encoderUtf8 ??= new TextEncoder();
  return encoderUtf8.encode(utf8);
}
