# data/

Static JSON snapshot that the app reads at build time. The demo must work when Sotkanet or the LLM is down, so everything the UI shows comes from these files. Types and helpers live in `lib/data.ts`.

Rule: **every row has a `source_id`** that points into `sources.json`. The build script refuses to write the snapshot if any `source_id`, `county_id` or `indicator_id` does not resolve, or if the numbers quoted in `SPEC.md` (Päijät-Häme 32.7, Vantaa–Kerava 85.4, Finland 54.7 for 6411 in 2025) no longer match.

## Rebuild

```bash
npm run data:build   # fetches Sotkanet, rewrites data/*.json
```

Do not hand-edit the JSON; change `scripts/data/build-snapshot.mjs` and rebuild. Output is sorted, so a rebuild only changes rows whose data changed. Commit the result.

## Files

| File | One row is | Key fields |
|---|---|---|
| `sources.json` | a source: a Sotkanet indicator, the region list, or a study behind an action | `source_id`, `kind` (`statistic` / `evidence`), `name`, `url`, `publisher`, `retrieved`, `data_updated` |
| `counties.json` | an area: 21 wellbeing services counties, the City of Helsinki, and Finland (`kind: "country"`, kept out of rankings and routes) | `id` (URL slug), `kind`, `name`, `name_fi`, `sotkanet_region_id`, `source_id` |
| `indicators.json` | an indicator we show | `indicator_id`, `name`, `short_name`, `unit`, `direction`, `stage`, `limitation`, `source_id` |
| `values.json` | one area × indicator × year value (2023–2025; screening indicators 2022–2024; context-only indicators 2371, 293, 692 have stage null) | `county_id`, `indicator_id`, `year`, `value`, `abs_value`, `source_id` |
| `gaps.json` | the 2025 status of one pathway stage in one county | `county_id`, `stage`, `indicator_id`, `status`, `value`, `national_value`, `note`, `source_id`, optional `shared` (a wider value such as HUS, shown labelled, never as the county's) |
| `evidence.json` | a recommended action with its precedent and source (from `docs/evidence/evidence.json`, verified rows only) | Luan's fields minus `source_url` / `source_title`, plus `source_id` |

## Indicators (Sotkanet, THL)

| id | Measures | Direction | Stage |
|---|---|---|---|
| 6411 | % of non-urgent GP appointments in primary care that waited more than 7 days | higher is worse | `gp_access` |
| 13 | % of referrals to specialised care processed within 3 days | lower is worse | `referral` |
| 5033 | % of referrals processed after more than 21 days | higher is worse | context only |
| 3621 | % of women invited to breast cancer screening (mammography) who attended | lower is worse | context only |
| 6103 | % of people invited to colorectal cancer screening who attended | lower is worse | context only |
| 3620 | % of women invited to cervical cancer screening who attended | lower is worse | context only |

## Stage status rule (product decision, easy to change)

For each county, the 2025 value is compared with Finland's 2025 value on the same indicator:

- **red**: worse than Finland
- **amber**: Finland's level or better (still a delay, not a pass)
- **no_data**: Sotkanet has no county value

`gp_recognition` (does the GP recognise possible cancer?) has no public indicator, so it has no rows and the app shows it as grey.

## Known gaps and limitations

- **6411 is not cancer-specific.** It covers all non-urgent GP appointments. Say so in the limitations box.
- **No county-level referral data (13, 5033) for East, Central and West Uusimaa or Vantaa and Kerava.** HUS handles their hospital referrals, and Sotkanet publishes one HUS row under region id 599, which the region list does not name. We know it is HUS because (1) the indicator description says the statistic covers the counties, "HUSin alue" and Helsinki, (2) the row plus all county rows add up exactly to Finland in 2023-2025, and (3) its 2024 count (246,244) is the figure in HUS's own report (source `hus-referrals-2024`). The build fails if (2) or (3) stops holding. The four counties stay `no_data` (there is no figure for the county alone), but their `gaps.json` row carries `shared`: the HUS-wide value and trend. The app shows it labelled "HUS-wide, not a county figure" and never uses it for status, ranking or picking actions.
- **Helsinki's 13 value covers the city's own specialist units only.** Most Helsinki hospital referrals go to HUS; the county page says so.
- **6411 covers public health centres only**, not occupational or private care. The county page says so, with Kuitunen et al. 2026 (source `kuitunen-2026`) as context.
- **Helsinki has 13 / 5033 values for 2025 only** within 2023–2025.
- **5033 is 0–3% everywhere** and published as whole percentages, so it does not separate counties.
- **Screening attendance (3621, 6103, 3620) is context only**, the step before the GP. Years are 2022–2024 (published a year behind), all 22 areas plus Finland. It counts attendance among those invited, the three programmes invite different age bands, and Sotkanet names the Finnish Cancer Registry as the publisher. `stage` is `null`, so it never enters the ranking, stage status or action selection.
- **Åland** is outside the wellbeing services reform and has no values; it is excluded.
- **Evidence:** `evidence.json` stays empty until `docs/evidence/evidence.json` (PR #7) is on main; then run `npm run data:build`. Each unique `source_url` becomes one `ev-…` source. NICE NG12 rows carry a link and a short quote only: NICE content cannot be reproduced outside the UK.
