# Guided briefing: notes

Post-freeze experiment on branch `t3/guided-county-briefing`, stacked on `t3/experimental-real-user-audit`. Production is untouched.

The briefing brings one area's data to a county director one piece at a time: a nearly empty card, one statement or one figure, and a clearly labelled button to go on. It lives at `/briefing`.

- Start: `/briefing` (choose the area, press "Start the briefing for …").
- Steps: `/briefing/<area>` (step 1) and `/briefing/<area>/<step>` (steps 2 to 6). Area and step are in the address, so every step can be linked, refreshed and reached with the browser's Back button.

## The steps and why

| # | Step | Address | The one thing on screen | Why it is a step |
|---|---|---|---|---|
| 1 | Where you stand | `/briefing/<area>` | The area's share of non-urgent GP visits that come more than a week after people ask, counted up, with Finland's bar beside it and the area's place among the 22 | A director's first question is "are we bad?". One figure, one comparison, one rank. |
| 2 | Where the delay is | `…/where-the-delay-is` | The three steps of the way to care as three tiles; the one worse than Finland is marked "The delay is here." | The audit found the bottleneck was buried under charts. Here it is the whole screen. Steps without public data are drawn as that, and said in a sentence. |
| 3 | What it means | `…/what-it-means` | "About 85 of every 100 non-urgent GP visits…" on a hundred dots, with a button per year | A percentage becomes a count a board can repeat. The year buttons show the direction without a chart. |
| 4 | What to do on Monday | `…/what-to-do` | The three recommended actions, all named at once; the first is open on its first step and who is responsible | Audit finding 2.1: actions two and three were below the fold. Here all three are in view before any press. |
| 5 | What it could change | `…/what-it-could-change` | What was reported where the chosen action was tried, with its source and its limits | The honest answer to "will it work?": a result elsewhere, never a forecast for this area (see "Step 5: no estimate" below). |
| 6 | Take it to your board | `…/take-it-to-your-board` | The briefing in three lines and one filled button to the board-ready plan | The briefing ends in something the director can carry out of the browser: the plan page, a printed document, an email. |

The order follows the questions in the order a director asks them: how bad, where, what does that mean, what do I do, will it help, what do I take to the board.

## What is behind each button

Always there: "Next: …" (filled, bottom right, names the next step), "Back" (bottom left; on step 1 "Back: choose another area"), "Leave the briefing: full table of all areas" (top right, every step), "Step n of 6" with six progress segments. On step 6 the second button is "Start again with another area". The button bar stays at the bottom of the window while a long step scrolls.

| Step | Button | What it shows |
|---|---|---|
| Start | "Choose your area" (a labelled list) | The 22 areas in alphabetical order. It opens on the area with the highest share, so Start can be pressed at once. |
| 1 | "Show me the source" | Who publishes the figure, its official name, the year, the date of our copy, what it cannot say, and a link to the source. |
| 1 | "Compare with another area" | A list of the other areas and two bars, with one sentence in words. It opens on the lowest-share area. Nothing is called "similar": the director picks. |
| 2 | "Show the figures and their sources" | Each step's figures with its source chip; the hospital-group value for the four HUS areas, labelled as not the area's own; and the two figures after the referral that nobody publishes by area (from `data/data-gaps.json`). |
| 2 | "Explain these three steps" | What each step's words mean, and that the colours compare with Finland, not with a clinical standard. |
| 3 | "2023", "2024", "2025" | The statement and the hundred dots for that year. |
| 3 | "Show me the source" | As on step 1, for the figure in focus. |
| 4 | "Show the first step" (one per action) | The action's first step and who is responsible. One is open at a time; action 1 starts open. |
| 4 | "Show where it was tried and how it is funded" (inside an open action; the shared `Disclosure`) | The precedent with its source chip, and the national roadmap measure and funding route with its chip, or a sentence that none is named. |
| 4 | "See the result where it was tried" (link) | Goes to step 5 with that action chosen. |
| 5 | "Action 1", "Action 2", "Action 3" | Which action's result is shown. The choice made on step 4 carries over. |
| 5 | "Show where it was tried" | The place and the programme. |
| 5 | "Show what <area> would measure" | The published figure the area would watch, with its chip; the sentence that FirstLine gives no estimate; and the pace that would reach Finland's level (or the best area's) by a year chosen with the buttons "2027" to "2031". |
| 6 | "Open the plan for your board" | `/county/<area>/plan?target=…&year=…` with the target year chosen on step 5. |
| 6 | "Print this briefing" | The browser's print dialog with the whole briefing as one document (below). |
| 6 | "Send this briefing by email" | A mail draft with the address of step 1. |
| 6 | "Full page for <area>", "Table of all 22 areas" | The detail pages. |

