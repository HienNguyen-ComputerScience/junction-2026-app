# FirstLine deck: speaker notes and sources (Draft v3)

Related: `deck-outline.md` (older, longer outline) and the 16-slide draft in `deck-nabeo11/`. Which deck is uploaded on Sunday: TODO (lead decides).

Files: `docs/submission/deck.html` (source) and `docs/submission/firstline-deck.pdf` (rendered: 9 slides, 1280×720, about 960 KB). Draft v3 (14 Nov) uses the screenshots retaken at commit c4f067d, adds a crop of the live local news panel to slide 7, and updates the built-vs-next status to `docs/submission/test-runs.md` Run 3 (pre-freeze).

Re-render from PowerShell. Bare `--headless` from Git Bash produced no PDF. Without `--user-data-dir`, Edge can hand off to a running instance and exit without writing.

```powershell
Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList '--headless=new','--disable-gpu','--no-pdf-header-footer','--user-data-dir="<scratch dir>"','--print-to-pdf="<repo>\docs\submission\firstline-deck.pdf"','file:///<repo>/docs/submission/deck.html' -Wait
```

Story and wording follow `docs/pitch/demo-script.md` and `docs/pitch/exa-angle.md`.

Sotkanet sources (`data/sources.json`; publisher THL; retrieved 2026-11-13):

| Indicator | URL | Data updated |
|---|---|---|
| 6411 | https://sotkanet.fi/sotkanet/en/metadata/indicators/6411 | 2026-05-13 |
| 13 | https://sotkanet.fi/sotkanet/en/metadata/indicators/13 | 2026-06-05 |

---

## 1. Title

**Say:** "FirstLine shows a wellbeing services county director where the first step of early cancer care breaks in their county, and what to do about it on Monday."

Numbers: none.

## 2. Problem

**Say:** "In Vantaa–Kerava, 85% of non-urgent GP visits come more than a week after people ask for one. In Päijät-Häme it's a third."

| Number | Source |
|---|---|
| 85.4% Vantaa and Kerava ("85%" in the sentence) | `data/values.json`: `county_id: vantaa-kerava`, `indicator_id: "6411"`, `year: 2025`, `value: 85.4`. THL Sotkanet 6411, 2025 |
| 32.7% Päijät-Häme ("a third") | `data/values.json`: `paijat-hame` / 6411 / 2025, `value: 32.7` |
| 54.7% Finland (chart reference row) | `data/values.json`: `finland` / 6411 / 2025, `value: 54.7` |
| All 23 chart bars (21 counties, Helsinki, Finland) | Every `data/values.json` row with `indicator_id: "6411"` and `year: 2025`, unrounded. West Uusimaa is 40, shown as 40.0. |

- **Colours** follow the `data/README.md` rule, the same one behind the `status` field in `data/gaps.json`: red = worse than Finland, amber = Finland's level or better. There is no green.
- **Limitation on the slide:** 6411 counts all non-urgent GP visits, not only possible cancer (`data/indicators.json` → 6411 `limitation`).
- **Wording:** 6411 counts from when the need for care was *assessed*. "After people ask" is the demo script's plain-language version. If a judge pushes, say "after the need was assessed".

## 3. Who it's for

**Say:** "The county owns this first step, but nobody shows its director which step breaks or what worked elsewhere. Finland's own cancer roadmap asks for stronger GP access."

| Number | Source |
|---|---|
| Measure 2.5.1; 2026–2031 | `docs/evidence/evidence.json` `ev-gp-capacity-roadmap`, `quote_or_page` (p. 51). STM, *Kansallinen syöpästrategia 2026–2035: Toimeenpanon tiekartta vuosille 2026–2031*, https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf. The chip shows the roadmap period because the publication year is not in the repo. |
| "3 days" on the stage card | Definition of indicator 13 (`data/indicators.json`) |

