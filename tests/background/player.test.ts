import { describe, expect, it } from "vitest";
import {
  createInitialPlaybackState,
  reducePlaybackState
} from "../../src/background/player";

describe("reducePlaybackState", () => {
  it("moves to the next paragraph on advance", () => {
    const state = createInitialPlaybackState(["One", "Two"]);
    const next = reducePlaybackState(state, { type: "advance" });

    expect(next.currentIndex).toBe(1);
  });

  it("does not move before the first paragraph on rewind", () => {
    const state = createInitialPlaybackState(["One", "Two"]);
    const next = reducePlaybackState(state, { type: "rewind" });

    expect(next.currentIndex).toBe(0);
  });

  it("updates the playback status", () => {
    const state = createInitialPlaybackState(["One", "Two"]);
    const next = reducePlaybackState(state, {
      type: "set-status",
      status: "playing"
    });

    expect(next.status).toBe("playing");
  });

  it("moves to a specific paragraph index", () => {
    const state = createInitialPlaybackState(["One", "Two", "Three"]);
    const next = reducePlaybackState(state, {
      type: "set-index",
      index: 2
    });

    expect(next.currentIndex).toBe(2);
  });
});
