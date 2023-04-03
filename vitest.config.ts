import { OnuResolver } from "onu-ui"
import AutoImport from "unplugin-auto-import/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setup.vitest.ts",
  },
  plugins: [
    AutoImport({
      resolvers: [OnuResolver()],
      // targets to transform
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],

      // global imports to register
      imports: [
        // presets
        "vue",
        "vue-router",
        {
          "@iconify/vue": ["Icon"],
          "@vueuse/core": ["computedAsync"],
          "@capacitor/filesystem": ["Filesystem", "Directory", "Encoding"],
        },
      ],
      dirs: ["src/logic/*.ts"],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }),
  ],
})
