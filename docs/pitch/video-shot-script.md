# FirstLine: video shot script

Draft by the lead's agents for fraidfax to edit; the canonical wording is in demo-script.md. Total target 1:50 (10 s safety margin under the 2:00 hard limit).

Related: `video-script.md` (your own timed script) and `demo-script.md` ("2:00 video outline"). This file only adds a shot-by-shot version with exact URLs, click paths, word counts and a recording checklist. Same story order as the outline. Wording rule (SPEC.md): the indicator counts non-urgent GP **visits**, so say "visits", never "people".

Voice-over pace: about 2.3 words per second. Each window leaves about 1 s for cuts and clicks.

## Shots

Live site: https://firstline-finland.vercel.app (routes below returned 200 on 14 Nov).

| # | Time | On screen | Voice-over (word for word) | Words | Caption |
|---|---|---|---|---|---|
| 1 | 0:00–0:11 | Title slide: muted map of Finland. Two big numbers pop in: 85% on Vantaa–Kerava, 33% on Päijät-Häme. Source chip fades in. | In Vantaa–Kerava, 85 percent of non-urgent GP visits happen more than a week after people ask. In Päijät-Häme, it is 33 percent. | 22 | `85.4% Vantaa–Kerava` / `32.7% Päijät-Häme` / `THL Sotkanet 6411, 2025` |
| 2 | 0:11–0:30 | Slide: patient → GP → referral → treatment line. The first two steps light up. | In Finland, lymphoma patients who started at a public health centre waited a median 127 days to treatment. Through private or work care: 76. Equal care runs from GP wait, to referral, to treatment. No county sees where it breaks. | 41 | `127 vs 76 days · Kuitunen et al. 2026` / `GP wait → referral → treatment` |
| 3 | 0:30–0:41 | `/` (county ranking). Slow scroll down the list of 22 areas.. | This is FirstLine. Every wellbeing county, ranked by GP wait and referral speed. Public THL data, with source and year on every number. | 23 | `22 areas · source and year on every number` |
| 4 | 0:41–0:52 | Click Vantaa and Kerava in the ranking. Lands on `/county/vantaa-kerava`. Rest the cursor on step 1 (red, 85.4%, Finland 54.7%), then on step 3 (grey, "No public data"), then on the limitations box. | Open Vantaa–Kerava. The delay is getting in to a GP. The referral step is grey: no public data, and we say so. | 22 | `Red: worse than Finland (54.7%)` / `Grey: no public data` |
| 5 | 0:52–1:08 | Go to `/county/vantaa-kerava/act`. Open the first card, "Give patients a named GP (omalääkäri) they keep over time". Scroll to its owner, first step and source link. | What to do on Monday? Each action has an owner and a first step. In Norway, patients with one GP for over 15 years had 25 percent lower odds of dying in the study year. | 35 | `Owner · first step · source` / `Norway study: observational, not cancer-specific` |
| 6 | 1:08–1:18 | Go to `/county/south-ostrobothnia/act`. Open the card "Introduce cancer fast-track pathways with maximum time limits". Show "17 days shorter" and the source link. | In South Ostrobothnia, the weak step is referral. Denmark's fast-track pathways made the median time to diagnosis 17 days shorter. | 20 | `Denmark: 17 days shorter · Jensen et al., BMC Cancer 2015` |
| 7 | 1:18–1:26 | Still on `/county/vantaa-kerava/act`: scroll to the red-flag helper. Type "weight loss, tiredness". Show the "vague symptoms" route. | For the GP: type the symptoms, see guideline warning signs and the fastest referral route. | 15 | `Decision support, not diagnosis` |
| 8 | 1:26–1:40 | Back to `/county/vantaa-kerava`. Scroll to "Local news". Pause on the newest card (dated 2 Nov 2026, laakarilehti.fi, "Vake palkkaa 450–500 uutta työntekijää, lääkäreitä 26"). Zoom on the label "Found live — unverified". | The numbers are from THL. This month's news is in no dataset. Exa finds it: Vantaa–Kerava is hiring 26 doctors. Every item links its source, labelled found live, unverified. | 29 | `Found live with Exa` / `Found live — unverified` / `2 Nov 2026 · laakarilehti.fi` |
| 9 | 1:40–1:50 | Close card: FirstLine, https://firstline-finland.vercel.app, three bullets. | Decision support, not medical advice. Public 2025 data, every number sourced, no patient data. FirstLine: equal first steps across Finland. | 20 | `Public 2025 data` / `Every number sourced` / `No patient data` |

Total: 22 + 41 + 23 + 22 + 35 + 20 + 15 + 29 + 20 = **227 words**. At 2.3 words per second that is 98.7 s of speech inside a 110 s (1:50) plan, so there is 11 s of slack for cuts, clicks and breathing.

Limitations line (shot 9): decision support, not medical advice, and the data is from 2025. The on-screen limitations box in shot 4 adds that the indicator covers all non-urgent GP visits, not only cancer.

