# data/

Static JSON snapshot that the app reads at build time. The demo must work when Sotkanet or the LLM is down, so everything the UI shows comes from these files. Types live in `lib/data.ts`.

Rule: **every row has a `source_id`** that points into `sources.json`. Rows without one are not committed.

| File | One row is | Key fields |
|---|---|---|
| `sources.json` | a data source (Sotkanet indicator page, THL report, guideline) | `source_id`, `name`, `url`, `publisher`, `retrieved` |
| `indicators.json` | an indicator we show (e.g. Sotkanet 6411 GP wait > 7 days, 13 / 5033 referral processing) | `indicator_id`, `name`, `unit`, `source_id` |
| `values.json` | one county × indicator × year value | `county_id`, `indicator_id`, `year`, `value`, `source_id` |
| `gaps.json` | a pathway stage status for one county (red / amber / no_data) | `county_id`, `stage`, `status`, `note`, `source_id` |
| `evidence.json` | a precedent or study behind a recommended action | `evidence_id`, `title`, `summary`, `source_id` |

Fetch scripts go in `scripts/data/`. Status: planned, no files yet.
