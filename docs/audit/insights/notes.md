# Insights: what was built, how, and what the data could not support

Branch `t3/insights-cancer-access-gaps`. Page: `/insights` ("Where getting to a doctor is hardest, and what to start counting"). Coverage check first: [coverage.md](coverage.md). Component contract: [contract.md](contract.md).

## Headline finding

In Central Finland and South Savo, about 7 in 10 non-urgent GP visits come more than a week after people ask (73.5% and 69.7%; Finland 54.7%, Sotkanet 6411, 2025), and fewer people there use an occupational-health doctor (1,580 and 1,694 visits per 1,000 aged 15–64; Finland 2,049, Sotkanet 2371) or a private doctor (23.5% and 22.3% of residents reimbursed by Kela; Finland 26.9%, Sotkanet 692) than in Finland as a whole. They are the only two areas that stay in this group under all six cut-offs tested, including the 2023 and 2024 figures.

## How everything is produced

- `scripts/insights/rules.mjs`: every rule and cut-off. `scripts/insights/starter.mjs`: the starter dataset's content.
- `scripts/insights/build-insights.mjs` reads `data/*.json` and writes `data/insights/{rules,grades,no-way-round,early-warning,pathway,starter-dataset}.json`. No network, deterministic.
- `scripts/insights/check-insights.mjs` rebuilds in memory and fails if a committed file is out of date, if any figure lacks a `source_id` or differs from `data/values.json` (shared HUS values against `data/gaps.json`), if a starter field points at a data gap, roadmap measure or source that does not exist, if a starter field looks patient-identifying, if the two appended sources are missing, or if the recording threshold differs from `lib/recording.ts`. Tested by tampering one value: it failed with both the "out of date" and the "snapshot says 85.1" message.
- `scripts/insights/add-sources.mjs` appends `thl-ohjaus-21-2016` and `nhs-cancer-waiting-times` to `data/sources.json` (the source chip resolves by id only). Nothing else in that file was touched.
- No value was fetched at request time. No new Sotkanet values were fetched into the snapshot (see "Checked and not used" in coverage.md).

## 1. "No way round" areas

**What it shows.** Each area's 2025 GP wait (6411) against its use of the two other routes to a doctor: occupational health (2371) and private doctors reimbursed by Kela (692). Four plain groups by comparison with Finland's value in the same year: long wait / shorter wait × few other routes (both below Finland) / other routes in use (at least one at or above Finland). No score and no weights.

**Groups on the main view (2025 vs Finland):** long wait, few other routes 8; long wait, other routes in use 6; shorter wait, few other routes 4; shorter wait, other routes in use 4.

**Sensitivity: does the grouping flip?** Six tests, each changing one thing:

| Test | Compared with (wait · occupational · private) | Areas in "long wait, few other routes" |
|---|---|---|
| 2025 vs Finland (main) | 54.7% · 2,049 · 26.9% | Central Finland, North Karelia, North Ostrobothnia, North Savo, Ostrobothnia, South Karelia, South Ostrobothnia, South Savo |
| 2025 vs the middle area of the 22 | 58.6% · 1,827 · 25.5% | Central Finland, South Ostrobothnia, South Savo |
| 2025, only areas more than 5% from Finland | same, ±5% | Central Finland, North Karelia, North Ostrobothnia, South Karelia, South Ostrobothnia, South Savo |
| 2025, only areas more than 10% from Finland | same, ±10% | Central Finland, South Ostrobothnia, South Savo |
| 2024 vs Finland | 43.4% · 2,060 · 26.6% | Central Finland, Central Ostrobothnia, North Ostrobothnia, North Savo, Ostrobothnia, South Karelia, South Savo |
| 2023 vs Finland | 48.5% · 2,010 · 26.0% | Central Finland, Central Ostrobothnia, North Ostrobothnia, North Savo, Päijät-Häme, South Karelia, South Savo |

Result: it **does** flip for most areas. Only Central Finland and South Savo hold in all six; South Ostrobothnia holds in every 2025 test but not in 2023–2024 (its recorded visits fell 48% in 2025); North Ostrobothnia and South Karelia hold in four. So the page names only the two, shows every area's count of tests in the table ("6 of 6 (Every test)", "4 of 6 (Main view, not every test)"…), and lists the six tests behind "Show the six cut-offs we tested". 16 of 22 areas are below Finland on occupational-health visits (the national figure is pulled up by the large cities), which the page says, because that comparison alone separates little.

