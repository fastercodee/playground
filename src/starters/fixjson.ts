import fs from "fs"

import { globbySync } from "globby"

console.log(
  globbySync("**/*.json").map((item) => {
    fs.renameSync(
      __dirname + "/" + item,
      __dirname + "/" + item.replace(/^_/, "").replace(".json", "._json")
    )
  })
)
