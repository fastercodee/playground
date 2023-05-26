import { compile } from "svelte/compiler"

export function compileSvelte(filename: string, code: string) {
  const result = compile(code, { dev: true })

  // result.js.code += `Component$.__file = ${JSON.stringify(filename)}`

  // result.js.code += `\n//# sourceMappingURL=data:application/json;base64,${uint8ToBase64(
  //   utf8ToUint8(JSON.stringify(result.js.map))
  // )}`

  return { js: result.js.code }
}
