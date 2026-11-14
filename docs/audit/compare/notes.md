# /compare rework: notes

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
