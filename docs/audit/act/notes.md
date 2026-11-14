# Act page: cut to small chunks (post-freeze experiment)

Branch `t3/act-page-small-chunks`, stacked on `t3/experimental-real-user-audit`.

Files: `app/county/[id]/act/page.tsx` and `components/act/`:
- `action-item.tsx`
- `action-copy.ts`
- `referral-routes.tsx`
- `action-card.tsx`, which only gains an exported `statisticLine`.

## What the page is now

1. **Opening card** (keylime). The area's delay as one serif statement ("Vantaa and Kerava's delay: getting to a GP"), the figure counting up (85.4%), one caption line ("of GP visits waited over 7 days"), a "Finland 54.7%" pill and the source chip. Then one quiet button, "Why only these actions?", and the primary "Make the action plan for the board".
2. **One mint card per action.** Each card reveals in order as it scrolls in: a fade and rise at the loud level (500ms with a 120ms stagger), and each piece stays. The card shows:
   - the number and a short title (8 words at most);
   - an "Owner: …" pill;
   - a "Fixes: …" step pill, only when the actions work on more than one step (for example North Savo);
   - one why line;
   - the source chip;
   - one "Show details" button, which opens in place.

   "Show details" holds:
   - the first step;
   - the action in full (the full title, the detail and the full owner line);
   - where it was done and what happened: the precedent, the study figure with its comparison, the evidence sentence, the figure as the study states it, the quote and page (except for NICE), "Source checked" and the chip;
   - what it will not fix or prove.
3. **The plan button again**, alone.
4. **One slate card with three buttons:**
   - "Show the 11 other actions";
   - "Show the four referral routes a county needs";
   - "Search new research for these actions" (screen only).
5. **"Back to <area>"**.

The short titles, owners and why lines are a mapping in `components/act/action-copy.ts`, condensed from each row's own `action`, `who_implements` and `detail`. The data is unchanged and the full text is in "Show details".

## Word count (visible before any button is pressed)

The count is scripted on the rendered page at 1366×768, scrolled to the end so every reveal has played. It leaves out navigation, links, buttons, source chips and screen-reader-only text.

| Area | Before (state at 4c519d1) | Round 2 (cut) | Round 3 (removal pass, final) |
|---|---|---|---|
| Vantaa and Kerava | 380 | 125 | 82 |
| Kainuu | 333 | 119 | 76 |
| Central Uusimaa | 385 | 123 | 82 |

The 82 words on Vantaa and Kerava, in full: "Vantaa and Kerava's delay: getting to a GP · 85.4% · of GP visits waited over 7 days · Finland 54.7% · Give every patient a named GP · Owner: Primary care director · A GP who knows the patient notices a new symptom sooner. · Triage contacts with Omaolo, the online checker · Owner: Digital services lead · Frees phone lines and GP slots; urgent cases are routed faster. · Add GP capacity and named GPs county-wide · Owner: STM and the county · Finland's own roadmap names it as the first measure."

## Removal pass (round 3: "Is it needed? If it is, is this the best implementation?")

| Element | Decision | Reason |
|---|---|---|
| Four "Show …" buttons per action | One "Show details" | One question ("tell me more about this action") needs one button. The four parts are labelled inside, so paper reads the same. |
| Sticky pathway picture | Removed | The H1 already names the delay. On most areas all three actions lit the same step, so the picture repeated the H1 three times. |
| "Fixes: …" step pill | Shown only when the actions span more than one step | Otherwise it repeats the H1 on every card. Where actions differ (North Savo: two on getting to a GP, one on referral), it is the only thing that tells them apart. |
| "Ask the evidence" and "Sources and limitations" at the bottom | Removed | Both are in the site navigation on every page. |
| "Back to <area>" | Kept | The breadcrumb is at the top of a long page; this is the way back from the bottom. |
| "Print or save as PDF" | Removed | The plan page is the printable document. Browser print still works here and opens every section. |
| Second "Make the action plan" button | Kept | The top one is for the director who already knows; the bottom one is where a reader of the three actions decides. The team lead listed this button as always staying. |
| "Finland 54.7%" pill | Kept | 85.4% means nothing without it. A pill, not a sentence. |
| "Why only these actions?" | Kept, one button | It holds every caveat moved off the page: the selection rule, the HUS-wide note, the GP-recognition data gap, and what the figure covers. |
| Other actions, referral routes, web search | Kept as three buttons in one card | The plan page links here for "all the evidence-backed options". SPEC.md puts the referral routes on the act screen, and the pathway components link to `#referral-routes`. The evidence finder is the Exa layer and appears nowhere else in the app. Each is one button with no heading and no paragraph. |
| Big action number | Kept | It is the order of the list and the anchor the home page links to (`#action-1`). |

## What was deleted from the visible page, and where it lives now

None of these was the only place a caveat, owner or source appears on the site.

