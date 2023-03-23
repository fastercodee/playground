import { initialize, transform } from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

// eslint-disable-next-line functional/no-let
let inited = false
export async function compilerFile(
  content: ArrayBuffer,
  filename: string,
  ext: string,
  tsconfigRaw: string
) {
  if (!inited) {
    await initialize({
      wasmURL,
    })
    inited = true
  }

  const res = await transform(new Uint8Array(content), {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loader: ext as unknown as any,
    sourcemap: "inline",
    sourcefile: `${filename}.${ext}`,
    tsconfigRaw,
  })

  return new TextEncoder().encode(res.code).buffer
}
