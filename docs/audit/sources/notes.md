# /sources redesign: notes

## Third pass (design polish, branch `t3/polish-sources-page-design`)

Built on `t3/post-freeze-build-integration`, merged three times: at the start, after the first commit, and again at the end. The integration branch was rewritten mid-task, so the final merge needed one shared conflict (`components/motion/animated-number.tsx`) and one stray line (`components/compare/compare-table.tsx`) set to the integration branch's version. After that, the tree differs from the integration branch only in `app/sources`, `components/sources` and `docs/audit/sources`. The final numbers below were re-measured on that tree and match the earlier run exactly (fact-diff after3 → final: 0 missing, 0 added). Checked on a production build (`npm run start -- -p 3112`) with playwright-core and its bundled Chromium.

What the judges marked down (rounds 1–4: 6.5 → 8.0, motion 7.5) and what changed:

1. **"Areas ›" breadcrumb** (R2, R4): removed. /sources is a top-level page, not under Areas; /compare and /insights have none either. Top padding now matches /compare (`pt-6 sm:pt-8`).
2. **First screen at 1366×768**: the first row of limitation cards used to end at y=769, cut by the fold. The counts line and the "Read how to read them" link now share one row, and the breadcrumb is gone, so the row ends at **y=669** and is wholly on screen.
3. **Ranking cards**: the `FocusGroup` cards were capped at 52rem, sat 8px outside the page edge when in focus and changed surface as you scrolled (one cream, one mint). They are now two static framed cards side by side (stacked on a phone), at the page's full width like every other unit, with `items-start` so opening one doesn't stretch the other.
4. **Plain words**: "Sotkanet 6411 sets the order; 13 sets the referral status shown beside it." now reads "“GP wait over 7 days” sets the order. “Referrals processed within 3 days” sets the referral status shown beside each county's rank.". The names come from `indicator.short_name`, not typed; the ids are still in each card's "definition and scope" (sotkanet-6411, sotkanet-13).
5. **Page ending**: "Back to areas" assumed the same hierarchy as the breadcrumb. It is replaced by the shared `MoreCard` "Read next" as on /how-to-read: How to read these numbers, Where access is hardest (/compare), Areas. Screen only (`print:hidden`), as the back link was.
6. `SourceCard` lost its now-unused `focus` option.

Unchanged on purpose: the one-claim h1, the 10 always-visible limitation cards (default stretch, so closed rows stay even), the rank/context split, the evidence and other-source lists.

### Numbers (same script, before = round-4 state on this branch's base)

Visible words in `<main>` with every "Show …" closed, screen-reader-only text excluded, tokens without a letter or digit (the "·" separators) not counted, so it reads lower than the second-pass method.

| | Before (round 4) | After |
|---|---|---|
| Visible words | 408 | 448 (+40: the Read next card and the longer plain-name ranking line, less the breadcrumb and back link) |
| Height at 1366 | 3,486px | 3,347px |
| Height at 390 | 5,269px | 5,619px (+350: the Read next card) |
| First limitation row ends (1366×768) | y=769 (cut) | y=669 (on screen) |
| Print, all expanded | 1,957 words, 0 of 23 closed, 34 links | 1,963 words, 0 of 23 closed, 35 links |
| Sideways scroll at 390 | none | none |
| Text under 16px (except eyebrows) | 0 | 0, also with every panel open |
| Reduced motion / no JavaScript | complete, 408 words, 23 native `<details>` | complete, 448 words, 23 native `<details>` |
| Console errors | 0 | 0 |

### Fact-diff (third pass)

Print render after `beforeprint` (PrintExpand opened all 23 panels, 0 closed), split into 170 sentences and lines, then each one searched for in the after text:

