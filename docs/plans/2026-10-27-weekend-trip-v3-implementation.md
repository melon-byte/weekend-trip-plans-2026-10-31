# Weekend Trip v3 Implementation Plan

> **For Codex:** Execute these tasks in order. The user has already approved the v3 direction and asked to continue.

**Goal:** Ship a concise, large-type, mobile-first trip page at GitHub Pages.

**Architecture:** One static HTML file with inline CSS and no runtime dependencies. Existing verified assets are referenced from `assets/stays/`; native `details` elements hold the two-day itineraries.

**Tech Stack:** HTML, CSS, PowerShell, headless Chromium via the existing Chrome DevTools Protocol capture scripts, Git, GitHub Pages.

---

### Task 1: Prepare Confirmed Stay Images

**Files:**
- Create: `assets/stays/chengyu-card.jpg`
- Create: `assets/stays/miyi-card.jpg`
- Keep: `assets/stays/xibaifang-hero.jpg`

**Step 1: Crop only the confirmed property-photo regions**

Run the image crop command against `chengyu-ctrip.jpg` and `miyi-ctrip.jpg`. Do not use the unrelated villa images.

**Step 2: Inspect all three card images**

Open each image locally and confirm it depicts the intended stay or a crop of the corresponding Ctrip listing.

**Step 3: Check dimensions**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem 'assets\stays\*-card.jpg','assets\stays\xibaifang-hero.jpg' |
  ForEach-Object {
    $img=[System.Drawing.Image]::FromFile($_.FullName)
    [PSCustomObject]@{Name=$_.Name;Width=$img.Width;Height=$img.Height}
    $img.Dispose()
  }
```

Expected: each image has non-zero width and height.

### Task 2: Build the v3 Page

**Files:**
- Create: `weekend-trip-plans-2026-10-31-v3.html`
- Modify later: `index.html`

**Step 1: Write the concise page**

Use a large-type single column on mobile and three cards on desktop. Include exactly the confirmed facts, one-line judgments, route estimates, fee reminders, and folded two-day plans.

**Step 2: Remove the budget surface**

Confirm the HTML has no budget section, total price, per-person amount, or room-rate module.

**Step 3: Run a structural check**

Run:

```powershell
$html = Get-Content -Raw 'weekend-trip-plans-2026-10-31-v3.html'
[PSCustomObject]@{
  StayCards = ([regex]::Matches($html, 'class="stay-card"')).Count
  Details = ([regex]::Matches($html, '<details')).Count
  BudgetWords = ([regex]::Matches($html, '预算|总价|人均|房价')).Count
}
```

Expected: `StayCards = 3`, `Details = 3`, `BudgetWords = 0`.

### Task 3: Browser Verification

**Files:**
- Read: `weekend-trip-plans-2026-10-31-v3.html`
- Create: `result/after-v3-iphone.png`
- Create: `result/after-v3-desktop.png`

**Step 1: Launch a headless Chromium debugging endpoint**

Start Microsoft Edge or Chrome with `--remote-debugging-port=9331`.

**Step 2: Capture iPhone 390×844**

Verify `document.documentElement.scrollWidth <= innerWidth`, body font size is at least 18px, all images load, and the three detail panels can open.

**Step 3: Capture desktop 1440×900**

Verify the same content and image-load checks, with readable body text and no overlap.

**Step 4: Visually inspect both screenshots**

Use the local image viewer and adjust spacing, type size, or image crops if anything is cramped.

### Task 4: Publish

**Files:**
- Modify: `index.html`
- Add: confirmed files under `assets/stays/`
- Add: `docs/plans/2026-10-27-weekend-trip-v3-*.md`

**Step 1: Replace the published entry page**

Copy the verified v3 HTML to `index.html`.

**Step 2: Stage only intended files**

Run `git status --short`, then add the v3 page, index, confirmed assets, and plan files explicitly.

**Step 3: Commit**

```powershell
git commit -m "Simplify weekend trip page for mobile"
```

**Step 4: Push**

```powershell
git push origin main
```

**Step 5: Verify GitHub Pages**

Open `https://melon-byte.github.io/weekend-trip-plans-2026-10-31/` after deployment and confirm the live HTML contains the v3 title and three stay cards.
