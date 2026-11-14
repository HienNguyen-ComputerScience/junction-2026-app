# FirstLine design system (short)

**Direction.** Sober, exact, plain-spoken: a statistics office's annual report, not a startup page. One dark theme, no toggle. The chrome is near-black and neutral, with one accent that is the product's identity; the only other saturated colour on any screen is data status. The richness goes into the figures and the bars.

**Signature: the Finland line.** Every bar in the product is zero-based (0 to 100%) and carries a thin off-white marker at Finland's value, labelled "Finland 54.7%". Use `components/ui/measure-bar.tsx`, never a hand-made bar:
- `<MeasureBar value finland finlandLabel status />`: bar + line + axis. `value={null}` draws a hatched empty track (no public data), `finland={null}` draws no line. Optional: `size="lg"` (the tall bar of the home card), `gapLabel` (with `size="lg"`: text written on the span between the bar's end and the line, e.g. "+30.7 pts"), `higherIsBetter` (see below).
- `BarFill`, `FinlandTick`, `FinlandAxis`: the parts, for custom layouts (the ranking draws one continuous 1px line down the column).
- The red part of a bar is always the distance from Finland, and there are two kinds of share:
  - a **wait** share (lower is better) is worse when it runs past the line: tinted red up to the line, solid red beyond it;
  - a **referral** share (higher is faster) is worse when it stops short of the line: a neutral fill up to the value, then a red **outlined** segment from the value to the line. Never a solid red bar that ends before the line.
  - The kind is read from the data: "worse than Finland" below Finland's value, or "at or better" above it, can only be a higher-is-better share. Pass `higherIsBetter` only to override that.
- Amber bars use `bg-status-amber-bar`, a quieter amber than the marker, and an amber figure stays in the text colour (`STATUS_FIGURE`), so the calm end of a chart is calm. Markers and labels keep the full amber. Amber is still not "good".
- The axis label is centred on its tick and leaves the centre only where it would run off the bar. "0%" and "100%" appear at the ends where there is room.
- `<BarKey />`: the swatch legend, drawn like the marks it names. Default `kinds="both"` is true for wait and referral bars together; `kinds="wait"` for a chart of wait bars only; `finlandLabel="Finland 54.7%"` names the line with its value when one value applies to every bar in view. Add it wherever bars are shown. No prose keys.

**Tokens** (`app/globals.css`, use as Tailwind classes; hex values are what they resolve to)
- Surfaces, deepest to highest: `bg-background` page `#050506` → `bg-frame` `#0d0e0f` → `bg-card` panel `#131415` → `bg-muted` raised `#1a1b1d` (inputs, chips, inner blocks, row hover) → `bg-accent` raised and hovered `#222425`. Near-black and neutral: nothing may read as navy.
- The surface steps are small, so hairlines carry the edges: `border-frame-border` (8%), `border-border` (9%), `border-input` (10%), all the text colour at low opacity. No shadows.
- Text, three roles, all AA on every surface (the lowest pair, `text-faint` on `bg-accent`, is 5.6:1): `text-foreground` `#eaebed`, `text-muted-foreground` `#abaeb2`, `text-faint` `#999b9f` (placeholders, axis ticks, rank numbers, row chevrons). Never lighter than `text-faint`.
- **Accent**: one colour, a cold glacier cyan, `brand` `#68cfe3` (`oklch(0.8 0.1 212)`, 11:1 on the page). It is used for exactly five things: the logo mark's bars, the active nav underline, the primary button fill (`bg-primary`, with `text-primary-foreground` `#050506` on it), text links (`text-brand-ink` `#8adbea`; any `<a class="underline">` without a colour of its own gets it) and the focus ring (`ring-ring`). Nothing else: no accent headings, icons, borders, chips or chart marks. It is blue-leaning so it can never read as "green = good".
- Primary button, disabled: `bg-brand-soft` with an accent hairline and accent text, so the main action is recognisable before it is available.
- Status (data only): `status-red` `#e34f4c` (worse than Finland), `status-amber` `#eaaf49` (at or better than Finland's level), `status-grey` `#727577` (no public data, hatched). Each has `-soft`, `-border`, `-ink`; text uses `-ink` (`#f88985`, `#f0c77c`). `status-amber-bar` `#c59d5d` is the amber of a bar fill. Text on a filled red or amber mark is `text-background`. Notes, banners, results and errors are neutral (`bg-muted`, `border-input`, `text-foreground`).
- `bg-track`: the empty part of a bar (text colour at 12%).
- Radius: `rounded-frame` 20px (outer) → `rounded-panel` 14px (inner, frame padding is 6px; `rounded-xl` resolves to the same 14px) → `rounded-lg` 10px (buttons, inputs, inner blocks) → `rounded-sm` 6px (chips, badges). `rounded-full` only for the step and action number dots. Nothing else is a pill.
- Spacing: 4px grid. Container: `page-container` (used by the header, the footer and every page, so left edges match). Sections: `gap-6 sm:gap-8`. Panel padding: `px-4 sm:px-6`.

**Dark by default, with no `.dark` class.** `:root` holds the dark tokens and sets `color-scheme: dark`; `app/layout.tsx` exports the matching `viewport` (theme colour `#050506` and colour scheme). `@custom-variant dark (&:is(.dark *))` stays in `globals.css` on purpose: it keeps every `dark:` class inert. Do not remove it, do not add a `dark` class, and do not write `dark:` variants.

**Type** (Bricolage Grotesque for display and figures, Geist for text, Geist Mono for source chips; weights 600 or below)
- `type-display` home h1 · `type-page` page h1 · `type-title` section h2 (20px) · `type-heading` panel title (17px). An `h1` or `h2` without a `type-*` class still gets the system's weight and tracking.
- `type-lede` (17px) · body `text-sm`/`text-[0.9375rem]` · `type-caption` (13px) · `type-micro` (12px)
- `type-legend`: 13px, one step above muted, for legend labels (`BarKey` sets it itself).
- `type-note`: 12px text face with tabular figures, for notes on a chart or a card ("via Exa", "Solid red: beyond Finland's line", "No indicator, so nothing to draw", dates, model names, "Finland 54.7%" axis labels). Pair with `text-muted-foreground`.
- `type-mark`: 11px mono. **Mono is for source chips and bare axis numerals only** (0%, 100%, years, tick values). Anything with words in it that is not a source chip uses `type-note`.
- `numeral` for key figures, with a size: `numeral text-[3.5rem]`. Colour a figure with `STATUS_FIGURE[status]` (red ink only when worse than Finland). Sentence case everywhere; short labels end without a period.
- Gaps to Finland are written "+30.7 pts vs Finland" / "−21.9 pts vs Finland": one decimal, a true minus sign, computed for display from the two figures shown (`gapToFinland` in `components/ranking/ranking-list.tsx`).

**Components**
- `Frame` / `FrameHeader` / `FrameTitle` / `FrameMeta` / `FrameDescription` / `FramePanel` / `FrameFooter` (`frame.tsx`): the section container, a frame with a label row around panels. There is no inverse tone: the home hero leads by size and by its figures, on the same page as everything else.
- `StatusBadge`: a square mark plus a text label, never colour alone. `variant="chip"` (tag), `"plain"` (coloured text), `"quiet"` (muted text, for dense rows). Take status from the data; never recompute it. In a list, the group heading carries the status label once; rows carry the gap as text with the marker, not the label repeated.
- `SourceChip` (`components/source-chip.tsx`): mono tag with an arrow, on the raised surface. Must sit next to, or in the same block as, every number. One format everywhere: "Sotkanet 6411" or, with the figure's year, "Sotkanet 6411 · 2025"; evidence sources show the publisher's name ("PubMed Central", "NICE", "Sveriges riksdag", "Junction challenge file"), never "Source: hostname". The hostname and the full title are in the tooltip. In a table, one chip per column per group heading, not one per row and not again in the column header.
- `Badge`: `outline` is the same reference tag as `SourceChip` without the link (mono, raised surface, same height); `secondary` and `brand` are neutral text tags ("Found live — unverified", "Cached"). `default` is the accent fill and is not used for labels.
- `Button`: `default` is the accent fill with dark text (one per view); `outline` is the raised surface; `link` is accent text. Sizes `sm` 32px, default 36px, `lg` 44px for the main action.
- `BackLink`: the only back-link pattern (arrow icon + text, starts on the page edge).
- `Disclosure`: styled `<details>` with a chevron. Never a bare `<details>`.
- Rows that navigate (the ranking): the whole row is the link, with a 16px chevron at its right end (`text-faint`, the text colour on hover), a `bg-muted` hover and focus surface and an inset focus ring. All rows are equal.
- Selection (the red-flag chips): a raised surface, a stronger hairline and a tick box. Never a colour change alone.
- Icons: lucide only, 16px, stroke 1.75, text colour. No glyph arrows or triangles in text.

**Page pattern**: `BackLink`, a one-line context caption, `type-page` h1, then Frames. Phone (390px): one-row 56px header, stacked columns, tap targets 36px or more, no horizontal scroll, and data before legend: a chart starts with one line saying what the bar and the line are; the full key goes under it.

**Motion**: `animate-bar-grow` (bars, staggered with `--i`) and `animate-fade-up`, one curve, under 0.6s, off with `prefers-reduced-motion`. Hover is a surface step or a text-colour change only.

**Don't**: gradients, shadows, glows, pills, all-caps tracked labels, the accent outside its five uses, a second accent, green, text lighter than `text-faint`, mono for captions, a prose legend where swatches would do, a status label repeated on every row, truncating meaningful text, a `SourceChip` nested inside another link, a sticky table header that slices rows, a solid red bar that ends short of the Finland line, or a bar without the Finland line when Finland's value exists.
