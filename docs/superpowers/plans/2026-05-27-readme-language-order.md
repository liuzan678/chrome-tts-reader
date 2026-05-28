# README Language Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder `README.md` so the Chinese section appears first and the English section appears second, without changing any existing copy.

**Architecture:** This is a documentation-only change in a single Markdown file. Keep the existing bilingual content, anchors, screenshots, and links intact, and only change the top language navigation plus the order of the two language blocks.

**Tech Stack:** Markdown, Git, Python 3 for repeatable verification/edit commands

---

## File structure

- `README.md` — bilingual project documentation; the only file that will change during implementation
- `docs/superpowers/specs/2026-05-27-readme-language-order-design.md` — approved design reference for this change

### Task 1: Reorder bilingual README sections

**Files:**
- Modify: `README.md:1-356`
- Reference: `docs/superpowers/specs/2026-05-27-readme-language-order-design.md`

- [ ] **Step 1: Write the failing verification**

Create this one-off verification command to assert the target state before making changes:

```bash
python - <<'PY'
from pathlib import Path

text = Path("README.md").read_text()
assert text.startswith("[中文](#chinese) | [English](#english)"), "top nav is not Chinese-first"
assert text.index('<a id="chinese"></a>') < text.index('<a id="english"></a>'), "Chinese section is not before English section"
PY
```

- [ ] **Step 2: Run the verification to confirm it fails**

Run:

```bash
python - <<'PY'
from pathlib import Path

text = Path("README.md").read_text()
assert text.startswith("[中文](#chinese) | [English](#english)"), "top nav is not Chinese-first"
assert text.index('<a id="chinese"></a>') < text.index('<a id="english"></a>'), "Chinese section is not before English section"
PY
```

Expected: FAIL with `AssertionError: top nav is not Chinese-first`

- [ ] **Step 3: Apply the minimal README reorder**

Run this exact command to update the navigation order and swap the Chinese and English blocks while preserving all body content:

```bash
python - <<'PY'
from pathlib import Path

path = Path("README.md")
text = path.read_text()

old_nav = "[English](#english) | [中文](#chinese)"
new_nav = "[中文](#chinese) | [English](#english)"
english_anchor = '<a id="english"></a>'
chinese_anchor = '<a id="chinese"></a>'
separator = "\n---\n\n"

english_start = text.index(english_anchor)
separator_index = text.index(separator, english_start)
chinese_start = text.index(chinese_anchor, separator_index)

prefix = text[:english_start].replace(old_nav, new_nav, 1)
english_block = text[english_start:separator_index].rstrip() + "\n"
chinese_block = text[chinese_start:].rstrip() + "\n"

updated = prefix + chinese_block + separator + english_block
path.write_text(updated)
PY
```

- [ ] **Step 4: Run the verification to confirm it passes**

Run:

```bash
python - <<'PY'
from pathlib import Path

text = Path("README.md").read_text()
assert text.startswith("[中文](#chinese) | [English](#english)"), "top nav is not Chinese-first"
assert text.index('<a id="chinese"></a>') < text.index('<a id="english"></a>'), "Chinese section is not before English section"
print("README language order verified")
PY
```

Expected: PASS with output `README language order verified`

- [ ] **Step 5: Verify the rendered structure manually**

Open `README.md` and confirm all of the following:

```text
1. The first line is [中文](#chinese) | [English](#english)
2. The Chinese section starts at the top of the document body
3. The English section appears after the horizontal rule
4. The four screenshot image paths are unchanged
5. The #chinese and #english anchors still match their sections
```

- [ ] **Step 6: Commit the documentation change**

Run:

```bash
git add README.md
git commit -m "docs: reorder README language sections"
```

Expected: a new commit containing only the `README.md` reorder
