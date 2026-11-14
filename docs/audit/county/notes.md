# County page (`/county/<id>`): design pass after judge round 4

Starting point: `t3/post-freeze-build-integration` at `ac1e752`. The round-4 judge scored the page 8.7: clarity 9.0, ease 8.5, hierarchy and consistency 8.5, type and spacing 8.5, motion 8.5, accessibility 9.0.

Files changed: `components/county/area-lead.tsx`, `components/county/step-story.tsx`, `app/county/[id]/page.tsx`. No shared component was edited.

Checked on Vantaa and Kerava, Kainuu, and East Uusimaa (an Uusimaa area that shares the HUS referral figure), at 1366×768 and 390×844, on a production build (`npm run start -- -p 3123`) with playwright-core 1.65.1 and its bundled Chromium. Helsinki was checked as an extra case. The button position and sideways scroll were measured on all 22 areas.

## What the judges held against the page, and what changed

### 1. Ease: "See what to do" was cut off in a real laptop window (R4, ease held at 8.5)
Round 4: "In a real laptop window, browser chrome leaves about 650px, so the button is still partly cut there." On a phone the button sat under the fold.

| Main button, top–bottom (px) | Before | After |
|---|---|---|
| Vantaa and Kerava, 1366×768 | 681–738 | **572–629** |
| Kainuu, 1366×768 | 679–736 | **542–598** |
| East Uusimaa, 1366×768 | 681–738 | **572–629** |
| Vantaa and Kerava, 390×844 | 806–863 (under the fold) | **757–814** |
| Kainuu, 390×844 | 830–887 (under the fold) | **782–838** |
| East Uusimaa, 390×844 | 806–863 (under the fold) | **757–814** |
| All 22 areas: button ending past y=650 (desktop) / y=844 (phone) | 22 / 22 | **0 / 0** |

How, with nothing removed (`area-lead.tsx`, `page.tsx`):
- **The source chip and the "Read with care" note now share one row**, still directly under the figure they qualify. When "Why?" opens, the row aligns to the top and the explanation grows downwards. This saves about 44px on desktop; on a phone the two still stack.
- **From 640px the unit runs on one line beside the numeral**: "85.4% of non-urgent GP visits waited more than 7 days" now reads as one sentence. This saves about 33px. It uses a local `LeadFigure` with the same face and sizes as the shared `ChunkFigure`, whose unit is capped at 22ch.
- **On a phone, the eyebrow drops the Finnish name** ("Vantaan ja Keravan hyvinvointialue · ") so it stays on one line. Desktop keeps it.
- **Spacing:** the hero gap is 16px (was 20px), the stray `pt-2` above the buttons is gone, and the page's top padding is 16px at every width (was 24px from 640px).

### 2. Hierarchy: step titles outranked their section heading
Measured before: h1 40px, section h2 "Where care is delayed" 28px, and each step's h3 **40px** (32/24/32 on a phone). The step titles were larger than the heading above them, which is the pattern R3-04 docked on the act page.
- After: h1 40, h2 28, h3 **24** (phone: 32/24/24), the same scale the act page uses since R3-04.
- The two section h2s now use `type-title`. Their old `text-[2rem] sm:text-[2.75rem] max-w-[24ch]` classes never applied, because the unlayered `h2` rule in `globals.css` wins. The visible size is unchanged, but "What these figures cannot tell you" now fits on one line instead of breaking after "figures".

### 3. Clarity: each step's text now reads as a sentence
- **Before:** "Non-urgent GP visits waiting over 7 days, % of visits, 2025. Finland overall: 54.7%. 27.4 points worse than in 2023 (58.0%)." That reads like a table header.
- **After:** "In 2025, **85.4%** of non-urgent GP visits waited more than 7 days. Finland overall: **54.7%**. 27.4 points worse than in 2023 (58.0%)."
- **A step with no figure of its own** (the HUS-shared referral, or no data) now gives the reason first, then "Finland overall, 2025: **76.8%** of referrals were processed within 3 days."
- The unit wording is one constant, `STEP_UNIT`, shared by the hero and the steps, so the two can't drift apart.

### 4. "The main delay" showed twice, side by side (desktop)
The pill was in the sticky step list and again on the text card beside it. It is now only in the list, which is the overview of the three steps and stays on screen while the cards scroll past.

### 5. Step list: the status tag wrapped
"Same as or better than Finland overall" wrapped to two lines on desktop (Kainuu, step 1), and on a phone "Longer wait than Finland overall" took three. Each step is now a small grid: number, name and figure on the first row, and the status tag on the second, running under the figure too.
- Desktop: one line for every label.
- Phone: two lines at most (`after-vantaa-kerava-m-s02.png`).

