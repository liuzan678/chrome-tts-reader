import { describe, expect, it } from "vitest";
import type { ReaderState } from "../../src/shared/contracts";
import {
  shouldLoadActiveTabContent,
  shouldPauseForTabActivation
} from "../../src/shared/tab-state";

function createState(overrides: Partial<ReaderState> = {}): ReaderState {
  return {
    activeTabId: 12,
    activeUrl: "https://example.com/article",
    availableVoices: [],
    currentIndex: 4,
    error: null,
    paragraphs: ["One", "Two"],
    rate: 1,
    source: "article",
    status: "playing",
    title: "Article",
    voiceName: null,
    ...overrides
  };
}

describe("shouldPauseForTabActivation", () => {
  it("keeps playback running when the user activates a different tab", () => {
    expect(shouldPauseForTabActivation(createState(), 99)).toBe(false);
  });
});

describe("shouldLoadActiveTabContent", () => {
  it("does not reload when the active tab already matches the in-memory reading state", () => {
    expect(
      shouldLoadActiveTabContent(createState({ status: "stopped" }), {
        id: 12,
        url: "https://example.com/article#section-two"
      })
    ).toBe(false);
  });

  it("reloads when the active tab is a different page", () => {
    expect(
      shouldLoadActiveTabContent(createState({ status: "stopped" }), {
        id: 99,
        url: "https://example.com/other"
      })
    ).toBe(true);
  });
});
