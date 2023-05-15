import presetUno from "@unocss/preset-uno"
import transformerDirectives from "@unocss/transformer-directives"
import { presetOnu } from "onu-ui"
import { defineConfig, presetAttributify } from "unocss"

export default defineConfig({
  presets: [
    presetAttributify({
      prefix: "un-",
      prefixedOnly: true, // <--
    }),
    presetUno(),
    presetOnu(),
  ],
  rules: [
    [
      /^size-\[([^[\]]+)\]/,
      ([, value]) => ({ width: value, height: value }),
    ],
  ],
  transformers: [transformerDirectives()],
})
