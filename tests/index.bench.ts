import { describe, bench } from "vitest";

describe("string access", () => {
  bench("charAt", () => {
    const string = "hello world";
    const compare = "abcdefghijklmnopqrstuvwxyz";

    let result: boolean;
    for (let i = 0; i < string.length; i++) {
      result = string.charAt(i) === compare.charAt(i);
    }
  });

  // Accessing via charCode is faster.
  bench("charCode", () => {
    const string = "hello world";
    const compare = "abcdefghijklmnopqrstuvwxyz";

    let result: boolean;
    for (let i = 0; i < string.length; i++) {
      result = string.charCodeAt(i) === compare.charCodeAt(i);
    }
  });
});

describe("iterating over string", () => {
  // Fastest.
  bench("for loop with counter", () => {
    const string = "abc/def/ghi";
    let result: string;
    for (let i = 0; i < string.length; i++) {
      result = string[i];
    }
  });

  bench("for of", () => {
    const string = "abc/def/ghi";
    let result: string;
    for (const char of string) {
      result = char;
    }
  });

  bench("split and iterate over array", () => {
    const string = "abc/def/ghi";
    const segments = string.split("/");

    let result: string;
    for (let i = 0; i < segments.length; i++) {
      result = segments[i];
    }
  });
});

describe("creating objects", () => {
  bench("Object.create", () => {
    const object = Object.create(null);
    object
  })

  // Fastest.
  bench("object literal", () => {
    const object = {}
    object
  })
})
