# How to read these numbers: notes

Post-freeze experiment, stacked on `t3/experimental-real-user-audit`. Route: `/how-to-read`. Production is untouched.

One long page, told on scroll like a product page. Each topic is one or more shared `Chunk`s (serif statement, figure, one plain sentence, source chip, one `CaveatNote`). Two topics use the shared `ScrollStory`: a picture stays in place while two or three short text blocks scroll past it. Every caveat is on the page as one short sentence, with its detail behind "Why?" or a "Show …" button.

Files: `app/how-to-read/` (page and its small CSS), `components/walkthrough/` (the two pictures, the forward link), `lib/walkthrough/model.ts` (the only place the page reads data).

## The topics, what is behind each button, and where each statement comes from

The sticky bar at the top holds one link, "See the full list of sources" (`/sources`). It is visible everywhere on screen and hidden on paper. Under the page title, "On this page" links to the six topics.

### 1. Where the numbers come from

| What | Says | Source in the repo |
|---|---|---|
| Statement | "Every number here comes from a public source you can open." | — |
| Figure | 31 public sources, 15 of them studies and national documents | Row counts of `data/sources.json` (all, and `kind: "evidence"`) |
| Sentence | "Our copy was taken on 14 November 2026 and is shown unchanged." | `retrieved` in `data/sources.json` |
| List | THL on Sotkanet (6411, 13, 5033, 293, 2371), the Finnish Cancer Registry on Sotkanet (3621, 3620, 6103, 3625, 3627), Kela on Sotkanet (692), HUS (its 2024 referral report). One plain line on what each gives, and its source chips | `publisher` and `name` in `data/sources.json`; the grouping is ours |
| "Show when each publisher last updated its figures" | Each statistic's full name and the publisher's last update date | `data_updated` in `data/sources.json` |

How often each source publishes is not in the data. The page shows the publisher's last update date instead and does not claim a frequency.

### 2. What one figure really counts (ScrollStory)

| What | Says | Source |
|---|---|---|
| Statement | "A figure counts exactly one thing." | — |
| Picture | "Choose another area" (a list of the 22 areas, worst first, each with its 2025 share). The share counts up to its exact value, with one line: "of non-urgent GP (health-centre doctor) visits in [area] came more than a week after people asked, 2025". Next comes the area's confidence label ("Read with care", with the reason behind "Why?"). Then two pairs: "Counted: visits" / "Not counted: people", and "Counted: every non-urgent GP visit" / "Not published: cancer-related visits alone". Last comes the source chip | `getRanking()`, `formatPct`, `getGrade(area, "6411", 2025)` |
| Story step 1 | "It counts visits, not people. One person can make several visits." | Wording rule in SPEC.md; `scope` of 6411 in `data/insights/rules.json` |
| Story step 2 | "It counts every non-urgent visit, not only cancer. It shows how hard any GP appointment is to get." | `limitation` of 6411 in `data/indicators.json` |
| "Show the official definition" | THL's English name, a plain version ("more than 7 days after the need for care was assessed"), and the limitation | `data/indicators.json` |

The area chooser opens on Vantaa and Kerava (85.4%), so the first label a reader meets is "Read with care". THL reports visits missing from that area's records.

### 3. How much to trust a figure (three chunks)

| What | Says | Source |
|---|---|---|
| Statement | "Every figure carries a label: how far to trust it." | — |
| Figure | 16 of 22 areas' GP-wait figures for 2025 are marked to read with care (both "Read with care" and "Read the trend with care"; unquoted on the page, since 15 of the 16 are the second label) | Count of `level: "care"` for 6411, 2025, in `data/insights/grades.json` |
| Sentence | "Most often because the way visits were recorded changed." | 15 of the 16 carry `recording-change` (`rule_ids`) |
| "Show the labels and the rules behind them" | The four labels with their shapes and meanings, and the eight rules in the order they are applied | `rules.levels`, `rules.grade_rules` (`lib/insights`) |
| Example: Ostrobothnia | A two-by-two table: waited over a week 43.8% → 56.7%; recorded visits 26,493 → 8,485 (2024 → 2025). Caveat: "part of the rise may be in what was recorded"; behind "Why?": the grade's reason, quoted as is ("fell 68% from 2024"), and how recorded visits are worked out | `getGrade("ostrobothnia", "6411", 2024 / 2025)`: `value` and `base`. Checked: `abs_value / (value / 100)` in `data/values.json` gives 26,493 and 8,485 |
| Example: the HUS figure | "4 areas in Uusimaa share one referral figure." 74.1% of referrals processed within 3 days at HUS, 2025. The sentence names Central, East and West Uusimaa and Vantaa and Kerava. Caveat: "this is the value of HUS, never one area's own"; behind "Why?": why, and that it counts all referrals | `gap.shared` of the referral step in `data/gaps.json` (`getStageGap`), `confirmed_by: hus-referrals-2024` |

