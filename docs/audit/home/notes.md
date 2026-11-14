# Home page: the guided briefing is the front door

## Round 5 design pass (branch `t3/home-design-polish`, on `t3/post-freeze-build-integration` 88df84d)

Goal: raise the judges' home score from 8.5. Round 4: clarity 8.5, ease 9.0, hierarchy 8.5, type and spacing 8.0, motion 8.0, accessibility 9.0. The judges named no home defect after R1-04, so the targets came from their round-4 screenshots. The concept stays the same: the area picker, then "Start the briefing for <area>", no header button on home, "Guided briefing" first in the nav, no scroll-driven reveals.

### What was wrong in the round-4 frames

| Where | Problem |
|---|---|
| 1366: the keylime card | About 200px of content was centred in a 458px card, so roughly 250px of empty green surrounded the one action. |
| 1366: the headline row | The h1 used only the left two-thirds of its own full-width row, leaving a dead band beside it. |
| 1366: the status line | "… a longer / wait." left one word alone on the last line. |
| 1366 and 390: the link list | Five 1100px-wide rows for 200px labels. Three of the five (Where access is hardest, How to read these numbers, Sources & limitations) repeat the nav. |
| Motion | The links section faded in on scroll, the one scroll-driven reveal on a page that is meant to have none. Choosing another area swapped the card with no feedback. Start had no hover or pending state. |

### What changed

- **One composition.** The page is a two-column grid from 1024px. The headline sits over the area panel in the left column, and step 1 is beside them, spanning both rows. On a phone the order is unchanged: headline, panel, step 1, links.
  - The panel now fits its content, and the headline's dead band is gone.
  - Page height at 1366 went from 1238px to 918px.
  - The divider and "Or look through the data yourself" now peek above the fold at 768px, as a cue that there is more below.
  - The headline stays in the static shell. The tool's parts take their own grid cells, so there is no extra wrapper.
- **Headline** keeps "non-urgent" on one line (`whitespace-nowrap`). It used to break as "non- / urgent".
- **Start button:** the label is left-aligned with the arrow at the right edge, so a two-line label on a phone reads as a sentence rather than a centred block. The label and the line under it use `text-balance`.
- **Status line** in step 1: `text-balance`, so it breaks into two even lines with no lone word.
- **Links: five to two.** "Compare all 22 areas" and "Full page for <area>" are the two places the nav doesn't name. The nav's "Areas" goes to `/`, and the other three are nav items one line above the headline. On a laptop the two sit on one line; on a phone they stack, each 44px tall.
- **Motion and interaction:**
  - The links section is a plain section, with no scroll reveal.
  - Choosing an area plays a quiet `animate-fade-up` (320ms) on the new step-1 card. It plays only on a change, never on load. The `aria-live` wrapper stays mounted, so the change is still announced.
  - Start's arrow nudges 4px forward on hover and keyboard focus.
  - While the briefing loads, the arrow becomes a spinner (`useLinkStatus`). The spinner only turns when motion is allowed.
  - Reduced motion: every animation is off (checked with `document.getAnimations().length === 0` right after load and right after an area change).
- **Files:** `app/page.tsx`, `components/home/area-picker.tsx`, `components/home/briefing-preview.tsx`. No new numbers and no new wording about Finland overall.

### Checked (`next build` + `next start -p 3113`, playwright-core with Chromium 1255)

106 checks passed, 0 failed, before and after the change. The script is in the session scratchpad; it is not committed.

- **Views:** 1366×768 and 390×844, each with and without reduced motion.
- **First screen:** Start is fully on the first screen (bottom edge at 522px of 768 at 1366, and 495–521px of 844 at 390) for **all 22 areas**. Every area has a step-1 card. No sideways scroll for any area at either width.
- **One filled button** on home at both widths.
- **Text:** nothing under 16px in `main` except the 11px step pill.
- **Choosing and starting:**
  - Choosing Kainuu updates the label, `?area=kainuu` and the card.
  - Tab from the list lands on Start with the focus ring showing (`after-1366-focus-start.png`).
  - Enter opens `/briefing/kainuu`, whose title is "Step 1 of …". Browser Back returns to `/?area=kainuu` with Kainuu selected.
  - No page errors.
- **No JavaScript:** `/?area=helsinki` server HTML holds `href="/briefing/helsinki"`, "Step 1 of" and the links.
- **Print:** A4 PDF is 1 page with the figure and source.
- **Verify command:** `npm test` (517/517), `brief:check`, `typecheck`, `lint`, `build`, `check-insights` and `check-hardcoded` all pass.

### Screenshots (`screenshots/round5/`)

