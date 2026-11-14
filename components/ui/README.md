# FirstLine design system (short)

**Direction.** Sober, exact, plain-spoken: a statistics office's annual report, not a startup page. Ink on cool paper, measured marks, footnoted sources. Chrome stays quiet; the richness goes into the bars.

**Signature: the Finland line.** Every bar in the product is zero-based (0 to 100%) and carries a thin ink marker at Finland's value, labelled "Finland 54.7%". Use `components/ui/measure-bar.tsx`, never a hand-made bar:
- `<MeasureBar value finland finlandLabel status />`: bar + line + axis label. `value={null}` draws a hatched empty track (no public data), `finland={null}` draws no line.
- `BarFill`, `FinlandTick`, `FinlandAxis`: the parts, for custom layouts (the ranking draws one continuous line down the column).
- A "worse than Finland" bar that runs past the line is tinted up to it and solid beyond it. Wherever that shows, say so in a one-line key.

**Tokens** (`app/globals.css`, use as Tailwind classes)
- Surfaces: `bg-background` (cool paper), `bg-frame` + `border-frame-border` (outer frames), `bg-card` (white panels). Text: `text-foreground` (ink), `text-muted-foreground` (secondary, AA on all surfaces; never lighter).
- Accent, lake indigo: `bg-primary`/`bg-brand`, `text-brand-ink`, `bg-brand-soft`. Rare: the primary button, links, focus, and the one "First step" block per action. Never for data status.
- Status (data only): `status-red` (worse than Finland), `status-amber` (at or better than Finland's level), `status-grey` (no public data). Each has `-soft`, `-border`, `-ink`. Never use red or amber for notes, banners or results; those are neutral (`bg-muted`, `border-input`).
- Radius: `rounded-frame` 20px (outer) → `rounded-panel` 14px (inner, frame padding is 6px) → `rounded-lg` 10px (buttons, inputs, inner blocks) → `rounded-sm` 6px (chips, badges). `rounded-full` only for the step and action number dots. Nothing else is a pill.
- Spacing: 4px grid. Container: `page-container` (used by the header, the footer and every page, so left edges match). Sections: `gap-6 sm:gap-8`. Panel padding: `px-4 sm:px-6`.

**Type** (Bricolage Grotesque for display and figures, Geist for text, Geist Mono for reference marks; weights 600 or below)
- `type-display` home h1 · `type-page` page h1 · `type-title` section h2 (20px) · `type-heading` panel title (17px)
- `type-lede` (17px) · body `text-sm`/`text-[0.9375rem]` · `type-caption` (13px) · `type-micro` (12px)
- `type-mark`: 11px mono for source chips, axis labels, years, dates. Nothing else is mono.
- `numeral` for key figures, with a size: `numeral text-[3.5rem]`. Sentence case everywhere; short labels end without a period.

**Components**
- `Frame` / `FrameHeader` / `FrameTitle` / `FrameMeta` / `FrameDescription` / `FramePanel` / `FrameFooter` (`frame.tsx`): the section container, a tinted frame with a label row around white panels. `tone="inverse"` is the dark hero, once, on home only.
- `StatusBadge`: a square mark plus a text label, never colour alone. `variant="chip"` (tag), `"plain"` (coloured text), `"quiet"` (muted text, for dense rows). Take status from the data; never recompute it.
- `SourceChip` (`components/source-chip.tsx`): mono tag with an arrow. Must sit next to, or in the same block as, every number.
- `BackLink`: the only back-link pattern (arrow icon + text, starts on the page edge).
- `Disclosure`: styled `<details>` with a chevron. Never a bare `<details>`.
- `Badge` (`secondary|outline|brand`), `Button` (`sm` 32px, default 36px, `lg` 44px for the main action).
- Icons: lucide only, 16px, stroke 1.75, text colour. No glyph arrows or triangles in text.

**Page pattern**: `BackLink`, a one-line context caption, `type-page` h1, then Frames. Phone (390px): one-row 56px header, stacked columns, tap targets 36px or more, no horizontal scroll.

**Motion**: `animate-bar-grow` (bars, staggered with `--i`) and `animate-fade-up`, one curve, under 0.6s, off with `prefers-reduced-motion`. Hover is a colour change only.

**Don't**: gradients, coloured shadows, pills, all-caps tracked labels, a second accent, text lighter than `muted-foreground`, truncating meaningful text, a `SourceChip` nested inside another link, or a bar without the Finland line when Finland's value exists.