The Ostrobothnia caveat quotes the year-on-year grade reason. It does not use `lib/recording`'s 2023-to-2025 change, which gives a different percentage.

### 4. What Finland does not publish (ScrollStory)

| What | Says | Source |
|---|---|---|
| Statement | "Of 7 steps from screening to survival, 3 have no public figure by area." | `published` flags in `data/insights/pathway.json` (the same for every area) |
| Picture | The seven steps. Published ones are filled, with a tick and what is published ("Screening attendance", "Referrals processed in 3 days, by hospital"). The three gaps (GP recognition, diagnosis, treatment start) are hatched empty slots marked "Not published by area", never a zero | `getPathwayRow` |
| Story steps | "4 steps are published." / "3 steps are empty." / "A gap stays a gap. We never fill one with an estimate." The picture marks the published slots, then the empty ones, then their labels | — |
| "Show what is missing, and what exists instead" | For each gap, what is missing, what exists instead, and its source chip | `missing`, `today`, `source_id` in `data/data-gaps.json` |

### 5. What we did about it

| Row | Visible | Behind the button | Source |
|---|---|---|---|
| Results elsewhere, not predictions | "A tried action shows the study's own result, never a forecast." | — | Briefing step 5, `docs/audit/briefing/notes.md` ("no estimate") |
| The AI writes words, not numbers | "A checker deletes any AI sentence whose number is not in our data." | "Show what the checker removes": the five rules, and the fallback brief | `lib/brief/validate.ts` (`checkClaim`), `lib/brief/generate.ts` (`fallbackResponse`) |
| Live web results carry this label | The real "Found live — unverified" badge | "Show how live results are checked": the question box answers only from the results and removes sentences whose numbers are not in the results it cites | `components/exa/result-list.tsx`, `app/api/ask/route.ts`, `lib/exa/answer.ts` |

The two checkers are described separately, as the code has them. The brief checker checks claims against the snapshot facts for the sources they cite. The question box checks sentences against the live results they cite.

### 6. What a county can do from Monday

| What | Says | Source |
|---|---|---|
| Statement | "A county can start counting its own figures now." | — |
| Figure | 18 counts in 6 groups, kept once a quarter | `starterDataset.sections[].fields` (`lib/insights`) |
| Sentence | "Counts only: no names, identity codes or details about a patient." | `starterDataset.privacy` |
| "Download the Excel template (.xlsx)" | The insights template, `GET /api/insights/starter-template` | `StarterDownload` |
| "Show the counts to record" | Each group, why, its fields; all three privacy lines (including the "<5" rule); a link to the definitions on `/insights` | `starterDataset` |
| End | "Start the guided briefing for your area", "See where access is hardest" | — |

## Removal pass: what was cut or simplified, and why

