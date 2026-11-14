# /compare rework: notes

## Pass 2 (15 Nov): toward 9.0

**Base:** `t3/post-freeze-build-integration` at `ac1e752`, which already has R4-02 and R4-05. Judge round 4 scored this page 8.4. What held it back:
- the `*` key sat about 1,900px under its marker;
- the status words were repeated 44 times;
- on a 1366×768 screen the first screen showed the hero only, with the picture below the fold.

**Checked on:** a production build (`npm run start -- -p 3121`), with playwright-core 1.65.1 and its bundled Chromium. I stopped the server by its PID; port 3121 is free.

### What changed

1. **The picture is on the first screen.**
   - From 1024px wide, the hero (claim, **14**, Finland overall, chip, caveat, Save or share) sits in the left 5/12 and the 22-bar chart in the right 7/12.
   - At 1366×768 the first screen shows the headline, the 14 and 18 of the 22 bars, including all 14 rust bars and the dashed Finland overall line (`pass2-d-first.png`; before: `pass2-before-d-first.png`).
   - The h1 keeps the site's own size, which a global rule in `globals.css` sets to 40px. Measured: two lines at 1024, 1280 and 1366, and no sideways scroll. At 1024 the first screen still shows all 14 rust bars and the Finland line (`pass2-1024-first.png`).
   - Save or share now starts 27px below the fold at 1366×768, so the shared `Reveal` shows it after a small scroll (opacity 0.99 one second later). It was further down before.
   - Opened, its panel stays in flow inside the hero column, ends 48px before the chart and adds no sideways scroll, at 1366, 1024 and 390 (`pass2-share-1366.png`).
   - Phones, print and narrower screens stack as before. Print forces one column (`print:block`).
   - The h2 "Where you live decides how long a visit waits" is cut. The h1 makes the claim, and the chart's own caption names what it shows.
2. **The chart key comes before the bars** (the R4-06 lesson): the two statuses, then Finland overall.
3. **The bars grow once from the left** (the existing `animate-bar-grow` inside a `Reveal`, 420ms, 7ms stagger). Measured: scale 0 at 50ms, 1.00 at 1s. Under reduced motion they are 1.00 at 50ms, and without script and on paper they are at their value. Nothing else moves.
4. **Table rows are one line from 1280px wide.**
   - The status words are short in the wide table only: "Longer wait" / "Same or shorter wait", and for referrals "Slower" / "Same or faster".
   - Each heading now reads "Compared with Finland overall: 54.7%" (or 76.8% for referrals), so the comparison is named once per column. Screen readers still get the full label in every cell (`sr-only`).
   - The phone list keeps the full labels, because it has no column headings.
   - On the desktop table, the HUS cells read "HUS-wide: 74.1%, not its own". The phone list keeps "No figure of its own. HUS-wide: 74.1%".
   - The table body fell from 1,572px to 1,117px.
   - Table `scrollWidth` equals its wrapper at 640, 768, 1024, 1280, 1366, 1440 and 1920 (548/548, 676/676, 932/932, 1060/1060).
   - Only the "Change since 2023" heading note is capped at 15rem, so it can't take the spare width.
5. **A dashed "Finland overall: 54.7%" row** sits between rank 14 and rank 15 in the default order, on the desktop table and the phone list (`pass2-m-line.png`). It is the chart's line, repeated where the table splits the same way. The line is computed from the rows' status, and other sort orders have no line.
6. **The `*` key says what it means where you meet it:** "* Read with care: recorded visits changed by more than 20% since 2023". It appears under the "Change since 2023" heading and in the phone key. The text is built from `RECORDING_CHANGE_ABOVE` and `FIRST_YEAR`, not typed in.
7. **One unit under the table.** The `*` note, the status and brackets note, and the sources line are now one framed unit with hairlines between them, where there were three. The unit is `print-flow`, because opened on paper it is tall.
8. **Table rows tint** Keylime on hover. This is decoration only: no information is shown on hover.

**Tried and removed:** a fade on `<tbody>` each time the sort changed. In the full-page capture it left the table body caught pale, so it was cut.

### Measured (same counter before and after: visible text only, closed `<details>` and `sr-only` excluded)

