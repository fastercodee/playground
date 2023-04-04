import { normalize } from "path/posix"

const map = new Map([
  ["current/index.html", { }],
  ["current/src/main.js", {}],
  ["current/assets/logo.svg", {}],
  ["current/assets/vue.svg", {}]
])

type TreeResult = Map<string, {
  fullPath: string
  children: Map<string, TreeResult | Entry<"file">>
}>

const newMap: TreeResult = new Map()
map.forEach((entry, path) => {
  const names = normalize(path).split("/")

  let currentDirpath = ''
  const metaDir = names.slice(0, -1).reduce((currentMap, dirname) => {
    let meta = currentMap.get(dirname)

    if (!meta) {
      // create filter dir
      currentMap.set(dirname, meta = {
        fullPath: currentDirpath + '' + dirname,
        children: new Map()
      })
    } else {
    }

    currentDirpath += dirname + '/'

    return meta.children
  },newMap)

  metaDir.set(names.at(-1)!, {
    name: names.at(-1)
  })

})
console.log(newMap)