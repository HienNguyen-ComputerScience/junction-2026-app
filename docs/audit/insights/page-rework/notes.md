# /insights told on scroll: what was cut, moved or simplified

Branch `t3/rework-insights-scroll-story`, on top of `t3/experimental-real-user-audit` (merged from the local ref, with `FocusGroup`). Rule applied: cut first, to every element (text, sections, panels, cards, buttons, charts, tables, pickers). No figure was added or changed: every number on the page comes from `data/insights/*.json` as before.

## Word count (visible text, desktop 1366×768, before any button is pressed)

| | Words |
|---|---|
| Before | **2,851** |
| After | **231** as the script counts it. Of these, 36 are the 22 area names in the picture and 16 are the step names and "Not published" in the pathway row, so the prose is about **179**. The picture's 13-word legend is `aria-hidden` (each box carries its own screen-reader text), so the script does not count it. |

The script, kept in the session's scratchpad, removes source chips, pills and badges, button and `summary` labels, tables, form controls, closed `<details>` content and screen-reader-only text. It still counts a `CaveatNote`'s always-visible short text and a `ConfidenceBadge`'s visible reason.

Screenshots: `before-*.png` and `after-*.png` show the first two screen heights at 1366×768 and 390×844 under reduced motion, which is the final state. `after-desktop-story-step-3.png` is the story at its last step with motion on.

## The page now

1. **The finding** (lead `Chunk`, h1). "In two areas the GP queue is long, with no way round it." Then Central Finland 73.5% and South Savo 69.7% counting up, the unit line with Finland's 54.7%, one source chip (Sotkanet 6411 · 2025, the same for both), one grade label ("Read the trend with care", the same for both) and a `CaveatNote`: "area figures, not people; not cancer-specific".
2. **How the two stand out** (`ScrollStory`). The picture shows the 22 areas as boxes. Four short steps: all 22 → a longer wait than Finland → 8 of them also use the other routes less → only the two hold under all six cut-offs. Each level has its own fill **and** its own number of dots, so the picture does not rely on colour alone. Two buttons sit below: "Show how we tested this" and "Show the full table".
3. **Early warning** (`Chunk`). "Only South Karelia's GP wait is plainly getting worse." Then 53.3% → 60.3%, with its source chip and grade label. "15 more look worse, but their recorded visits changed or are incomplete." The `CaveatNote` reads "three years only: a direction, not a forecast". Two buttons: "Show all 22 areas" and "Show how we grade each figure".
4. **What to record from Monday** (`Chunk`, `#starter-dataset`). "Three of seven steps to cancer treatment are not published by area." Then the seven steps in one row, with the three gaps dashed and labelled "Not published", and "18 quarterly counts let a county measure them itself." The `CaveatNote` reads "counts only, no patient data". Below that come the primary button "Download the recording template (Excel)", "Show the 18 fields", one framed Goal 3 line with "Show the Goal 3 link", and "Show one area's figures for each step" (the picker; it opens by itself when an area has been chosen, `/insights?area=<id>#pathway`).

All of it sits in one `FocusGroup`.

## Removal pass: removed, linked out or simplified