## Motion

The loud end of the site's motion language. The briefing's root carries `motion-loud` (`MOTION_LOUD_CLASS` from `lib/motion.ts`), so timings and easing are the foundation's: rise 500 ms, stagger 120 ms, bars 700 ms, 14 px, `cubic-bezier(0.22, 1, 0.36, 1)`.

Shared pieces used (from `components/motion` and `app/globals.css`):

- `animate-fade-up` for every element that fades in with a slight rise, staggered with `--i`.
- `animate-line-in` for the progress segment of the current step, the line of the way behind the three tiles on step 2, and the bar across the top of the tile where the delay is.
- `AnimatedNumber` (`level="loud"`) for the figure on step 1 and the pace on step 5. The server renders the final text; the moving digits are an `aria-hidden` overlay.
- `AnimatedBar` for the bars on step 1 and in the comparison, always with `play`, so they grow when a button puts them on screen and never on scroll.
- `Disclosure` (`tone="quiet"`) inside the action cards on step 4.

The briefing's own choreography (`app/briefing/briefing.css`, classes `bf-*`):

- `bf-line`: the seven thin Forest Ink lines sliding in from the card's left edge, once per step (640 ms, 55 ms apart). Desktop only, hidden from screen readers and from paper.
- `bf-rank`: the area's marker sliding along the rank line to its place (700 ms).
- `bf-pop`: the hundred dots appearing one after the other (360 ms each, 7 ms apart, about 1.1 s in all), and the words "The delay is here." landing after the red bar.
- `bf-dot`: the dots changing colour when a year is pressed.

Rules kept:

- Nothing moves until a button is pressed. A step is mounted by the press of Next, Back or Start, plays once and stops. There is no autoplay, no scroll-jacking, no content that needs hover.
- Every keyframe has only a `from`, so the finished state is the element's own style: the server HTML of every step is the finished step, and reduced motion and print show it at once.
- Only opacity and transform move. No element changes size, so nothing jumps.
- `prefers-reduced-motion`: all animation and transition is off under `.bf-root`, on top of the foundation's own rule. Checked: 0 running animations on every step.

## Data and sources behind each step

Every number comes from the repo's `data/` snapshot through existing `lib/` functions. `lib/briefing/model.ts` (`buildBriefing(areaId)`) is the one place where the briefing reads data; the screen and the print document are written from the same model. No LLM call, no Exa call, no network request: the briefing is static pages and works with both services down.

| Step | Figures | Source | Functions | Limitation shown on the step |
|---|---|---|---|---|
| 1 | Area's and Finland's share of non-urgent GP visits that waited more than 7 days, 2025; the gap in percentage points; rank among 22 | Sotkanet 6411 (THL) | `getRanking`, `getNationalValue`, `diff1` | "Visits, not people; all non-urgent GP visits, not only cancer-related ones. A GP is a health-centre doctor." |
| 2 | Status of each of the three steps against Finland; GP wait (Sotkanet 6411); referrals processed within 3 days (Sotkanet 13); HUS-wide referral value for the four HUS areas; unpublished figures after the referral | Sotkanet 6411, Sotkanet 13, national cancer strategy roadmap | `getBottleneck`, `bottleneckLede`, `getStageGap`, `STATUS_LABEL`, `getDataGaps` | Step 2 of the way has no public data anywhere, said as a finding. The HUS value is labelled "No county figure" and never shown as the area's own. Helsinki's tile says "The city's own units only. Most referrals go to the HUS hospital group." |
| 3 | The focus step's share per year 2023 to 2025, rounded to "n of every 100"; change since 2023 | Sotkanet 6411 or 13 | `getMainReason`, `getValue`, `getNationalValue`, `YEARS`, `getRecordedVisitChange`, `isRecordingSensitiveChange`, `describeVisitChange` | Visits (or referrals), not people; rounded. Where recorded visits changed a lot, the change is followed by "Read with care: recorded visits … so part of the change may be how visits are recorded." |
| 4 | No figures. Actions, first steps, owners, precedents, roadmap measures and funding routes | `data/evidence.json`, `data/roadmap.json` | `pickActions`, `plainTitle`, `getMeasureForAction` | "Proposals for service planning, picked by a fixed rule from a checked evidence table. Not medical advice." |
| 5 | The precedent's reported result in the study's own words (`effect_text`); the published figure to watch; the target pace | The study behind each action (source chip); Sotkanet 6411 or 13 | `pickActions`, `targetPath`, `bestForStage`, `TARGET_YEARS` | "Not a forecast for <area>." followed by the study's limitations from the evidence table, always on the step. |
| 6 | Step 1's figure and Finland's, repeated | Sotkanet 6411 | as step 1 | "Visits, not people; all non-urgent GP visits, not only cancer-related ones." |

