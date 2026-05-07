# GitHub README Design for Chrome TTS Reader

**Date:** 2026-05-06

## Goal

Replace the current minimal README with a GitHub-ready bilingual README that presents Chrome TTS Reader as a polished open-source project. The new document should help first-time visitors quickly understand what the extension does, what problems it solves, how to install it, and how to build it from source.

## Audience

### Primary Audience

- GitHub visitors evaluating the project for personal use
- Users looking for a Chrome extension that reads webpage content aloud
- People deciding whether the repository looks active, credible, and worth starring or trying

### Secondary Audience

- Developers who want to build the extension from source
- Contributors who need a quick overview of the project structure and commands

## README Positioning

The README should be user-facing first, not architecture-first. It should follow common open-source repository conventions used by strong GitHub projects:

- concise headline and value proposition
- immediately visible feature summary
- installation and usage before deep technical details
- accurate, restrained claims based on implemented functionality
- clean structure that scans well on GitHub

The tone should stay professional and clear. Avoid hype, vague AI-style wording, and promises that the repository does not yet fulfill.

## Content Principles

### Accuracy

Only describe functionality that is already reflected in the codebase, manifest, tests, and design documents:

- read selected text
- read article-like page content
- persistent side panel controls
- play, pause, stop, next, and previous paragraph controls
- voice selection and speech rate
- active paragraph highlighting
- resume reading on the same URL
- keyboard shortcuts
- support focused on article, blog, and documentation pages

### Honest Scope

The README must clearly state current constraints:

- Chrome extension based on Manifest V3
- best effort on complex or highly dynamic pages
- restricted pages such as `chrome://` are not supported
- no cloud TTS providers
- no AI summarization or translation features

### GitHub Readability

The document should be easy to skim:

- short paragraphs
- bullet-heavy sections where useful
- predictable section headings
- minimal duplication between sections

## Bilingual Format

The README will use complete English content first, followed by complete Chinese content.

### Why This Format

- English-first is the most standard layout for public GitHub repositories
- international visitors can read the main document immediately
- Chinese readers still get full documentation, not a reduced summary
- both language sections can stay structurally aligned for easier maintenance

### Language Navigation

The top of the README should include simple jump links:

- `English`
- `中文`

## README Structure

### 1. Hero

The opening section should include:

- project name: `Chrome TTS Reader`
- one-sentence summary
- short feature-oriented value statement
- optional badges area that does not depend on fake external URLs
- language navigation links

The summary should position the project as a Chrome extension that reads selected text or article-like page content aloud with persistent side-panel controls.

### 2. Screenshots

Add a screenshots section near the top so visitors can quickly understand the interface.

Use these reserved image paths:

- `./docs/images/hero.png`
- `./docs/images/sidepanel.png`
- `./docs/images/highlight.png`

The README should reference these paths directly so screenshots can be added later without changing the structure.

### 3. Features

Provide a concise bullet list of the core capabilities. This section should emphasize user-visible outcomes instead of implementation details.

### 4. Installation

Split installation into two parts.

#### Install from Release / Web Store

Reserve space for:

- GitHub Releases
- Chrome Web Store

Because these distribution channels are not yet present, label them clearly as placeholders or coming soon, while keeping the section ready for future publishing.

#### Build from Source

Document the real installation path that works today:

1. install dependencies with `npm install`
2. build with `npm run build`
3. open `chrome://extensions`
4. enable Developer mode
5. load the `dist/` directory as an unpacked extension

### 5. Usage

Explain the main usage flow from the user perspective:

- open the extension side panel
- read the current page
- read selected text
- control playback
- change voice and rate
- continue reading from the saved position

### 6. Keyboard Shortcuts

Document the shortcuts defined in the manifest for:

- toggle play or pause
- next paragraph
- previous paragraph

Show both default and macOS mappings where relevant.

### 7. How It Works

Add a short technical overview that improves credibility without overwhelming casual users. Keep it brief and concrete:

- background service worker manages playback state and Chrome TTS integration
- content script extracts readable text and controls in-page highlighting
- side panel provides persistent reading controls

### 8. Project Structure

List the main directories and their purpose:

- `public/`
- `src/background/`
- `src/content/`
- `src/sidepanel/`
- `src/shared/`
- `tests/`

Keep this section concise.

### 9. Development

Document the main commands:

- `npm run build`
- `npm run dev`
- `npm test`

Mention the core stack briefly: TypeScript, Vite, Vitest, Chrome Extensions Manifest V3.

### 10. Limitations

Call out current limitations explicitly to reduce confusion and issue noise.

### 11. Roadmap

Include a modest roadmap section with realistic future improvements, such as:

- packaged releases
- Chrome Web Store publishing
- stronger extraction on more complex pages
- broader compatibility improvements

Avoid speculative or overly broad roadmap items.

### 12. License

Do not invent a license. If no license file is present in the repository, state that the license is not yet specified.

## Asset Conventions

The README should use relative repository paths for screenshots. The expected image location is:

- `docs/images/`

This keeps documentation assets in the repository and works well on GitHub.

## Out of Scope

The README should not include:

- fake Chrome Web Store links
- fake release download links
- unsupported browser claims
- references to AI features that do not exist
- deep implementation detail that belongs in internal design docs

## Implementation Notes

The implementation step should:

- replace the existing `README.md`
- preserve accurate setup commands from the current project
- keep markdown formatting clean and GitHub-friendly
- maintain one English section and one Chinese section with matching structure
- use screenshot references that point to `docs/images/...`

## Acceptance Criteria

The README is complete when all of the following are true:

1. it is fully bilingual, with English first and Chinese second
2. it follows a standard public GitHub open-source README structure
3. it accurately describes the extension’s implemented feature set
4. it includes both future distribution placeholders and working source-install instructions
5. it reserves screenshot paths under `docs/images/`
6. it includes usage, shortcuts, development, limitations, roadmap, and license sections
7. it reads like a polished repository front page rather than an internal engineering note
