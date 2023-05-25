import { uint8ToUTF8, utf8ToUint8 } from "src/logic/text-buffer"

import { compilerFile } from "./compiler-file"

describe("compiler-file", async () => {
  const sketchStore = {
    getJSXConfig: () => null,
    tsconfigのFile: { ready: null },
    packageのFile: { data: { dependencies: { vue: "3", shared: "2" } } },
  } as unknown as ReturnType<typeof useSketchStore>

  test("should compile file import js", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import a from './a'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import a from "/a?import";')
  })

  test("should compile file import css", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import './style.css'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import "/style.css?import=css";')
  })

  test("should compile file import css module", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import styles from './style.module.css'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import styles from "/style.module.css?import=css-module";')
  })

  test("should compile file import svg", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import image from './javascript.svg'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import image from "/javascript.svg?import=url";')
  })

  test("should compile file import vue", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import Counter from './Counter.vue'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import Counter from "/Counter.vue?import=vue";')
  })

  test("should compile file ?url", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import image from './javascript.svg'"),
            "/main.js",
            ".js",
            new URLSearchParams("?url"),
            sketchStore
          )
        )
      )
    ).include(`var main_default = "/main.js";
export {
  main_default as default
};`)
  })

  test("should compile file ?base64", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import image from './javascript.svg'"),
            "/main.js",
            ".js",
            new URLSearchParams("?base64"),
            sketchStore
          )
        )
      )
    )
      .include(`var main_default = "aW1wb3J0IGltYWdlIGZyb20gJy4vamF2YXNjcmlwdC5zdmcn";
export {
  main_default as default
};`)
  })

  test("should compile file ?import=css", async () => {
    console.log(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import image from './javascript.svg'"),
            "/main.js",
            ".js",
            new URLSearchParams("?import=css"),
            sketchStore
          )
        )
      )
    )
  })

  test("should compile file js `import library`", async () => {
    expect(
      uint8ToUTF8(
        new Uint8Array(
          await compilerFile(
            utf8ToUint8("import { ref } from 'vue'"),
            "/main.js",
            ".js",
            new URLSearchParams(),
            sketchStore
          )
        )
      )
    ).include('import { ref } from "/cdn_modules/vue";')
  })

  test("should compile file vue", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
<template>
  <h1>hello</h1>
  {{ count }}
</template>

<script setup>
const count = ref(0)
</script>
            `),
          "/main.vue",
          ".vue",
          new URLSearchParams(),
          sketchStore
        )
      )
    )

    expect(code).include(
      'import { createElementVNode as _createElementVNode, unref as _unref, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "/cdn_modules/vue"'
    )
    expect(code).include('"hello"')
    expect(code).include('__file = "main.vue"')
  })

  test("should compile file vue ts", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
<template>
  <h1>hello</h1>
  {{ count }}
</template>

<script lang="ts" setup>
const count = ref<number>(0)
</script>
            `),
          "/main.vue",
          ".vue",
          new URLSearchParams(),
          sketchStore
        )
      )
    )

    expect(code).include(
      'import { createElementVNode as _createElementVNode, unref as _unref, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "/cdn_modules/vue"'
    )
    expect(code).include('"hello"')
    expect(code).include('__file = "main.vue"')
  })

  test("should compile file vue css", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
<template>
  <h1>hello</h1>
  {{ count }}
</template>

<script setup>
const count = ref(0)
</script>

<style lang="css">
h1 {
  color: red
}
</style>
            `),
          "/main.vue",
          ".vue",
          new URLSearchParams(),
          sketchStore
        )
      )
    )
    console.log(code)

    expect(code).include(
      'import { createElementVNode as _createElementVNode, unref as _unref, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "/cdn_modules/vue"'
    )
    expect(code).include('"hello"')
    expect(code).include('__file = "main.vue"')
    expect(code).include("style")
  })

  test("should compile file vue import ts", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
<template>
  <h1>hello</h1>
  <Counter />
</template>

<script setup>
import Counter from './Counter.vue'
const count = ref(0)
</script>
            `),
          "/main.vue",
          ".vue",
          new URLSearchParams(),
          sketchStore
        )
      )
    )

    expect(code).include('"hello"')
    expect(code).include('__file = "main.vue"')
    expect(code).include('import Counter from "/Counter.vue?import=vue";')
  })

  test("should compile file css module", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
.App {
  color: red
}

.header {
  font-size: 22px;
  color: black
}

.a {
  color: blue;
  font-weight: 500
}
          `),
          "/style.module.css",
          ".css",
          new URLSearchParams(),
          sketchStore
        )
      )
    )

    expect(code).include(
      '".__App_1a3a6a4b{color:red}.__header_75c41e03{font-size:22px;color:black}.__a_8daa19aa{color:blue;font-weight:500}";'
    )
    expect(code).include(
      ' { "App": "__App_1a3a6a4b", "header": "__header_75c41e03", "a": "__a_8daa19aa" };'
    )
  })

  test("should compile svelte", async () => {
    const code = uint8ToUTF8(
      new Uint8Array(
        await compilerFile(
          utf8ToUint8(`
    <script>
      let count = 0;

      function handleClick() {
        count += 1;
      }
    </script>

      <style>
        button {
          background: #ff3e00;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 2px;
        }
      </style>

      <button on:click={handleClick}>
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </button>`),
          "/App.svelte",
          ".svelte",
          new URLSearchParams(),
          sketchStore
        )
      )
    )
    
    expect(code).include("var Component$ = class extends SvelteComponentDev$")
  })
})
