# /insights rework 3: make the lead land in five seconds

This pass targets the design judge's round-4 score of 8.2 for `/insights`. The base is `t3/post-freeze-build-integration` at `ac1e752`, which already has R4-01, R4-06, R4-07 and R4-08.

Checked on a production build (`next start -p 3122`, started and stopped by PID from the measuring script) with playwright-core 1.65.1 and its bundled Chromium, at 1366×768 (`-d`) and 390×844 (`-m`).

## What still held the page back

**Named by the round-4 judge and still open:** the card-1 sentence was dense.

**From my own audit of the page with R4-01, R4-06, R4-07 and R4-08 applied** (the judge did not raise these):
- **The lead proved only half its claim.** The h1 "In two areas the GP queue is long, with no way round it" never said what "no way round it" means. That was left to card 1.
- **The comparison had to be read, not seen.** The two big figures came first, and the measure and "Finland overall: 54.7%" came in a sentence after them.
- **Small things.** The pathway card's three source chips (NHS England, PubMed Central, the roadmap) sat under a Finnish pathway with nothing to say which gap each one backs. "Show the Goal 3 link" read like a hyperlink. Two "Show … all 22 areas" labels were nearly the same.
- **The primary action was far down the page.** The Excel template sits in the last card, about 3,000px below the start, with no way to reach it from the top.

## What changed

All changes are in `app/insights/page.tsx`, `components/insights/no-way-round-tiles.tsx` and one export in `components/insights/insights-story.tsx`.

| Element | Before | After | Why |
|---|---|---|---|
| Eyebrow | "GP wait, 2025" | "Where access is hardest" (the nav label) | Same as `/sources` and `/how-to-read`, whose eyebrows are the page name. The year moved to the measure line. |
| Under the h1 | nothing | "Both wait long for a GP, and both make few private or work-health doctor visits instead." | Says what "no way round it" means, in words, before any figure. No number. The areas are the subject, as in card 1, so the line does not contradict the "area figures, not people" caveat under it. |
| Hero figures | Central Finland 73.5%, South Savo 69.7%, then "of non-urgent GP visits waited more than 7 days. Finland overall: 54.7%." | The measure line "Non-urgent GP visits that waited more than 7 days, 2025" comes first. Then a `<dl>`: the two areas in rust, then **Finland overall 54.7%** in Forest Ink at the same size, after a hairline from 1024px. Below that width Finland overall wraps to its own line with no rule (`after-t-header-closed.png`, 768px). | The gap is seen at a glance: red, red, green. The measure is read before the numbers. On a phone the two areas sit side by side (52px) and Finland overall goes under them. |
| Chip and caveat | two rows | one row (`flex-wrap`) | Wins back the height the dek added. Card 1 starts at y=701 at 1366×768, against 679 before, so its top is still on the first screen. The cost: only the legend's 22 and 14 lines are above the fold now; before, its 14, 8 and 2 lines were. |
| Header actions | "Save or share" | "Save or share" plus a quiet underlined link, "Go to the recording template ↓" (`#starter-dataset`) | The persona can reach the page's one action from the first screen. The link is underline-quiet, so the Excel button stays the only primary button. |
| Card 1 title | "Of the 14 areas that wait longer than Finland overall, only two also make …" | "14 areas wait longer than Finland overall. Only two of them also make few private or work-health doctor visits in all six tests." | Two short sentences, with the count first. "Only two" stays tied to "in all six tests", because 8 areas meet the condition in the main view. |
| Card 1 legend | "14 Longer GP wait …", "8 … and few …", "2 … true in every one …" | It now reads as a funnel: "22 All areas", "14 Longer GP wait than Finland overall", "8 Of those, few private or work-health doctor visits instead", "2 Of those, true in every one of the six tests we ran" | No line starts on "…" any more. Each line is a subset of the one above, and 22 is counted from the tiles. |
| Card 3 sources | three bare chips | One row per unpublished step: **GP recognition**, NHS England Fingertips; **Diagnosis**, PubMed Central; **Treatment start**, Kansallinen syöpästrategia | Says which gap each source backs. Each pair comes from the step's `data-gaps.json` row. |
| Card 2 table button | "Show all 22 areas" | "Show the change for all 22 areas" | Card 1 already has "Show the figures for all 22 areas". |
| Scroll margin of the four card anchors | 112px at every width | 16px under 640px, 112px from 640px | The header is not sticky. On a phone, `#starter-dataset` (and the new header link) now lands with the Excel button in view. |
| Card 4 Goal 3 button | "Show the Goal 3 link" | "Show how this ties to Goal 3" | It no longer reads like a hyperlink. |

**Kept on purpose:**
- The "Read with care" caveat on the hero. Both areas' 2025 GP waits are graded "Read the trend with care" in `no-way-round.json`, so here the label is the grade, not a contradiction.
- The four cards, their order, every "Show …" and their contents.

## Fact-diff

The method is the same as rework 2. The page is rendered in print (print media, then `beforeprint`, so every `<details>` is open) before and after, then diffed by number token, link `href` and element id. Files are in the session scratchpad: `before-print*.txt|json` and `final-print*.txt|json`.
- **Numbers:** 193 distinct tokens before and 193 after, with none missing and none new. With `?area=vantaa-kerava` it is 195 and 195. No number is typed into the page. The 22 legend line is `areas.length`, and 54.7% is the `FINLAND_WAIT` that was already on the page.
- **Links:** 17 before and 17 after, the same set.
- **Ids:** `#no-way-round`, `#early-warning`, `#pathway` and `#starter-dataset` are all kept. The only id change is React's auto-generated `_R_…` ids.
- **Words:** the print text went from 3,428 to 3,454 words (+26), and visible words with every panel closed from 540 to 576. All of the added words come from the dek, the measure line, the template link, the "All areas" legend line and the step names beside the chips.
- **Wording:** the print text, plain and with `?area`, has no "Finland's level" and no bare "worse than Finland".

