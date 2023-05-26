import fs from "fs"
import { join } from "path"

import { globbySync } from "globby"

fs.readdirSync(__dirname).forEach((name) => {
  console.log("Building template %s", name)
  const base = join(__dirname, name, "template")
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return

  // eslint-disable-next-line functional/no-let
  let code = "export const files = {"

  globbySync("**/*", { cwd: base }).forEach((file) => {
    code +=
      `'${file.replace("._", ".")}':` +
      "new Uint8Array([" +
      new Uint8Array(fs.readFileSync(join(base, file))) +
      "]),"
  })

  code += "}"

  fs.writeFileSync(join(__dirname, name, "index.ts"), code)
})
