import { describe, expect, test } from "vitest"

import { searchText } from "./search-text"

describe("search-text", () => {
  test("normal search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: false,
      regexp: false,
    }
    const result = Array.from(Array.from(searchText(text, options)))

    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("case sensitive search", () => {
    const text = "Hello World"
    const options = {
      search: "hello",
      caseSensitive: true,
      wholeWord: false,
      regexp: false,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([])
  })
  test("whole word search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regexp: false,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("regex search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: false,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("regex search with case sensitive", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: true,
      wholeWord: false,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("regex search with whole word", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("regex search with case sensitive and whole word", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: true,
      wholeWord: true,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("before text matches", () => {
    const text = "Shin! Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 6,
        match: "Hello",
        after: " World",
        before: "Shin! ",
        posStart: 6,
        posEnd: 11,
      },
    ])
  })
  test("after text matches", () => {
    const text = "Hello World! Ohayo! Shin"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World! Ohayo! Shin",
        before: "",
        posStart: 0,
        posEnd: 5,
      },
    ])
  })
  test("multi line", () => {
    const text = `Hello World! Ohayo! Shin

Sayonara!`
    const options = {
      search: "Sayonara",
      caseSensitive: false,
      wholeWord: true,
      regexp: true,
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 26,
        match: "Sayonara",
        after: "!",
        before: "",
        posStart: 26,
        posEnd: 34,
      },
    ])
  })
})
