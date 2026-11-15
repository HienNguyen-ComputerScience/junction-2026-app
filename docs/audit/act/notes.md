# Act page: cut to small chunks (post-freeze experiment)

## Hero rework (round 5, target ≥ 9.0 from the judge's 8.6)

Files: `app/county/[id]/act/page.tsx` and `components/act/action-item.tsx`. Screenshots are in `screenshots/hero-r5/before/` and `screenshots/hero-r5/after/`. Raw measurements are `measure-before.json` and `measure-after3.json`.

**Where the height went (before, 1366×768, Vantaa and Kerava):**
- 201px above the hero (header 122, breadcrumb, `pt-6`, `mt-6`).
- A 497px hero in one column. The h1 was capped at `max-w-[22ch]`, so it wrapped beside "Save or share", and the figure block used only the left half of a 1126px card.
- 82px between the hero and the card.

Shrinking the padding and numeral (R3-02) could only save 17px, because the height came from the one-column stack, not the padding.

**What changed:**
- **Hero, from 1024px:** a two-column grid. The statement sits on the left with "Why only these actions?" under it and "Save or share" at the bottom. The figure block is on the right: numeral, caption, Finland overall pill, source chip and caveat. The columns are 5:6 from 1024px, and from 1280px the figure column is a fixed 36rem.
  - DOM and phone order: h1 → figure → Why → share. Under 1024px the hero is one column in that order.
  - **Changed:** "Save or share" moved from second (beside the title) to last in DOM and Tab order. The keyboard walk at 1366 goes: breadcrumb, source chip, caveat "Why?", "Why only these actions?", "Save or share", then card 1's chip and "Show details". Focus moves from the right column back to the left for the two controls. Every stop shows a focus ring.
- **"Save or share" is the last thing in the hero** at every width, as on the area page. Its menu opens downwards, in flow, at the end of the card.
  - The numeral does not move: y=227 closed, with the menu open, and with Why and the menu both open, at 1366 and at 390. A first try moved it 3–7px. The cause was `FocusGroup`'s `scale(1.02)` on a hero that grows around its centre. `origin-top` on the hero fixes it.
  - The 200px gap under the title is gone.
- **Spacing:** page `pt-6` → `pt-4`, hero `mt-6` → `mt-4`, actions section `mt-8` → `mt-7`, h2 `mb-5` → `mb-4`. The hero's and cards' own padding classes are left alone. Inside a `FocusGroup`, `app/globals.css` sets `[data-focus-item]` padding to `clamp(1.3125rem, 1rem + 1.5vw, 2.625rem)` unlayered, so those classes have no effect.
- **Action card:** `gap-5` → `gap-4`. The reveal has three stagger steps instead of five (title; owner and why; chip and "Show details"), so a card is complete about 0.74s after it scrolls in, not about 0.98s. The scroll-driven reveal itself is kept.
- **Caveat wording (GP figure only):** the caveat now uses the area page's words, "Counts visits, not people; not only cancer", so the same figure carries the same caveat on both pages (R4 noted the mismatch). This copies `components/county/area-lead.tsx`, which the county agent owns. If they reword it, this string should follow. The referral caveat keeps its shorter wording. The area page's longer one wrapped Kainuu's caveat to three rows and cost 24px.

**Kept unchanged:**
- the mint `FocusGroup` cards;
- the trimmed "Show details";
- the two bottom panels;
- every figure and chip, and every caveat's substance (one is reworded, above).

### First-card y (top of `#action-1`, page coordinates)

These are settled, reduced-motion numbers, the judge's state. With motion on, the card is 6px lower: the focus effect scales the unfocused card to 0.96.

| Viewport | Area | Before | After |
|---|---|---|---|
| 1366×768 | Vantaa and Kerava | 780 | **574** (card title ends at 666; owner pill on screen) |
| 1366×768 | Kainuu | 780 | **596** (title ends at 688) |
| 1366×768 | Central Uusimaa (4-line statement) | 828 | **670** (title ends at 762) |
| 1440×800 | Vantaa and Kerava | — | 576 |
| 1280×800 | Vantaa and Kerava | — | 571 |
| 1152×800 | Vantaa and Kerava | — | 630 |
| 1024×800 | Vantaa and Kerava | about 780 (the same one-column hero) | 674 |
| 390×844 | Vantaa and Kerava | 1000 | 972 |
| 390×844 | Kainuu | 918 | 890 |

At 1366×768 the first card's number, title and owner are on the first screen. In a real laptop window of about 650px, the number and title of Vantaa and Kerava's card 1 are visible; its why line still needs one scroll. On a phone, the hero still fills the first screen, because the shared two-row nav takes 170px.