## Checks

| Check | Before | After |
|---|---|---|
| Height, 1366 / 390 | 3,337 / 4,780px | 3,470 / 5,013px |
| Card 1 top, 1366 / 390 | 679 / 906 | 701 / 1,025 |
| Sideways scroll, closed and all open, both widths, with and without `?area` | none | none |
| Text under 16px, apart from the 11px eyebrows | none | none |
| h1 count | 1 | 1 |
| Console errors | none | none |
| `?area=vantaa-kerava#pathway` | card top at 112px, panel open | 112px at 1366, 16px at 390, panel open |
| `#starter-dataset`, 1366 | Excel button at y=504–560, in view | same |
| `#starter-dataset`, 390 | button at y=790–871, cut by the 844px fold | button at y=694–775, in view (`after-m-anchor-starter.png`) |
| Reduced motion | complete | complete (every screenshot here is taken under it) |
| Motion on, after a slow scroll | 34 elements under full opacity | 34. All are the intentionally dimmed icons (`lucide-arrow-up-right` on chips, `lucide-arrow-up-down` on sort buttons). No content is faint. |
| No JS (after 2.5 s) | download link in the HTML, 9 `<details>`, 4 anchors | same |
| Print | 9 of 9 `<details>` open, 0 closed | Same. The three figures sit on one row and the caveat prints open (`after-print-top.png`). The template link is `print:hidden` along with "Save or share". |
| Excel download | `firstline-cancer-pathway-starter-template.xlsx`, 9,444 bytes | same |
| "Save or share" open, and "Why?" open | — | Both work. The menu opens in flow under its button and the template link stays in the row (`after-d-share-open.png`). The caveat panel opens in place (`after-m-why-open.png`). |

Verify: `npm test` (517 of 517 pass), `brief:check`, `typecheck`, `lint`, `build`, `check-insights` (OK, 930 derived rows) and `check-hardcoded` (OK) all pass.

## Self-score against the rubric

These are scored from the frames in this folder, against the round-4 judge's 8.2 (8.0, 8.0, 8.5, 8.5, 8.0, 8.5). They are my estimates, not a judge's.

| Criterion | R4 | Now | Reason |
|---|---|---|---|
| Clarity 25% | 8.0 | 9.0 (estimate) | The lead now says what it claims and shows the comparison: two red figures beside Finland overall, under a named measure. The card-1 sentence is two short sentences, and the legend reads as a funnel. The sources on card 3 say which gap they back. |
| Ease 25% | 8.0 | 8.5 | The page's one action is one click from the first screen and lands in view at both widths, and the labels no longer collide. Held back: on a phone the three panel tables still scroll sideways (with the R4-08 hint). |
| Hierarchy & consistency 20% | 8.5 | 9.0 | The eyebrow matches the family. The hero hierarchy is h1, then what it means, then the measure, then the figures, then source and caveat, then actions. |
| Type & spacing 15% | 8.5 | 8.5 | Unchanged rules. The page is 133px taller on desktop, and card 1 moved down 22px. Its top still shows on the first screen, but fewer legend lines do. |
| Motion & interaction 10% | 8.0 | 8.0 | Unchanged. |
| Accessibility 5% | 8.5 | 8.5 | The figures are now a `<dl>` with their names as `<dt>`, and the legend's count line is read. |

**Weighted:** 0.25×9.0 + 0.25×8.5 + 0.2×9.0 + 0.15×8.5 + 0.1×8.0 + 0.05×8.5 = 2.25 + 2.125 + 1.8 + 1.275 + 0.8 + 0.425 = **8.675, so about 8.7**. That is short of 9.0.

Ease alone would not close the gap: raising it to 9.0 gives only 8.8. A 9.0 needs about 9 on nearly every row, which means:
- **Ease:** a stacked phone list for the three panel tables. It can be built inside `components/insights/sortable-table.tsx` with `max-sm:` utilities and 16px labels. It is not done in this pass, and needs no shared change.
- **Type and spacing:** win back first-screen space so the whole legend shows at 1366×768.
- **Motion:** something that earns a 9, which this pass did not touch.

## Known limits

- The no-JS fallback with `?area=<id>` is the same as in rework 2: the default area is shown.
- The panel tables on a phone still scroll sideways, with the R4-08 hint (see the self-score).

## Screenshots

- `before-*-top.png`, `before-*-full.png`: `ac1e752`.
- `after-*-top.png`, `after-*-full.png`: this pass.
- Also in this pass:
  - `after-d-area-full.png`: `?area=vantaa-kerava`;
  - `after-m-anchor-pathway.png`: landing on `?area=…#pathway`;
  - `after-d-anchor-starter.png`, `after-m-anchor-starter.png`;
  - `after-t-header-closed.png`: 768px;
  - `after-print-top.png`: print media, A4 width;
  - `after-nojs-full.png`;
  - `after-d-share-open.png`;
  - `after-m-why-open.png`.