## Kept as it was
- The scroll-driven reveal (`motion-loud`), the sticky step picture, the mint focus card (`FocusGroup`) and the step story. None of the motion changed.
- Every figure, source chip and caveat. The limitations box is always visible and unchanged. The `MoreCard` is unchanged.
- The wording "Finland overall" everywhere. No "Finland's level", and no bare "worse than Finland".

## Fact-diff
I dumped the main text of Vantaa and Kerava, Kainuu, East Uusimaa and Helsinki with every `<details>` open, before and after, and diffed every number token.
- **Numbers removed:** none.
- **Numbers added:** each step's own figure, now repeated in its step sentence. That is 85.4% (Vantaa and Kerava), 38.4% and 75.2% (Kainuu), 51.8% (East Uusimaa), and 75.9% and 76.8% (Helsinki). Each is the same value, with the same source chip, that the step picture beside it already shows. Helsinki's referral figure is 76.8%, the same as Finland overall's.
- **Words removed:** the table-header phrasing ("…, % of visits, 2025", "Referrals to specialist care…, % of referrals"), the second "The main delay", and, on a phone only, the Finnish area name in the eyebrow.
- **No new number has been introduced, and no source or caveat moved away from its figure.**

## Checks
- **Verify:** `npm test` (517 pass), `brief:check`, `typecheck`, `lint`, `build`, `check-insights` and `check-hardcoded` all pass.
- **Sideways scroll at 390px:** none on any of the 22 areas, including with "Why?" open.
- **Text under 16px:** none, apart from the 11px eyebrows.
- **Console errors:** none.
- **"Why?":** opens at both widths (`after-vantaa-kerava-{d,m}-why-open.png`).
- **Reduced motion:** 0 elements left below full opacity, and the full page is present (`after-vantaa-kerava-reduced-full.png`).
- **No JavaScript:** the full page renders (`after-vantaa-kerava-nojs-full.png`).
- **Print:** everything is expanded, the steps print in sequence and the caveats are open (`after-vantaa-kerava-print-full.png`).
- **Contrast:** no colour changed. The same tokens sit on the same surfaces, so AA holds as measured in the contract.

## Screenshots (`screenshots/`)
- `before-*` and `after-*`: `<area>-<d|m>-s00` is the first screen, and `-s02` is the step story.
- `vantaa-kerava-d-full`: the whole page.
- `after-*-why-open`, `-reduced-full`, `-print-full`, `-nojs-full`.
- `before-buttons.json` and `after-buttons.json`: the main button's position on all 22 areas at both widths.

## Self-score (honest; the rubric weights are applied)

| Criterion | R4 judge | Mine | Why |
|---|---|---|---|
| Clarity 25% | 9.0 | 9.0 | The step sentences now read in plain words. The hero is unchanged in content. The stacked double heading over the limitations (below) still costs a little. |
| Ease 25% | 8.5 | 9.0 | The main button is on the first screen for every area, at both sizes, and above the ~650px a real laptop window leaves. |
| Hierarchy & consistency 20% | 8.5 | 9.0 | The heading scale now runs 40, then 28, then 24, the same as the act page. "The main delay" appears once. The status tags no longer wrap unevenly. |
| Type & spacing 15% | 8.5 | 9.0 | The unit reads as one line, the section titles no longer break oddly, and the hero spacing is tighter. |
| Motion & interaction 10% | 8.5 | 8.5 | Unchanged by design. The long 75vh slots between short step cards are the shared ScrollStory's. |
| Accessibility 5% | 9.0 | 9.0 | Unchanged: the same contrast, ≥16px text, DOM order kept (the status is still read before the figure). |
| **Weighted** | **8.7** | **≈8.95** | 0.25×9 + 0.25×9 + 0.2×9 + 0.15×9 + 0.1×8.5 + 0.05×9 = 8.95. That is at the 9.0 line, not clearly over it: a judge who holds clarity or hierarchy at 8.5 lands at about 8.85. |

## Needs from owners of shared components
- **`components/pathway/limitations-box.tsx` (shared):** the page's h2 "What these figures cannot tell you" sits directly above the box's own h2, "Limitations: read before acting on these numbers". That is two headings saying the same thing. Suggestion: an optional `title={null}` (or a `hideTitle` prop), so the county page can keep its section h2 alone.
- **`components/motion/chunk.tsx` (`ChunkFigure`):** the unit is capped at `max-w-[22ch]`. A `unitClassName` prop (or `sm:max-w-none` by default) would let the county page drop its local `LeadFigure` copy.
- **`components/motion/scroll-story.tsx`:** the 75vh step slots leave a lot of empty page around short cards such as step 2 ("No public figure exists…"). A shorter minimum height, or one tied to content, would tighten the story. This is the main thing left holding motion and interaction at 8.5.