### Checks

Run on `next build` + `next start -p 3124`, with playwright-core 1.65.1 driving its bundled Chromium. The server was stopped by PID.

- **Sideways scroll:** none at 390, 1024, 1152, 1280, 1366 or 1440. That holds with Save or share open, with Why and Save or share both open, and with every `<details>` open.
- **Small text:** none under 16px in `main`.
- **No JavaScript:** all three cards, the figure and every reveal are visible once the CSS entrance has played, and nothing is left at opacity 0. Save or share renders as a button.
- **Print (the `beforeprint` handler plus print media):** all 11 `<details>` are open, none closed. Save or share is hidden, and nothing is faint. The PDF is `after/vantaa-kerava-print.pdf`.
- **Reduced motion:** every item is in place at load. The full pages with everything open are `after/*-all-open-reduced.png`.
- **Console:** no page errors.

### Fact-diff (`main.innerText`, every `<details>` open, Vantaa and Kerava, Kainuu and Central Uusimaa)

The only changed line is the GP caveat short form above, on Vantaa and Kerava and Central Uusimaa. Every number, source chip, limitation and action text is identical. The only move is "Save or share", now at the end of the hero; it is hidden on paper.

### Self-score (rubric weights)

| Clarity 25% | Ease 25% | Hierarchy & consistency 20% | Type & spacing 15% | Motion & interaction 10% | Accessibility 5% | Weighted |
|---|---|---|---|---|---|---|
| 9.0 | 9.0 | 9.0 | 8.5 | 8.5 | 9.0 | **8.9** |

**Why it moves:**
- **Ease:** the first action is on the first screen at 1366.
- **Hierarchy:** the statement and the figure read side by side, as one claim and its evidence. The share menu no longer splits the hero.
- **Consistency:** the GP caveat now matches the area page.
- **Motion:** the card's reveal completes sooner.

**Why it is not a clear 9.0:**
- On a phone the hero still fills the first screen.
- In a 650px laptop window, card 1's why line is below the fold.
- On Central Uusimaa the four-line statement pushes the card to 670.
- Tab order goes right column, then left, for the two hero controls.

Branch `t3/act-page-small-chunks`, stacked on `t3/experimental-real-user-audit`.

Files: `app/county/[id]/act/page.tsx` and `components/act/`:
- `action-item.tsx`
- `action-copy.ts`
- `referral-routes.tsx`
- `action-card.tsx`, which only gains an exported `statisticLine`.

## What the page is now

1. **Opening card** (keylime). It holds:
   - the area's delay as one serif statement ("Vantaa and Kerava's delay: getting to a GP"; an area with no step worse than Finland reads "Central Uusimaa: no step worse than Finland. Closest: getting to a GP");
   - the figure counting up (85.4%) with one caption line ("of non-urgent GP visits waited over 7 days");
   - a "Finland 54.7%" pill and the source chip;
   - the figure's main caveat, always visible as a `CaveatNote` ("Read with care: All non-urgent GP visits, not only cancer"), with the indicator's full limitation behind "Why?";
   - one quiet button, "Why only these actions?", and the primary "Make the action plan for the board".
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

| Area | Before (state at 4c519d1) | Round 2 (cut) | Round 3 (removal pass) | Final |
|---|---|---|---|---|
| Vantaa and Kerava | 380 | 125 | 82 | 83 |
| Kainuu | 333 | 119 | 76 | 76 |
| Central Uusimaa | 385 | 123 | 82 | 87 |

The final count adds "non-urgent" to the caption and names the closest step on areas with no step worse than Finland. The caveat note's own text is in its button and is not counted; it adds about 8 words.

The 82 words of round 3 on Vantaa and Kerava, in full: "Vantaa and Kerava's delay: getting to a GP · 85.4% · of GP visits waited over 7 days · Finland 54.7% · Give every patient a named GP · Owner: Primary care director · A GP who knows the patient notices a new symptom sooner. · Triage contacts with Omaolo, the online checker · Owner: Digital services lead · Frees phone lines and GP slots; urgent cases are routed faster. · Add GP capacity and named GPs county-wide · Owner: STM and the county · Finland's own roadmap names it as the first measure."

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
| The figure's limitation (indicator text) | Always visible in short under the figure ("All non-urgent GP visits, not only cancer"; "When assessment starts, not when the patient is seen" for referrals), with the full text behind its "Why?". Also on the area page. |
| "GP recognises warning signs: no public data" | Behind "Why only these actions?" and in the other-actions group. |

## Click-through