| Deleted | Where it is now |
|---|---|
| Eyebrow "Path to early cancer care · Vantaan ja Keravan hyvinvointialue" | Deleted; the breadcrumb and H1 say it. The Finnish name is on the area page. |
| "Here are the 3 actions we recommend for it, with who does each and why." | Deleted; it described the page. |
| HUS-wide referral paragraph | Behind "Why only these actions?". Also on the area page's referral step card, and in the "can't be measured here yet" group under "Show the 11 other actions". |
| "The plan has these 3 actions filled in. You add …" | Deleted; the plan page explains itself. |
| "Recommended actions" heading and its subtitle about ordering | The ordering rule (`SELECTION_RULE`) is behind "Why only these actions?". The heading is kept for screen readers only. |
| "With these 3 actions, ready to print or download." | Deleted. |
| "Other options" heading and paragraph | The button says it. The group notes are inside. |
| Referral routes heading and intro question | The button says it. "Decision support for the county, not diagnosis" is the first line inside. |
| Web search heading and paragraph on checked and unchecked evidence | "Web results are new and not checked by us" is the first line inside, and results carry their own "Found live — unverified" mark. |
| "Where the delay sits" step strip with figures and chips (round 1) | The area page's step cards and the plan carry every step figure with its chip. |
| "What if" panel (round 1) | The plan's target and yearly-pace arithmetic. `components/home/what-if-panel.tsx` is now unused (not my file). |
| Full action title, detail, owner line | "Show details" → "The action in full". |
| "Source checked" badge | "Show details" → "Where it was done and what happened". |
| The figure's limitation (indicator text) | Behind "Why only these actions?" as "What the figure covers: …", and on the area page. |
| "GP recognises warning signs: no public data" | Behind "Why only these actions?" and in the other-actions group. |

## Click-through

Run on the production build (`next build`, `next start`) with `playwright-core` driving its bundled Chromium; the Playwright MCP needs Chrome, which is missing. Areas: Vantaa and Kerava (HUS-wide referral), Kainuu (referral is the delay) and Central Uusimaa (HUS-wide, no step worse than Finland). The step pill was checked on North Savo.

- **1366×768:** the first screen is the opening card only, and each later screen holds at most one or two action cards. Screenshots are `after/<area>-1366x768-screen1-after.png` and `screen2`, with `before/` twins; the slate card is in `after/<area>-more-card-after.png`.
- **Keyboard only:** Tab goes breadcrumb, source chip, "Why only these actions?", the plan button, action 1's chip, then "Show details" (15 presses from the top, header included). Every stop shows a focus ring. Enter opens it and the label turns to "Hide details".
- **390×844, reduced motion:** no sideways scroll. A 2px overflow from the long plan button was found and fixed; the button now wraps. Every Reveal is visible at once. The only text under 16px is the shared breadcrumb and Back link (14px; not my files).
- **No JavaScript:** all three cards, the figure and every reveal are visible.
- **Print** (`print` media with the `beforeprint` handler): every section is open (7 on Vantaa and Kerava), no "Show …" button is shown, and every part has its own label. The PDF is `after/vantaa-kerava-print.pdf`.
- **Console:** no script errors. The one failed request on every page is the site header's prefetch of `/how-to-read`, a 404 until that page lands (not this page's link).

## Earlier rounds on this branch

- **Round 1 (4c519d1):** the actions became a numbered list with depth behind four buttons. The step strip and what-if panel were removed. The referral routes and web search went behind buttons. A nested-disclosure bug was found: an inner "Show …" read "Hide …" while closed, because both use the same `group/show` name. The route evidence links are now always visible, so nothing is nested.
- **Round 2:** the team lead found it still a wall of text. The page was cut to 125 words, with a sticky pathway picture beside the cards and four buttons per card.
- **Round 3 (final):** the removal pass above.

Round-1 screenshots are in `screenshots/round1/`.

## Needed from others

- **`components/motion`:** `ScrollStory`, `Chunk` and `MoreCard` landed after this page was built, and the page does not use them. The picture was removed in the removal pass. `MoreCard` is `print:hidden`, which would drop the referral routes and other actions from paper. If the team wants one look, the slate card here can switch to `MoreCard` once it can print.
- **`components/motion/disclosure.tsx`:** nested Disclosures show the wrong label (shared `group/show` name). Use a unique group name per instance, or document "do not nest".
- **`components/ui/frame.tsx`:** `FrameDescription` hard-codes `type-caption` (14px), so a `text-base` override loses. This page no longer uses it.
- **`components/ui/breadcrumb.tsx`, `components/ui/back-link.tsx` and the `checked` Badge:** 14px text, under the 16px floor.
- **`components/exa/evidence-finder.tsx`:** "Find more evidence live" (inside the search panel) is still tech wording; audit 2.4 suggests "Search the web for more studies".
- **`components/home/what-if-panel.tsx`:** no longer used anywhere; delete it or reuse it.
- **Site header:** "How to read these numbers" links to `/how-to-read`, which returns 404 on this branch.