`before-*` is the round-4 home on this build, and `after-*` is this pass.

- **First screen:** `-1366.png`, `-390.png`.
- **Full page:** `-1366-full.png`, `-390-full.png`.
- **Reduced motion:** `-*-reduced-full.png`.
- **States:**
  - `-1366-kainuu.png` and `-390-kainuu.png`: an area below Finland overall, drawn in slate.
  - `-1366-focus-start.png`: keyboard focus on Start.
  - `-nojs-1366-full.png`: the page without JavaScript.
  - `-print-media.png`: print media.

### Self-score against the rubric (honest, not a judge)

| Clarity 25% | Ease 25% | Hierarchy 20% | Type & spacing 15% | Motion 10% | Accessibility 5% | Weighted |
|---|---|---|---|---|---|---|
| 9.0 | 9.0 | 9.0 | 9.0 | 8.5 | 9.0 | **8.95** |

- **Clarity +0.5:** two links instead of five, and one composition with no empty block.
- **Hierarchy +0.5:** the headline now introduces the action it sits over, and the eye runs headline → list → Start, with the evidence beside them.
- **Type and spacing +1.0:** no dead green, no hyphen break, no lone word, and a shorter page.
- **Motion +0.5:** feedback on area change, on hover and focus, and while loading, with no scroll reveal.
- **Ease** stays at 9.0, since the flow is unchanged.
- It is a judgement call whether a judge lifts motion to 9; the count-up was removed site-wide, so the page's motion is now only feedback.

### Not changed, and needed from others

- **Print-media emulation clips the caveat's open text** ("…not only cancer-"), before and after alike. Emulated print doesn't fire `beforeprint`, so `PrintExpand` never opens it; a real print should. The CaveatNote is shared (`components/motion/caveat-note.tsx`), so this is not mine to change.

---

*History: the sections below describe the earlier pass on `t3/home-briefing-first-screen`. Where they disagree with Round 5 above (the five links, their scroll fade-in, the count-up), Round 5 is current.*

## What the home page is now

**First screen:**
- The headline.
- One keylime card: "Choose your area", the area list, and the only large filled button on the page, **"Start the 2-minute briefing for <area> →"** (opens `/briefing/<area>`). Under it: "6 short steps · about 2 minutes · ends in a plan you can print for your board". The step count comes from `BRIEFING_STEP_COUNT`; the print claim is step 6 of the briefing ("Open the plan for your board", "Print this briefing").
- Beside it on a laptop, under it on a phone: **the briefing's step 1** for the chosen area, built from the briefing's own model (`buildBriefing(id).stand`):
  - the pill "Step 1 of 6 · Where you stand";
  - the figure counting up once, in the briefing's serif;
  - the statement ("of non-urgent GP visits in … come more than a week after people ask.");
  - one status line with Finland's figure ("30.7 percentage points above Finland's level (54.7%), which is worse.");
  - the source chip;
  - the main caveat as the shared `CaveatNote` ("Read with care: counts visits, not people", with the full limitation behind "Why?").

**Below a rule, headed "Or look through the data yourself":** one link per destination, with hairline rows between them: Compare all 22 areas, Full page for <area>, Where access is hardest, How to read these numbers, Sources & limitations. They fade in once on scroll (`Reveal`, quiet timings).

**Header and nav:**
- "Start the guided briefing" stays in the header on every page except home, where the first screen holds the button. It is a `usePathname` client piece in `site-nav.tsx`.
- The nav reads: Guided briefing (new, first), Areas, Actions, Where access is hardest, Ask the evidence, How to read these numbers, Sources & limitations. It is one line at 1366 and 1440. At 390 it wraps to two lines of short words, all at 16px, with no menu icon.
- Inside a briefing (`/briefing/<area>/…`), the nav's "Actions" now goes to that area's act page, and the area is remembered for the next page, as on county pages.

## Removal pass (team lead: "Is it needed? If it is, is this really the best implementation?")

