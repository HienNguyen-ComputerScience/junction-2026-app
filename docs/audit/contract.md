# Contract for agents building on this branch

Branch `t3/experimental-real-user-audit`. This file lists what other agents (the guided briefing, the insights page) can rely on: theme tokens, the shared motion pieces, the plan page's route and query format, the Word and Excel writers, the data shapes and the `lib/` functions to call. It is updated whenever one of these changes. Names and signatures listed here will not be renamed.

Folders that are **not** this branch's: `app/briefing/**`, `components/briefing/**`, `lib/briefing/**`, `docs/audit/briefing/**` (briefing agent); `lib/insights/**`, `components/insights/**`, `data/insights/**`, `scripts/insights/**`, `app/insights/**`, `app/api/insights/**`, `docs/audit/insights/**` (insights agent); `app/sources/`, `docs/evidence/`, `docs/pitch/`, `docs/submission/` (teammates).

## 1. Theme tokens (`app/globals.css`)

One light theme, no dark mode, no `.dark` class.

### Palette

Each exists as a CSS variable on `:root` and as Tailwind utilities (`bg-…`, `text-…`, `border-…`, `fill-…`, `stroke-…`).

| Token | Value | Utility example | Use |
|---|---|---|---|
| `--color-forest-ink` | `#0f3e17` | `text-forest-ink`, `bg-forest-ink` | Headings, links, primary button fill, icon strokes, focus ring. Never a surface tint. |
| `--color-forest-shadow` | `#0c2f10` | `hover:bg-forest-shadow` | Hover of a Forest Ink fill. |
| `--color-cream-paper` | `#fffefc` | `bg-cream-paper` | Page background, pill background, text on a Forest Ink button. |
| `--color-keylime-wash` | `#e1f4df` | `bg-keylime-wash` | The main light panel. |
| `--color-mint-veil` | `#cfe7d3` | `bg-mint-veil` | Raised block inside a panel, active nav item, hover of an outline button. |
| `--color-sage-mist` | `#b1dbb8` | `bg-sage-mist` | Heavier feature panel, hovered row. |
| `--color-slate-hush` | `#b6ced5` | `bg-slate-hush` | Cool counter-panel for data previews; put cream cards on it. |
| `--color-charcoal` | `#222222` | `text-charcoal` | Body text. |
| `--color-border-mist` | `#efeeeb` | `border-border-mist` | Hairline on cream. |

Keylime, mint, sage and slate are surfaces only, never text.

### Semantic (shadcn) tokens, mapped onto the palette

| Token | Maps to | Utility |
|---|---|---|
| `--background` | cream paper | `bg-background` |
| `--card`, `--frame` | keylime wash | `bg-card` |
| `--muted`, `--secondary` | mint veil | `bg-muted` |
| `--accent` | sage mist | `bg-accent` |
| `--popover` | cream paper | `bg-popover` |
| `--foreground` | charcoal | `text-foreground` |
| `--muted-foreground` | `#454c46` | `text-muted-foreground` (AA on every surface, slate included) |
| `--faint` | `#4f564f` | `text-faint` (placeholders, axis ticks; AA on every surface) |
| `--primary`, `--brand`, `--brand-ink`, `--ring` | forest ink | `bg-primary`, `text-brand-ink` |
| `--primary-foreground` | cream paper | `text-primary-foreground` |
| `--border` | forest ink at 14% | `border-border` (hairline on green surfaces) |
| `--frame-border` | border mist | `border-frame-border` (hairline on cream) |
| `--input` | `#6c7f6f` | `border-input` (field edge, 3:1 or more) |
| `--track` | forest ink at 16% | `bg-track` (empty part of a bar) |

### Status colours

The only hues outside the greens. Never colour alone: every use carries a text label (`STATUS_LABEL` in `lib/ranking.ts`). The alarm colour is a rust, tuned to sit with the greens; the tokens keep their historical names.

| Meaning | Mark / fill | Text (AA on every surface) | Chip background / border |
|---|---|---|---|
| Worse than Finland's level (`red`) | `--status-red` `#ad4a22` → `bg-status-red`, `fill-status-red` | `--status-red-ink` `#7c3110` → `text-status-red-ink` | `bg-status-red-soft`, `border-status-red-border`; `bg-status-red-tint` is the lighter part of a bar |
| At or better than Finland's level (`amber`, drawn as slate) | `--status-amber` `#3f6672` (marker), `--status-amber-bar` `#4f7682` (bar) | `--status-amber-ink` `#27444e` → `text-status-amber-ink` | `bg-status-amber-soft`, `border-status-amber-border` |
| No public data (`no_data`) | `--status-grey` `#686e69` → `bg-status-grey`; `bg-hatch` for an empty track | `--status-grey-ink` (= muted foreground) | `bg-status-grey-soft`, `border-status-grey-border` (dashed) |

