import { flatToTree } from "./flat-to-tree"

describe("flat-to-tree", () => {

  function toMap<T>(data: Record<string, T>): Map<string, T> {
    return new Map(Object.entries(data))
  }

  test("normal file", () => {
    const data = toMap({
      "foo.js": []
    })

    const tree = flatToTree(data)

    expect(tree).toEqual({
      dirs: new Map(),
      files: toMap({
        "foo.js": {
          fullPath: "foo.js",
          matches: []
        }
      })
    })
  })

  test("file in subdirectory", () => {
    const data = toMap({
      "foo/bar.js": []
    })
    const tree = flatToTree(data)

    expect(tree).toEqual({
      files: new Map,
      dirs: toMap({
        "foo": {
          fullPath: "foo",
          children: {
            dirs: new Map(),
            files: toMap({
              "bar.js": {
                fullPath: "foo/bar.js",
                matches: []
              }
            })
          }
        }
      })
    })
  })

  test("file in subdirectory with subdirectory", () => {
    const data = toMap({
      "foo/bar/baz.js": []
    })
    const tree = flatToTree(data)
    expect(tree).toEqual({
      files: new Map,
      dirs: toMap({
        "foo": {
          fullPath: "foo",
          children: {
            files: new Map,
            dirs: toMap({
              "bar": {
                fullPath: "foo/bar",
                children: {
                  dirs: new Map,
                  files: toMap({
                    "baz.js": {
                      fullPath: "foo/bar/baz.js",
                      matches: []
                    }
                  })
                }
              }
            })
          }
        }
      })
    })
  })

  test("file in nested subdirectory", () => {
    const data = toMap({
      "foo/bar/baz/qux.js": []
    })
    const tree = flatToTree(data)
    expect(tree).toEqual({
      files: new Map,
      dirs: toMap({
        "foo": {
          fullPath: "foo",
          children: {
            files: new Map,
            dirs: toMap({
              "bar": {
                fullPath: "foo/bar",
                children: {
                  files: new Map,
                  dirs: toMap({
                    "baz": {
                      fullPath: "foo/bar/baz",
                      children: {
                        dirs: new Map,
                        files: toMap({
                          "qux.js": {
                            fullPath: "foo/bar/baz/qux.js",
                            matches: []
                          }
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    })
  })

  test("multiple file in nested subdirectory", () => {
    const data = toMap({
      "foo/bar/baz/qux.js": [],
      "foo/bar/quux.js": []
    })
    const tree = flatToTree(data)
    expect(tree).toEqual({
      files: new Map,
      dirs: toMap({
        "foo": {
          fullPath: "foo",
          children: {
            files: new Map,
            dirs: toMap({
              "bar": {
                fullPath: "foo/bar",
                children: {
                  files: toMap({
                    "quux.js": {
                      fullPath: "foo/bar/quux.js",
                      matches: []
                    }
                  }),
                  dirs: toMap({
                    "baz": {
                      fullPath: "foo/bar/baz",
                      children: {
                        dirs: new Map,
                        files: toMap({
                          "qux.js": {
                            fullPath: "foo/bar/baz/qux.js",
                            matches: []
                          }
                        })
                      }
                    },
                  })
                }
              }
            })
          }
        }
      })
    })
  })

  test("mixed", () => {
    const data = toMap({
      "foo.js": [],
      "foo/bar.js": [],
      "foo/bar/baz.js": [],
      "foo/bar/baz/qux.js": []
    })
    const tree = flatToTree(data)
    expect(tree).toEqual({
      files: toMap({
        "foo.js": {
          fullPath: "foo.js",
          matches: []
        }
      }),
      dirs: toMap({
        foo: {
          fullPath: "foo",
          children: {
            files: toMap({
              "bar.js": {
                fullPath: "foo/bar.js",
                matches: []
              }
            }),
            dirs: toMap({
              "bar": {
                fullPath: "foo/bar",
                children: {
                  files: toMap({
                    "baz.js": {
                      fullPath: "foo/bar/baz.js",
                      matches: []
                    },
                  }),
                  dirs: toMap({
                    "baz": {
                      fullPath: "foo/bar/baz",
                      children: {
                        dirs: new Map,
                        files: toMap({
                          "qux.js": {
                            fullPath: "foo/bar/baz/qux.js",
                            matches: []
                          }
                        })
                      }
                    }
                  }),
                }
              }
            })
          }
        }
      })
    })
  })
})
