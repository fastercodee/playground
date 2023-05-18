import { cleanupFS, writeFile } from "app/setup.vitest"

import { respondWith } from "./respond-with"

describe("respond-with", () => {
  const rootのsketch = "/"
  const tsconfigのFile: ReturnType<typeof useFile<string>> = {
    ready: Promise.resolve(),
    data: "{}",
  }
  const watchFs = new WatcherFs()

  beforeEach(cleanupFS)

  test("should request /", async () => {
    await writeFile("index.html", "hello index.html")

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/",
      headers: [],
    })

    console.log(res)

    expect(res.return?.init.status).toEqual(200)
    expect(new Uint8Array(res.return?.content ?? [])).toEqual(
      utf8ToUint8("hello index.html")
    )
  })

  test("should request /main.js", async () => {
    await writeFile(
      "main.js",
      `
    import './style.css'
    import javascriptLogo from './javascript.svg'
    import viteLogo from '/vite.svg'
    import { setupCounter } from './counter.js'

    document.querySelector('#app').innerHTML = \`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="\${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
          <img src="\${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        </a>
        <h1>Hello Vite!</h1>
        <div class="card">
          <button id="counter" type="button"></button>
        </div>
        <p class="read-the-docs">
          Click on the Vite logo to learn more
        </p>
      </div>
    \`

    setupCounter(document.querySelector('#counter'))
    `
    )

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/main.js",
      headers: [],
    })

    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? [])))
      .include(`// ../../main.js?resolve=
import "/style.css?import=css";
import javascriptLogo from "/javascript.svg?import=url";
import viteLogo from "/vite.svg?import=url";
import { setupCounter } from "/counter.js";`)
  })

  test("should request /style.css (static file)", async () => {
    await writeFile("style.css", "body{color:red}")

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/style.css",
      headers: [],
    })

    expect(res.return?.init.status).toEqual(200)
    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? []))).toBe(
      "body{color:red}"
    )
  })

  test("should request /js.svg (static file)", async () => {
    await writeFile("js.svg", "body{color:red}")

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/js.svg",
      headers: [],
    })

    expect(res.return?.init.status).toEqual(200)
    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? []))).toBe(
      "body{color:red}"
    )
  })

  test("should request /style.css?import=css (gen from file js)", async () => {
    await writeFile("style.css", "body{color:red}")

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/style.css?import=css",
      headers: [],
    })

    expect(res.return?.init.status).toEqual(200)
    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? []))).toBe(
      "const style = document.createElement('link'); style.rel = 'stylesheet'; style.type = 'text/css'; style.href = \"/style.css\"; document.head.appendChild(style)"
    )
  })

  test("should request /ts.svg?url (gen from file js)", async () => {
    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/ts.svg?url",
      headers: [],
    })

    expect(res.return?.init.status).toEqual(200)
    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? []))).toBe(
      'export default "/ts.svg"'
    )
  })

  test("should request /main (auto exact file)", async () => {
    await writeFile(
      "main.js",
      `
    import './style.css'
    import javascriptLogo from './javascript.svg'
    import viteLogo from '/vite.svg'
    import { setupCounter } from './counter.js'

    document.querySelector('#app').innerHTML = \`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="\${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
          <img src="\${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        </a>
        <h1>Hello Vite!</h1>
        <div class="card">
          <button id="counter" type="button"></button>
        </div>
        <p class="read-the-docs">
          Click on the Vite logo to learn more
        </p>
      </div>
    \`

    setupCounter(document.querySelector('#counter'))
    `
    )

    const res = await respondWith(rootのsketch, tsconfigのFile, watchFs, {
      url: "http://localhost/main",
      headers: [],
    })

    expect(uint8ToUTF8(new Uint8Array(res.return?.content ?? [])))
      .include(`// ../../main.js?resolve=
import "/style.css?import=css";
import javascriptLogo from "/javascript.svg?import=url";
import viteLogo from "/vite.svg?import=url";
import { setupCounter } from "/counter.js";`)
  })

})
