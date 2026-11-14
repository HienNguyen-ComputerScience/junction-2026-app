# /sources redesign: notes

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