- **Missing (3):** "Areas" and "Sources & limitations" (the breadcrumb; the page name is still the eyebrow and the nav), and the 6411/13 ranking line, **reworded** as in item 4 with the same fact.
- **Links:** all 34 before links are present; one added (`/compare`, in Read next, screen only). That covers all 31 `data/sources.json` URLs and the map boundaries link.
- **No new numbers.** "7 days" and "3 days" come from the indicators' own short names, already on the page.
- "Finland's level" and a bare "worse than Finland" do not appear.
- **Added (screen only, so not in the print diff):** the Read next card's three rows: "Three things to know before you read any figure", "Every area side by side, against Finland overall", and "One area's figures and what it can do". "Three" is typed by hand: it repeats the /how-to-read headline and is not data. If /how-to-read changes its count, change this line too.
- **All panels open (390 and 1366):** 23 of 23 open, no sideways scroll, nothing under 16px except the eyebrows, and no element past the right edge.

### Self-score (after, against the judges' rubric)

| Clarity 25% | Ease 25% | Hierarchy 20% | Type & spacing 15% | Motion 10% | Accessibility 5% | Weighted |
|---|---|---|---|---|---|---|
| 8.5 | 8.5 | 8.5 | 8.5 | 8.0 | 8.5 | **8.45** (was 8.0) |

This is not 9.0. The judge's best page, the briefing, scores 8.9, and this page does not beat it. What still holds it back: nine identical "Show definition and scope" buttons (`Disclosure` has no accessible-name prop; that is a shared change); the evidence list, which is the heart of the transparency story, sits behind one closed button; the phone page is 350px longer; and the motion is plain by design.

### Screenshots (third pass)

`screenshots/r4-*.png` = before (round-4 state): `desktop`, `desktop-first`, `mobile`, `mobile-first`, `reduced`, `nojs`, `print`. `screenshots/after3-*.png` = after, same set. Full page unless `-first`.

---

# Earlier passes

Branch `t3/redesign-sources-page`, built on `t3/post-freeze-build-integration` (merged locally). Checked on a production build (`npm run start -- -p 3093`) with playwright-core and its bundled Chromium. The header's "Start the guided briefing" button in the screenshots comes from the integration branch before `0a4457d`. This branch does not touch it.

## The page now (second pass)

1. **Top**: eyebrow, one serif statement ("Every number in FirstLine comes from a public source. Here they are, and what they cannot tell you."), "31 public sources · 11 indicators" (counted from `data/`), a link to `/how-to-read`, and one "Save or share" (Print, Email). The jump links are cut because the page is short now.
2. **What the data can't tell you**: 10 limitations, always visible, each a framed one-liner with its full original wording behind "Show detail".
3. **Indicators, used to rank counties** (6411, 13): two full focus cards (`FocusGroup`) with the name, the main caveat, the publisher, the years, "Official definition on Sotkanet" and "Show definition and scope".
4. **Indicators, shown for context only** (9): one framed list, one row each: name · publisher (short: THL, Kela, Finnish Cancer Registry) · years · "Sotkanet ↗", and "Show definition and scope". That panel holds the full name, the full publisher, the source id and dates, and the whole limitation text, so the caveat that the old card showed is still there. No FocusGroup.
5. **Evidence for actions**: one framed line ("15 studies, guidelines and strategies behind the recommended actions. All retrieved 2026-11-14.") and "Show all 15". That opens one line per source: the name as the link, then the publisher, under the note "Each recommended action cites one of these checked sources; the publisher is the host of the link."
6. **Other sources**: one framed line ("6 more: background figures cited on county pages, the list of areas and the map. None changes a ranking, status or action.") and "Show all 6": the 4 background figures, the Sotkanet area list (`sotkanet-regions`, in `data/sources.json` but not shown before) and the map boundaries.

Years read "2023–2025" where they run without a gap (every indicator here does). The full list form is kept for any indicator whose years have a gap.

The Finland comparison is one limitation, "“Finland overall” is a reference, not a target": Sotkanet's whole-country value for the same indicator and year, not a target and not an average of areas. The recorded-visits limitation says "for Finland overall". "Finland's level" and "worse than Finland" do not appear anywhere on the page (checked on the rendered text).

## Word count and height

The counts are visible words in `<main>` at 1366×768 with every "Show …" closed. Screen-reader-only text such as "(opens in a new tab)" is excluded. The raw `innerText`, which includes it, is in brackets.