Wording rules kept: Sotkanet 6411 counts visits, so the briefing says "85.4% of non-urgent GP visits … come more than a week after people ask", never "of people" or "of patients". No guideline text is reproduced. There is no symptom checker and no input that takes patient data: the only inputs are the list of areas and buttons.

How the data shapes play out (all walked):

- Delay at getting to a GP, referral shared with HUS (Vantaa and Kerava, Central, East and West Uusimaa): step 2 marks tile 1 and says steps 2 and 3 cannot be judged for the area.
- Delay at the referral (Kainuu, Pirkanmaa, Central Ostrobothnia): step 2 marks tile 3; step 3 counts referrals processed within 3 days.
- No step worse than Finland (Lapland, Päijät-Häme, East Uusimaa): step 2 says so and names the step closest to Finland's level; step 4 becomes "things that help <area> keep its level"; the pace on step 5 aims at the best area's level, and the best area itself gets "The aim is to hold the level."
- Helsinki: the referral tile carries the city-units limit on the tile, and the figure sets no target.

## Step 5: no estimate, and why

The brief allowed an estimate only if a sourced effect size fits. None does. Every effect size in `data/evidence.json` is in the unit of its own study (odds of dying within a year, days of diagnostic interval, share of triage assessments judged safe, and so on). None is measured in the unit of Sotkanet 6411 (share of non-urgent GP visits waiting more than 7 days) or Sotkanet 13 (share of referrals processed within 3 days). Turning one into the other would be an invented number.

So the step shows three things and keeps them apart:

1. What the cited precedent reported where it was done, in its own words and unit, with its source chip and, always visible under it, "Not a forecast for <area>." and the study's limits.
2. The published figure the area would watch to know whether it is working (behind "Show what <area> would measure"), with the sentence "FirstLine gives no estimate of this action's effect in <area>: no published study measures it on this figure."
3. In the same panel, the pace that would reach a published level by a chosen year. This is `targetPath` from `lib/plan.ts`: an even pace between two published shares. It is labelled "This is arithmetic on the two published figures above … It assumes nothing about what any action will achieve."

## Slots left for the insights branch

Nothing from `lib/insights`, `components/insights` or `app/insights` is imported. Three slots are ready; they render nothing until something is passed.

| Where | Prop | Meant for |
|---|---|---|
| `components/briefing/step-stand.tsx`, `StepStand` | `confidence?: ReactNode` | A small confidence label beside the big figure on step 1 (rendered in `[data-slot="briefing-confidence"]`). |
| `components/briefing/step-where.tsx`, `StepWhere` | `confidence?: Partial<Record<Stage, ReactNode>>` | A confidence label per tile on step 2, under its status. |
| `components/briefing/step-board.tsx`, `StepBoard` | `moreLinks?: ReactNode` (pass `<li>` elements) | The link to `/insights` ("See where access is hardest across Finland") at the end of step 6's link list. |

They are passed in `app/briefing/[id]/layout.tsx`, where the six steps are created.

## How it is built

- `app/briefing/[id]/layout.tsx` builds the model once and renders all six steps on the server. It hands them to the client `BriefingShell` (`components/briefing/shell.tsx`), which shows the one named by the address (`useSelectedLayoutSegment`). The pages (`[id]/page.tsx`, `[id]/[step]/page.tsx`) only supply the title, the static params and the 404 for an unknown area or step. Every address is prerendered, and each one's HTML holds its finished step.
- Next and Back are plain links, so the browser's Back and Forward work. All six steps arrive with the first, so a press changes the screen at once.
- On each step change the keyboard focus moves to the step's statement (`h1`, `tabindex="-1"`), the page title becomes "Step n of 6: <name> · Briefing for <area>", and Next's route announcer reads the statement or the title. The step reached by pressing Start takes the focus too (`components/briefing/arrival.ts`); a page loaded directly keeps the browser's own focus.
- The action chosen on step 4 and the year chosen on step 5 live in a small context in the shell. Nothing depends on them: a step opened from a link shows action 1 and 2028.
- Print: `components/briefing/print-document.tsx` writes the whole briefing for the area as one document (all six steps, every action, every year, the target paces, a numbered source list with addresses). It is in the page on every step, hidden on screen and shown on paper, where the card, its buttons and the site header and footer are hidden.

## What I checked, and how

The Playwright browser MCP could not start in this environment ("Chromium distribution 'chrome' is not found"), so the walks were scripted with `playwright-core` driving the bundled Chromium, pressing the same buttons a person would. Screenshots are in `docs/audit/briefing/screenshots/`.

