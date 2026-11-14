# Insights: contract for other agents

Branch `t3/insights-cancer-access-gaps`, stacked on `t3/experimental-real-user-audit`. Everything here is self-contained: server components (except `SortableTable`), no props that need data fetching, no new dependencies. All of it is shown on `/insights`. Names and props below will not be renamed.

Every component uses the shared tokens and `components/motion` (`Reveal`, `AnimatedNumber`, `Disclosure`, `PrintButton`), prints expanded, and shows everything at once under reduced motion.

## Data and functions (`lib/insights`)

```ts
import {
  getGrade,            // (countyId, indicatorId, year) => Grade | undefined
  getPathwayRow,       // (countyId) => PathwayRow | undefined
  noWayRound,          // NoWayRound: groups, tests, per-area figures
  earlyWarning,        // { summary, rows: WarningRow[] }
  starterDataset,      // sections, fields, indicators, privacy lines
  rules,               // grade levels, grade rules (in order), scope lines, tests, groups
  countAreasWithRule,  // (indicatorId, year, ruleId) => number of the 22 areas
  countBaseChange,     // (indicatorId, fromYear, toYear) => { changed, compared }
  formatValue, formatPoints, INDICATOR_NAME,
} from "@/lib/insights";
import { buildStarterXlsx, starterSheets, STARTER_FILENAME } from "@/lib/insights/starter-xlsx";
```

`Grade` = `{ county_id, indicator_id, year, value, shared_value?, level: "solid" | "care" | "shared" | "none", label, reason, also: string[], rule_ids, scope, source_id }`. Graded: 6411, 13, 5033, 2371, 293, 692, 3621, 6103, 3620, 3627, 3625, for the 22 areas and `"finland"`, every year in the snapshot.

The data comes from `data/insights/*.json`, written by `node scripts/insights/build-insights.mjs` from `data/*.json` and checked by `node scripts/insights/check-insights.mjs` (fails if any row lacks a `source_id`, disagrees with `data/values.json`, or is out of date). **Run both after any `npm run data:build`**, and run `node scripts/insights/add-sources.mjs` too: a snapshot rebuild drops the two sources this branch appended to `data/sources.json`.

## Components

| Component | Props | What it shows | Where it should sit | Caveat that must travel with it |
|---|---|---|---|---|
| `ConfidenceBadge` (`components/insights/confidence-badge`) | `grade?: GradeBrief` or `areaId`, `indicatorId`, `year`; `showReason = true`; `className` | A pill: shape + label ("Solid", "Read with care", "Read the trend with care", "Shared hospital value", "No public data"), and the one-sentence reason as visible text | Beside any number from Sotkanet: county page figures, the briefing's "where you stand" figure, compare table cells (`showReason={false}` in tight cells, with the reason elsewhere on the page) | The reason. Use `showReason={false}` only where the reason is visible nearby |
| `GradeGlyph` | `level`, `className` | The shape alone (filled, half, linked, dashed) | Legends | Never without the label next to it |
| `GradingRules` (`components/insights/grading-rules`) | `defaultOpen = false` | Button "How we grade this number" opening the four grades, the rules in order and the scope of each indicator | Once per page that shows grades, near the first graded number; on Sources & limitations | — |
| `NoWayRound` (`components/insights/no-way-round`) | `headingLevel: 2 \| 3 = 2` | The insight: statement, the areas that hold in every test as figure cards, the method in two sentences, caveats, two charts, sortable table of all 22, the six tests behind a button | Finland-overall page (whole thing); home or compare as a teaser (use `NoWayRoundArea`) | `NO_WAY_ROUND_CAVEATS` (exported): area-level not people; occupational health covers people in work; not cancer-specific, counts visits; recording changed |
| `NoWayRoundArea` | `area: NwrArea`, `index` | One area's three figures with sources and grades, and how many of the six tests it holds in | County page of an area in the group: `noWayRound.areas.find(a => a.county_id === id)`; show only when `tier !== "none"` and say the tier in words | Same caveats; for `tier: "main-only"` say "not in every test" |
| `NoWayRoundChart` | none | Two scatter charts, GP wait against each other route, Finland's lines | Inside `NoWayRound`; on its own only with the table | Charts name only the two areas that hold in every test |
| `StarterDataset` (`components/insights/starter-dataset`) | `headingLevel` | Six groups of counts (18 fields), each tied to a `data/data-gaps.json` row, a roadmap measure and the Finnish or foreign definition; the privacy box; the Excel download; seven indicators to compute | Finland-overall page under the data-gap list; the county plan's "what to start recording" section; the briefing's last step | "No patient data" box stays with it |
| `StarterDownload` | none | Primary button "Download the Excel template (.xlsx)" → `/api/insights/starter-template` | Next to any mention of the starter dataset, the plan's Excel button | — |
| `PathwayRow` (`components/insights/pathway-row`) | `areaId`, `headingLevel = 3` | A strip of all seven steps for one area, then each step: screening (vs Finland and the 80% target), "Not published" for GP recognition, the GP wait, referral speed (or the HUS-wide value), "Not published" for diagnosis and treatment start, survival | County page, below the three steps; the briefing's "where it breaks" step | The box "Read this row side by side, not as cause and effect" (rendered by the component; keep it) |
| `EarlyWarning` (`components/insights/early-warning`) | `indicatorIds?` (default 6411, 13, 3621, 3620, 6103), `areaId?`, `headingLevel` | Flags: "Getting worse" / "Now worse than Finland" where no recording problem was found; "Possible, check recording" or "…check comparability" otherwise; sortable table of every area and figure | Compare page (replaces nothing; can sit under the existing "Getting worse fastest"); county page with `areaId` | The trend reasons listed in each card; "three years, no forecast" sentence |
| `Goal3Link` (`components/insights/goal3-link`) | `headingLevel` | Goal 3's three measures, the stand-in today, what replaces it | Finland-overall page, next to the Goal 3 line | — |
| `SortableTable` (`components/insights/sortable-table`, client) | `caption`, `columns: { header, align?, sortable? }[]`, `rows: { key, cells: ReactNode[], sort: (number \| string \| null)[], emphasis? }[]`, `initialSort?` | A plain table with "Sort by …" buttons in the headings | Anywhere a chart needs a table behind it | — |

