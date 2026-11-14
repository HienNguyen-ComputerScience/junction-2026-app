# FirstLine design system (short)

**Direction.** Sober, exact, plain-spoken: a statistics office's annual report, not a startup page. One dark theme, no toggle. The chrome is near-monochrome graphite; the only saturated colour on any screen is data status. The richness goes into the figures and the bars.

**Signature: the Finland line.** Every bar in the product is zero-based (0 to 100%) and carries a thin off-white marker at Finland's value, labelled "Finland 54.7%". Use `components/ui/measure-bar.tsx`, never a hand-made bar:
- `<MeasureBar value finland finlandLabel status />`: bar + line + axis label. `value={null}` draws a hatched empty track (no public data), `finland={null}` draws no line.
- `BarFill`, `FinlandTick`, `FinlandAxis`: the parts, for custom layouts (the ranking draws one continuous 1px line down the column).
- A "worse than Finland" wait bar that runs past the line is tinted up to it and solid beyond it. A referral bar is the other way round (higher is faster), so it is worse when it stops short of the line. Wherever both kinds show, add `<BarKey />`, which says so in words.

**Tokens** (`app/globals.css`, use as Tailwind classes; hex values are what they resolve to)
- Surfaces, deepest to highest: `bg-background` page `#0e0f11` → `bg-frame` `#151618` → `bg-card` panel `#1b1d1e` → `bg-muted` raised `#242628` (inputs, chips, inner blocks) → `bg-accent` raised and hovered `#2d2f32`. The ramp is graphite, only barely cool: nothing may read as navy.
- Depth is those steps plus hairlines: `border-frame-border` (7%), `border-border` (8%), `border-input` (10%), all the text colour at low opacity. No shadows.
- Text, three roles, all AA on every surface: `text-foreground` `#eaebed`, `text-muted-foreground` `#abaeb2`, `text-faint` `#999c9f` (placeholders, axis ticks, rank numbers). Never lighter than `text-faint`.
- Primary action: `bg-primary` is the off-white text colour with dark text. Disabled, it drops to a raised surface with a hairline and faint text.
- Accent: `text-brand-ink`, a pale glacier blue `#b0d0df`, for text links and focus rings only (`ring-ring`). Never a fill, never a button, never green.
- Status (data only): `status-red` `#e34f4c` (worse than Finland), `status-amber` `#eaaf49` (at or better than Finland's level), `status-grey` `#727577` (no public data, hatched). Each has `-soft`, `-border`, `-ink`; text uses `-ink` (`#f88985`, `#f0c77c`). Text on a filled red or amber mark is `text-background`. Notes, banners, results and errors are neutral (`bg-muted`, `border-input`, `text-foreground`).
- `bg-track`: the empty part of a bar.
- Radius: `rounded-frame` 20px (outer) → `rounded-panel` 14px (inner, frame padding is 6px) → `rounded-lg` 10px (buttons, inputs, inner blocks) → `rounded-sm` 6px (chips, badges). `rounded-full` only for the step and action number dots. Nothing else is a pill.
- Spacing: 4px grid. Container: `page-container` (used by the header, the footer and every page, so left edges match). Sections: `gap-6 sm:gap-8`. Panel padding: `px-4 sm:px-6`.

**Dark by default, with no `.dark` class.** `:root` holds the dark tokens and sets `color-scheme: dark`; `app/layout.tsx` exports the matching `viewport` (theme colour and colour scheme). `@custom-variant dark (&:is(.dark *))` stays in `globals.css` on purpose: it keeps every `dark:` class inert. Do not remove it, do not add a `dark` class, and do not write `dark:` variants.

**Type** (Bricolage Grotesque for display and figures, Geist for text, Geist Mono for reference marks; weights 600 or below)
- `type-display` home h1 · `type-page` page h1 · `type-title` section h2 (20px) · `type-heading` panel title (17px)
- `type-lede` (17px) · body `text-sm`/`text-[0.9375rem]` · `type-caption` (13px) · `type-micro` (12px)
- `type-mark`: 11px mono for source chips, axis labels, years, dates. Nothing else is mono.
- `numeral` for key figures, with a size: `numeral text-[3.5rem]`. Sentence case everywhere; short labels end without a period.

**Components**
- `Frame` / `FrameHeader` / `FrameTitle` / `FrameMeta` / `FrameDescription` / `FramePanel` / `FrameFooter` (`frame.tsx`): the section container, a frame with a label row around panels. There is no inverse tone: the home hero leads by size and by its figures, on the same page as everything else.
- `StatusBadge`: a square mark plus a text label, never colour alone. `variant="chip"` (tag), `"plain"` (coloured text), `"quiet"` (muted text, for dense rows). Take status from the data; never recompute it.
- `SourceChip` (`components/source-chip.tsx`): mono tag with an arrow, on the raised surface. Must sit next to, or in the same block as, every number.
- `BarKey` (`measure-bar.tsx`): the one-paragraph key for reading wait bars and referral bars.
- `BackLink`: the only back-link pattern (arrow icon + text, starts on the page edge).
- `Disclosure`: styled `<details>` with a chevron. Never a bare `<details>`.
- `Badge` (`secondary|outline|brand`, all neutral), `Button` (`default` off-white, `outline` raised; `sm` 32px, default 36px, `lg` 44px for the main action).
- Selection (the red-flag chips): a raised surface, a stronger hairline and a tick box. Never a colour change alone.
- Icons: lucide only, 16px, stroke 1.75, text colour. No glyph arrows or triangles in text.

**Page pattern**: `BackLink`, a one-line context caption, `type-page` h1, then Frames. Phone (390px): one-row 56px header, stacked columns, tap targets 36px or more, no horizontal scroll.

**Motion**: `animate-bar-grow` (bars, staggered with `--i`) and `animate-fade-up`, one curve, under 0.6s, off with `prefers-reduced-motion`. Hover is a surface step or a text-colour change only.

**Don't**: gradients, shadows, glows, pills, all-caps tracked labels, a brand colour in the chrome, a second accent, green, text lighter than `text-faint`, truncating meaningful text, a `SourceChip` nested inside another link, a sticky table header that slices rows, or a bar without the Finland line when Finland's value exists.
