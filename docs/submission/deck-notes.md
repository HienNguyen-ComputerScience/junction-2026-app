# FirstLine deck: speaker notes and sources (Draft v2)

Files: `docs/submission/deck.html` (source) and `docs/submission/firstline-deck.pdf` (rendered: 9 slides, 1280×720, about 530 KB). Draft v2 (14 Nov) adds real screenshots from commit 18daaeb and updates the built-vs-next status to `docs/submission/test-runs.md` Run 2.

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
- The demo script line "Most cancers are first noticed by a GP" has **no source in the repo**. It is not on the slide and not in the speaker line.

## 4. Product

**Say:** "Rank all 22 areas, open one to see where the delay sits (in Vantaa–Kerava it's getting to a GP, and grey means no public data), then act on it."

- **Screenshots:** `docs/submission/screenshots/01-ranking.png` (`/`), `02-county-pathway.png` (`/county/vantaa-kerava`) and `03-act.png` (`/county/vantaa-kerava/act`). They come from Run 2: headless Edge at 1440×900 against the local dev server at commit 18daaeb.
- **How they're placed:** `deck.html` references them by relative path, and the PDF embeds them at full 1440×900. The slide trims only the blank side margins (x < 150 and x > 1290 px). That removes the Next.js dev-mode badge and no page content.
- **"22 areas":** `data/counties.json`, and the ranking screen itself ("All 22 areas"). "Vantaa–Kerava: the delay is getting to a GP" is the pathway page's verdict (Run 2), from `data/gaps.json`: `vantaa-kerava`, `gp_access`, `red`.
- **Not in these screenshots:** the limitations box (below the fold on the pathway page) and the red-flag helper (below the fold on the act page). Run 2 confirmed both on the page.

## 5. Act (checked evidence)

**Say:** "For Vantaa–Kerava, where the delay is getting to a GP, FirstLine shows a named GP: in Norway, keeping the same GP goes with lower mortality. For South Ostrobothnia, red at both steps, it shows Denmark's fast-track pathways, 17 days off the median time to diagnosis, and we also show that Sweden's pathways left regional gaps."

| Number | Source |
|---|---|
| −17 days: median diagnostic interval after vs before pathways, Denmark (adjusted) | `evidence.json` `ev-ref-denmark-cpp`, `effect_size.value: -17`. Jensen et al., *BMC Cancer* 2015;15:308, https://pmc.ncbi.nlm.nih.gov/articles/PMC4412104/ |
| 25% lower odds of dying, same GP >15 years vs 1 year (OR 0.75; Norway, observational) | `evidence.json` `ev-gp-continuity`, `effect_size.value: 0.75`, `effect_text`. Sandvik et al., *Br J Gen Pract* 2022, https://pmc.ncbi.nlm.nih.gov/articles/PMC8510690/ |
| "Equal or better" outcomes, "probably"; 18 trials | `evidence.json` `ev-gp-nurse-first-contact`: `effect_text`, `quote_or_page` and `precedent` ("18 randomised trials"). Laurant et al., *Cochrane Database Syst Rev* 2018, https://pmc.ncbi.nlm.nih.gov/articles/PMC6367893/ |
| Sweden: shorter waits, regional gaps remain (no number) | `evidence.json` `ev-ref-sweden-svf`. Regeringens skrivelse 2023/24:48 on Riksrevisionen's report RiR 2023:12, published by Riksdagen, https://www.riksdagen.se/sv/dokument-och-lagar/dokument/regeringens-skrivelse/riksrevisionens-rapport-om-statens-arbete-med_hb0348/html/. Chip: "Riksrevisionen RiR 2023:12, via Riksdagen · 2023". |

Where each card appears in the app (Run 2, `docs/pitch/demo-script.md`):
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