| | Before (`ac1e752`) | After |
|---|---|---|
| Page height, 1366 | 4,861px | **3,287px** |
| Page height, 1366, every "Show …" open | 6,236px | **4,602px** |
| Page height, 390 | 6,711px | 6,668px |
| Page height, 390, every "Show …" open | 9,464px | 9,421px |
| Visible words, 1366 / 390 | 922 / 1,023 | **795** / 1,020 |
| Print (A4 landscape PDF) | 6 pages | 6 pages, one column, 4 of 4 `<details>` open |

### Fact-diff

Compared `main.innerText` before and after, with every "Show …" open: at 1366 and at 390 on screen, and the print render after `beforeprint`.
- **Numbers:** 146 distinct numbers before and 146 after, in all three renders. None is missing and none is new.
- **Sources and caveats:** the same count of each, before and after:
  - the Sotkanet 6411 chips (5) and the Sotkanet 13 chip (1);
  - "HUS-wide" (5), "City units only" (2), "About the same" (3);
  - "clinical standard", "not only possible cancer" and "itself a delay".
- **"changed by more than 20%"** appears once more on screen, because the `*` key now says it.
- **Wording:** every "Finland" on the page, other than in area names (Central Finland, Southwest Finland), is "Finland overall". The computed headline is unchanged, and `check-hardcoded` passes.

### Checks

| Check | Result |
|---|---|
| 1366×768 and 390×844, closed and every "Show …" open | No sideways scroll, nothing under 16px except the 11px eyebrows, no console errors |
| Sorting | The select reorders both views ("Slowest referrals first" puts South Ostrobothnia, North Savo, Central Ostrobothnia first). Clicking the "Area" heading sets `aria-sort="ascending"` and the select follows (`name`). There is no Finland line outside the default order. |
| Reduced motion | Same 795 words, 0 reveals left hidden, bars at full value from the first frame |
| No JavaScript | Same 795 words, same 3,287px height; the "Show …" are native `<details>` |
| Print | One column; all 4 `<details>` open; the paper table is shown and the screen table and phone list are hidden. 6 pages, the same breaks as before: the hero, the chart, the table, the 12 areas, the rises, then 20 words. Words per page, read from the PDF: 77 / 97 / 416 / 181 / 188 / 20, so none is blank (`pass2-print.pdf`). |
| Save or share open | Inside the hero column at 1366, 1024 and 390. It doesn't overlap the chart and adds no sideways scroll. |
| `npm test && npm run brief:check && npm run typecheck && npm run lint && npm run build` | 517 pass, 0 fail; the brief check, types, lint and build are clean |
| `check-insights.mjs`, `check-hardcoded.mjs` | OK (930 rows; 3 anchors, 4 computed claims) |

### Self-score against the rubric

| Clarity 25% | Ease 25% | Hierarchy & consistency 20% | Type & spacing 15% | Motion & interaction 10% | Accessibility 5% | Weighted |
|---|---|---|---|---|---|---|
| 9.0 | 9.0 | 8.5 | 8.5 | 8.5 | 9.0 | **8.8** |

- **Clarity and ease go up because of the first screen.** The claim, the 14 and the rust bars that are those 14 areas are now together, and the table repeats the chart's split with the same line.
- **Hierarchy stays at 8.5.** "Worse than in 2023" still gives a serif h2 to one sentence, and the nav lights "Areas" on this page (see below).
- **The phone page is about the same height** (6,668px). Its gain is the Finland line and the self-contained `*` key, not length.
- **8.8 is under the 9.0 target.** The gap is the near-unchanged phone list and the serif h2 over one sentence. A judge who weighs the phone first would land nearer 8.7.

### For the lead to veto (each a one-line revert)
- **The short status words in the wide table.** They lean on the heading for "Finland overall"; the wording rule is the lead's call.
- **The bar growth.** Pass 1 made the chart deliberately static.
- **The desktop HUS cell:** "HUS-wide: 74.1%, not its own", against "No figure of its own. HUS-wide: 74.1%".

### Needed from others

- **Nav (shared, `components/site-nav.tsx`):**
  - The "Where access is hardest" item points to `/insights`, but `/sources` (line 395) uses that text to link to `/compare`.
  - On `/compare` the nav highlights "Areas".
  - One label should mean one page.
- **`components/home/early-warning.tsx`:** fixed in R4-03, nothing more needed.

### Screenshots (pass 2)