| Removed or simplified | Why |
|---|---|
| "See all actions" big green button | It competed with the briefing. The nav's "Actions" already goes to the area's act page. |
| Dashboard figure with badge, caption and count-up (bottleneck step) | Replaced by the briefing's step 1, which is always the GP wait, so home and the briefing open on the same figure. |
| The two bars (area vs Finland) in the step-1 card | They repeated the figure. One status line now names Finland's figure. The bars stay in the briefing. |
| "· Vantaa and Kerava, 2025" beside the step pill | Duplicate: the area is in the list and the statement, and the year is on the source chip. |
| The rank sentence ("The highest share of Finland's 22 areas.") | It doesn't change what the reader does before starting. It is on step 1 of the briefing. |
| "Next: where the delay is" under step 1 | It was a second route into the same briefing. Start is the one way in, and step 2 is one press further. |
| The step list beside the Start card | The line under the button already says six steps and where they end. |
| Map of Finland, the area's verdict, the three step cards, Recommended action 1 | The briefing (steps 2 and 4) and the area page show all of them. "Full page for <area>" is the one link to that detail. |
| The recording caveat under the verdict | It qualified the "worse than in 2023" verdict, which is no longer on home. It is still on the county page and in the briefing. |
| "Click an area on the map", the header tagline "For county directors: …" | They described the page itself (the cut-first rule). |
| `components/home/lead-figure.tsx`, `components/home/top-action.tsx` | No longer used anywhere. |
| What-if and early-warning panels | Not on home before either. Their files stay because `/compare` and the act page import them. |

The divider's links repeat three nav items (Where access is hardest, How to read, Sources). I kept them because the lead named them as the list below the divider, and they serve a reader who has scrolled past the nav.

## Click-through (playwright-core with its bundled Chromium; the Playwright MCP was not used)

Script: home → choose area → Start, and home → Start → the briefing's "Next: where the delay is", plus browser Back. It ran for Vantaa and Kerava (delay at the GP), Kainuu (delay at the referral) and Helsinki. Views: 1366×768, 1440×900 and 390×844, each with and without reduced motion. Last run: against `next build` + `next start` after the merge, **216 checks passed, 0 failed**.

- **Start without scrolling:** the button's bottom edge is at 410px of 768 (1366) and 456px of 844 (390).
- **Phone order:** at 390 the button sits directly under the list (list ends at 357px, button starts at 377px) and above the figure (button ends at 456px, figure starts at 626px). No sideways scroll at any width.
- **One large dark-filled button** on home at every width. The header's briefing button is hidden on home and present on briefing pages.
- **Keyboard only:**
  - Tab reaches the list, and the next Tab lands on Start with a visible 2px Forest Ink ring (`after-*-focus-start.png`).
  - Enter opens `/briefing/<area>`, the title reads "Step 1 of 6: Where you stand · Briefing for …", and focus lands on the step's statement (`markArrival` is used, as on `/briefing`).
- **`?area=`:**
  - Choosing an area rewrites the URL to `/?area=<id>` and the button's label and link follow it.
  - Browser Back from the briefing returns to `/?area=<id>` with that area selected.
  - The server HTML of `/?area=helsinki` already holds `href="/briefing/helsinki"`, "Step 1 of", the source, the caveat and the links below the divider. Content is there before any script.
- **"Why?"** opens the full limitation. The figure, its source chip and the short caveat stay visible.
- **Reduced motion:** 0 running animations at load and after scrolling. Every element is at full opacity except the source chips' arrow icons (70% by design).
- **Page errors:** none.
- **Text under 16px on home:** only the step pill (11px eyebrow, the allowed exception) and the site footer's line (14px, not my file).
- **Print** (A4, print media): before, 2 pages. After, 1 page with the headline and the step-1 card (figure, statement, status, source, caveat open). The area list, the button and the link list are `print:hidden` because they do nothing on paper. The map, the steps and the action no longer print from home because they are no longer on home.

## Screenshots (`screenshots/`)

- `before-1366.png`, `before-1440.png`, `before-390.png` (and `-full`), `before-print-media.png`: the frozen home.
- `after-1366.png`, `after-1440.png`, `after-390.png` (and `-full`), `after-print-media.png`: this branch.
- `after-*-focus-start.png`: keyboard focus on Start. `after-1366-why-open.png`: the caveat opened.

## Not verified

- No person, screen reader or real printer. Focus and the live region were checked in the DOM. Print was checked as print-media rendering and PDF.
- Choosing an area was driven with `selectOption`, which is equivalent to choosing with the arrow keys; the arrow keys were not pressed in the list itself.
- `/how-to-read` and `/insights` are linked but were not opened (another branch owns `/how-to-read`).
- No Vercel preview: this branch is pushed once, at the end.

## Needed from others

- **Briefing agent:** the briefing's own Back ("Back: choose another area") and "Leave the briefing" links don't carry the area back to home (`/?area=<id>`). Browser Back does. Also: a heading-level prop on `StepStand` would let home render the real step 1 rather than a composed copy.
- **Foundation agent:**
  - `AnimatedNumber` draws its moving digits over the final text on paper. In print-media rendering, "85.4%" showed a second digit over the "4", on the frozen home too (`before-print-media.png`).
  - The site footer's line is 14px.
