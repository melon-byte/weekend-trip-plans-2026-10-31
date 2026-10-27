# Weekend Trip Ranking and Region Map Design

## Goal

Restore the old clickable ranking experience while keeping the current
region-based organization and readable mobile layout. The page remains
play-first, with accommodation visible directly below the route sections.

## User-Facing Decisions

- The unified ranking contains all 18 routes.
- The 15 original routes keep their existing scores.
- The three cross-city routes are scored with the same rule:
  daytime experience 45, content mix 25, ease 20, evidence 10.
- New route evidence is stated explicitly; weak evidence lowers the evidence
  score instead of blocking the route from the ranking.
- Ranking rows open a modal with the route's one-line reputation, fee warning,
  two-day plan, images, evening stay and source.
- Region cards remain on the page and use the same modal for details.
- Accommodation is not folded and keeps its images, rating, one-line
  reputation and four-room confirmation questions.
- Budget, total price, per-person price and room-rate content remain absent.

## Page Structure

1. Compact trip facts and anchor navigation.
2. Region map with relative positions and clickable region labels.
3. Unified ranking board, sorted by total score.
4. Region sections with compact route cards.
5. Directly visible accommodation section grouped by region.
6. Source and fee caveats.

## Region Map

Use an inline, local SVG schematic instead of foreign map tiles. It shows
Lujiazui as the origin and approximate relative positions for Qingpu,
Jinshan, Fengxian, Pudong and the three Suzhou areas. The map is explicitly
labeled as a relative-position sketch, not a navigation distance. Region
labels link to the corresponding cards.

## Ranking Data

Existing route ratings come from `trip-data.json`. New route ratings are
added to the page data with the same fields and a visible evidence note:

- `s01` 锦溪古镇 · 水乡慢逛＋计家墩理想村
- `s02` 周庄古镇 · 白天水巷＋晚上看灯
- `s03` 太湖西山 · 雕花楼＋缥缈峰＋院子

The ranking will be computed again from the 18 totals. Old scores are not
silently changed; if a new route interleaves, the displayed rank changes
because the comparison set is now larger.

## Interaction

- Ranking row and region route card are keyboard-accessible buttons.
- One native dialog is generated per route.
- Dialog close button, Escape and backdrop click close the dialog.
- Native dialog focus handling keeps keyboard users inside the modal.
- No map network requests are required.

## Responsive and Content Rules

- iPhone standard viewport is `390x844`.
- Mobile body text is at least 20px; route and board titles are larger.
- Desktop uses a wider grid but does not shrink text back to small sizes.
- Every image shown must have an exact or clearly labeled property/place
  caption; no unrelated images.
- All concrete fee warnings remain.
- No horizontal overflow at `390x844` or `1440x1000`.

## Verification

- Static checks: 18 ranking rows, 18 route cards, 14 stay cards, no `<details>`
  around the accommodation section.
- Interaction checks: ranking row opens modal; route card opens modal;
  close button and Escape close it.
- Image checks: all local images load.
- Content checks: one-line reputation and fee warning on every route; no
  budget or room-rate words.
- Browser checks: screenshots and overflow measurements at mobile and desktop
  widths using the installed Chrome executable.