Ready-made: `StatusBadge` (`components/ui/status-badge.tsx`, props `status`, `size`, `variant`), and `STATUS_FILL` / `STATUS_INK` class maps from the same file.

### Type

Fonts are loaded with `next/font` in `app/layout.tsx`: Inter as `--font-sans` (300, 400, 600) and Cormorant Garamond as `--font-display` (300 only, never bold). Utilities `font-sans`, `font-display`.

| Utility | What |
|---|---|
| `type-display` | Serif 300, 40–56px, Forest Ink. Home headline. |
| `type-page` | Serif 300, 32–40px. Page title (`h1`). |
| `type-title` | Serif 300, 24–28px. Section title (`h2`). |
| `type-statement` | Serif 300, 23px / 1.5. One sentence set large (a briefing statement). |
| `type-heading` | Inter 600, 18px / 1.3. Item title inside a section. |
| `type-lede` | 18px / 1.6. |
| `type-eyebrow` | 11px, 600, uppercase, 0.08em, Forest Ink. The only uppercase style. |
| `type-caption` | 14px. Meta lines. |
| `type-note` | 13px. Notes on a chart. |
| `type-mark` | 12px tabular. Axis numerals. |
| `numeral` | A standalone key figure: Inter 300, tabular, tight. Add a `text-*` size (20–80px). |
| `figure` | A number inside a line of text: tabular figures only. |

Body copy is 16px: `text-sm` and `text-base` are both 16px on this branch. Do not go below 16px for body text or button labels.

### Shape and space

- `rounded-lg` = 14px (cards, buttons). `rounded-full` for pills, chips and badges. `rounded-sm` = 7px (nav items).
- No box-shadow anywhere (shadow utilities are neutralised). Depth is cream → keylime → mint → sage → slate.
- `page-container`: the one page width. Card padding 28–42px, never under 21px.
- Primary button: `<Button>` (`components/ui/button.tsx`): Forest Ink fill, cream text; `size="lg"` for the one main action on a screen; `variant="outline"` for secondary. Put a trailing arrow icon on a primary button that moves forward: `<ArrowRight data-icon="inline-end" />`.
- Pill: `<Badge variant="outline">`, or `rounded-full bg-cream-paper px-3.5 py-2 text-forest-ink`.
- Source chip: `<SourceChip sourceId="…" year={2025} />` (`components/source-chip.tsx`). Every number shows one.

## 2. Motion (`lib/motion.ts`, `components/motion/`)

One easing, two volume levels. Quiet is the default; wrap a subtree in `className="motion-loud"` (exported as `MOTION_LOUD_CLASS`) for the louder set. Only opacity and transform move.

```ts
import { MOTION, MOTION_EASE, MOTION_LOUD_CLASS, easeOut, prefersReducedMotion, type MotionLevel } from "@/lib/motion";
// MOTION.quiet = { rise: 320, stagger: 60, bar: 500, count: 600, distance: 8, open: 280 }   (ms, px)
// MOTION.loud  = { rise: 500, stagger: 120, bar: 700, count: 700, distance: 14, open: 360 }
// MOTION_EASE  = "cubic-bezier(0.22, 1, 0.36, 1)"
```

The same values are CSS variables: `--motion-ease`, `--motion-rise`, `--motion-stagger`, `--motion-bar`, `--motion-distance`, `--motion-open`. CSS utilities: `animate-fade-up` (rise), `animate-bar-grow` (grow from the left), `animate-line-in` (a thin rule drawing itself from the left edge; give it `h-px bg-forest-ink`). All three take `style={{ "--i": n }}` for a stagger.

```ts
import { AnimatedBar, AnimatedNumber, Disclosure, PrintButton, Reveal } from "@/components/motion";
```

All pieces render their final content on the server (nothing is blank before script runs), do nothing under `prefers-reduced-motion`, and print in their final state.

### `Reveal`

Fades its content in with a slight rise, once.