| Removed or simplified | Why |
|---|---|
| The intro paragraph under the title ("Where FirstLine's figures come from … Keep scrolling") | It described the page; the "On this page" list already says what is here. |
| The "Why some areas share a number" topic, folded into "How much to trust a figure" | "Shared hospital value" is one of the four trust labels, so it is a case of that topic, not a topic of its own. Seven topics became six. |
| The four cards explaining the trust labels | The two examples show what a label looks like. The full meanings are behind "Show the labels and the rules behind them". |
| The Ostrobothnia bar chart, replaced by a two-by-two table of four figures | The point is two numbers moving in opposite directions. Bars showed only one of them. |
| The HUS panel (four area pills, connector lines, a nested card), replaced by one figure and one sentence naming the areas | The picture repeated what the sentence says. The connector lines were decoration. |
| The Finland comparison bar in the GP-wait picture | That topic is about what the figure counts, not how the area compares. The briefing and county pages carry the comparison. |
| The explanatory line under each "counted / not counted" box | Each box title says it all, and the story text beside the picture explains it. |
| The source-publisher cards, replaced by one list split by hairlines | It is the same content without four boxes. |
| The "Published: …" lines in the pathway picture, cut to a few words after a tick | At 1366×768 the picture must fit the window while it stays in place. |
| The publishers table (four columns), replaced by a two-column list behind the button | "We copied it" was the same date on every row; it is now one sentence on the page. |
| "Only published figures" in "What we did about it" | It repeated topic 1. |
| The four "What we did" cards, replaced by three rows in one list | No boxes inside a box. |
| The six starter-group tiles | The figure says "18 counts in 6 groups". The names and fields are behind "Show the counts to record", next to the download. |
| "Where to go next" heading, its sage panel and the third link to `/sources` | The sources link is always in the top bar; two plain links are enough. |
| "Back to On this page" link | The browser's own scrolling does it. |
| The page title in the sticky bar | It repeated the h1. The bar now holds only the sources link. |
| The decorative line before each section name | Decoration; the shared `Chunk` eyebrow names the topic. |
| The page's own sticky-story component and CSS | Replaced by the shared `ScrollStory`, so this page scrolls like the others. |
| Body text of the "What we did" rows and the HUS and Ostrobothnia caveats | Cut to one sentence each. The detail is behind "Why?" or "Show …". |

## Motion

Everything is the shared set at the loud level (`motion-loud` on the root): `Chunk` reveals its statement, figure, sentence, then source and caveat as each enters view. `AnimatedNumber` counts every figure to its exact value. `ScrollStory` picks out picture parts as its text blocks cross the middle of the screen. The only CSS of the page's own is the hatching of an empty slot, the scroll padding under the sticky bar, and reduced-motion and print overrides. No wheel or touch handlers, no scroll-snap, no parallax, nothing on hover only.

## What I checked, and how

The Playwright MCP was not used; `playwright-core` drove the bundled Chromium against `npm run dev -- -p 3041`. Scripted, pressing and scrolling as a reader would:

- **Desktop 1366×900, scrolling down in steps:** every chunk revealed and stayed revealed (0 left waiting); no console error after one fix (two siblings had the same React key). Both stories advanced: GP-wait picture steps 0 → 1, pathway picture 0 → 1 → 2. Frames in `screenshots/frames/` (`one-figure-*`, `not-published-*`, the step in the file name).
- **Every "Show …" and "Why?" button** opened and switched its label to "Hide …" (`screenshots/desktop-all-open.png`). Choosing Päijät-Häme in the area list showed 32.7% with its own label (`screenshots/one-figure-paijat-hame.png`).
- **Figures against `data/values.json`:** all 22 area values in the chooser match 6411 for 2025. Finland 54.7% and 76.8% are no longer shown. HUS 74.1% matches `data/gaps.json`. Ostrobothnia 43.8% and 56.7% match, and the recorded visits recomputed from `abs_value` give 26,493 and 8,485. 31 sources matches `data/sources.json`.
- **Reduced motion:** 0 running animations, 0 waiting pieces, both stories in their final state (`screenshots/reduced-motion-full.png`).
- **No JavaScript:** every piece and every figure in the HTML, nothing hidden, stories final (`screenshots/no-javascript-full.png`).
- **Phone 390×844:** no sideways scroll, no element past the edge, both pictures static above their text (`screenshots/phone-390-full.png`).
- **Keyboard only:** 72 Tab stops through the page, each with a visible focus ring and none hidden under the sticky bar. Enter on an "On this page" link lands the topic just under the bar.
- **Print:** both pictures unstuck and final, every `<details>` open, the sticky bar hidden (`screenshots/print.pdf`, `screenshots/print-media-full.png`).
- **Template download:** `firstline-cancer-pathway-starter-template.xlsx`, a valid zip (starts with PK).

## What still falls short

- **Not tested with a person or a screen reader.** Focus and labels were checked in the DOM only.
- **Text under 16px from shared components:** the "Found live — unverified" badge (14px, `components/ui/badge.tsx`) and the 11px eyebrow on each `Chunk` (the allowed exception).
- **Frequency of publication** is not in the data, so it is not stated (see topic 1).
- **The 16 "read with care" count** groups "Read with care" and "Read the trend with care", as the grade level does.
- **A long print:** with every button's detail expanded, the page prints long. Nothing is cut.
- **No Vercel preview checked.** Pushing is held to one push at the end, by team rule.
