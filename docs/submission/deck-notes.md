# FirstLine deck: speaker notes and sources (Draft v1)

Files: `docs/submission/deck.html` (source) and `docs/submission/firstline-deck.pdf` (rendered: 9 slides, 1280×720, about 300 KB).

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

**Say:** "Rank every county, open one to see where the delay sits (grey means no public data, and we say so), then act."

- "2–3 actions" is the product spec (SPEC.md, screen 3), not a statistic.
- The three frames are labelled placeholders. No product screenshots exist yet.

## 5. Act (checked evidence)

**Say:** "Denmark's fast-track pathways cut median time to diagnosis by 17 days, and in Norway keeping the same GP goes with lower mortality. We show what didn't work too: Sweden's pathways shortened waits, but regional gaps stayed."

| Number | Source |
|---|---|
| −17 days: median diagnostic interval after vs before pathways, Denmark (adjusted) | `evidence.json` `ev-ref-denmark-cpp`, `effect_size.value: -17`. Jensen et al., *BMC Cancer* 2015;15:308, https://pmc.ncbi.nlm.nih.gov/articles/PMC4412104/ |
| 25% lower odds of dying, same GP >15 years vs 1 year (OR 0.75; Norway, observational) | `evidence.json` `ev-gp-continuity`, `effect_size.value: 0.75`, `effect_text`. Sandvik et al., *Br J Gen Pract* 2022, https://pmc.ncbi.nlm.nih.gov/articles/PMC8510690/ |
| "Equal or better" outcomes, "probably"; 18 trials | `evidence.json` `ev-gp-nurse-first-contact`: `effect_text`, `quote_or_page` and `precedent` ("18 randomised trials"). Laurant et al., *Cochrane Database Syst Rev* 2018, https://pmc.ncbi.nlm.nih.gov/articles/PMC6367893/ |
| Sweden: shorter waits, regional gaps remain (no number) | `evidence.json` `ev-ref-sweden-svf`. Regeringens skrivelse 2023/24:48 on Riksrevisionen's report RiR 2023:12, published by Riksdagen, https://www.riksdagen.se/sv/dokument-och-lagar/dokument/regeringens-skrivelse/riksrevisionens-rapport-om-statens-arbete-med_hb0348/html/. Chip: "Riksrevisionen RiR 2023:12, via Riksdagen · 2023". |

Deliberately left off this slide:
- **Danish survival (45% → 54%):** it comes from a different paper (Jensen 2017) and carries lead-time bias.
- **Nurse-led care "frees GP slots":** that is the action's aim, and the review did not measure waits.

How to phrase Norway: say "goes with", never "cuts deaths". If asked what else didn't work: Denmark's direct CT access alone did not help significantly (`ev-rec-direct-ct-training`).

## 6. Trust

**Say:** "Every number carries its source, the gaps are shown in grey instead of hidden, and a validator drops any AI sentence whose number isn't in its source. Public data only, decision support, not diagnosis."

| Number | Source |
|---|---|
| 4 areas without referral data (Vantaa and Kerava, East, Central and West Uusimaa) | `data/gaps.json`: 4 rows with `stage: referral` and `status: no_data`. Also `data/README.md`, "Known gaps". Sotkanet 13, 2025 |
| 6411 | Indicator ID, `data/indicators.json` |

Built vs next:
- **Built:** the validator for live answers, `validate()` in `lib/exa/answer.ts`. It drops a sentence that cites no valid item, or that contains a number not found in the cited item's title, snippet or date.
- **Not built yet:** the county-brief validator (SPEC: Claude writes text around fixed numbers). The two chips on the slide say this.

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

## 8. How it's built

**Say:** "Public THL data is snapshotted with a source on every row, so the demo works even if Sotkanet, Exa or the AI is down. On the left is what runs today; on the right is what lands before the freeze."

| Number | Source |
|---|---|
| 22 areas (21 wellbeing services counties + City of Helsinki) | `data/counties.json`. It has 23 rows; the 23rd is `finland`, `kind: country`, kept as the reference. See `data/README.md`. |
| 3 indicators | `data/indicators.json` (6411, 13, 5033) |
| 2023–2025 | `data/README.md` (`values.json` years) |
| 14 checked actions | `docs/evidence/evidence.json` |

"Real today" was checked against the repo on 13 Nov:
- data snapshot (`data/`) and the evidence table
- Exa routes `app/api/{county-news,national-news,evidence,ask}`
- answer validator `lib/exa/answer.ts`
- `components/source-chip.tsx`

The three screens in `app/` are still placeholder pages.

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
- [ ] Find a source for "most cancers are first noticed by a GP", or keep it out of the pitch.

### Screenshots and live items
- [ ] Slide 4: replace the three placeholder frames with real screenshots: County ranking (`/`), County pathway (`/county/vantaa-kerava`) and Act (`/county/vantaa-kerava/act`).
- [ ] Slide 7: re-run county news on Sunday morning. Swap in the freshest real items with their dates and links, and keep the "found live — unverified" label. Never edit a date.

### Built vs next (slides 6 and 8)
- [ ] Move an item from "Next" to "Real today" only once it is merged and working: the three screens, red-flag helper, county brief + validator, deploy.

### Team and links (slide 9)
- [ ] Live demo URL (README says TBD).
- [ ] Real names next to the GitHub logins. The repo has only the logins, from `AGENTS.md`.
- [ ] Remove the "Draft v1" footer from slide 1 for the final PDF.

## Body word counts (Draft v1)

Counts exclude the headline, kicker, chips, pills, footer, chart SVG and placeholder frames. They include card titles, stage labels and list items.

| Slide | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Words | 28 | 45 | 52 | 41 | 47 | 45 | 57 | 54 | 43 |

Prose alone is ≤ 35 words on every slide. The rest is diagram and card labels (stage names, list items, news headlines). Cut further if the team wants a strict 35.
