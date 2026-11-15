# /insights rework 2: one statement, four framed insights

Branch `t3/insights-page-rework`, on `t3/post-freeze-build-integration` (merged from the local ref). The pattern is `/sources` (judged 6.5 before its rework and 8.0 after): one serif statement first, then compact framed units with the detail behind plainly labelled "Show …" buttons. Nothing is left loose on the page, and every fact is still reachable and complete in print.

Checked on a production build (`npm run start -- -p 3103`) with playwright-core 1.65.1 and its bundled Chromium.

## What the judges asked for

- **Round 1, R1-02:** jargon in the legend ("few other routes", "cut-offs"). Round 2 still found "cut-offs we tested" in the story heading, and "Finland: 54.7%" in the hero.
- **Round 1, R1-12:** "Show how we tested this" and "Show the full table" sat loose between units.
- **Round 3:** a 9.0 overall needs `/insights` reworked the way `/sources` was.

The judge's `insights-d-full.png` shows the cause. The `ScrollStory` reserved about 2,000px of mostly empty screen for four one-line steps, and the page mixed four surfaces: a bare page, a slate panel, cream focus cards and a sage panel.

## The page now

1. **Statement first** (unframed `header`, the h1). "In two areas the GP queue is long, with no way round it." Under it are Central Finland 73.5% and South Savo 69.7% counting up, then "of non-urgent GP visits waited more than 7 days. Finland overall: 54.7%.", the Sotkanet 6411 chip and the main caveat ("area figures, not people; not cancer-specific", with the four caveats and both grade reasons behind "Why?"). This is the page's strongest single message, so it leads.
2. **Four framed insights.** Each is one cream card with a Border Mist hairline: an eyebrow, the finding in one serif sentence, its visual, the source chips and the main caveat (always visible), and then a hairline and the "Show …" buttons for method and full figures.

| # | Anchor | Finding (one sentence) | Visual | Always visible | Behind "Show …" |
|---|---|---|---|---|---|
| 1 | `#no-way-round` | "Of the 14 areas that wait longer than Finland overall, only two also make few private or work-health doctor visits in all six tests." | The 22-area grid (the "grades grid"). The legend now carries the counts: **14** longer GP wait, **8** and few private or work-health doctor visits, **2** in every one of the six tests. The legend is read by screen readers when it carries counts. On desktop the grid sits beside the text. | Chips: Sotkanet 6411, 2371 and 692 (2025) | "Show how we tested this" (the six tests), "Show the figures for all 22 areas" (sortable table) |
| 2 | `#early-warning` | "Only South Karelia's GP wait is plainly getting worse." | 53.3% → 60.3%, "of non-urgent GP visits waited over 7 days, 2023 → 2025"; "15 more look worse, but their recorded visits changed or are incomplete." | Chip 6411 · 2025, the "Solid" grade, caveat "three years only: a direction, not a forecast" | "Show how we flag and grade a change" (the flag rule with its thresholds read from `rules.json`, the recording-change and publisher-gap rules, then the grading rules), "Show all 22 areas" |
| 3 | `#pathway` | "Three of seven steps to cancer treatment are not published by area." | The seven-step row with the three gaps dashed and labelled "Not published" | One chip per gap, from that step's `data-gaps.json` row: NHS England Fingertips, PubMed Central, Kansallinen syöpästrategia (roadmap) | "Show one area's figures for each step" (picker and `PathwayRow`; opens by itself with `?area=<id>`) |
| 4 | `#starter-dataset` | "18 quarterly counts let a county measure those steps itself." | The six groups of the template as tiles, each with its count (5, 2, 3, 3, 2, 3); "Two of them measure Goal 3 of the national cancer strategy directly." | Caveat "counts only, no patient data"; the **one primary button**, "Download the recording template (Excel)", with "Save or share" (Print, Email) beside it as an outline button | "Show the 18 fields", "Show the Goal 3 link" |