| What | Now | Why |
|---|---|---|
| Header lede ("Five findings from published Finnish statistics…") | Deleted | It describes the page. |
| "On this page" list of six links | Deleted | It describes the page; the story is read in order. |
| Header "Print or save as PDF" button | Deleted | Not needed to understand or act. Browser print still prints everything open and unstuck (checked). |
| Header "Download the Excel template" button | Moved to the template chunk | One place for the download, next to what it is. |
| No-way-round eyebrow, h2 and the 50-word statement | Replaced by the 12-word lead statement | Same finding, fewer words. |
| Two area cards (GP wait, occupational, private, each with a grade and reason; the "in 6 of 6 tests, 2023 and 2024 too" line) | GP wait figures in the lead; occupational and private figures in "Show the full table"; the tests line became story step 4 and "Show how we tested this" | The GP wait is the headline. The other two figures back step 3, whose source chips (2371, 692) are visible. |
| Two grade reasons under the hero figures | Behind the lead caveat's "Why?" (both reasons) | They cost about 45 words, and the label stays visible. |
| Paragraph "On the main view, 8 of 22… 16 of 22 are below Finland on occupational-health visits…" | "8" in story step 3; the 16-of-22 sentence deleted | Method detail. It is still in `docs/audit/insights/notes.md`. |
| "How it was worked out" paragraph | Deleted | The intro to "Show how we tested this" says the same. |
| Mint "What these figures do not show" box (4 bullets) | `CaveatNote` with the 4 bullets behind "Why?" | One main caveat, visible; the detail is in place on request. |
| Two scatter charts and their legend | One picture: 22 boxes narrowing to two | The narrowing is the finding. The scatter's magnitudes are in the full table. Two panels did not fit the sticky slot at 1366×768. |
| Full table of 22 areas | Behind "Show the full table" | Reference, not story. |
| Starter dataset h2, eyebrow and statement | Chunk statement and the step row | The "Not published" steps are the reason for the template, so they now sit together. |
| Slate "No patient data" box (3 bullets) and the "One row per cancer group…" sentence | `CaveatNote` "counts only, no patient data", bullets behind "Why?"; the sentence deleted | The template's Read me sheet says it. |
| Six group cards (why, missing figure, roadmap measure, Finnish definition, abroad) | Group title, fields and definition/abroad source chips behind "Show the 18 fields"; the why, missing-figure and roadmap lines removed from the page | Background, not needed before downloading. The content stays in `data/insights/starter-dataset.json` and the template. |
| Indicators table (I1–I7, formulas) | Removed from the page | It is the template's Indicators sheet. |
| Confidence-grade section (h2, paragraph incl. "18 of 22 areas changed by more than a fifth", rules panel) | One button, "Show how we grade each figure", in the early-warning chunk | Brief: a small button, not a paragraph. `/how-to-read` returns 404 on this branch, so there is nothing to link to yet. |
| Pathway section: picker, 7-cell strip, 7 detail cards, 4-bullet caveat box | A seven-step row (no area needed: the gaps are the same everywhere) in the template chunk; picker and detail cards behind "Show one area's figures for each step"; the caveat box became a `CaveatNote` "side by side, not cause and effect" | The point is "Not published". The county page has no such row (its `PathwayStrip` is the eight-step stepper without these figures), so linking out was not possible. The strip duplicated the detail cards, so it is gone (`strip={false}`). |
| Early warning: h2, method paragraph, summary paragraph (GP 16 of 22, bowel 22 of 22), "Getting worse" heading and screening note, the warning cards, the "possible changes" cards, the all-figures table | One chunk for the GP wait: the South Karelia figure, the "15 more" line, the caveat, and "Show all 22 areas" (GP-wait table) | The GP wait is the page's subject. **Dropped from this page:** the referral (5), breast screening (5) and cervical screening (6) "getting worse" flags and the bowel-screening comparability flags. The `EarlyWarning` component is unchanged and can show them elsewhere. |
| Goal 3 section (h2, 3 paragraphs, 4 chips, keylime panel) | One framed line, "Two of the counts measure Goal 3 of the national cancer strategy directly.", with the detail and its 4 chips behind "Show the Goal 3 link" | Brief. |
| Page title "What the data shows, and what to start counting" | "Where access is hardest", matching the nav label | Shorter. |

## Component changes (all in `components/insights`)

- New: `no-way-round-tiles.tsx` (client picture, uses `useStoryStep()`), `insights-story.tsx` (`GpWaitWarningTable`, `PathwayStepsRow`, `StarterFields`).
- `PathwayRow`: new prop `strip` (default `true`). Its caveat box is now a `CaveatNote` (short form visible, the four bullets behind "Why?").
- `ConfidenceBadge`: the label is 16px (was 13px), to meet the 16px floor. This applies everywhere the badge is used.
- `StarterDownload`: optional `label`. `Goal3Detail` is exported (`Goal3Link` uses it). `TestsTable` and `AreaTable` (no-way-round) and `Flag` and `seriesText` (early-warning) are exported.
- Every existing export and prop is kept.

## Checked (dev server, port 3061, `playwright-core` with the bundled Chromium)

- **1366×768, motion on:** the story moves through steps 0 → 1 → 2 → 3. Highlighted boxes go 0 → 14 mint → 8 sage → 2 forest. The picture stays fully in view while it sticks (top 128, bottom 632–662). After a full scroll every Reveal is at full opacity. No console errors.
- **Keyboard only:** the tab order follows the reading order (source chips, then caveat "Why?", "Show how we tested this", "Show the full table", "Show all 22 areas", "Show how we grade each figure", download, "Show the 18 fields", "Show the Goal 3 link", "Show one area's figures for each step"). Enter opens a disclosure.
- **390px:** the picture sits above the text in its final state, and there is no sideways scroll even with every disclosure open (the scroll width was 988 before the fix).
- **Reduced motion:** the page reads as a static document, with the picture in its final state.
- **Print** (print media, A4 PDF): all 11 `<details>` are open, the picture is not sticky, and the story is in its final state; 21 pages.
- **Template:** the button downloads `firstline-cancer-pathway-starter-template.xlsx` (9,444 bytes, valid zip).
- **Area picker:** choosing Vantaa and Kerava loads `/insights?area=vantaa-kerava#pathway`, with the disclosure open on "The whole pathway in Vantaa and Kerava".

## Known leftovers

- Eyebrows are 11px. This is the shared `type-eyebrow` style, used site-wide; the step eyebrows inside `PathwayRow` use the same style.
- Not done: a screen-reader pass, and opening the template in Excel itself.
