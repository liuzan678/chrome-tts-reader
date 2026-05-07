import { describe, expect, it } from "vitest";
import { normalizeParagraphs } from "../../src/shared/text";

describe("normalizeParagraphs", () => {
  it("drops empty and duplicate paragraphs while preserving order", () => {
    expect(
      normalizeParagraphs(["  Hello   world  ", "", "Hello world", "Second"])
    ).toEqual(["Hello world", "Second"]);
  });
});