Route: `GET /api/insights/starter-template` returns the `.xlsx` (`Content-Disposition: attachment`).

## The rules, as published in the UI

Grades, tried in order; the first that applies sets the level, the others are listed as `also`:

1. **No public data**: Sotkanet has no value for the area and year, and no wider value covers it.
2. **Shared hospital value**: Sotkanet 13 for East, Central and West Uusimaa and Vantaa–Kerava; the HUS-wide value from `gaps.json` is shown, labelled.
3. **Read with care** (publisher gap): THL's own notes report missing visits: Vantaa–Kerava 2023–2025, Helsinki 2023, for 6411, 2371, 293.
4. **Read with care** (small base): the 6411 share rests on fewer than 1,000 visits (Kainuu 2023: about 408; 2024: about 653).
5. **Read with care** (partial unit): Helsinki's 13 and 5033 cover the city's own units only.
6. **Read the trend with care** (recording change): the count behind the figure moved more than 20% from the year before (same 0.2 as `RECORDING_CHANGE_ABOVE` in `lib/recording.ts`; the check script asserts they agree). Year on year, so Central Finland's +71% then −36% is caught. Applies to 6411, 13, 2371, 293, 692; not to screening (invitations follow programme rounds) or 5033 (0–3%, count ÷ share undefined at 0).
7. **Read the trend with care** (programme widening): 6103, every year.
8. **Solid**: none of the above.

Distribution for the GP wait (6411, 22 areas): 2023 19 solid / 3 care; 2024 8 / 14; 2025 6 / 16. The label separates areas; it is not the same everywhere.

"About the same as Finland": within 1 percentage point (`ABOUT_SAME_POINTS`), as `RISE_POINTS` in `lib/recording.ts`.

## Goal 3 link

- **Goal 3 of the national cancer strategy 2026–2035**: "Varmistetaan yhdenvertainen ja vaikuttava syövänhoito" (Ensure equal and effective cancer care). Its monitoring measures (strategy p. 5, figure 1): five-year survival of poor-outlook cancers reaches the Nordic level (lung, pancreas, liver; footnote **); cancer mortality falls 10%; patients reach care within the target times (footnote *** cites THL Ohjaus 21/2016). The last is repeated under sub-goal 3.1 (p. 33) and is the indicator of roadmap measure 3.1.2 (roadmap p. 57).
- **None of the three is published by wellbeing services county.**
- **Stand-in today:** Sotkanet 13, share of referrals to specialist care processed within 3 days. It is the only published, area-level timing figure after the GP and the first step of the interval THL Ohjaus 21/2016 follows (referral arrives → first doctor visit → first cancer treatment). It is not cancer-specific, it is counted per hospital organisation, and it stops before the patient is seen. Bowel (3627) and breast (3625) survival are published by area but are not Goal 3's poor-outlook cancers; they are shown as the outcome step only.
- **Replacement once the starter dataset exists:** indicator I6, the share of patients starting cancer treatment within 6 weeks of the referral's arrival (fields E1, E2). 6 weeks is the maximum for suspected cancer that THL Ohjaus 21/2016 quotes from the national working group; it is replaced by the national target times when they are set (roadmap 3.1.2 schedule: 2026–2028).
- **Not Goal 3:** the 80% screening attendance target is Goal 2 (strategy p. 5; roadmap measure 2.4.1, p. 48). The pathway row shows it as such.

## Navigation

The header already links `/insights` as "Where access is hardest". That label fits the page's title ("Where getting to a doctor is hardest, and what to start counting"); keep it.
