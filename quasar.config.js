/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const {
  default: transformerDirectives,
} = require("@unocss/transformer-directives")
const { OnuResolver, presetOnu } = require("onu-ui")
const { extend } = require("quasar")
const { configure } = require("quasar/wrappers")
const { presetAttributify, presetUno } = require("unocss")

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: false,
      errors: false,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ["axios", "unocss", "auth"],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },

      vueRouterMode: "hash", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      rebuildCache: false, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      env: {
        GITPOD_WORKSPACE_URL: process.env.GITPOD_WORKSPACE_URL,
        CODESPACE_NAME: process.env.CODESPACE_NAME,
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:
          process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
        ...require("dotenv").config().parsed,
      },
      // rawDefine: {},
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf) {
        extend(true, viteConf, {
          resolve: {
            alias: {
              path: "path-cross/posix",
            },
          },
          server: {
            // configure vite for HMR with Gitpod
            hmr: process.env.GITPOD_WORKSPACE_URL
              ? {
                  // removes the protocol and replaces it with the port we're connecting to
                  host: process.env.GITPOD_WORKSPACE_URL.replace(
                    "https://",
                    "9000-"
                  ),
                  protocol: "wss",
                  clientPort: 443,
                }
              : process.env.CODESPACE_NAME
              ? {
                  host: `${process.env.CODESPACE_NAME}-9000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
                  protocol: "wss",
                  clientPort: 443,
                }
              : true,
          },
        })
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          "unocss/vite",
          {
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
          },
        ],
        [
          "unplugin-auto-import/vite",
          {
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
              },
            ],
            dirs: [
              "src/logic/**/*.ts",
              "src/logic/**/*.tsx",
              "src/stores/**/*.ts",
              "src/composables/*.ts",
              "src/constants/*.ts",
            ],
            eslintrc: {
              enabled: true, // Default `false`
              filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
              globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
            },
          },
        ],
        [
          "unplugin-vue-components/vite",
          {
            resolvers: [OnuResolver()],
          },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: false, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        dark: true,
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "generateSW", // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "fcanvas-playground",
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  }
})