- The grey "GP spots possible cancer" stage reflects `data/README.md`: `gp_recognition` has no public indicator.
- The demo script GP-first line is now sourced (PR #38): "In health systems where the GP is the first stop, 75 to 85 percent of cancer patients start at the GP" (Vedsted & Olesen, Br J Cancer 2015, PMC4385978; Danish and UK data, not Finnish). The older wording "Most cancers are first noticed by a GP" had no source and is not used.

## 4. Product

**Say:** "Rank all 22 areas, open one to see where the delay sits (in Vantaa–Kerava it's getting to a GP, and grey means no public data), then act on it."

- **Screenshots:** `docs/submission/screenshots/01-ranking.png` (`/`), `02-county-pathway.png` (`/county/vantaa-kerava`) and `03-act.png` (`/county/vantaa-kerava/act`). They come from Run 3: headless Edge at 1440×900 against the local dev server at commit c4f067d.
- **How they're placed:** `deck.html` references them by relative path, and the PDF embeds them at full 1440×900. The slide trims only the blank side margins (x < 150 and x > 1290 px). That removes the Next.js dev-mode badge and no page content. Checked again on the Run 3 retakes: the pathway page's limitations box (now a sticky right-hand column) ends inside the kept area, so nothing is cut.
- **"22 areas":** `data/counties.json`, and the ranking screen itself ("All 22 areas"). "Vantaa–Kerava: the delay is getting to a GP" is the pathway page's verdict, from `data/gaps.json`: `vantaa-kerava`, `gp_access`, `red`.
- **In these screenshots now:** the limitations box shows on the pathway page (02), beside the stage cards.
- **Not in these screenshots:** the brief and local news (below the fold on the pathway page; slide 7 shows the news panel), the question box (below the fold on `/` and the act page) and the red-flag helper (below the fold on the act page).

## 5. Act (checked evidence)

**Say:** "For Vantaa–Kerava, where the delay is getting to a GP, FirstLine shows a named GP: in Norway, keeping the same GP goes with lower mortality. For South Ostrobothnia, red at both steps, it shows Denmark's fast-track pathways, 17 days off the median time to diagnosis, and we also show that Sweden's pathways left regional gaps."

| Number | Source |
|---|---|
| −17 days: median diagnostic interval after vs before pathways, Denmark (adjusted) | `evidence.json` `ev-ref-denmark-cpp`, `effect_size.value: -17`. Jensen et al., *BMC Cancer* 2015;15:308, https://pmc.ncbi.nlm.nih.gov/articles/PMC4412104/ |
| 25% lower odds of dying, same GP >15 years vs 1 year (OR 0.75; Norway, observational) | `evidence.json` `ev-gp-continuity`, `effect_size.value: 0.75`, `effect_text`. Sandvik et al., *Br J Gen Pract* 2022, https://pmc.ncbi.nlm.nih.gov/articles/PMC8510690/ |
| "Equal or better" outcomes, "probably"; 18 trials | `evidence.json` `ev-gp-nurse-first-contact`: `effect_text`, `quote_or_page` and `precedent` ("18 randomised trials"). Laurant et al., *Cochrane Database Syst Rev* 2018, https://pmc.ncbi.nlm.nih.gov/articles/PMC6367893/ |
| Sweden: shorter waits, regional gaps remain (no number) | `evidence.json` `ev-ref-sweden-svf`. Regeringens skrivelse 2023/24:48 on Riksrevisionen's report RiR 2023:12, published by Riksdagen, https://www.riksdagen.se/sv/dokument-och-lagar/dokument/regeringens-skrivelse/riksrevisionens-rapport-om-statens-arbete-med_hb0348/html/. Chip: "Riksrevisionen RiR 2023:12, via Riksdagen · 2023". |

Where each card appears in the app (Runs 2 and 3, `docs/pitch/demo-script.md`; `04-act-south-ostrobothnia.png` shows the South Ostrobothnia act page):
- **Named GP** (`ev-gp-continuity`): first card on `/county/vantaa-kerava/act`.
- **Denmark fast-track** (`ev-ref-denmark-cpp`): second card on `/county/south-ostrobothnia/act`. South Ostrobothnia is red at both steps (`data/gaps.json`: 6411 = 67.8 and 13 = 68.9, both worse than Finland). Don't show the Denmark card as a Vantaa–Kerava example: its referral step is grey there.
- **Nurse-led card:** not tied to a county on the slide.

Deliberately left off this slide:
- **Danish survival (45% → 54%):** it comes from a different paper (Jensen 2017) and carries lead-time bias.
- **Nurse-led care "frees GP slots":** that is the action's aim, and the review did not measure waits.

How to phrase Norway: say "goes with", never "cuts deaths". If asked what else didn't work: Denmark's direct CT access alone did not help significantly (`ev-rec-direct-ct-training`).

## 6. Trust

**Say:** "Every number carries its source, the gaps are shown in grey instead of hidden, and validators drop any AI claim whose number isn't in its source. Public data only, decision support, not diagnosis."

| Number | Source |
|---|---|
| 4 areas without referral data (Vantaa and Kerava, East, Central and West Uusimaa) | `data/gaps.json`: 4 rows with `stage: referral` and `status: no_data`. Also `data/README.md`, "Known gaps". Sotkanet 13, 2025 |
| 6411 | Indicator ID, `data/indicators.json` |

Built vs next (Run 3, commit c4f067d). Both are mounted on pages since PR #39, which is why the chips say "On page":
- **County brief:** `CountyBrief` on `/county/[id]`. It shows the precomputed brief ("Precomputed from the snapshot") with a "Write AI brief" button. Validator: `lib/brief/validate.ts` (`GET /api/brief`, PR #29). It drops a claim whose number or `source_id` is not in the snapshot context, or that turns visits into people. In Run 3 the AI brief for Vantaa–Kerava had 0 dropped claims and every number matched the snapshot.
- **Question box:** `AskBox` on `/` and on `/county/[id]/act`. Validator: `validate()` in `lib/exa/answer.ts` (`POST /api/ask`). It drops a sentence that cites no valid item, or that contains a number not found in the cited item's title, snippet or date. In Run 3 "Does drug X cure lung cancer?" returned "Nothing found in the sources." and the injection question got a refusal without calling Exa.
- **Not click-tested:** Run 3 tested the AI brief, the question-box answers and the evidence finder through the API only. Nobody typed a question or clicked "Write AI brief" or "Find more evidence live" in the UI. Say "on the page", not "we watched it answer on screen", until a run clicks through.
- **If a judge asks:** the Vantaa answer quotes a 45-day average wait (Vantaan Sanomat), a different measure from the 85.4% on screen (Run 3 oddity 4).

## 7. Live layer (Exa)

**Say:** "The numbers are from THL, but what happened in Vantaa this week isn't in any dataset or any AI's memory. Exa finds it live, with a link for every claim, and we keep it apart from the checked evidence."

| Item | Source |
|---|---|
| "14 actions" | `docs/evidence/evidence.json`: 14 rows, all `verified: true`; the same 14 are in `data/evidence.json` |
| Live news crop | `docs/submission/screenshots/05-exa-live.png` (Run 3, `/county/vantaa-kerava` at 1440×2300, commit c4f067d). The slide shows only the "Local news" panel: about x 150–940, y 1762–2092 of the source image. It holds the panel badges ("Last 12 months", "Found live — unverified", "via Exa", "Cached") and the first two items, dated 2026-11-02 and 2026-07-23. |

The checked column (left, solid border) and the live column (right, dashed border, "Found live — unverified") stay visibly separate. The live items are **found live and unverified**. They are not checked evidence.

- **What the slide does not show or claim:** a question-box answer or evidence-finder results. Both need typing or a click, and Run 3 tested them only through the API. The question-box line in the checked column describes the rule ("answers only from linked results, or “nothing found”"), not a screen.
- **"Cached" badge:** the screenshot was taken after the prewarm, so the panel served from cache. Say "found live", not "loaded just now".
- **Background (no longer on the slide):** the v2 slide listed items from the 13 Nov probe (`docs/exa-probe.md`, `docs/evidence/exa-queries.md`, `docs/pitch/exa-angle.md`): Lääkärilehti, 2 Nov 2026, Vantaa–Kerava hiring doctors; Etelä-Suomen Sanomat, 10 Nov 2026, Päijät-Häme expands named doctor and nurse care; Lääkärilehti, 23 Apr 2026, counties differ in lung cancer detection (https://www.laakarilehti.fi/terveydenhuolto/keuhkosyovan-toteamisessa-eroja-hyvinvointialueiden-valilla/). The last one is also the prewarm "demo hook" in Run 3.

## 8. How it's built

**Say:** "Public THL data is snapshotted with a source on every row, so the demo works even if Sotkanet, Exa or the AI is down. Today the county page has the AI brief and local news for all 22 areas, and the act page has the evidence finder and question box. If live search is down, it shows saved results with their date."

| Number | Source |
|---|---|
| 22 areas (21 wellbeing services counties + City of Helsinki) | `data/counties.json`. It has 23 rows; the 23rd is `finland`, `kind: country`, kept as the reference. See `data/README.md`. |
| 3 indicators | `data/indicators.json` (6411, 13, 5033) |
| 2023–2025 | `data/README.md` (`values.json` years) |
| 14 checked actions | `docs/evidence/evidence.json` |

"Real today" comes from `docs/submission/test-runs.md` Run 3 (pre-freeze, commit c4f067d, 14 Nov 00:20–00:40 Helsinki):

| Slide line | Evidence (Run 3) |
|---|---|
| Three screens, source chips, limitations box | `/`, `/county/[id]`, `/county/[id]/act` all 200; limitations box as the sticky right column on the pathway page (check 3b); PRs #23, #26, #39 |
| County page: AI brief + local news, all 22 areas | `CountyBrief` and `CountyNews` on `/county/[id]` (check 3a; PR #39). `/api/county-news` accepts all 22 area ids (check 4; PR #41). `/api/brief` `mode: ai`, 0 dropped claims |
| Act page: evidence finder, question box | `EvidenceFinder` ("Find more evidence live" under each of the 3 recommended cards) and `AskBox` on `/county/[id]/act` (check 3a; `06-act-tall.png`). Results and answers tested via the API only (check 8 "Not run") |
| Question box on the ranking page; red-flag helper | `AskBox` on `/` ("Ask the evidence", check 2); `components/act/red-flag-helper.tsx` on the act page |
| Rate limit; saved demo results if search is down | `lib/exa/rate-limit.ts`, 429 on the 21st ask in a minute (check 5); committed demo cache answers with `stale-cache` and the save date on a cold server (check 7). The cache holds only the 4 demo counties, 14 evidence rows, the lung preset, the national strip and the 3 prewarm questions |

"Next" lists what is still missing or untested:
- **National news strip on a page:** `/api/national-news` works (200, 5 items) but no page fetches it (oddity 2).
- **Sources & limitations page:** Run 3 found `/sources` 404 (oddity 1). PR #10 merged on 13 Nov at 22:38 UTC (commit 3c7da0f), after Run 3 at c4f067d, so it is on main but untested. The slide says "Sources page: merged after run 3, untested". Move it to "Real today" only after a run opens `/sources`.
- **Live deploy:** no live URL yet.

Move a line to "Real today" only after a test run sees it on a page.

## 9. Close

**Say:** "Public data, every number sourced, no patient data, and a first step a county can start on Monday. FirstLine: equal first steps, across Finland."

| Number | Source |
|---|---|
| "2–3 health stations", "aged 50+" | `evidence.json` `ev-gp-continuity`, `first_step` |
| "7-day GP access" | Definition of Sotkanet 6411 |

The demo script's claim "in two minutes" is left out because it has no source.

---

## Re-check after freeze (Sat 18:00)

### Numbers
- [ ] Run `npm run data:build`. If 6411/2025 changed in `data/values.json`, update slide 2: the big numbers, the sentence and all 23 bars. Regenerate the SVG from `values.json` rather than editing it by hand.
- [ ] Re-count the `no_data` referral rows in `data/gaps.json` (slide 6, "4 areas").
- [ ] Re-count the `evidence.json` rows (slides 7 and 8, "14").
- [ ] Re-count areas and indicators (slide 8).
- [ ] If the evidence table changed, re-check slide 5 against `ev-ref-denmark-cpp`, `ev-gp-continuity`, `ev-gp-nurse-first-contact` and `ev-ref-sweden-svf`.
- [x] Source found for the GP-first line (PR #38): "In health systems where the GP is the first stop, 75 to 85 percent of cancer patients start at the GP" (Vedsted & Olesen, Br J Cancer 2015, PMC4385978). Danish and UK data, not Finnish.

### Screenshots and live items
- [x] Slide 4: screenshots 01–03 retaken at commit c4f067d in Run 3. Margin crop re-checked: nothing cut.
- [x] Slide 7: real screenshot of the local news panel added (crop of `05-exa-live.png`, Run 3, commit c4f067d).
- [ ] After the freeze: retake all screenshots (01–06) on the final build, ideally the deployed URL or a production build so no dev badge appears. Same file names, then re-render. If the news panel moves in `05-exa-live.png`, re-fit the `.livecrop` offsets in `deck.html`.
- [ ] Slide 7: on Sunday morning, check the news crop still shows real, dated items. Never edit a date, and keep the "Found live — unverified" label.

### Built vs next (slides 6 and 8)
- [x] Updated to Run 3 (commit c4f067d): brief, county news (22 areas), evidence finder, question box, rate limit and saved demo cache moved to "Real today". Slide 6 chips changed from "API:" to "On page:".
- [ ] Run 4 (after freeze): open `/sources`. PR #10 merged after Run 3; move "Sources & limitations page" to "Real today" only if it loads.
- [ ] Run 4: click the question box and "Find more evidence live" in the UI. Until then, don't claim on-screen answers.
- [ ] Move "National news strip" and "Live deploy" only if a run sees them.

### Team and links (slide 9)
- [ ] Live demo URL (README says TBD).
- [ ] Real names next to the GitHub logins. The repo has only the logins, from `AGENTS.md`.
- [ ] Remove the "Draft v3" footer from slide 1 for the final PDF.

## Body word counts (Draft v3)

Counts exclude the headline, kicker, chips, pills, footer, chart SVG and placeholder frames. They include card titles, stage labels and list items.

| Slide | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Words | 28 | 45 | 52 | 61 | 62 | 46 | 30 | 81 | 43 |

Excluding labels, prose stays at or under 35 words on most slides. The rest is diagram and card labels: stage names, list items, the "In the app" lines on slide 5 and the screenshot notes on slides 4 and 7. Slide 7 dropped from 57 because the news headlines are now inside the screenshot. Slide 8 is the densest because of the built-vs-next lists. Cut further if the team wants a strict 35.
