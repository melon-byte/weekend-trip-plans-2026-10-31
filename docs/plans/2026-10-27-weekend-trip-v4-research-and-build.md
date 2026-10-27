# Weekend Trip v4: restored, re-verified, and mobile-first

## Goal

Restore the complete 15-route / 11-stay guide from commit `20e3117`, add the
three user-confirmed stays from v3, and re-check all retained places with:

1. Ctrip Wendao via `ctrip-wendao/scripts/wendao_query.js`
2. Meituan Travel CLI via `mttravel`
3. Amap MCP for geocoding and driving distance/route confirmation

The final page must remain a single guide. It must not replace earlier content
with only the three newly confirmed stays.

## User Requirements

- Fixed trip facts: 6 adults, 4 bedrooms, check-in 2026-10-31 for 1 night.
- Start point for driving research: Shanghai Lujiazui.
- The trip purpose is the daytime experience, not accommodation. Routes are
  the primary content; stays are a secondary reference for the overnight stop.
- The three newly confirmed stays must be merged into the old candidate list,
  not presented as the main three-plan choice.
- iPhone standard viewport (`390x844`) is the primary target; desktop must also
  use comfortable, larger text.
- Use an overview, grouped sections, and collapsible details. Do not solve
  density by deleting places.
- Remove budget, total price, per-person price, and room-rate modules.
- Keep concrete fee warnings such as ticket prices, boat-ticket prices,
  "only if the price is acceptable", and "ask before paying".
- Keep rating, review count, and a one-sentence reputation summary.
- Every displayed image must match the named place or property. A similar
  property or unrelated image is not acceptable.
- Preserve all 15 routes and all 11 original stay candidates unless an exact
  source proves a place is closed or no longer exists; record that conflict.

## Canonical Baseline

- Full prior guide: `20e3117:index.html`
- Incorrect narrowed page: `2b88b5e:index.html`
- New stay data and local images: current `HEAD`
- Existing evidence and source captures: repository root of
  `D:\codex\trip-review-research`

Baseline inventory:

- 15 routes: `01, 02, 03, 04, 05, 06, 08, 09, 11, 12, 13, 14, 15, 16, 17`
- 11 stay candidates associated with those route IDs
- New stays: 橙屿民宿, 觅家·一夜花香（周庄）, 苏州太湖西山民宿 / 小白房

## Orchestration

### Main agent

- Extract and preserve the canonical baseline.
- Create the shared research schema and region boundaries.
- Dispatch independent research agents.
- Review source conflicts and exact-name matches.
- Merge reports into the final data model and page.
- Run iPhone and desktop browser checks.
- Commit and push only after verification.

### Research agents

Each agent receives one disjoint region or accommodation scope. Agents may read
repository evidence and call the three research sources, but must not edit
`index.html` or shared assets. Each agent writes only its assigned report file.

- Agent A: 青浦 routes `01, 02, 03, 11, 16`
- Agent B: 金山 routes `04, 05, 06, 15`
- Agent C: 奉贤 routes `09, 12, 13`
- Agent D: 浦东 routes `08, 14, 17`
- Agent E: three confirmed stays plus cross-city context

### Reviewer agents

- Spec review checks that every baseline route/stay is accounted for, reviews
  remain, images are exact, and no budget module returns.
- Quality review checks mobile typography, overflow, tap targets, collapse
  behavior, image loading, links, and desktop readability.

## Research Contract

Every place entry must return:

| Field | Required content |
| --- | --- |
| `id` | Existing route ID or new stay key |
| `name` | Exact matched name |
| `area` | City / district / village |
| `exactMatch` | `exact`, `probable`, or `miss`; never treat a similar name as exact |
| `ctrip` | Query text, exact result, rating, review count, property facts, URL |
| `meituan` | Query text, exact result, rating, review count, property facts, URL |
| `amap` | Search result, formatted address, coordinates, car distance/minutes from Lujiazui |
| `weather` | Current 10/31-11/01 forecast if available; otherwise `not returned` |
| `fees` | Specific ticket/boat/activity fee warning; omit room-rate and trip-budget data |
| `oneLineReview` | One concrete sentence grounded in returned reviews |
| `reservationQuestions` | Facts that must be confirmed before booking |
| `images` | Exact image URL/local path, caption, match evidence, source |
| `sources` | Ctrip, Meituan, Amap, and official source URLs used |
| `conflicts` | Contradictory facts and which source wins |
| `confidence` | `high`, `medium`, or `low` with a short reason |
| `baselinePreserved` | Confirm route/stay content was carried forward or explain why not |

Rules:

- Use only the `result` field from Wendao responses as user-facing evidence.
- Do not label a Meituan near-match as the same business unless name and address
  both match.
- Amap must use Shanghai Lujiazui as origin for route comparisons.
- When no exact source result exists, keep the baseline entry, mark `miss`, and
  present it as "待确认" rather than inventing facts.
- No generic model knowledge may fill a missing travel fact.
- Do not include room prices or total budgets in the final page.

## Merge Plan

1. Extract the old `tripData` and `reviewLines` without altering their meaning.
2. Normalize all research reports into one v4 data object.
3. Keep original route IDs and add unique keys for the three new stays.
4. Render summary rows first, with details in native `<details>` elements or a
   single accessible detail sheet.
5. Keep one-line reviews visible at the summary level.
6. Use 18px minimum body text and larger mobile card titles.
7. Add an overview index for regions and accommodation choices.
8. Remove every old budget section or price-derived recommendation.

## Verification

- Static checks: all 15 route IDs and 14 stay candidates are present exactly once.
- Content checks: every route/stay has a one-line review; exact images only.
- Forbidden-content checks: no "预算", "总价", "人均", or room-rate module.
- Required fee copy: route-specific tickets/boat/activity warnings remain.
- Browser checks: `390x844` and desktop screenshots, no horizontal overflow.
- Asset checks: all image requests finish successfully; no fallback placeholders.
- Link checks: primary source links open and GitHub Pages returns HTTP 200.

## Delivery

- Replace the published root page with v4 after verification.
- Preserve a dated standalone `weekend-trip-plans-2026-10-31-v4.html`.
- Commit, push, and verify the live GitHub Pages URL.
