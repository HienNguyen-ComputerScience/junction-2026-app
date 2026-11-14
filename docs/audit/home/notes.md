# Home page: the guided briefing is the front door

Post-freeze experiment on branch `t3/home-briefing-first-screen`, stacked on `t3/experimental-real-user-audit`. Production is untouched.

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
