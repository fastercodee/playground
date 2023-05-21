// import init, { transformSync as Tr } from "@swc/wasm-web";
// import SWCWasm from "@swc/wasm-web/wasm-web_bg.wasm?url";
import {
  BindingMetadata,
  CompilerOptions,
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
  rewriteDefault,
  SFCDescriptor,
} from "@vue/compiler-sfc"
import hashId from "hash-sum"
// import { transform } from "sucrase";

export const COMP_IDENTIFIER = "__sfc__"

async function transformTS(src: string) {
  return src
  // return transform(src, {
  //   transforms: ["typescript"],
  // }).code;
}

export async function compileVue(filename: string, code: string) {
  const id = hashId(filename)
  const { errors, descriptor } = parse(code, {
    filename,
    sourceMap: true,
  })

  const scriptLang =
    (descriptor.script && descriptor.script.lang) ||
    (descriptor.scriptSetup && descriptor.scriptSetup.lang)
  const isTS = scriptLang === "ts"

  const hasScoped = descriptor.styles.some((s) => s.scoped)
  // eslint-disable-next-line functional/no-let
  let clientCode = ""
  // eslint-disable-next-line functional/no-let
  let ssrCode = ""

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  const clientScriptResult = await doCompileScript(descriptor, id, false, isTS)
  if (!clientScriptResult) {
    return
  }
  const [clientScript, bindings] = clientScriptResult
  clientCode += clientScript

  // script ssr only needs to be performed if using <script setup> where
  // the render fn is inlined.
  if (descriptor.scriptSetup) {
    const ssrScriptResult = await doCompileScript(descriptor, id, true, isTS)
    if (ssrScriptResult) {
      ssrCode += ssrScriptResult[0]
    } else {
      ssrCode = `/* SSR compile error: ${errors[0]} */`
    }
  } else {
    // when no <script setup> is used, the script result will be identical.
    ssrCode += clientScript
  }

  // template
  // only need dedicated compilation if not using <script setup>
  if (descriptor.template && !descriptor.scriptSetup) {
    const clientTemplateResult = await doCompileTemplate(
      descriptor,
      id,
      bindings,
      false,
      isTS
    )
    if (!clientTemplateResult) {
      return
    }
    clientCode += clientTemplateResult

    const ssrTemplateResult = await doCompileTemplate(
      descriptor,
      id,
      bindings,
      true,
      isTS
    )
    if (ssrTemplateResult) {
      // ssr compile failure is fine
      ssrCode += ssrTemplateResult
    } else {
      ssrCode = `/* SSR compile error: ${errors[0]} */`
    }
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`
    )
  }

  // eslint-disable-next-line functional/no-let
  let js = ""
  // eslint-disable-next-line functional/no-let
  let ssr = ""
  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` +
        `\nexport default ${COMP_IDENTIFIER}`
    )
    js = clientCode.trimStart()
    ssr = ssrCode.trimStart()
  }

  // styles
  // eslint-disable-next-line functional/no-let
  let css = ""
  for (const style of descriptor.styles) {
    if (style.module) {
      console.error("<style module> is not supported in the playground.")
      return
    }

    const styleResult = await compileStyleAsync({
      source: style.content,
      filename,
      id,
      scoped: style.scoped,
      modules: !!style.module,
    })
    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes("pathToFileURL")) {
        console.error(styleResult.errors)
      }
      // proceed even if css compile errors
    } else {
      css += styleResult.code + "\n"
    }
  }

  css = css?.trim() ?? "/* No <style> tags present */"

  return { js, ssr, css, isTS }
}

async function doCompileScript(
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
  isTS: boolean
): Promise<[string, BindingMetadata | undefined] | undefined> {
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const expressionPlugins: CompilerOptions["expressionPlugins"] = isTS
        ? ["typescript"]
        : undefined
      const compiledScript = compileScript(descriptor, {
        inlineTemplate: true,
        id,
        templateOptions: {
          ssr,
          ssrCssVars: descriptor.cssVars,
          compilerOptions: {
            expressionPlugins,
          },
        },
      })
      // eslint-disable-next-line functional/no-let
      let code = ""
      if (compiledScript.bindings) {
        code += `\n/* Analyzed bindings: ${JSON.stringify(
          compiledScript.bindings,
          null,
          2
        )} */`
      }
      code +=
        "\n" +
        rewriteDefault(
          compiledScript.content,
          COMP_IDENTIFIER,
          expressionPlugins
        )

      if (isTS) {
        code = await transformTS(code)
      }

      return [code, compiledScript.bindings]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e)
      throw e
    }
  } else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

async function doCompileTemplate(
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
  isTS: boolean
) {
  const templateResult = compileTemplate({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    source: descriptor.template!.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some((s) => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    isProd: false,
    compilerOptions: {
      bindingMetadata,
      expressionPlugins: isTS ? ["typescript"] : undefined,
    },
  })
  if (templateResult.errors.length) {
    console.error(templateResult.errors)
    return
  }

  const fnName = ssr ? "ssrRender" : "render"

  // eslint-disable-next-line functional/no-let
  let code =
    `\n${templateResult.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`

  if (isTS) {
    code = await transformTS(code)
  }

  return code
}
