# FirstLine design system (short)

**Tokens** (`app/globals.css`, use as Tailwind classes)
- Surfaces: `bg-background` (cool frost page), `bg-frame` + `border-frame-border` (outer frames), `bg-card` (white panels). Text: `text-foreground` (ink), `text-muted-foreground` (AA on all surfaces; never lighter).
- Brand accent, lake indigo: `bg-primary`/`bg-brand`, `text-brand-ink`, `bg-brand-soft`. Use sparingly: links, focus rings, primary button, small highlights. Never for data status.
- Status (data only): `status-red` (worse than Finland), `status-amber` (at or better than Finland's level), `status-grey` (no public data). Each has `-soft` (chip bg), `-border`, `-ink` (AA text). Plain `bg-status-red` etc. are fills for bars/dots. Don't use raw `red-500`/`amber-400` in new code.
- Radius: `rounded-frame` (22px outer), `rounded-panel` (16px inner), `rounded-xl`/`rounded-lg` for controls, `rounded-full` for chips and nav pills.
- Fonts: Bricolage Grotesque (display: h1-h3 by default, big figures; `font-display`), Geist (everything else; add `font-sans` to a small heading that should stay in Geist).

**Type scale** (custom utilities, named `type-*` so `cn` does not merge them away with `text-*` colours)
- `type-display` page h1 (fluid 38-64px) · `type-title` section h2 (22px) · `type-heading` card/panel title (17px)
- `type-lede` intro paragraph (17px) · body `text-sm`/`text-[0.9375rem]` · `type-caption` (13px) · `type-micro` (11.5px, footnotes, column heads)
- `numeral` for key figures: display face, tabular, tight. Pair with a size: `numeral text-[2.5rem]`.

**Frame** (`components/ui/frame.tsx`): the main section container.
```tsx
<Frame aria-labelledby="t">                 {/* as="section"|"div"|"article"|"aside"; tone="inverse" = dark, once per screen */}
  <FrameHeader>
    <FrameTitle id="t" className="type-title">Title</FrameTitle>   {/* as="h1"|"h2"|"h3"|"div", default h2 */}
    <FrameMeta>chips / small meta, right</FrameMeta>
    <FrameDescription>one or two lines</FrameDescription>
  </FrameHeader>
  <FramePanel padding="md">content</FramePanel>                    {/* none|sm|md|lg */}
  <FrameFooter>footnotes</FrameFooter>
</Frame>
```
Frames never clip overflow, so `sticky` children work. `tone="inverse"` scopes the `.dark` tokens, so chips, badges and status colours flip automatically inside it.

**Status** (`components/ui/status-badge.tsx`): `<StatusBadge status={gpStatus}>{STATUS_LABEL[gpStatus]}</StatusBadge>`. It always has a dot and text, never colour alone. Sizes `xs|sm|md`; `variant="plain"` (dot + coloured text) for dense lists. `STATUS_FILL[status]` / `STATUS_INK[status]` give the class for bars and values. Take status from the data (`gaps.json` via lib); never recompute it.

**Other primitives**: `Badge` variants `default|brand|secondary|outline|ghost|link|destructive`; `SourceChip` (an outline badge link, 24px tall with a 36px hit area) must sit next to, or in the same block as, every number. `Button` sizes `sm` 32px, `default` 36px, `lg` 44px (use `lg` for the main CTA). `Card` = a white panel (16px radius, hairline ring): use it for repeated items inside a Frame.

**Layout and spacing**
- Container: `mx-auto w-full max-w-6xl px-4 sm:px-6` (the header and footer use the same edges). Gaps between sections: `gap-5 sm:gap-7`.
- Inside a panel: `gap-5` between groups, `gap-2` within a group. Rows in lists: `py-2.5`, rhythm from a shared grid.
- Phone (390px): stack columns, keep tap targets at 36px or more, no horizontal scroll.

**Motion**: `animate-bar-grow` (bars, with `style={{"--i": index}}` for a stagger) and `animate-fade-up`. Both finish under 1 s and are disabled with `prefers-reduced-motion`. Final state is the base style. Hover: colour only, 150 ms.

**Don't**: all-caps tracked labels, gradients, extra accent colours, text lighter than `muted-foreground`, truncating meaningful text, nesting a `SourceChip` (a link) inside another link, or more than one inverse frame per screen.