| Prop | Type | Default | |
|---|---|---|---|
| `as` | `"div" \| "section" \| "li" \| "p" \| "span" \| "article" \| "tr"` | `"div"` | |
| `index` | `number` | `0` | Position among siblings; each step waits one stagger. |
| `show` | `boolean` | undefined | Leave undefined: plays when the element first enters the viewport (at once if already on screen). `false`: hidden and skipped by screen readers but still takes its space; `true`: plays. This is the button-driven mode. |
| `className`, `style`, `children` | | | |

Bars inside a Reveal (`AnimatedBar`, `animate-bar-grow`, `animate-line-in`) start when the Reveal plays. The state is on the element as `data-reveal="load" | "wait" | "in" | "hold"`.

### `AnimatedNumber`

Counts up to a value, once. The exact final text is what the server renders, what screen readers read at every moment, and what the count lands on; the moving digits are an `aria-hidden` overlay, so nothing shifts and no intermediate value is announced.

| Prop | Type | Default | |
|---|---|---|---|
| `value` | `number` | required | The number to count to. |
| `final` | `string` | formatted `value` | The exact text at rest, e.g. `formatPct(value)`. |
| `decimals` | `number` | `1` | For the moving digits. |
| `prefix`, `suffix` | `string` | `""` | e.g. `suffix="%"`. |
| `from` | `number` | `0` | |
| `level` | `"quiet" \| "loud"` | `"quiet"` | Count duration. |
| `play` | `boolean` | undefined | Undefined: counts on entering view. `false`: shows the final value and waits; `true`: counts. |
| `align` | `"start" \| "end"` | `"start"` | `"end"` in right-aligned cells. |
| `className` | | | Put `numeral text-7xl` etc. on a parent or here. |

### `AnimatedBar`

A horizontal bar that grows from the left to its value, once. One accessible image: say the value in `label`.

