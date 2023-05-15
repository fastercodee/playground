/* eslint-disable n/no-path-concat */
import fs from "fs"

fs.readdirSync(__dirname)


  .forEach(name => {
    if (!fs.statSync(`${__dirname}/${name}`).isDirectory()) return
    fs.renameSync(`${__dirname}/${name}`, `${__dirname}/${name}.bak`)

    fs.mkdirSync(`${__dirname}/${name}`)
    fs.renameSync(`${__dirname}/${name}.bak`, `${__dirname}/${name}/template`)
    fs.writeFileSync(`${__dirname}/${name}/index.ts`, `export const files =
    Object.fromEntries(
      Object.entries(
        import.meta.glob("./template/**/*", { eager: true, query: "arraybuffer" })
      )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([path, value]) => [path.replace("./template/", "").replace('._', '.'), (value as any).default])
    )
  `)
    fs.writeFileSync(`${__dirname}/${name}/meta.json5`, `{
      name: "HTML",
      icon: ["logos:html-5"],
    }`)
  })
