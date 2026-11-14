# Act page: cut to small chunks (post-freeze experiment)

Branch `t3/act-page-small-chunks`, stacked on `t3/experimental-real-user-audit`. Files: `app/county/[id]/act/page.tsx`, `components/act/` (`action-item.tsx`, `action-copy.ts`, `action-story.tsx`, `referral-routes.tsx`; `action-card.tsx` only gains an exported `statisticLine`).

## What the page is now

1. **Opening card** (keylime). The area's delay as one serif statement ("Vantaa and Kerava's delay: getting to a GP"), the figure counting up (85.4%), one caption line ("of GP visits waited over 7 days"), a "Finland 54.7%" pill and the source chip. Then one quiet button, "Why only these actions?", and the primary "Make the action plan for the board".
2. **The actions beside the pathway.** A picture of the three steps (status in words and colour) holds still on the left while the action cards scroll past. The step that the card in the middle of the window works on lights up, with "Action N works here" under it. At 390px the picture sits above the cards and does not stick. Each card (mint) shows only the number, a short title (8 words at most), an "Owner: …" pill, a "Fixes: …" step pill, one why line and the source chip. They reveal in that order (fade and rise, loud level: 500ms, 120ms stagger) and stay. Four buttons per card open in place:
   - "Show the first step";
   - "Show the full description" (the full title, the detail and the full owner line from the data);
   - "Show where it was done and what happened" (precedent, the study figure in plain words with its comparison, the evidence sentence, the figure as the study states it, the quote and page except for NICE, "Source checked" and the chip);
   - "Show what it will not fix" (the limitations).
3. **The plan button again**, alone.
4. **One slate card with three buttons:** "Show the 11 other actions", "Show the four referral routes a county needs", and "Search new research for these actions" (screen only).
5. **Footer row:** Back to the area, Ask the evidence, Sources and limitations.

The short titles, owners and why lines are a mapping in `components/act/action-copy.ts`, condensed from each row's own `action`, `who_implements` and `detail`. The data is unchanged and its full text sits behind "Show the full description".

## Word count (visible before any button is pressed)

The count is scripted on the rendered page at 1366×768, scrolled to the end so every reveal has played. It leaves out navigation, links, buttons, source chips and screen-reader-only text.

| Area | Before (commit 4c519d1 state) | After |
|---|---|---|
| Vantaa and Kerava | 380 | 125 |
| Kainuu | 333 | 119 |
| Central Uusimaa | 385 | 123 |

The 125 words are: the statement, the figure and its caption, "Finland 54.7%", the picture's three steps with their status, "Action N works here", and three cards of title, two pills and a why line.

## What was deleted, and where it lives now

None of these was the only place a caveat, owner or source appears on the site.

| Deleted from the visible page | Where it is now |
|---|---|
| Eyebrow "Path to early cancer care · Vantaan ja Keravan hyvinvointialue" | Deleted; the breadcrumb and H1 say it. The Finnish name is on the area page. |
| "Here are the 3 actions we recommend for it, with who does each and why." | Deleted; it described the page. |
| HUS-wide referral paragraph | Behind "Why only these actions?". Also on the area page's referral step card, in the "can't be measured here yet" group under "Show the 11 other actions", and on the picture as "Only a HUS-wide figure". |
| "The plan has these 3 actions filled in. You add …" | Deleted; the plan page explains itself. |
| "Print or save as PDF" button | Deleted; the plan page prints. The browser's own print of this page still opens every section. |
| "Recommended actions" heading and its subtitle about ordering | The ordering rule (`SELECTION_RULE`) is behind "Why only these actions?". The heading stays for screen readers only. |
| "With these 3 actions, ready to print or download." | Deleted. |
| "Other options" heading and paragraph | The button says it. The group notes ("can't be measured here yet", HUS-wide) are inside. |
| Referral routes heading and intro question | The button says it. "Decision support for the county, not diagnosis" is the first line inside. |
| Web search heading and paragraph about checked and unchecked evidence | "Web results are new and not checked by us" is the first line inside. The results still carry their own "Found live — unverified" mark. |
| "Where the delay sits" step strip with figures and chips (removed in round 1) | The area page's step cards and the plan carry every step figure with its chip. The picture keeps each step's status in words. |
| "What if" panel (removed in round 1) | The plan's target and yearly-pace arithmetic. `components/home/what-if-panel.tsx` is now unused (not my file). |
| Full action title, detail, owner line | "Show the full description". |
| "Source checked" badge | Inside "Show where it was done and what happened". |
| The figure's limitation (indicator text) | Behind "Why only these actions?" as "What the figure covers: …", and on the area page. |
| "GP recognises warning signs: no public data" | Behind "Why only these actions?", on the picture ("No public data") and in the other-actions group. |

## Click-through (dev server, `playwright-core` with its bundled Chromium; the Playwright MCP needs Chrome, which is missing)

Areas: Vantaa and Kerava (HUS-wide referral), Kainuu (referral is the delay) and Central Uusimaa (HUS-wide, no step worse than Finland).

- **1366×768:** the first screen is the opening card only, and each later screen holds at most two chunks (picture plus one card). Screenshots `after/<area>-1366x768-screen1-after.png` and `screen2`, with `before/` twins.
- **Picture follows the reading:** with action 2 in the middle of the window, the lit step is "Getting to a GP … Action 2 works here" (Vantaa and Kerava, Central Uusimaa) and "Referral to a specialist … Action 2 works here" (Kainuu).
- **Keyboard only:** Tab goes breadcrumb, source chip, "Why only these actions?", the plan button, action 1's chip, then "Show the first step" (15 presses from the top, header included). Every stop shows a focus ring. Enter opens it and the label turns to "Hide the first step".
- **390×844, reduced motion:** no sideways scroll (a 2px overflow from the long plan button was found and fixed: the button now wraps). Every Reveal is visible at once, and the picture is static above the cards. The only text under 16px is the shared breadcrumb and Back link (14px; not my files).
- **No JavaScript:** all three cards, the figure and every reveal are visible.
- **Print** (`print` media with the `beforeprint` handler): all 16 sections are open, no "Show …" button is shown, every opened block has its own label, and the picture is not sticky. PDF: `after/vantaa-kerava-print.pdf`.
- No script errors in any run.

## Earlier rounds on this branch

- Round 1 (commit 4c519d1): the actions became a numbered list with depth behind four buttons. The step strip and what-if panel were removed. The referral routes and web search went behind buttons. A nested-disclosure bug was found: an inner "Show …" read "Hide …" while closed, because both use the same `group/show` name. The route evidence links are now always visible, so nothing is nested.
- Round 2 (this commit): the team lead found it still a wall of text. The page was cut to the shape above.

## Needed from others

- `components/motion`: `ScrollStory` and `Chunk` had not landed when this was built. The act page's own version is `components/act/action-story.tsx`. It could move into `components/motion` if the shared one fits.
- `components/motion/disclosure.tsx`: nested Disclosures show the wrong label (shared `group/show` name). Use a unique group name per instance, or document "do not nest".
- `components/ui/frame.tsx`: `FrameDescription` hard-codes `type-caption` (14px), so a `text-base` override loses. This page no longer uses it.
- `components/ui/breadcrumb.tsx`, `components/ui/back-link.tsx`, and the `checked` Badge: 14px text, under the 16px floor.
- `components/exa/evidence-finder.tsx`: "Find more evidence live" (inside the search panel) still uses tech wording; audit 2.4 suggests "Search the web for more studies".
- `components/home/what-if-panel.tsx`: no longer used anywhere; delete it or reuse it.