| Prop | Type | Default | |
|---|---|---|---|
| `value` | `number` | required | |
| `max` | `number` | `100` | Value at the right end of the track. |
| `tone` | `"red" \| "slate" \| "grey" \| "forest"` | `"forest"` | red = worse than Finland, slate = at or better, grey = no data, forest = no status. |
| `label` | `string` | required | Read by screen readers: "Vantaa and Kerava 85.4%, Finland 54.7%". |
| `marker` | `number` | | A reference line (Finland's level), same scale as `value`. |
| `markerLabel` | `string` | | Visible text under the line: "Finland 54.7%". |
| `play` | `boolean` | undefined | Undefined: grows on entering view or with its Reveal. `false`: empty; `true`: grows. |
| `index` | `number` | `0` | Stagger among sibling bars. |
| `className` | | | Width, margins. |

Colour is never the only signal: show the figure and the status in words next to the bar. The domain bar with the red tint up to Finland's line is `MeasureBar` in `components/ui/measure-bar.tsx`; it also grows inside a Reveal.

### `Disclosure`

A "show more" button: a native `<details>` styled as a button whose label switches between "Show …" and "Hide …". Works without script, eases open where the browser can animate it, always expanded on paper.

| Prop | Type | Default | |
|---|---|---|---|
| `label` | `string` | | Lower case: `"how this is measured"` → "Show how this is measured" / "Hide how this is measured". |
| `show`, `hide` | `string` | | Full wording instead of the two above. |
| `defaultOpen` | `boolean` | `false` | For content that is the point of the page. |
| `tone` | `"outline" \| "quiet"` | `"outline"` | quiet: an underlined text-weight button inside a dense panel. |
| `className`, `contentClassName`, `children` | | | |

Never put a headline figure, its source chip or its main limitation inside one.

### `PrintButton` and print

`<PrintButton label="Print or save as PDF" variant="outline" size="default" />` calls `window.print()`. `PrintExpand` (mounted once in the layout) opens every closed `<details>` for the print. The print stylesheet hides the header, the footer and anything marked `print:hidden` or `data-print="hide"`, shows every Reveal, and keeps colours. A new full-screen layout should mark its own chrome `print:hidden`. Panels may break across pages (a tall panel that may not break pushes a blank page ahead of itself); add `print-keep` to a small unit that must stay whole.

### Tables on a phone

`<table className="stack-table">`: below 640px each row reads as label/value lines. Give every `<td>` a `data-label="Column name"` and wrap its content in one element. The plan page's `Td` helper does both.

## 3. Plan page: route and query format

- Page: `/county/<id>/plan` (`<id>` is a `County.id`, e.g. `vantaa-kerava`).
- Export: `/county/<id>/plan/export?format=docx` or `format=xlsx`, with the same parameters as the page.

Every parameter is optional; anything missing or invalid takes its default, so a bare link always works.

| Parameter | Values | Default | |
|---|---|---|---|
| `actions` | Comma-separated `Evidence.id`s, at most three, in the order to show | The area's recommended actions (`pickActions`) | The briefing's hand-off: the actions the director chose. Unknown ids are dropped. |
| `target` | `finland` \| `best` | `finland` if any step is worse than Finland, else `best` | Level to aim for on each step. |
| `year` | `2027` … `2031` | `2028` | End of the year to reach it by. |
| `person1`…`person3` | text, 80 characters | empty | Named person responsible, per action. |
| `review1`…`review3` | text | empty | Review date, per action. |
| `cost1`…`cost3` | text | empty | The area's own cost estimate, per action. |
| `approved`, `decided` | text | empty | Sign-off: approved by, date of decision. |

Example: `/county/vantaa-kerava/plan?actions=ev-gp-continuity,ev-gp-capacity-roadmap&target=finland&year=2029`

In code: `buildPlan(countyId, params: URLSearchParams, today?: Date): Plan | null` and `readPlanInput` in `lib/plan-model.ts`; `plan.query` is the query string that reproduces a plan. Target arithmetic: `targetPath({ value, target, better, fromYear, toYear })` in `lib/plan.ts` (an even pace in percentage points; labelled as arithmetic, not a forecast).

Live on this branch since `5e333ff`. Word and Excel builders for the plan: `planToDocx(plan)`, `planToSheets(plan)`, `planFileName(plan, ext)` in `lib/plan-export.ts`. Tests: `tests/plan.test.mjs`.

## 4. Word and Excel writers (`lib/export/`)

No dependency; server only (they use `node:zlib`). Both were opened and read back in Word and Excel on Windows.

```ts
import { buildXlsx, sheetName, XLSX_TYPE, type Cell, type Sheet } from "@/lib/export/xlsx";
// type Cell = string | number | null          numbers stay numeric cells (sortable, local decimal mark)
// type Sheet = { name: string; widths: number[]; rows: Cell[][]; headerRows?: number }
//   name: at most 31 characters (sheetName() makes any string safe); widths: column widths in characters;
//   the first `headerRows` rows (default 1) are bold and frozen; all cells wrap.
// buildXlsx(sheets: Sheet[]): Uint8Array<ArrayBuffer>

import { buildDocx, DOCX_TYPE, type Block, type Run } from "@/lib/export/docx";
// type Run = string | { b: string }            plain or bold; "\n" inside a run is a line break
// type Block =
//   | { type: "title" | "h1" | "h2"; text: string }
//   | { type: "p" | "note"; runs: Run[] }       note: smaller and grey (captions, source lines)
//   | { type: "table"; widths: number[]; rows: Run[][][] }   first row is the header; widths are relative
// buildDocx(blocks: Block[]): Uint8Array<ArrayBuffer>      A4, 2 cm margins
```

In a route handler:

```ts
return new Response(buildXlsx(sheets), {
  headers: { "Content-Type": XLSX_TYPE, "Content-Disposition": 'attachment; filename="template.xlsx"' },
});
```

Tests: `tests/export.test.mjs`. `lib/export/zip.ts` (`zip`, `xml`) is the shared base.

## 5. Data

All data is the static snapshot in `data/`, written only by `scripts/data/build-snapshot.mjs` (`npm run data:build`). Every row carries a `source_id` that resolves in `data/sources.json`. Types are in `lib/data.ts`.

### `data/data-gaps.json` (`DataGap[]`, exported as `dataGaps`)

Figures nobody publishes, each as a to-do.

```ts
type DataGap = {
  id: string;                 // "suspected-cancer-gp-wait" | "route-to-diagnosis" | "diagnostic-interval"
                              // | "hus-area-referrals" | "stage-by-area" | "treatment-within-target"
  step: Stage | "diagnosis" | "treatment";
  missing: string;            // what is not published
  today: string;              // what exists instead
  could_publish: string;      // who could publish it (our proposal, shown labelled as one)
  measure_id: string | null;  // roadmap measure it belongs to, e.g. "3.1.4"
  county_can: string;         // what a county can start recording itself
  applies_to: string[] | null; // null: every area; else only these County ids
  source_id: string;
};
```

`getDataGaps(countyId?)` returns the national rows plus those naming that area. `data/roadmap.json` (`RoadmapMeasure[]`, `roadmap`, `getMeasure(id)`, `getMeasureForAction(evidenceId)`) holds the five roadmap measures (2.5.1, 2.5.2, 3.1.2, 3.1.4, 3.2.1) with `title`, `responsible`, `funding`, `schedule[{ period, text }]`, `indicator`, `pages`, `evidence_ids`, `source_id`. Euro figures there are national funding needs, never a county's cost.

### Functions to call

| Need | Call | From |
|---|---|---|
| All areas (21 counties and Helsinki) | `counties: County[]`; `getCounty(id)` | `lib/data` |
| An area's value for an indicator | `getValue(countyId, indicatorId, year = 2025): IndicatorValue \| undefined` (`.value` in %, `.abs_value`, `.source_id`) | `lib/data` |
| Finland's value | `getNationalValue(indicatorId, year?)` | `lib/ranking` |
| Indicator ids | `GP_WAIT_ID = "6411"`, `REFERRAL_ID = "13"`; `getIndicator(id)` gives `name`, `direction`, `limitation` | `lib/ranking` |
| Rank | `getRanking(): RankingRow[]`, worst first by GP wait: `{ county, rank, gpWait, gpWaitChange, referral, sharedReferral, gpStatus, referralStatus }` | `lib/ranking` |
| Values 2023–2025 | `getTrend(countyId, indicatorId)` → `{ year, value: IndicatorValue \| null }[]`; `YEARS`, `FIRST_YEAR` | `lib/ranking` |
| The three steps | `STAGES`, `STAGE_LABELS[stage]`; `getStageGap(countyId, stage): Gap \| undefined`; `stageStatus(countyId, stage): GapStatus`; `STATUS_LABEL[status]` | `lib/data`, `lib/act`, `lib/ranking` |
| Bottleneck stage | `getBottleneck(countyId): Bottleneck` = `{ focus: Gap[] (worst first), anyRed, noData: Gap[] }`; `bottleneckLede(bottleneck)` is the one-line answer; `getAreaStatus(countyId)` is the area's single status | `lib/act` |
| Why (one sourced sentence) | `getMainReason(countyId): MainReason` = `{ kind, gap, text, chips: { sourceId, year }[], caveat }` | `lib/main-reason` |
| Recommended actions | `pickActions(bottleneck): Evidence[]` (at most 3); `otherActions(countyId, picked)`; `plainTitle(evidence.action)` for the heading | `lib/act`, `lib/action-title` |
| An action's fields | `Evidence`: `id`, `stage`, `action`, `detail`, `who_implements`, `first_step`, `precedent`, `effect_text`, `effect_size`, `limitations`, `source_id` | `lib/data` |
| Sources | `getSource(sourceId): Source`; `<SourceChip sourceId year />` | `lib/data`, `components/source-chip` |
| Limitations | `getIndicator(id).limitation`; `gap.note`; `getRecordingCaveat(areaId): { tag, text } \| null` (show it wherever a rise in the GP-wait share is shown); `CITY_UNITS_ONLY_REFERRAL` (Helsinki); `gap.shared` (the HUS-wide referral value, never a county's own figure) | `lib/ranking`, `lib/recording` |
| Best area, gap to it | `bestForStage(stage)`, `betterFor(indicatorId)`; `whatIf(…)`, `diff1(a, b)` | `lib/main-reason`, `lib/what-if` |
| Formatting | `formatPct(value)` → `"85.4%"` | `lib/ranking` |

### Wording rules that travel with the data

- Sotkanet 6411 counts non-urgent GP **visits**, not people: "85.4% of non-urgent GP visits waited over 7 days", never "of patients".
- The referral figure for Central, East and West Uusimaa and Vantaa and Kerava is HUS-wide: label it shared, never as the area's own.
- A projection or target is labelled as arithmetic or as an estimate, with its assumptions; no number without a `source_id` and a visible source chip.
- No symptom checker or patient-facing input, no patient data, no reproduced guideline text (link and cite only).

## 6. Navigation

The header links to `/briefing` ("Start the guided briefing", a primary button, also on the home page) and to `/insights` ("Where access is hardest", a placeholder label until the insights agent proposes one). Both routes arrive when those branches are merged; until then the links 404 on this branch alone.
