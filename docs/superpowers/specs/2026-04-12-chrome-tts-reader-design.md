# Chrome TTS Reader Design

**Date:** 2026-04-12

## Goal

Build a Chrome browser extension that reads webpage text aloud for article, blog, and documentation pages. V1 supports both selected-text playback and full-page main-content playback without any AI summarization.

## Product Scope

### In Scope

- Read selected text on the current page
- Read extracted main content from article-like pages
- Playback controls: play, pause, stop
- Navigation controls: previous paragraph, next paragraph
- Voice selection and speech rate
- Keyboard shortcuts for core playback actions
- Highlight the currently spoken paragraph in-page
- Resume from the last playback position on the same URL
- Chrome Manifest V3 implementation

### Out of Scope

- AI summarization, translation, or rewriting
- PDF support
- `chrome://`, Web Store, or other restricted-page support
- Cloud TTS providers
- Cross-browser compatibility in V1

## Target Pages

V1 optimizes for pages with clear article structure:

- News and media article pages
- Personal and company blogs
- Technical documentation pages

Pages with heavily dynamic layouts, infinite feeds, or embedded application shells are best-effort only in V1.

## User Experience

### Entry Points

- Click the extension action to open the side panel and start or resume reading
- Use the context menu on selected text to read only that selection
- Use keyboard shortcuts for playback control

### Playback Rules

- If the user has selected text, selection playback takes priority
- Otherwise, the extension extracts the main readable content and reads it paragraph by paragraph
- The side panel stays open during playback and reflects current state
- The active paragraph is highlighted and optionally scrolled into view
- Playback can resume on the same URL from the saved paragraph index

## Technical Design

### Architecture

The extension uses a standard Manifest V3 split:

- `service worker` owns playback state, TTS API access, and extension event handling
- `content script` extracts visible text, tracks selection, and manages paragraph highlighting
- `side panel` renders controls and current state
- `shared` modules define message contracts, storage keys, and parsing utilities

### Why This Architecture

`chrome.tts` is available to extension contexts, while content scripts are responsible for DOM inspection and manipulation. A message-based architecture keeps extraction, playback, and UI responsibilities separate and testable.

### Content Extraction Strategy

Extraction priority:

1. Current text selection
2. Semantic containers such as `article`, `main`, and `[role="main"]`
3. Readability-based extraction for article pages
4. Visible block fallback using `p`, headings, list items, and `pre`

Each extracted paragraph is normalized, deduplicated, assigned a stable paragraph id, and returned with enough selector/path metadata to find the same element again for highlight and resume behavior.

### Playback Model

Playback is organized as a queue of paragraph utterances. The service worker calls `chrome.tts.speak()` one paragraph at a time and advances on `end` events. This keeps paragraph-level navigation simple and aligns highlight updates with playback state.

### State Model

The extension maintains:

- Active tab id
- Active URL
- Playback source type: selection or article
- Paragraph list
- Current paragraph index
- Selected voice
- Rate
- Playing / paused / stopped status

`chrome.storage.sync` stores durable user preferences such as voice and rate. `chrome.storage.local` stores page-specific resume state keyed by normalized URL.

## Error Handling

- If no readable content is found, show a clear side-panel error
- If no voices are available, fall back to Chrome defaults and surface a warning
- If the tab changes or closes, stop playback and clear active tab state
- If a single paragraph fails to resolve for highlight, continue playback without blocking TTS
- On SPA route changes, invalidate paragraph references and re-extract content

## Testing Strategy

- Unit test text normalization, paragraph segmentation, selector heuristics, and playback reducer/state transitions
- Smoke-test extension flows manually on representative news, blog, and docs pages
- Verify restricted-page behavior fails safely

## Risks And Decisions

- Main-content extraction is heuristic. V1 should prefer predictable article pages over trying to support every site.
- Paragraph-level TTS is simpler than character-accurate resume. V1 stores paragraph index first and only uses finer offsets if Chrome exposes reliable event data.
- Side panel is preferred over popup because playback needs persistent controls during long reading sessions.
