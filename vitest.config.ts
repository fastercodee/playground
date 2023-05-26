import { OnuResolver } from "onu-ui"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import vitePluginArraybuffer from "vite-plugin-arraybuffer"
import json5 from "vite-plugin-json5"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./setup.vitest.ts",
  },
  resolve: {
    alias: {
      app: __dirname,
      path: "path-cross/posix",
    },
  },
  plugins: [
    json5(),
    vitePluginArraybuffer(),
    AutoImport({
      resolvers: [OnuResolver()],
      // targets to transform
      include: [/\.tsx?$/, /\.vue$/, /\.vue\?vue/],

      // global imports to register
      imports: [
        // presets
        "vue",
        "vue-router",
        {
          "@iconify/vue": ["Icon"],
          "@vueuse/core": ["computedAsync"],
          "@tachibana-shin/capacitor-filesystem": [
            "Filesystem",
            "Directory",
            "Encoding",
          ],
          quasar: ["useQuasar"],
          "vue-auth3": ["useAuth", "useUser"],
          "vue-request": ["useRequest"],
        },
      ],
      dirs: [
        "src/logic/**/*.ts",
        "src/logic/**/*.tsx",
        "src/stores/**/*.ts",
        "src/composables/*.ts",
        "src/constants/*.ts",
        "src/validators/*.ts",
      ],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }),
    Components({
      resolvers: [OnuResolver()],
    }),
  ],
})
