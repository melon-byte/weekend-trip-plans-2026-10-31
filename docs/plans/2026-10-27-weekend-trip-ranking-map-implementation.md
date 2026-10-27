# Weekend Trip Ranking and Region Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a unified 18-route ranking board, clickable route modal and local region map without losing the region classes, images, reviews, fee warnings or visible accommodation section.

**Architecture:** Extend the existing `build-v4.mjs` data model with three new
route ratings and a generated modal per route. The build script emits the
same standalone v4 HTML and then the published root page is replaced with the
verified file. The map is inline SVG and needs no external service.

**Tech Stack:** Node.js build script, semantic HTML, inline CSS/SVG,
native `<dialog>`, local Chrome DevTools verification.

---

### Task 1: Add rating and modal data

**Files:**
- Modify: `D:\codex\trip-review-research\publish\scripts\build-v4.mjs`
- Read: `D:\codex\trip-review-research\trip-data.json`

**Step 1: Add rating entries for `s01`, `s02`, `s03`.**

Use the existing 4 dimensions and store `parts`, `total`, `stars`,
`confidence`, `reason`, `deductions`, and an evidence note. Do not alter old
route totals.

**Step 2: Derive a new 18-route ranking from total score.**

Sort by total descending; use the old route order as the tie-breaker. Render
rank numbers from the sorted array, not from the old rank property.

**Step 3: Render one native dialog per route.**

Each dialog contains title, region, score, one-line reputation, fee warning,
travel, activity chips, both days, available local images, evening stay and
source. Escape the generated text and never inject remote map tiles.

### Task 2: Add ranking and map markup

**Files:**
- Modify: `D:\codex\trip-review-research\publish\scripts\build-v4.mjs`

**Step 1: Replace the overview card with the region map section.**

Use inline SVG with Lujiazui and region labels. Mark regions with links to
their section anchors and a note that it is a relative sketch.

**Step 2: Add the ranking section before the regional sections.**

The board contains 18 clickable rows. Each row shows rank, local image,
title, one-line reputation, tags and score. The score breakdown is visible
inside the dialog.

**Step 3: Convert compact route cards to modal launchers.**

Keep images, titles, travel, one-line reputation, fee warnings and tags in
the card. Move long timelines and secondary images to the dialog.

### Task 3: Browser and content verification

**Files:**
- Modify: `D:\codex\trip-review-research\publish\scripts\verify-v4-chrome.mjs`
- Output: screenshots in `D:\codex\trip-review-research\publish`

**Step 1: Add checks for 18 board rows, 18 route cards, 18 dialogs, and 14 stay cards.**

**Step 2: Open a board row and assert the dialog is open and has a close control.**

**Step 3: Verify no horizontal overflow, no broken images, no forbidden budget terms, and no accommodation section inside `<details>`.**

**Step 4: Capture mobile and desktop screenshots using the installed Chrome executable.**

Run:

```powershell
Set-Location 'D:\codex\trip-review-research\publish'
node scripts\build-v4.mjs
node scripts\verify-v4-chrome.mjs
```

Expected: route count `18`, stay count `14`, no broken images, no overflow,
and successful modal open/close.

### Task 4: Publish

**Step 1: Copy the verified standalone file to `index.html`.**

**Step 2: Re-run static and browser checks against `index.html`.**

**Step 3: Commit only the page, build script, verification script and plan
files. Leave unrelated untracked screenshots and test assets untouched.**

**Step 4: Push to the configured GitHub remote and verify the live URL.**
