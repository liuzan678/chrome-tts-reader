# README language order design

## Goal

Adjust `README.md` so the Chinese section appears before the English section.

## Scope

- Update the top language navigation from `[English] | [中文]` to `[中文] | [English]`
- Move the Chinese README block to the top of the document
- Move the English README block to the bottom of the document
- Preserve all existing headings, body text, images, anchors, and links

## Recommended approach

Use a minimal structural reorder in `README.md` only.

This keeps the bilingual content intact while changing the reading order to match the requested preference. It avoids any wording changes, anchor renames, or broader documentation edits.

## Architecture and components

This change affects one file only:

- `README.md`

The document will keep the same two anchor targets:

- `#chinese`
- `#english`

The only structural difference is the order of the two language sections.

## Data flow

There is no runtime data flow. This is a documentation-only change.

## Error handling

No code paths or runtime behavior are affected.

The only thing to verify is that:

- the top navigation links still jump to the correct sections
- the screenshots and links remain unchanged
- the markdown structure still renders correctly on GitHub

## Testing

Manual verification is sufficient:

1. Open `README.md`
2. Confirm Chinese content appears first
3. Confirm English content appears second
4. Confirm the top navigation order is `[中文] | [English]`
5. Confirm `#chinese` and `#english` anchors still match their sections

## Out of scope

- Rewriting any Chinese or English copy
- Changing screenshots or image paths
- Changing installation or usage instructions
- Editing any files other than `README.md`
