# Chrome TTS Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Manifest V3 Chrome extension that reads selected text or extracted article content aloud with a persistent side panel, paragraph navigation, highlight, shortcuts, and resume support.

**Architecture:** Use a service worker for TTS orchestration and state, a content script for extraction and highlighting, and a side panel for controls. Keep shared contracts and pure logic in small TypeScript modules so core behavior can be tested outside the browser runtime.

**Tech Stack:** TypeScript, Vite, Vitest, Chrome Extensions Manifest V3, chrome.tts, sidePanel, storage

---

## File Structure

- `package.json`: scripts and dependencies
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: build configuration for multiple extension entrypoints
- `manifest.json`: MV3 manifest
- `src/shared/contracts.ts`: extension message and state types
- `src/shared/text.ts`: paragraph normalization and extraction helpers
- `src/shared/storage.ts`: storage keys and normalization helpers
- `src/background/index.ts`: service worker entry
- `src/background/player.ts`: playback reducer and TTS orchestration helpers
- `src/content/index.ts`: content-script entry
- `src/content/extractor.ts`: DOM extraction logic
- `src/content/highlight.ts`: paragraph highlight logic
- `src/sidepanel/index.html`: side panel HTML
- `src/sidepanel/main.ts`: side panel UI bootstrap
- `src/sidepanel/app.ts`: side panel interactions
- `tests/shared/text.test.ts`: text helper tests
- `tests/background/player.test.ts`: playback state tests

### Task 1: Scaffold The Toolchain

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`

- [ ] **Step 1: Add package metadata and scripts**

```json
{
  "name": "chrome-tts-reader",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Add TypeScript compiler settings**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "types": ["chrome", "vitest/globals"]
  }
}
```

- [ ] **Step 3: Add a Vite build that emits service worker, content script, and side panel assets**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        background: "src/background/index.ts",
        content: "src/content/index.ts",
        sidepanel: "src/sidepanel/index.html"
      }
    }
  }
});
```

### Task 2: Define Shared Contracts And Tests

**Files:**
- Create: `src/shared/contracts.ts`
- Create: `src/shared/text.ts`
- Test: `tests/shared/text.test.ts`

- [ ] **Step 1: Write the failing text-normalization tests**

```ts
import { describe, expect, it } from "vitest";
import { normalizeParagraphs } from "../../src/shared/text";

describe("normalizeParagraphs", () => {
  it("drops empty and duplicate paragraphs while preserving order", () => {
    expect(
      normalizeParagraphs(["  Hello   world  ", "", "Hello world", "Second"])
    ).toEqual(["Hello world", "Second"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/shared/text.test.ts`
Expected: FAIL because `normalizeParagraphs` does not exist yet.

- [ ] **Step 3: Add the minimal shared types and implementation**

```ts
export type PlaybackStatus = "idle" | "playing" | "paused" | "stopped";

export function normalizeParagraphs(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/shared/text.test.ts`
Expected: PASS

### Task 3: Drive Playback State With Tests

**Files:**
- Create: `src/background/player.ts`
- Test: `tests/background/player.test.ts`

- [ ] **Step 1: Write the failing playback reducer test**

```ts
import { describe, expect, it } from "vitest";
import { createInitialPlaybackState, reducePlaybackState } from "../../src/background/player";

describe("reducePlaybackState", () => {
  it("moves to the next paragraph on advance", () => {
    const state = createInitialPlaybackState(["One", "Two"]);
    const next = reducePlaybackState(state, { type: "advance" });
    expect(next.currentIndex).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/background/player.test.ts`
Expected: FAIL because the player module does not exist yet.

- [ ] **Step 3: Add the minimal reducer implementation**

```ts
export function createInitialPlaybackState(paragraphs: string[]) {
  return { paragraphs, currentIndex: 0, status: "idle" as const };
}

export function reducePlaybackState(
  state: ReturnType<typeof createInitialPlaybackState>,
  event: { type: "advance" }
) {
  const nextIndex = Math.min(state.currentIndex + 1, state.paragraphs.length - 1);
  return { ...state, currentIndex: nextIndex };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/background/player.test.ts`
Expected: PASS

### Task 4: Add The MV3 Manifest And Runtime Entries

**Files:**
- Create: `manifest.json`
- Create: `src/background/index.ts`
- Create: `src/content/index.ts`
- Create: `src/sidepanel/index.html`
- Create: `src/sidepanel/main.ts`

- [ ] **Step 1: Add the MV3 manifest with required permissions and entry points**
- [ ] **Step 2: Add background bootstrap and message listeners**
- [ ] **Step 3: Add content-script bootstrap**
- [ ] **Step 4: Add side panel HTML and bootstrap script**
- [ ] **Step 5: Run `npm run build` and verify the bundle emits all entry points**

### Task 5: Implement Content Extraction

**Files:**
- Create: `src/content/extractor.ts`
- Modify: `src/content/index.ts`
- Test: `tests/shared/text.test.ts`

- [ ] **Step 1: Add a failing test for article-like extraction helpers that prefer semantic containers**
- [ ] **Step 2: Run `npm test -- tests/shared/text.test.ts` and verify the failure is specific**
- [ ] **Step 3: Implement selection-first and article-container fallback extraction**
- [ ] **Step 4: Re-run the targeted tests and confirm PASS**

### Task 6: Implement Highlight And Resume

**Files:**
- Create: `src/content/highlight.ts`
- Modify: `src/content/index.ts`
- Modify: `src/shared/storage.ts`

- [ ] **Step 1: Add storage key helpers for resume state**
- [ ] **Step 2: Implement paragraph highlighting and scroll-into-view**
- [ ] **Step 3: Persist and restore paragraph index by normalized URL**
- [ ] **Step 4: Run `npm test` and `npm run build`**

### Task 7: Wire TTS Playback

**Files:**
- Modify: `src/background/index.ts`
- Modify: `src/background/player.ts`
- Modify: `src/shared/contracts.ts`

- [ ] **Step 1: Add message contracts for load, play, pause, stop, next, previous, and set-voice**
- [ ] **Step 2: Implement `chrome.tts.speak`, `pause`, `resume`, `stop`, and `getVoices` integration**
- [ ] **Step 3: Publish playback-state updates to the side panel and content script**
- [ ] **Step 4: Run `npm test` and verify the reducer tests still pass**

### Task 8: Build The Side Panel Controls

**Files:**
- Create: `src/sidepanel/app.ts`
- Modify: `src/sidepanel/main.ts`

- [ ] **Step 1: Render the current article title, status, and paragraph index**
- [ ] **Step 2: Add controls for play, pause, stop, previous, next, rate, and voice**
- [ ] **Step 3: Add resume behavior when reopening the side panel**
- [ ] **Step 4: Run `npm run build` and manually load the unpacked extension in Chrome**

### Task 9: Add Context Menu And Commands

**Files:**
- Modify: `manifest.json`
- Modify: `src/background/index.ts`

- [ ] **Step 1: Add keyboard shortcut definitions for play/pause and next/previous**
- [ ] **Step 2: Register a context menu that reads the current selection**
- [ ] **Step 3: Verify the commands and context menu trigger the expected message flow**

### Task 10: Manual Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document local development, build, and Chrome loading instructions**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Manually validate on at least one news article, one blog post, and one docs page**
