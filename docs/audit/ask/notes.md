# /ask: design pass (judge score 8.1 → target 9.0)

Branch `t3/ask-page-design-polish`. Only `app/ask/**` and `docs/audit/ask/**` changed. Built with `next build`, served with `next start -p 3111`, driven with playwright-core (Chromium 1255) at 1366×768 and 390×844. The example asked was "How long is the wait for a non-urgent GP visit in Vantaa?", answered from the cache.

## What changed and why

| Before | After | Why |
|---|---|---|
| The h1 "Ask the evidence" over a bare box | Breadcrumb, eyebrow "Ask the evidence", serif statement "Ask a question about health care in Finland.", one lede line on what comes back | Same header as `/how-to-read` and `/sources`. The lede says what you get and that web results are new and not checked by us. |
| The field label was screen-reader only, with a search icon in a mint pill and a washed-out disabled "Ask ↑" | A visible "Your question" label, a cream field, and the primary "Ask →" button, always enabled | An admin user sees a labelled form. A greyed button reads as broken. An empty Ask now explains what to type. |
| "Try" and pill chips, with a "FI" box | "Or start with an example" and three plain buttons with a trailing arrow, plus "(in Finnish)" spelled out | The label says what the buttons are, and the code box is gone. |
| Results inside the box under "Searching" / "Results", the live mark in the h1 row, and the news strip's mark beside it | The answer in its own card: "Searching the web" then "Answer", with the live mark and the close button in that card. The examples step aside while an answer is open. | Each unit is framed once and the live mark appears once per unit. With the examples gone, the answer sits right under the box at 390px. |
| Focus fell to `<body>` after an example was clicked (its button was disabled mid-click) | Focus moves to the "Answer" heading (`tabIndex=-1`) when the answer lands, or while loading if focus was lost | Keyboard and screen-reader users land on the result. |
| Source chip and `[n]` citations at 12px | 16px chip (pill, Forest Ink) and 16px underlined `[n]` links | Meets the 16px floor. |
| "Written by AI…" sentence plus a separate caveat paragraph | An eyebrow, "Written by AI from the web sources below", and one caveat sentence: "Read the sources before relying on it. Their numbers can measure something different from the dashboard's (share of GP visits waiting more than 7 days)." | Same honesty in fewer words. |
| Dashboard sentence: "…30.7 points above Finland and worse than…" (from the API) | A display guard on `/ask` rewrites bare `above/below/than Finland` to "… Finland overall" | Follows the wording rule. The real fix belongs in the API text (see below). |
| "Finland, this month" news grid always open (about 600px) | A card titled "Health care news in Finland this month" with its live mark and a quiet "Show the news" | It is secondary to asking, so it is cut first. It is still one click away, framed, not loose. |
| No JavaScript: an inert form and news stuck on "Searching…" | A `<noscript>` hides both and says asking needs JavaScript | Gives a complete static page. |
| Print: an empty input and the live news | Header, lede and the three example questions; live results and news are `print:hidden` (screen-only, per the contract) | Gives a complete paper page. |

Kept unchanged: `/api/ask` and `/api/national-news`, the request body, the three `query` strings (demo-cache keys), the 429 and 400 messages, `LiveMark` ("Found live — unverified · Web results via Exa, saved …"), `Unavailable`, and `ResultList`.

## Numbers

| | Before | After |
|---|---|---|
| Words in `<main>`, idle, desktop / phone | 162 / 162 | 90 / 94 |
| Words, answered (Vantaa), desktop / phone | 471 / 471 | 374 / 382 |
| Page height, idle, desktop / phone | 988 / 1675 px | 1143 / 1470 px |
| Page height, answered, desktop / phone | 1922 / 3361 px | 2023 / 3019 px |
| Text under 16px (excluding 11px eyebrows) | 2 elements at 12px once answered | none |
| Sideways scroll at 390px | none | none |
| Focus after an example click | `<body>` | the "Answer" h2 |
| Console errors | 0 | 0 |

The desktop idle page is taller only because the header gains a breadcrumb and a lede. On desktop, the box, the examples and the first line of the news card all fit on the first screen.

## Screenshots (`screens/`)

- Before: `before-{d,m}-top.png`, `before-{d,m}-full.png`, `before-{d,m}-answer(-full).png`
- After: `after-{d,m}-top.png`, `after-{d,m}-full.png`, `after-{d,m}-answer(-full).png`
- Reduced motion: `after-rm-*` (same layout, nothing animates, same heights)
- No JavaScript: `after-nojs-full.png` (390px). The header is mid-fade in the capture because the shared `Reveal` CSS fade runs without script. That is the shared component's behaviour, the same on `/how-to-read`.
- Print: `after-print.pdf`

## Self-score (rubric weights 25/25/20/15/10/5)

| Clarity | Ease | Hierarchy & consistency | Type & spacing | Motion & interaction | Accessibility | Weighted |
|---|---|---|---|---|---|---|
| 9.0 | 9.0 | 9.0 | 8.5 | 8.5 | 9.0 | **8.9** |

- **Clarity 9.0:** The first screen says what to ask, what comes back and that it is unchecked, then shows a labelled box and three examples.
- **Ease 9.0:** The example click works, and the answer lands under the box with focus on it.
  - On a phone the answer heading is at the fold, so the reader must scroll to read it.
- **Hierarchy 9.0:** The header matches the family, with keylime framed units and a plainly labelled "Show the news".
  - Not 9.5: the answer card nests two inner boxes (the dashboard box and the dashed AI box).
- **Type 8.5:** Text meets the 16px floor and the eyebrows are consistent.
  - Web source titles are Finnish and long, which the page cannot fix.
- **Motion 8.5:** Header and box reveal once, and the shared Disclosure is used.
  - The loading state is static rows, honest but plain.
- **Accessibility 9.0:** Visible label, focus management, `aria-live`, AA tokens, no-JS and print paths.

## For others (not changed here)

1. **API wording (lead):** `getMainReason` text reaching `/api/ask` says "30.7 points above Finland". It should read "above Finland overall". `/ask` patches it for display only.
2. **`components/exa/ask-box.tsx` and `components/exa/national-news.tsx`** are no longer mounted anywhere. Delete them, or keep them for another page.
