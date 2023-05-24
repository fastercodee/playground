import { generate, parse, walk } from "css-tree"
import hashId from "hash-sum"

function genClassName(className: string): string {
  return `__${className}_${hashId(className)}`
}

export async function compileCSSModule(filename: string, code: string) {
  // parse CSS to AST
  const ast = parse(code)

  const store: Record<string, string> = {}
  // traverse AST and modify it
  walk(ast, (node) => {
    if (node.type === "ClassSelector") {
      const cache = store[node.name]

      if (cache) node.name = cache
      else {
        const { name } = node
        node.name = genClassName(node.name)
        store[name] = node.name
      }
    }
  })

  // generate CSS from AST
  return {
    js: `export default ${JSON.stringify(store)}`,
    css: generate(ast),
  }
}