Built vs next (Run 2, commit 18daaeb). Both validators exist behind APIs, which is why the chips say "API":
- **Question box validator:** `validate()` in `lib/exa/answer.ts` (`POST /api/ask`). It drops a sentence that cites no valid item, or that contains a number not found in the cited item's title, snippet or date. In Run 2 the injection test returned "Nothing found in the sources."
- **County brief validator:** `lib/brief/validate.ts` (`GET /api/brief`, PR #29). It drops a claim whose number or `source_id` is not in the snapshot context, or that turns visits into people. It falls back to a precomputed brief (`mode=fallback`).
- **Not visible yet:** neither the brief nor the question box is mounted on a page in Run 2. Don't say "on screen" until they are.

## 7. Live layer (Exa)

**Say:** "The numbers are from THL, but what happened in Vantaa this week isn't in any dataset or any AI's memory. Exa finds it live, with a link for every claim, and we keep it apart from the checked evidence."

| Item | Source |
|---|---|
| "14 actions" | `docs/evidence/evidence.json`: 14 rows, all `verified: true`; the same 14 are in `data/evidence.json` |
| Lääkärilehti, 2 Nov 2026: Vantaa–Kerava hiring doctors | `docs/evidence/exa-queries.md` ("Best demo items") and `docs/pitch/exa-angle.md`. No URL in the repo. The article's staff counts are deliberately left off the slide. |
| Etelä-Suomen Sanomat, 10 Nov 2026: Päijät-Häme expands named doctor and nurse care | Same files. No URL in the repo. |
| Lääkärilehti, 23 Apr 2026: counties differ in lung cancer detection | Same files. URL: https://www.laakarilehti.fi/terveydenhuolto/keuhkosyovan-toteamisessa-eroja-hyvinvointialueiden-valilla/ |
| "found 13 Nov 2026" | Probe date, `docs/exa-probe.md` |

These three items are **found live and unverified**. They are not checked evidence.

Status in Run 2: the Exa endpoints work (county news for the 4 demo counties, national news, evidence, ask). The Exa panels (`components/exa/`) are **not mounted on any page**, so there is no app screenshot of this layer yet (`05-exa-live.png` was not taken). The slide shows items from the 13 Nov probe, not a screen.

## 8. How it's built

**Say:** "Public THL data is snapshotted with a source on every row, so the demo works even if Sotkanet, Exa or the AI is down. The three screens and the APIs run today; next we wire the live layer and the AI brief into the screens."

| Number | Source |
|---|---|
| 22 areas (21 wellbeing services counties + City of Helsinki) | `data/counties.json`. It has 23 rows; the 23rd is `finland`, `kind: country`, kept as the reference. See `data/README.md`. |
| 3 indicators | `data/indicators.json` (6411, 13, 5033) |
| 2023–2025 | `data/README.md` (`values.json` years) |
| 14 checked actions | `docs/evidence/evidence.json` |

"Real today" comes from `docs/submission/test-runs.md` Run 2 (commit 18daaeb, 14 Nov 00:00–00:15 Helsinki):

| Item | Evidence |
|---|---|
| Ranking, pathway and act screens with source chips and limitations box | `/`, `/county/[id]`, `/county/[id]/act`; PRs #23, #26 |
| Red-flag helper | `components/act/red-flag-helper.tsx`, on the act page |
| Snapshot and 14 checked actions | `data/` |
| Exa API: county news, national news, evidence, ask with validator | `app/api/`; PR #16 |
| AI county brief API with snapshot validator and fallback | `/api/brief`; PR #29 |

"Next: wire into the screens" lists only what Run 2 found missing:
- Exa panels, question box and AI brief: the components exist (PR #22, `components/brief/`) but no page imports them. Re-checked by grepping `app/` on 14 Nov.
- `/sources` returns 404 (PR #10 open).
- County news accepts only the 4 demo counties (`vantaa-kerava`, `helsinki`, `paijat-hame`, `kainuu`).
- No live URL yet.

The wording stays true if these get mounted on Saturday: move each line to "Real today" only after it shows on a page.

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
- [x] Slide 4: real screenshots added (01 ranking, 02 Vantaa–Kerava pathway, 03 Vantaa–Kerava act), taken at commit 18daaeb in Run 2.
- [ ] Slide 4: retake 01–03 after the freeze on the deployed URL, if the screens change or the Exa panels and brief get mounted. Same file names, then re-render. Consider a production build so no dev badge appears.
- [ ] If the Exa panels get mounted, add a real screenshot of the county news strip to slide 7 (Run 2 had none: `05-exa-live.png` missing).
- [ ] Slide 7: re-run county news on Sunday morning. Swap in the freshest real items with their dates and links, and keep the "found live — unverified" label. Never edit a date.

### Built vs next (slides 6 and 8)
- [x] Updated to Run 2 (commit 18daaeb): screens, red-flag helper and brief API moved to "Real today".
- [ ] After the freeze: move "Exa panels, question box, AI brief on pages", "Sources & limitations page", "County news beyond 4 demo counties" and "Live deploy" to "Real today" only if Run 3 sees them on a page. Then change slide 6's chips from "API:" to "on screen".

### Team and links (slide 9)
- [ ] Live demo URL (README says TBD).
- [ ] Real names next to the GitHub logins. The repo has only the logins, from `AGENTS.md`.
- [ ] Remove the "Draft v2" footer from slide 1 for the final PDF.

## Body word counts (Draft v2)

Counts exclude the headline, kicker, chips, pills, footer, chart SVG and placeholder frames. They include card titles, stage labels and list items.

| Slide | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Words | 28 | 45 | 52 | 61 | 62 | 46 | 57 | 76 | 43 |

Excluding labels, prose stays at or under 35 words on most slides. The rest is diagram and card labels: stage names, list items, news headlines, the "In the app" lines on slide 5 and the screenshot note on slide 4. Slide 8 is the densest because of the built-vs-next lists. Cut further if the team wants a strict 35.
