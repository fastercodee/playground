describe("base64-buffer", () => {
  test("base64ToUint8", () => {
    expect(base64ToUint8(btoa("hello world"))).toEqual(
      new TextEncoder().encode("hello world")
    )
  })
})
