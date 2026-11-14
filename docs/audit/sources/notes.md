# /sources redesign: notes

Branch `t3/redesign-sources-page`, built on `t3/post-freeze-build-integration` (merged locally). Checked on a production build (`npm run start -- -p 3093`) with playwright-core and its bundled Chromium.

## What changed

- Opens with one serif statement ("Every number in FirstLine comes from a public source. Here they are, and what they cannot tell you."), then the counts (31 public sources · 11 indicators, both computed from `data/`), a link to `/how-to-read`, the jump links and one "Save or share" control (Print, Email).
- **What the data can't tell you** comes first and is always visible: ten limitations, each a framed one-liner (keylime panel) with its full original wording behind "Show detail". The old "essential distinction" panel, the six gaps and the live-search, decision-support and Exa paragraphs that sat in the evidence header are now limitations in the list.
- **Indicators**: compact cards in a `FocusGroup` (one column), showing the name, its main caveat (the first sentence of its limitation), the publisher, the data years and the official Sotkanet link. Full name, source id, dates and scope sit behind "Show definition and scope". "Used to rank counties" (6411, 13) stays separate from "Shown for context only".
- **Evidence for actions** and **Other sources**: the same card style (`components/sources/source-card.tsx`), each with name, publisher and link. The Sotkanet area list (`sotkanet-regions`, already in `data/sources.json` but not shown before) and the map-boundaries credit are now cards in Other sources, so the page lists every source it counts.
- Finland comparison: one limitation, "“Finland overall” is a reference, not a target", says it is Sotkanet's whole-country value for the same indicator and year, not a target and not an average of areas. The recorded-visits limitation now says "for Finland overall". The page never says "Finland's level" or "worse than Finland" (checked on the rendered HTML).
- All text is 16px or more except the five 11px eyebrows (measured on the rendered page).

## Word counts (visible text in `<main>`, closed "Show …" excluded)

| | Before | After |
|---|---|---|
| Screen, 1366×768 | 1,389 | 1,276 |
| Print (everything expanded) | n/a | 2,226 |

The cut is small on purpose: the brief keeps every source, limitation, definition and link, and most of the words are source names. What changed is how much is read first: the old page opened with four paragraphs at 15px; the new one opens with one sentence, the counts, and ten one-line limitations.

## Fact-diff

Checked by script against the rendered HTML of the new page (`curl /sources`):

- **All 31 source ids in `data/sources.json`**: URL and publisher present for every one; name present for every evidence and other source. Ids: ev-files-kansallinen-syopastrategia-toimeenpanon-tiekartta-2, ev-nice-recommendations-on-patient-support-safety-netting-th, ev-nice-update-information, ev-pmc-pmc11467609, ev-pmc-pmc4385978, ev-pmc-pmc4412104, ev-pmc-pmc4553012, ev-pmc-pmc4660800, ev-pmc-pmc6367893, ev-pmc-pmc7462853, ev-pmc-pmc8510690, ev-pmc-pmc9771088, ev-riksdagen-html, stm-cancer-strategy-2026-2035, thl-ohjaus-21-2016 (evidence); hus-referrals-2024, kuitunen-2026, ndrs-emergency-presentations, nhs-cancer-waiting-times (other); sotkanet-6411, sotkanet-13 (ranking); sotkanet-5033, sotkanet-3621, sotkanet-6103, sotkanet-3620, sotkanet-2371, sotkanet-293, sotkanet-692, sotkanet-3627, sotkanet-3625 (context); sotkanet-regions (area list, newly shown).
- **All 11 indicators**: short name, full name and every sentence of the limitation text present.
- **Limitations of the old page**, each sentence found unchanged in the new page:
  1. Essential distinction (GP-wait counts visits, not people with suspected cancer; access and referral processing, not a cancer journey; 6411 covers non-urgent GP appointments; proxy for access; referral indicators describe processing generally).
  2. No indicator follows a person's whole journey.
  3. Referral speed is not time to specialist.
  4. Warning signs and tests are not measured; missing evidence stays "no public data".
  5. Recorded visits change from year to year (computed text, numbers unchanged; "for Finland" → "for Finland overall").
  6. Four Uusimaa areas share one HUS value (title now "… one HUS referral value").
  7. Comparisons describe, they do not prove.
  8. Every recommended action cites a checked precedent; live search results are not checked; Exa "Found live — unverified" results not checked by the team.
  9. Referral-routes panel is decision support, not a diagnosis.
- **Other facts**: "Sotkanet 6411 sets the order; 13 sets the referral status", "Not used for ranking or stage status", "Each recommended action cites one of these checked sources", "not county indicators and do not change any ranking, status or action", retrieval and publisher-updated dates, map boundaries (Statistics Finland, wellbeing services counties 2025, 1:4 500 000, CC BY 4.0, link).
- **Removed**: only the indicators header sentence listing the publishers (THL, Cancer Registry, Kela). Each card now names its own publisher, so nothing is lost.
- **Added**: the "Finland overall" limitation (wording only, no number) and the `sotkanet-regions` card.

## Checks

| Check | Result |
|---|---|
| 1366×768 | No sideways scroll, no console errors |
| 390×844 | No sideways scroll (scrollWidth = viewport) |
| Reduced motion | Complete static page, same 1,276 words |
| No JavaScript | Complete page, 21 "Show …" buttons work as native `<details>` |
| Print (media=print, every `<details>` opened as `PrintExpand` does) | 0 closed, 2,226 words; Save or share and back link hidden |
| Font sizes | Nothing under 16px except the 11px eyebrows |
| Contrast | Uses only contract tokens: charcoal, Forest Ink and muted text on cream, keylime and mint (all AA per the contract's measured pairs) |
| `npm test && npm run typecheck && npm run lint && npm run build` | 517 pass, 0 fail; typecheck, lint and build clean |

## Screenshots

`screenshots/before-desktop.png`, `before-mobile.png`, `before-print.png`; `after-desktop.png`, `after-mobile.png`, `after-reduced.png`, `after-nojs.png`, `after-print.png` (full page).
