describe("compiler-file", async () => {
  test("should compile file import js", async () => {
    expect(
      uint8ToUTF8(
        await compilerFile(
          utf8ToUint8("import a from './a'"),
          "/main.js",
          ".js",
          new URLSearchParams(),
          ""
        )
      )
    ).include('import a from "/a?import";')
  })

  test("should compile file import css", async () => {
    expect(
      uint8ToUTF8(
        await compilerFile(
          utf8ToUint8("import './style.css'"),
          "/main.js",
          ".js",
          new URLSearchParams(),
          ""
        )
      )
    ).include('import "/style.css?import=css";')
  })

  test("should compile file import svg", async () => {
    expect(
      uint8ToUTF8(
        await compilerFile(
          utf8ToUint8("import image from './javascript.svg'"),
          "/main.js",
          ".js",
          new URLSearchParams(),
          ""
        )
      )
    ).include('import image from "/javascript.svg?import=url";')
  })

  test("should compile file ?url", async () => {
    expect(
      uint8ToUTF8(
        await compilerFile(
          utf8ToUint8("import image from './javascript.svg'"),
          "/main.js",
          ".js",
          new URLSearchParams("?url"),
          ""
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
        await compilerFile(
          utf8ToUint8("import image from './javascript.svg'"),
          "/main.js",
          ".js",
          new URLSearchParams("?base64"),
          ""
        )
      )
    ).include(`var main_default = "aW1wb3J0IGltYWdlIGZyb20gJy4vamF2YXNjcmlwdC5zdmcn";
export {
  main_default as default
};`)
  })


  test("should compile file ?import=css", async () => {
    console.log(
      uint8ToUTF8(
        await compilerFile(
          utf8ToUint8("import image from './javascript.svg'"),
          "/main.js",
          ".js",
          new URLSearchParams("?import=css"),
          ""
        )
      )
    )
  })
})