| | Before | First pass | Second pass |
|---|---|---|---|
| Visible words on screen | ≈1,289 (1,389 raw; 20 visible external links × 5 hidden words) | 1,276 raw | **440** (495 raw) |
| Page height at 1366 wide | 4,892px | 7,932px | **3,486px** |
| Page height at 390 wide | 9,576px | n/a | 5,269px |
| Print, everything expanded | n/a | 2,226 raw | 2,046 visible words, 0 closed |

## Fact-diff (second pass, run on the print render after `beforeprint`, so PrintExpand has opened every "Show …"; 0 left closed)

- **All 31 source ids in `data/sources.json`**: URL among the page's links, publisher in the text, and name in the text for every non-indicator source. Evidence (15): ev-files-kansallinen-syopastrategia-toimeenpanon-tiekartta-2, ev-nice-recommendations-on-patient-support-safety-netting-th, ev-nice-update-information, ev-pmc-pmc11467609, ev-pmc-pmc4385978, ev-pmc-pmc4412104, ev-pmc-pmc4553012, ev-pmc-pmc4660800, ev-pmc-pmc6367893, ev-pmc-pmc7462853, ev-pmc-pmc8510690, ev-pmc-pmc9771088, ev-riksdagen-html, stm-cancer-strategy-2026-2035, thl-ohjaus-21-2016. Other (4 + area list): hus-referrals-2024, kuitunen-2026, ndrs-emergency-presentations, nhs-cancer-waiting-times, sotkanet-regions. Ranking: sotkanet-6411, sotkanet-13. Context: sotkanet-5033, -3621, -6103, -3620, -2371, -293, -692, -3627, -3625.
- **All 11 indicators**: short name, full name and every sentence of the limitation text.
- **Map boundaries**: Statistics Finland, wellbeing services counties 2025 (1:4 500 000), CC BY 4.0, with the link.
- **All 34 checked sentences and phrases of the old page are present.** They cover the essential distinction, the six gaps, the recorded-visits caveat, HUS shared value, the comparisons caveat, live search and Exa unverified, referral-routes decision support, ranking vs context lines, "publisher is the host of the link", retrieval and publisher-updated dates, and "Official definition on Sotkanet". Two are reworded and keep the same fact:
  - "Recommended actions need a checked precedent and linked source." + "Every recommended action cites a checked precedent." → "Every recommended action cites a checked precedent and linked source."
  - "They are not county indicators and do not change any ranking, status or action." → "The background figures are not county indicators and do not change any ranking, status or action."
- **Removed (presentation only)**: the old eyebrow and lede ("How to read FirstLine", "Where every number comes from…"), the "The essential distinction" label, the "See Evidence for actions" and jump links, the publisher-list sentence (each row names its publisher), and "Links open the official definitions." (the link labels say it).
- **Added**: the "Finland overall" limitation (wording only, no number), the `sotkanet-regions` entry, and the full publisher name in each "definition and scope".

## Checks

| Check | Result |
|---|---|
| 1366×768 | No sideways scroll, no console errors, at most 1 card in focus at any scroll position |
| 390×844 | No sideways scroll |
| Reduced motion | Complete static page, same 440 words |
| No JavaScript | Complete page; 23 "Show …" buttons are native `<details>` and open without script |
| Print | `beforeprint` → PrintExpand opens all 23 (0 closed); Save or share and back link hidden |
| Font sizes | With every "Show …" open, nothing under 16px except the 11px eyebrows |
| Contrast | Contract tokens only: charcoal, Forest Ink and muted text on cream, keylime and mint (all AA per the contract's measured pairs) |
| `npm test && npm run typecheck && npm run lint && npm run build` | 517 pass, 0 fail; typecheck, lint and build clean |

## Screenshots

`screenshots/before-desktop.png`, `before-mobile.png`, `before-print.png`. After the second pass: `after-desktop.png`, `after-mobile.png`, `after-reduced.png`, `after-nojs.png`, `after-print.png` (full page; print = print media after PrintExpand).