## Before recording

- [ ] Browser: Chrome or Chromium, 1920×1080, 100% zoom, light theme, one tab, no bookmarks bar, no extensions visible. Hide any personal data in the address bar or tab titles.
- [ ] Record from the deployed URL, not localhost. PR #62 (rate limit on `/api/brief`, the 429 message, evidence sources listed on `/sources`) was merged but not deployed when this was written. Check the deploy is current, or do not show anything that depends on it.
- [ ] Curl the five routes first: `/`, `/county/vantaa-kerava`, `/county/vantaa-kerava/act`, `/county/south-ostrobothnia/act`, `/sources`. All must return 200.
- [ ] Pre-warm the Exa panels so they load instantly: run `npm run exa:prewarm -- https://firstline-finland.vercel.app` (the script takes the base URL; it needs no keys on your side because the server holds them). Then open the Vantaa–Kerava page and confirm "Local news" shows dated cards. Re-run after every deploy.
- [ ] Re-check shot 8 on recording day. If the newest Vantaa–Kerava card is not the 2 Nov 2026 Lääkärilehti item, change the voice-over and caption to the new item. Never edit or fake a date.
- [ ] Question for the question box (not in the 1:50 cut, use it in the live judge session or as a spare 5 s clip): the first pinned example, "How long do people wait to see a GP in Vantaa?" (`ASK_EXAMPLES[0]` in `lib/exa/config.ts`). It was tested in Run 3b. Note its answer quotes a 45-day average wait from a news item, which is a different measure from the 85.4% on the county page. If you show it, do not read the number aloud.
- [ ] Fallback if live search is slow or down: the app shows saved results with their date. Record those. Say "found live" only for what the label on screen says, and do not describe a "Cached" result as a fresh search. Keep the dated screenshot of the Vantaa–Kerava news strip as a backup.
- [ ] Record the voice-over separately from the screen capture, then cut to the windows above. Read it aloud once with a stopwatch; if any shot runs long, cut words, not the safety margin.
- [ ] Check the exported file is 2:00 or less (target 1:50), 1080p MP4.
- [ ] Upload as **public** on YouTube or Vimeo (unlisted is not enough for the form), open the link in a private window to confirm it plays, then paste it into hackjunction.app and switch the project DRAFT → FINAL before Sun 10:00.

## Numbers used

| In the voice-over or caption | Value | Source file and key |
|---|---|---|
| 85 percent, Vantaa–Kerava | 85.4 (2025) | `data/values.json`: `county_id` "vantaa-kerava", `indicator_id` "6411", `year` 2025 |
| 33 percent, Päijät-Häme | 32.7 (2025) | `data/values.json`: "paijat-hame", "6411", 2025 |
| Finland 54.7% (caption, shot 4) | 54.7 (2025) | `data/values.json`: "finland", "6411", 2025; also `data/gaps.json` `national_value` |
| Referral step grey, no public data (Vantaa–Kerava) | status `no_data` | `data/gaps.json`: "vantaa-kerava", stage "referral" |
| South Ostrobothnia referral step weak | status `red`, 68.9% within 3 days vs Finland 76.8% (2025) | `data/gaps.json`: "south-ostrobothnia", stage "referral", indicator "13" |
| 127 vs 76 days to treatment | median, public health centre vs private/work healthcare as first contact (lymphoma) | Kuitunen et al., Cancer Medicine 2026;15:e71920, https://pmc.ncbi.nlm.nih.gov/articles/PMC13158131/ (median symptoms-to-treatment, lymphoma, 160 patients, 7 Finnish hospitals; the challenge speaker's own study). Details: `docs/evidence/challenge-brief.md` |
| 25 percent lower odds of dying, over 15 years with one GP | odds ratio 0.75 (95% CI 0.70 to 0.80), observational, not cancer-specific | `docs/evidence/evidence.json`: id `ev-gp-continuity`, `effect_size`, `limitations` |
| 17 days shorter | median diagnostic interval after vs before pathways | `docs/evidence/evidence.json`: id `ev-ref-denmark-cpp`, `effect_size.value` -17 |
| 26 doctors, 2 Nov 2026 | news item "Vake palkkaa 450–500 uutta työntekijää, lääkäreitä 26", laakarilehti.fi | Run 3b check b5 in `docs/submission/test-runs.md`; it is a live Exa result, so re-check on recording day |
| 2025 (data year) | all Sotkanet values above | `data/values.json` `year` |

## Claims checked against Run 3b

Everything shown in shots 3 to 8 was seen on screen in Run 3b (`docs/submission/test-runs.md`): the ranking (a1), the county page with its stage cards and limitations box (b1 to b3), local news with dates and links (b5), the act page cards (c1), the red-flag route (c3) and the Denmark card (d). Not claimed: the AI brief, the question-box answer, the evidence finder, `/sources`. The Denmark card says "17 days shorter" in the app, so the voice-over uses those words.