**Caveats, always visible with it:** area figures, not people; occupational health covers people in work (lower use can mean fewer people employed); none of it is cancer-specific and 6411 counts visits, not people; recorded GP visits changed by more than a fifth from 2024 to 2025 in 15 of 22 areas, so the wait carries its grade. Central Finland's 2025 wait is itself graded "Read the trend with care" (visits fell 36% from 2024); the card says it is in the group with the 2023 and 2024 figures too.

## 2. Starter dataset

18 quarterly counts in six groups, one row per cancer group (breast, prostate, bowel, lung, other, total), counts only:

| Group | Counts | Missing figure it helps close (`data-gaps.json`) | Roadmap measure | Definition / abroad |
|---|---|---|---|---|
| How each new cancer was first found | A1–A5 | `route-to-diagnosis` | 3.2.1 | England, NDRS emergency presentations by area |
| Suspected cancer at the GP | B1–B2 | `suspected-cancer-gp-wait` | none named | same 7-day line as Sotkanet 6411 |
| Referral → first specialist visit | C1–C3 | `diagnostic-interval` | 3.1.4 | THL Ohjaus 21/2016 time points |
| Referral → diagnosis | D1–D3 | `diagnostic-interval` | 3.1.4 | NHS England 28-day standard; Denmark (Jensen 2015) |
| Referral → first cancer treatment | E1–E2 | `treatment-within-target` | 3.1.2 (Goal 3) | THL Ohjaus 21/2016 (6-week maximum quoted from the national working group); NHS England 62-day standard |
| Stage at diagnosis (from the Cancer Registry) | F1–F3 | `stage-by-area` | 3.2.1 (target in 2.5.2) | — |

Seven indicators to compute (I1–I7), each with its formula and what to compare it with. Time points follow THL Ohjaus 21/2016 (read in full via Julkari: referral arrival, first doctor visit, placement in the treatment queue, first cancer treatment), not memory. Day bands 14 and 28 are labelled reporting bands, not Finnish targets; only 42 days has a Finnish basis.

**Why counts and not dates:** one row per case with dates would be patient-level data. The template has no column where a name, identity code, birth date, address or individual date could go; intervals are counted in day bands; a small-number rule (1–4 → "<5" before sharing) is suggested and labelled as a suggestion. Excel download: `/api/insights/starter-template`, built with the foundation's `lib/export/xlsx.ts`.

## 3. Confidence grade on every figure