The surfaces are cream cards on cream paper, plus the shared status and grade colours. The slate panel, the sage-tinted chunk, the `FocusGroup` and the `ScrollStory` are gone. Each card fades in once (`Reveal`, loud set).

### Decisions

- **"Grades grid" = the 22-area tile grid.** These are the judges' `insights-*-grid.png` frames. The grade rules (Solid, Read with care, …) stay as a method button in insight 2, as before. No new grade matrix was built.
- **Excel is now a real link, not a menu item.** Before, the template link sat inside the closed "Save or share" menu, so a reader without JavaScript could not reach it (`hasDownload: false`), and nothing on screen read as the page's action. It is now `StarterDownload`, the only primary button on the page.
- **The `?area` fallback.** Before, `<Suspense fallback={null}>` meant the static shell, and any reader without script, got no area pathway at all. The fallback is now the same disclosure for the default area (Central Finland). See "Known limits".
- **Test labels.** `data/insights/rules.json` (`nwr_tests[].label`) says "compared with Finland". `TestsTable` now shows it as "Finland overall" (a display-only replace), and its intro and cells say "Finland overall" too. The data file is unchanged.

## Word count and height

The count is visible words in `<main>` with every "Show …" closed and screen-reader-only text excluded. It is the same script for before and after (`measure.mjs`, kept in the session scratchpad). Source chips and button labels are counted.

| | Before | After |
|---|---|---|
| Visible words, 1366×768 | 325 | 375 |
| Page height, 1366×768 | **5,103px** | **3,309px** (−35%) |
| Page height, 390×844 | 5,204px | 4,868px |
| With `?area=vantaa-kerava`, 1366 | 6,720px | 4,918px |
| With `?area=vantaa-kerava`, 390 | 8,953px | 8,626px |
| Print: words, `<details>` (closed) | 3,302 words, 11 (0) | 3,434 words, 10 (0); with `?area=vantaa-kerava` 10 (0) |
| A4 pages (Chromium PDF) | 22 | 20 |

The word count rose by 50. The story's four one-line steps and the "Where access is hardest" eyebrow were cut (about 50 words), and these were added:
- the six group titles of the starter dataset (about 35 words): the starter card's visual, which before was only reachable by opening "Show the 18 fields";
- three gap source chips on the pathway card: the unpublished steps had no visible source before;
- two card eyebrows, and a card-1 title that names both cut steps (other doctors, six tests) instead of repeating the h1;
- the legend counts.

The page is a third shorter, and the reader sees each insight's finding, visual and source in one frame.

## Fact-diff

Method: the print render (`beforeprint` fired, print media, so every "Show …" is open) of before and after, diffed by number token, link `href`, element id and line. Files: `before-print.txt`, `after-print.txt` and `*-print-links.json` in the scratchpad.

- **Numbers.** 193 distinct number tokens before and 193 after. None is missing and none is new. Every figure still comes from `data/insights/*.json` through `lib/insights`: the 14/8/2 legend counts are counted from `noWayRound.areas`, and the flag thresholds come from `rules.constants`. No number is typed into the page.
- **Links.** None is missing. Two are new: `/api/insights/starter-template` (the direct download, before only inside the menu) and the PubMed Central chip (the source of the diagnosis gap).
- **Sources.** Every chip from before is still there: 6411, 2371, 692, the 6411 early-warning chip, and every chip inside `PathwayRow`, the 18 fields and Goal 3. The pathway card adds `ndrs-emergency-presentations`, `ev-pmc-pmc4412104` and the roadmap.
- **Method.** "How we tested this" (all six tests and the areas each puts in the group), the grading rules (four grades, eight rules in order, scope per indicator), and the early-warning flag rule, now with the full recording-change and publisher-gap rule text from `rules.json`.
- **Ids.** `#starter-dataset` and `#pathway` are kept. `#pathway` is now its own card's anchor, so `/insights?area=…#pathway` lands on the pathway card (checked: card top at 105px). `nwr-heading` was removed; nothing links to it (`grep -rn "insights#" app components lib` finds only `#starter-dataset`, used twice by `/how-to-read`). New: `#no-way-round` and `#early-warning`.