- First screen and full page at 1366: `pass2-d-first.png`, `pass2-d-full.png`.
- Every "Show …" open: `pass2-d-open.png`, `pass2-m-open.png`.
- Sorted by referrals: `pass2-d-sorted.png`, `pass2-m-sorted.png`.
- Phone: `pass2-m-first.png`, `pass2-m-full.png`, `pass2-m-chart.png`, `pass2-m-line.png`.
- Reduced motion, no JavaScript and print: `pass2-reduced.png`, `pass2-nojs.png`, `pass2-print.png`, `pass2-print.pdf`.
- Before, for comparison: `pass2-before-d-first.png`, `pass2-before-d-full.png`.

---

## Pass 1

Built on `t3/post-freeze-build-integration` (merged locally). I checked it on a production build (`npm run start -- -p 3101`) with playwright-core and its bundled Chromium. The design judge's round-3 notes asked for this rework: "Bigger moves", `/compare` (7.8).

## The page now

1. **Hero (kept)**: the eyebrow, the computed headline ("Most areas wait longer than Finland overall", from `howManyLonger()`), **14** of 22, "Finland overall: 54.7% … That level is itself a delay.", the Sotkanet 6411 chip, the "Read with care" note with its "Why?", and Save or share (Print, Excel).
2. **The one picture**: "Where you live decides how long a visit waits". All 22 areas are fixed bars, longest wait first, on a 0–100% track. A dashed Finland overall line runs through every bar. A legend gives status in words. One caption line names the longest wait, the shortest wait and the gap between them, with the source chip. There is no motion and no sticky part, so screen, no-JS and paper are identical. Each area is one line at every width. On a phone the name column is as wide as the longest name.
3. **Every area, side by side**: a sort list, then a table of 5 columns: Rank · Area (link) · GP visits waiting over 7 days, 2025 (figure, points against Finland overall in brackets, status in words) · Change since 2023 · Referrals handled within 3 days, 2025. Finland overall's value for each measure is in its column heading. Under 640px the same rows, in the same order, become a compact list of 4 lines per area, under a two-line key (the GP measure with Finland overall 54.7% and what the brackets mean; referrals handled within 3 days with Finland overall 76.8%). Below the table are two framed lines and the sources:
   - "* Read with care: in 12 areas the share rose and recorded visits changed by more than 20% since 2023 …" with **Show the 12 areas** (each area's recorded-visits change);
   - "Status compares each area with Finland overall, not with a clinical standard. The figure in brackets is points above (+) or below (−) Finland overall. Changes under 1 point read "About the same"." with **Show what the referral labels mean** (HUS-wide, City units only);
   - the Sotkanet 6411 and 13 chips.
4. **Worse than in 2023**: one framed line, "In 16 of 22 areas the share … rose by at least 1 point since 2023. Read with care: in 12 of the 16, recorded visits changed by more than 20%." It has **Show the five largest rises** (the existing `EarlyWarning` list, with its own caveat line and chip).

**Cut:**
- The ScrollStory and its three chunks. The longest and shortest waits are now the chart's caption. The largest rise, "+41.7" in alarm red, now sits only in the closing "five largest rises" list, beside its caveat, in plain ink.
- The FocusGroup and the MoreCard.
- The in-cell bars, the bar key and the "Compared with Finland" column. The points against Finland overall are kept in brackets after each figure.
- The per-row "Read with care: …" lines. Each is now a `*` marker in the cell plus one framed note. Screen readers get the row's text inline (`sr-only`).
- Per-row reveal animation.

`components/compare/compare-story.tsx` and `story-fact.tsx` are deleted. `compare-chart.tsx` is new.

## Words and height

These are visible words in `<main>`, every "Show …" closed, screen-reader-only text excluded. Heights are document heights after scrolling through.

| | Before | After |
|---|---|---|
| Visible words, 1366×768 | 1,051 | **845** |
| Visible words, 390×844 | 1,029 | **917** (the phone list repeats "Since 2023:" and "Referrals:" per area, under a two-line key) |
| Page height, 1366 wide | 6,487px | **4,531px** |
| Page height, 390 wide | 13,907px | **6,659px** (9,412px with every "Show …" open) |
| Print, everything expanded | 1,092 words, 4 `<details>`, 0 closed, 7 A4 landscape pages | 1,294 words, 4 `<details>`, 0 closed, 7 pages, none blank |

Print is longer because the 12 recorded-visits lines and the five largest rises now open on paper.

## Fact-diff

I compared the print render of each version after `beforeprint` (PrintExpand opens every "Show …"; 0 left closed) and the screen render at 1366.

- **Areas**: all 22, both in the chart and in the table, on screen and on paper.
- **Figures**: of the 147 distinct numbers on the old printed page, 146 appear verbatim on the new one. The one exception is "+41.7": the old story card wrote it signed, and it now reads "41.7 points worse (from 26.1%)" in the table and in the five-largest-rises list.
  - On screen, the points against Finland overall (+30.7 … −22.0) are now in brackets after each figure.
  - The per-area recorded-visits changes (fell 25%, 37%, 50% …) sit behind "Show the 12 areas". They are open on paper and inline for screen readers.
  - The paper table (`PrintTable`) is unchanged: points vs Finland overall, the 2023 value, the change and the read-with-care text, per area.
- **Sources**: the Sotkanet 6411 · 2025 chip (hero, chart caption, sources line), the Sotkanet 13 · 2025 chip (sources line) and the Sotkanet 6411 chip in the five-largest-rises list. Each was present before and is present after.
- **Caveats**, all present:
  - "counts visits, not people, and every non-urgent GP visit, not only possible cancer" with the full indicator limitation behind "Why?";
  - "That level is itself a delay";
  - recorded visits changed by more than 20% (twice: per area and for the rising count);
  - HUS-wide shared value, not the area's own;
  - City units only, most Helsinki referrals go to HUS;
  - changes under 1 point read "About the same";
  - status compares with Finland overall, not a clinical standard.
- **Phone (390)**: the same diff on the phone text finds every old number except the per-area recorded-visits changes, which sit behind "Show the 12 areas". The key line keeps "handled within 3 days", Finland overall 76.8% for referrals and the meaning of the brackets visible.
- **Wording**: "Finland overall" throughout this page's own text. The old "points above Finland" text and "Status compares each area with Finland" in the paper caption are gone. The shared `EarlyWarning` still says "Dark line: Finland" (see below).

## Checks

| Check | Result |
|---|---|
| 1366×768 | No sideways scroll, no console errors |
| 390×844 | No sideways scroll; also checked at 768, 1024 and 1280 (no page or table overflow) |
| Font sizes | Nothing visible under 16px except the 11px eyebrows |
| Reduced motion | Complete static page, same 845 words, 0 reveals left hidden |
| No JavaScript | Complete page, 845 words, all rows present; the "Show …" are native `<details>` |
| Print | All 4 `<details>` open, screen table and phone list hidden, the paper table shown. The rises frame is `print-flow`, so the list breaks across pages instead of leaving a blank one (`screenshots/after-print.pdf`) |
| Opened states, 390 | All 4 "Show …" open: no sideways scroll, nothing under 16px (`after-mobile-open.png`) |
| Sort | Phone: the select re-orders the list ("Area name, A to Z" puts Central Finland first). Desktop: clicking "Area" sets `aria-sort="ascending"` and the select follows |
| Contrast | Contract tokens only: charcoal, Forest Ink, muted and status inks on cream; bars use `status-red` / `status-amber-bar` with a text legend |
| `npm test && npm run brief:check && npm run typecheck && npm run lint && npm run build` | 517 pass, 0 fail; brief, types, lint and build clean |
| `check-insights.mjs`, `check-hardcoded.mjs` | OK (the headline is still computed) |

## Needed from others

- `components/home/early-warning.tsx` (shared, used here behind "Show the five largest rises") says "Dark line: Finland", and its screen-reader trend text says a bare "Finland 54.7%". By the wording rule both should say "Finland overall".
- `docs/audit/contract.md` is now stale for this page. It lists `/compare` under FocusGroup's "Used on" and calls it the StatUnit reference page. This page uses neither any more.
- On paper, the "* Read with care" note has no `*` beside the figures, because the paper table has its own "Read with care" column. This is cosmetic.

## Screenshots

`screenshots/before-desktop.png`, `before-mobile.png`; `after-desktop.png`, `after-mobile.png`, `after-desktop-first.png`, `after-mobile-first.png` (first screen), `after-mobile-open.png` (every "Show …" open), `after-reduced.png`, `after-nojs.png`, `after-print.png` and `after-print.pdf` (print media after PrintExpand).