Four levels with distinct shapes (filled, half-filled, two linked circles, dashed empty) and text labels, plus a one-sentence reason in visible text. Rules in order, published under "How we grade this number" and in contract.md. Verified first: the visit count behind 6411 changed by more than 20% between 2023 and 2025 in **18 of 22** areas (the audit's figure holds); year on year it catches Central Finland (+71%, −36%), which the endpoint test misses. Added rules the count test alone would miss: THL's own reported gaps (Vantaa–Kerava looks steady at −4% but THL reports 20–30% missing visits), small base (Kainuu 2023: about 408 visits), Helsinki's city-units-only referrals, and bowel screening's widening programme.

Grade distribution, GP wait (22 areas): 2023 19 solid / 3 care; 2024 8 / 14; 2025 6 / 16. Referrals 2025: 16 solid, 2 care, 4 shared. Occupational, private, screening (except bowel) and survival: almost all solid.

## 4. The whole pathway in one row

For a chosen area (plain form, works without script, shareable as `/insights?area=<id>#pathway`): a strip of seven steps, then each step with value, Finland's value, "better / about the same / worse than Finland" (±1 point), source chip, year and grade. Detection is screening attendance 2024 (also against the 80% Goal 2 target); GP recognition, days to diagnosis and treatment start are dashed "Not published" cells with a link to the starter dataset; referral shows the HUS-wide value labelled for the four Uusimaa areas; outcome is bowel and breast five-year survival 2024 (diagnosed 2015–2024). The component states: side by side, not cause and effect; survival reflects earlier years; 6411 is by residence and 13 by the receiving hospital; neither is cancer-only.

## 5. Early warning

First vs last published year (three years: 2023–2025, screening 2022–2024). "Worse" = more than 1 point in the worse direction; "now worse than Finland" = at or better than Finland in the first year, worse in the last. No models, no forecasts. A flag on a figure whose recording changed, whose publisher reports gaps, or whose base is small becomes "Possible, check recording"; bowel screening becomes "Possible, check comparability".

| Figure | Areas with a trend | Worse | Crossed to worse | "Getting worse" (no recording problem found) | "Possible, check…" |
|---|---|---|---|---|---|
| GP wait 6411 | 22 | 16 | 4 | 1 (South Karelia) | 15 |
| Referrals 13 | 17 | 5 | 2 | 5 | 0 |
| Breast screening 3621 | 22 | 5 | 0 | 5 | 0 |
| Cervical screening 3620 | 22 | 5 | 5 | 6 (incl. Pirkanmaa, crossed by 0.5 points, labelled "Now worse than Finland") | 0 |
| Bowel screening 6103 | 22 | 22 | 1 | 0 | 22 (comparability) |

As expected, nearly every GP-wait flag is "check recording": the page says so plainly. The recording check is not applied to screening (invitations follow programme rounds by design); the page says those flags rest on the published share alone.

## Goal 3

See contract.md. Stand-in today: Sotkanet 13. Replacement: I6 (share starting treatment within 6 weeks of referral) from fields E1–E2. Wording checked against the strategy PDF (p. 5 figure 1, p. 33) and the roadmap (3.1.2, p. 57; 2.4.1, p. 48).

## What the data could not support, so it was not built

- **A composite "access score".** The grouping already flips under modest changes; a weighted score would hide that.
- **Any statement that the GP wait, referral speed or screening explains survival.** 22 areas, survival over a ten-year diagnosis window, units that differ (residence vs hospital).
- **A forecast or trend line.** Three yearly points per figure, not four; recording changed in most areas.
- **2022 as a fourth year.** Published, but before the counties existed and the year THL says the Helsinki/Vantaa/Kerava gaps hit hardest.
- **A cancer-specific GP wait, days to diagnosis, days to treatment, route to diagnosis or stage, by area.** Not published; shown as empty steps and turned into the starter dataset.
- **Goal 3's own survival or mortality measure by area.** Sotkanet 10024 ends in 2015 and has no county rows; poor-outlook cancer survival is not published by county.
- **People-level statements** ("x% of people"). 6411 counts visits.

## Verification

- `node scripts/insights/check-insights.mjs`: OK (930 derived rows). `npm run typecheck`, `npm run lint`, `npm run build`: pass (see the PR for the final run after the last merge).
- Walkthrough (dev server on port 3021). The Playwright MCP could not start (it needs Google Chrome, which is not installed), so the walk was scripted with `playwright-core` driving the installed Microsoft Edge, as the audit did. Desktop 1366×900 with reduced motion: all sections render complete at once, no console errors. Phone 390×800: the page first scrolled sideways to 773px; cause: `sr-only` text inside the scrollable tables escaping its container. Fixed with `relative` on the containers; now 390px, no sideways scroll. Keyboard only: tab order runs header → "On this page" links → Print → Download → source chips → the six "Sort by …" buttons → "Show the six cut-offs we tested" → the starter groups' "Show the counts" buttons, in reading order. Sorting by "Private doctor use" puts Satakunta (32.0%) first. The area picker submits to `/insights?area=vantaa-kerava#pathway` and the row shows the HUS-wide referral value labelled "Shared hospital value". Print (PDF via print media): every closed section is printed open, including the grading rules and all the tables; it is long (60 A4 pages) because every table is printed in full.
- Excel template: downloaded through the page's button; opened with openpyxl: 4 sheets (Read me, Quarterly counts, Field definitions, Indicators), 18 count columns, no count cell pre-filled, no header matching name / identity / birth / address / phone / email; "…", "÷" and "×" survive as Unicode.
- Spot checks: 12 displayed numbers found on the page and equal to `data/values.json` (Central Finland 6411 73.5, Finland 6411 54.7, Central Finland 2371 1,580, Finland 2371 2,049, South Savo 692 22.3, Finland 692 26.9, South Savo 3621 82.2, South Savo 13 78.1, South Savo 3627 72, Finland 3625 92, South Karelia 6411 2023 53.3, Lapland 13 2023 83.4). Four checked against the live Sotkanet API: 6411 Central Finland 2025 = 73.5, 692 South Savo 2025 = 22.3, 2371 Central Finland 2025 = 1,580, 6411 Finland 2025 = 54.7.
- Screenshots: `screenshots/` (desktop sections, the grades opened, the pathway for Vantaa–Kerava, phone, print preview).

## Not verified

- Excel opened in Microsoft Excel itself (only openpyxl here; the foundation reports its writer opens in Excel on Windows).
- A screen reader pass (only the accessibility tree via keyboard focus and labels).
- The NHS England page loads behind a bot check for scripts; its content was read through a fetch service. The NDRS (Fingertips) source was already in the snapshot.