Every changed line, and where its fact is now:

| Before | After |
|---|---|
| "… Finland: 54.7%." | "… Finland overall: 54.7%." |
| "How the two stand out" / "All 22 areas, 2025." | Card 1's eyebrow "All 22 areas, 2025" and its title "Of the 14 areas that wait longer than Finland overall, only two also make few private or work-health doctor visits in all six tests." |
| "A longer GP wait than Finland overall (54.7%)." | Legend "14 · Longer GP wait than Finland overall"; 54.7% is in the statement line |
| "8 of them also use occupational-health and private doctors less than Finland overall." | Legend "8 · … and few private or work-health doctor visits instead", with chips 2371 and 692 |
| "Only Central Finland and South Savo stay there under all 6 cut-offs we tested." | Card 1 title "… only two … in all six tests"; legend "2 · … true in every one of the six tests we ran"; the two dark tiles carry the names |
| TestsTable "with Finland", "Finland 2025: …" and the test labels | "Finland overall" (same values) |
| Flag rule "… moved by more than a fifth …" | "… more than 20% …" (from `recording_change_above`), plus the two full rule texts |
| "Three of seven steps of the cancer pathway are not published by area." | "Three of seven steps to cancer treatment are not published by area." |
| "18 quarterly counts let a county measure them itself." | "… measure those steps itself." |
| "Two of the counts measure Goal 3 …" | "Two of them measure Goal 3 …" |

## Checks

| Check | Result |
|---|---|
| 1366×768 and 390×844, with and without `?area=vantaa-kerava` | No sideways scroll, closed or with every "Show …" open (scroll width 1366 / 390). The test and area tables scroll inside their own container. No console errors. |
| `?area=vantaa-kerava#pathway` | Disclosure open on "The whole pathway in Vantaa and Kerava"; the pathway card scrolls into view |
| Reduced motion | Complete static page; all screenshots above are taken under it |
| Motion on | After a slow scroll, no Reveal is left below full opacity (1366, and 1366 and 390 with `?area`). Landing on `?area=vantaa-kerava#pathway` without scrolling, the 2,038px (desktop) and 4,503px (390) pathway card is at opacity 1. |
| No JavaScript | Complete page: the download link is in the HTML, and every "Show …" is a native `<details>`. See "Known limits" for `?area`. |
| Print | `beforeprint` → all 10 `<details>` open, 0 closed; the picker and Save or share are hidden |
| Font sizes | Nothing under 16px except the 11px eyebrows, closed or all open |
| Excel download | Clicking the button downloads `firstline-cancer-pathway-starter-template.xlsx` (9,444 bytes, a valid zip) |
| Finland wording | Print text, plain and with `?area`: no "Finland's level", no "worse than Finland". Every comparison says "Finland overall". The one other "Finland" outside area names is geographic, not a comparison: "Days from referral to diagnosis are not published by area in Finland." (`PathwayRow`). |
| Contrast | Contract tokens only (charcoal, Forest Ink, muted text and status ink on cream, keylime and mint), all AA per the contract's measured pairs |

## Known limits

- **No JavaScript with `?area=<id>`.** A reader without script sees the default area (Central Finland) behind "Show one area's figures for each step", not the chosen one. With PPR the chosen area is streamed into a hidden boundary that needs script to swap in. Before this change, the same reader got no area pathway at all. A full fix means rendering the page dynamically (a route config change), which is outside this rework.
- **Data still says "compared with Finland".** The label is in `data/insights/rules.json`. The page shows it as "Finland overall"; the data file is unchanged.

## Screenshots

`before-desktop.png`, `before-phone.png`, `before-*-top.png` and `after-desktop.png`, `after-phone.png`, `after-*-top.png` are full pages under reduced motion (the final state). Also: `after-desktop-area.png` (`?area=vantaa-kerava`), `after-desktop-area-anchor.png` (landing on `#pathway`) and `after-nojs.png`.