- **Areas walked from Start to step 6 by pressing the buttons:** Vantaa and Kerava and Kainuu at 1366×768; Päijät-Häme and Helsinki at 390×844; East Uusimaa with reduced motion. Every step was reached, the address and title changed on each, no page scrolled sideways, no console error.
- **Keyboard only:** from the start page with Tab and Enter to step 6. The list of areas, Start and every Next were reached and showed a 2 px Forest Ink focus ring. On arrival the focus was on the step's statement on all six steps. Browser Back went 6 → 5 → 4, and a refresh kept step 4.
- **Buttons inside the steps:** all of the buttons in the table above were pressed and their panels read (`screenshots/buttons/`). The year chosen on step 5 (2029) arrived on the plan page.
- **Reduced motion:** 0 running animations on all six steps 120 ms after load; everything at full opacity except the source chips' arrow icon, which is drawn at 70% by design.
- **Print:** the print document shows, the card and the site header do not; 4 A4 pages for Vantaa and Kerava and for East Uusimaa, with all six headings and the source list (`screenshots/print/`).
- **Contrast:** 751 text runs measured on the start page and all steps for three areas, with every panel opened. None below WCAG AA; the lowest ratio is 6.65:1.
- **Text size:** everything is 16 px or more except the 11 px eyebrows (the allowed exception) and the text inside the site's shared source chip (13 px, see "What still falls short").
- **Unknown addresses:** `/briefing/nowhere` and `/briefing/kainuu/not-a-step` return the 404 page.
- **Motion:** frame sequences of steps 1, 2 and 3 coming on screen, about every 130 ms after the press, in `screenshots/motion/`.

### The two-minute test

Counted, not timed with a person: the words on screen with no in-step button pressed, including every label, pill and bar caption.

| Area | Step 1 | 2 | 3 | 4 | 5 | 6 | Total | At 200 words a minute | At 250 |
|---|---|---|---|---|---|---|---|---|---|
| Vantaa and Kerava | 66 | 66 | 72 | 117 | 92 | 112 | 525 | 2 min 38 s | 2 min 6 s |
| Kainuu | 63 | 69 | 81 | 111 | 89 | 105 | 518 | 2 min 35 s | 2 min 4 s |
| Päijät-Häme | 62 | 69 | 115 | 112 | 89 | 107 | 554 | 2 min 46 s | 2 min 13 s |

So a reader who reads every word, captions and caveats included, needs about two and a half minutes; the statements alone (one per step, about 150 words) take under a minute. It passes the two-minute test for a demo or a brisk reader and misses it for a slow, complete read. The first version was about 600 to 690 words; steps 3 to 6 were cut after the team lead's note that step 5 had too much text.

## What still falls short

- **Two minutes is not met for a complete, careful read** (table above). What is left is mostly caveats and source lines, which the data-honesty rules keep on the step.
- **Not tested with a person, a screen reader or a real printer.** Focus, titles and live regions were checked in the DOM; nobody listened to it in NVDA or VoiceOver. Print was checked as print-media rendering and PDF, not on paper.
- **The route announcement is not uniform:** Next's announcer read the step's statement on some steps and the page title on others. Both name the step, and the focus moves to the statement either way.
- **The source chip's text is 13 px.** It is the site's shared `components/source-chip.tsx`, outside the briefing's folders.
- **Step 5 gives no number for the area.** That is the honest state of the evidence table, but a director may still want one. It needs an effect size measured on Sotkanet 6411 or 13, which no cited study has.
- **The briefing always opens on the GP wait in step 1,** also for the three areas whose delay is at the referral. Step 2 then moves to the referral. One opening figure for every area keeps step 1 comparable, at the price of a turn in the story for those three.
- **The comparison on step 1 is by the director's choice,** not by similarity. The data has no defensible "similar area" measure.
- **Choices are not in the address.** The action chosen on step 4 and the year chosen on step 5 are lost on a refresh (the step itself is kept).
- **The edge lines are desktop only** and purely decorative.
- **Motion was recorded as frames, not as video.**

## Needed from the foundation agent

Nothing blocks the briefing. Two small things outside the briefing's folders:

1. `components/source-chip.tsx`: the chip's text is 13 px, under the 16 px floor the brief sets for body and button text. Raise it, or confirm the chip is an allowed exception like the eyebrow.
2. `PRIMARY_BUTTON` and friends in `components/briefing/ui.tsx` restate the button look from the contract as class strings, because the briefing's buttons are links with their own sizes. If `buttonVariants` gains a 52 px size with the trailing arrow, the briefing can switch to it.

One thing for whoever copies the briefing's patterns: in Tailwind 4, `outline-none` next to `focus-visible:outline-2` switches the focus ring off (it sets the outline style to none). The briefing had this and it is fixed here; the shared `Disclosure` uses a ring instead and is not affected.
