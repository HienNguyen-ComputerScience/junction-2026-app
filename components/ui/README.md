# FirstLine design system (short)

**Direction.** Sober, exact, plain-spoken: a statistics office's annual report, not a startup page. One dark theme, no toggle. The chrome is near-black and neutral, with one accent that is the product's identity; the only other saturated colour on any screen is data status. The richness goes into the figures and the bars.

**One way to do each thing.** A step, a bar, a button, a link, a caption and a panel title each have one component or one rule below. Before adding a variant, remove a use.

## The pathway steps

`components/pathway/pathway-steps.tsx` is the only component for the three steps, on every page: `buildPathwaySteps(countyId)` reads them from the snapshot, `<PathwaySteps steps density />` draws them.

- Every step has the same parts in the same order: mark and title · status badge and source chip on one row · the value slot · the comparison line · one caption · the bar with the Finland line.
- A step with a figure uses the six shared rows (subgrid). A step without one omits what it has none of: the "No public data" badge and source chip, one caption (the data's own sentence), then the hatched bar. Its card is as tall as its content; there are no fixed-height rows that leave a blank band.
- Two densities. `density="full"` (county page): three divided columns on shared rows (subgrid). `density="compact"` (act page): one short strip, per step its name and value, what the value counts, a thin bar, the badge and the chip.
- The section title gives the year ("… (2025)"), so the chip in a step leaves it out and the status row stays one row.
- `ledStage`: the step whose figure already leads the page shows its gap to Finland in the slot instead, so **one number is on screen once per viewport**.
- `TrendStrip` (`components/pathway/trend-strip.tsx`) is the panel under the full steps: per step a figure block (the change since 2023 in words) and the chart, as a grid (1fr / 2fr, `gap-8`), the chart capped at 640px and left-aligned. Only the latest year has a status, so it alone is drawn by the bar rule (upright); the earlier years are neutral grey, and the label strip says "Only 2025 has a status" once. The source chips sit in the strip's right slot, not under the chart.

## Bars: the Finland line

Every bar is zero-based (0 to 100%) and carries a thin off-white marker at Finland's value. Use `components/ui/measure-bar.tsx`, never a hand-made bar:

- `<MeasureBar value finland finlandLabel status />`: bar, line and axis. `value={null}` draws a hatched empty track (no public data), `finland={null}` draws no line. `size`: `"sm"` 6px (compact steps), default, `"lg"` (the home card). `gapLabel`: the distance to Finland as text ("+30.7 pts", from `gapToFinland(value, finland)` in `components/ranking/ranking-list.tsx`).
- `BarFill`, `FinlandTick`, `FinlandAxis`: the parts, for custom layouts (the ranking draws one continuous 1px line down the bar rows, and only through bar rows).
- **One treatment for "worse than Finland", on every bar (big bars, the ranking's mini bars, the home card, the judged column of the trend):** the solid red part is always the gap to Finland and always touches the line.
  - a **wait** share (lower is better): tinted red up to the Finland line, solid red beyond it;
  - a **referral** share (higher is faster): tinted red up to the value, solid red from the value to the Finland line.
  - The tint is the opaque token `bg-status-red-tint`. The kind is read from the data; pass `higherIsBetter` only to override.
- At or better than Finland: slate (`bg-status-amber-bar`; the token name is historical). Slate is not "good", and a slate figure stays in the text colour (`STATUS_FIGURE`).
- Grey fill: only a mark without a status, i.e. the "Finland overall" bar and the earlier years of the trend. Hatched track: no public data.
- The map of Finland (`components/map/finland-map.tsx`) fills its areas with the same tokens at the same strength as the bars: `status-red`, `status-amber-bar`, the hatch.
- `<BarKey items />`: the key, one row of swatches drawn like the marks: "Finland's value", "Worse than Finland" (tint then solid), "At or better than Finland's level", "No public data". **One key per page** (home: in the hero card; county: under the steps; act: beside the strip's title), with `items` limited to the marks in view. No prose legends: a sentence under a chart is only for what a swatch cannot say.
- `withFigures("Finland 54.7%")` sets the numbers of a one-string label in the figure face.

## Buttons and links

- **Primary**: `Button` (default), the filled accent. At most one per viewport: the main action of the view ("What to do about it", "Ask"). Disabled, it is a flat neutral block with faint text: clearly switched off.
- **Secondary**: `Button variant="outline"`, a neutral outline on the raised surface ("Write AI brief", "Show 4 more", "Find more evidence live").
- **Tertiary**: a text link. `Button` has no other variants; sizes are default (36px) and `lg` (44px).
- **Links**: `TextLink` (`text-link.tsx`) is the one text link: accent text, no underline until hover, and an icon that says where it goes. `kind="jump"` (further down this page, arrow down), `kind="nav"` (another page of the app, arrow right), `kind="external"` (another site, new tab, the small up-right arrow the source chips use). `inline` sets it in running text. No other link style, and no underlined links.
- `BackLink`: the only back-link pattern (arrow + text, starts on the page edge).
- `Disclosure`: styled `<details>` with a chevron, never a bare `<details>`. Disclosures in one stack share one left edge, and a secondary button under them starts on the same edge (see the action card).
- Rows that navigate (the ranking): the whole row is the link, with a 16px chevron at its right end, a `bg-accent` hover and an inset focus ring.

## Text

Bricolage Grotesque for headlines, Geist for text and numbers, Geist Mono for source chips; weights 600 or below. Sentence case; short labels end without a period.

- `type-display` home h1 · `type-page` page h1 · `type-title` section title (22px; `FrameTitle` applies it) · `type-heading` item title inside a section (17px). An item title never uses `type-title`.
- `type-lede` (17px) · body `text-sm` / `text-[0.9375rem]`.
- **Captions: `type-caption`, 13px, in `text-muted-foreground`.** This is the one size for secondary text: descriptions, row sub-lines, footers, "Who" lines, the quiet status line. There is no smaller prose. A caption says something the screen does not already show; a sentence that restates a label, a chart or a badge is deleted, not shrunk. Limitations, source lines, exact labels and anything read from the data are never cut.
- 12px and 11px are for marks only: `type-note` (labels drawn on a chart or an axis), `type-mark` (mono source chips), badges.
- `type-legend`: 13px, for the labels of `BarKey` (it sets it itself).
- **Numbers: one face, Geist with tabular figures.** `numeral` for standalone key figures, with a size (`numeral text-[2.25rem]`), coloured with `STATUS_FIGURE[status]` (red ink only when worse than Finland). `figure` for a number inside a line of text; wrap the number with its unit and nothing else.
- Gaps to Finland: "+30.7 pts vs Finland" / "−21.9 pts vs Finland", one decimal, a true minus sign (`gapToFinland`). Change over time is written in words, with no arrow and no colour: "27.4 pts worse since 2023".
- Always "non-urgent GP visits"; never people or patients "waiting", and the app never does a "diagnosis".

## Surfaces and frames

- Surfaces, deepest to highest (`app/globals.css`): `bg-background` page `#050506` → `bg-frame` `#0f1011` → `bg-card` panel `#18191b` → `bg-muted` raised `#202123` (inputs, chips, inner blocks, the First step box) → `bg-accent` raised and hovered `#292b2d`. Page, frame and panel must be told apart at a glance; nothing may read as navy.
- Hairlines carry the edges: `border-frame-border` (10%), `border-border` (12%), `border-input` (14%), the text colour at low opacity. No shadows.
- `Frame` / `FrameHeader` / `FrameTitle` / `FrameMeta` / `FrameDescription` / `FramePanel` / `FrameFooter` (`frame.tsx`): the section container. `FrameMeta` sits beside the title from `sm` and under it on a phone.
- **A panel with a title has a label strip**: `FramePanelLabel` as the first child of a `FramePanel padding="none"`, title on the left, its chip or its one link on the right, a hairline under it. A panel without a title has no strip.
- Text, three roles, all AA on every surface: `text-foreground` `#eaebed`, `text-muted-foreground` `#abaeb2`, `text-faint` `#999c9f` (placeholders, axis ticks, rank numbers, chevrons). Never lighter than `text-faint`.
- **Accent**: one colour, a cold glacier cyan, `brand` `#67cfe3`. Used for the logo mark, the active nav underline, the primary button, text links (`text-brand-ink`) and the focus ring. Nothing else.
- Status (data only): `status-red` (worse than Finland, the only alarm colour), `status-amber` (slate; at or better than Finland's level), `status-grey` (no public data, hatched). Each has `-soft`, `-border`, `-ink`. Notes, banners, results and errors are neutral.
- Radius: `rounded-frame` 20px → `rounded-panel` 14px → `rounded-lg` 10px (buttons, inputs, inner blocks) → `rounded-sm` 6px (chips, badges). `rounded-full` only for the step dots.
- Spacing: 4px grid. Container: `page-container`. Sections: `gap-6`. Panel padding: `px-4 sm:px-6`.
- Dark by default, with no `.dark` class: `:root` holds the dark tokens. `@custom-variant dark (&:is(.dark *))` stays in `globals.css` to keep every `dark:` class inert. Do not add a `dark` class or `dark:` variants.

## Tags

- `StatusBadge`: an 8px square mark plus a text label, never colour alone. `variant="chip"` (tag; `size="xs"` is as tall as a source chip), `"plain"` (coloured text), `"quiet"` (the mark plus a 13px caption, for dense rows). Take status from the data. In a list, the group heading carries the status label once, with its count and its source chips.
- `SourceChip` (`components/source-chip.tsx`): mono tag with an arrow. Every number has one, or a source line, near it. One format: "Sotkanet 6411" or, where no title gives the year, "Sotkanet 6411 · 2025"; evidence sources show the publisher's name.
- **The 8px square is for data status only.** Provenance is a 14px lucide icon plus 13px muted text, no box: `<Badge variant="unverified">Found live — unverified</Badge>` (`CircleDashed`), `<Badge variant="checked">Source checked</Badge>` (`ShieldCheck`) and `<Badge variant="checked" source="snapshot">Precomputed from the snapshot</Badge>` (`Database`). Same muted colour, icon in the text colour.
- Live content (`components/exa/result-list.tsx`): `LiveMark` is the one provenance and freshness line, in the frame header: the unverified badge plus "via Exa · live" or "via Exa · cached · saved 2026-11-14". Rows are two columns (`grid-cols-[1fr_auto]`): the title (link, two lines), the snippet if any (two lines), a caption "host · 12 Nov 2026" (absolute dates, ISO in the `title`; never "3 days ago"), and the external arrow top-aligned in the right column. A row without a snippet is the title and the caption.
- Icons: lucide only, 16px (the up-right arrow of an external link or a chip is 14px), stroke 1.75, in the colour of the text beside them.

## Pages

- Page pattern: `BackLink`, a one-line context caption, `type-page` h1, then Frames.
- Act: the compact steps, then Action 1 with its "First step" box inside the first 1280×800 screen.
- County: the limitations box (title and content) is inside the first 1280×800 screen, never clipped.
- Action cards (act page and the county brief) use two tones: the action title in `text-foreground`; every other line (description, Owner, Precedent, Evidence, Who, labels) in `text-muted-foreground`, labels in `type-caption`. Only the "First step" box changes surface (`bg-muted`). No `text-faint` in body lines.
- The red-flag helper before any input is one `FramePanel` with a label strip ("Warning-sign category"), a 16px icon, "No concern picked yet" and one caption. The result rows (how fast, what the GP does, the guideline links) appear only with a result.
- A recommended action in the county brief is one row (title and "Who", the First step box, the source chip); the section has one link, "See the evidence and limitations", to the act page.
- Phone (390px): one-row 56px header, stacked columns, tap targets 36px or more, no horizontal scroll, a source line directly under the figures it sources.

**Motion**: `animate-bar-grow` (bars, staggered with `--i`) and `animate-fade-up`, one curve, under 0.6s, off with `prefers-reduced-motion`. Hover is a surface step or a text-colour change only.

**Don't**: gradients, shadows, glows, pills, all-caps tracked labels, the accent outside its uses, a second accent, green, text lighter than `text-faint`, prose under 13px, a second key on a page, a prose legend, a second filled button in a viewport, an underlined link, a status label repeated on every row, a number twice in one viewport, truncating meaningful text, a `SourceChip` nested inside another link, a red bar whose solid part does not touch the Finland line, or a bar without the Finland line when Finland's value exists.
