import fs from "fs"

import { globbySync } from "globby"

console.log(globbySync("**/*.json").map(item => {
  // eslint-disable-next-line n/no-path-concat
  fs.renameSync(__dirname + "/" + item, __dirname + "/" + item.replace(".json", "._json"))
}))