Run on the production build (`next build`, `next start`) with `playwright-core` driving its bundled Chromium; the Playwright MCP needs Chrome, which is missing. Areas: Vantaa and Kerava (HUS-wide referral), Kainuu (referral is the delay) and Central Uusimaa (HUS-wide, no step worse than Finland). The step pill was checked on North Savo.

- **1366×768:** the first screen is the opening card only, and each later screen holds at most one or two action cards. Screenshots are `after/<area>-1366x768-screen1-after.png` and `screen2`, with `before/` twins; the slate card is in `after/<area>-more-card-after.png`.
- **Keyboard only:** Tab goes breadcrumb, source chip, "Why only these actions?", the plan button, action 1's chip, then "Show details" (15 presses from the top, header included). Every stop shows a focus ring. Enter opens it and the label turns to "Hide details".
- **390×844, reduced motion:** no sideways scroll. A 2px overflow from the long plan button was found and fixed; the button now wraps. Every Reveal is visible at once. The only text under 16px is the shared breadcrumb and Back link (14px; not my files).
- **No JavaScript:** all three cards, the figure and every reveal are visible.
- **Print** (`print` media with the `beforeprint` handler): every section is open (7 on Vantaa and Kerava), no "Show …" button is shown, and every part has its own label. The PDF is `after/vantaa-kerava-print.pdf`.
- **Console:** no script errors. The one failed request on every page is the site header's prefetch of `/how-to-read`, a 404 until that page lands (not this page's link).

## Focus effect (shared `FocusGroup`)

The opening card and each action card are `data-focus-item`s in one `FocusGroup`. The end card and "Back to <area>" are outside it. Measured on Vantaa and Kerava with the focus walk script:

- **1366×768, scrolling:** the item in the middle of the window is at 1.0 and the others at 0.8. At the top and bottom of the page everything is at 1.0.
- **Opened or focused items:** an opened card stays at 1.0 while another is in the middle, and so does a card holding keyboard focus.
- **390px:** the others are at 0.85.
- **Reduced motion and print:** every item is at 1.0.
- **No sideways scroll and no script errors.**

The 0.8 floor is the shared component's own, measured for WCAG AA. It is not overridden here.

## Last fixes

- **Opening figure.** Its main caveat is always visible (contract: never behind a button). The captions use the data's words: "non-urgent" for indicator 6411 and "processed" for indicator 13.
- **Areas with no step worse than Finland.** The statement names the closest step, so the figure and actions have a subject.
- **Every area checked.** All 22 areas were fetched and each shows a statement, a figure, a caption, a caveat and three cards. `finland` is the national row and has no act page.
- **Plan button at 390px.** The label overran the button's padding (the class string did not beat `whitespace-nowrap`). It now merges with `cn` and wraps inside the button.

## Earlier rounds on this branch

- **Round 1 (4c519d1):** the actions became a numbered list with depth behind four buttons. The step strip and what-if panel were removed. The referral routes and web search went behind buttons. A nested-disclosure bug was found: an inner "Show …" read "Hide …" while closed, because both use the same `group/show` name. The route evidence links are now always visible, so nothing is nested.
- **Round 2:** the team lead found it still a wall of text. The page was cut to 125 words, with a sticky pathway picture beside the cards and four buttons per card.
- **Round 3:** the removal pass above.
- **Final:** the caveat note, the caption wording and the shared focus effect.

Round-1 screenshots are in `screenshots/round1/`.

## Needed from others

- **`components/motion`:** `ScrollStory`, `Chunk` and `MoreCard` landed after this page was built, and the page does not use them. The picture was removed in the removal pass. `MoreCard` is `print:hidden`, which would drop the referral routes and other actions from paper. If the team wants one look, the slate card here can switch to `MoreCard` once it can print.
- **`components/motion/disclosure.tsx`:** nested Disclosures show the wrong label (shared `group/show` name). Use a unique group name per instance, or document "do not nest".
- **`components/ui/frame.tsx`:** `FrameDescription` hard-codes `type-caption` (14px), so a `text-base` override loses. This page no longer uses it.
- **`components/ui/breadcrumb.tsx`, `components/ui/back-link.tsx` and the `checked` Badge:** 14px text, under the 16px floor.
- **`components/exa/evidence-finder.tsx`:** "Find more evidence live" (inside the search panel) is still tech wording; audit 2.4 suggests "Search the web for more studies".
- **`components/home/what-if-panel.tsx`:** no longer used anywhere; delete it or reuse it.
- **Site header:** "How to read these numbers" links to `/how-to-read`, which returns 404 on this branch.
