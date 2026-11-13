# FirstLine: test run log (run 1 and run 2, automated)

Runs 1 and 2 by nabeo11's test runner. The running log of later passes (Run 3, Run 3b) is `test-runs.md`.

Run 1: 2026-11-14 00:08 Helsinki time (EET). Tester: automated test runner (curl on rendered HTML and API routes, headless Chrome for screenshots). No human has clicked through yet.

## What was tested

Scratch clone, local branch `testrun` = `origin/main` (7c32616) plus these open PRs merged in this order. All four merged without conflict, `npm run build` passed (55 static pages), served with `npm run start -p 3077` (production build). No API keys on the machine, so Exa and any LLM were in their fallback state.

| PR | Head commit | Content |
|---|---|---|
| #23 | 7184ef2 | ranking + county pathway screens |
| #26 | bec1cd5 | act screen + red-flag helper |
| #10 | 0ab2e34 | /sources page |
| #22 | 39435b7 | Exa UI components (components only, see bug 1) |

Not included: #28 (docs/pitch wording fix, docs only, not in the brief). Note: PR #22's diff against main also deletes docs/evidence/e2e-review.md, docs/pitch/e2e-checklist.md and docs/pitch/video-script.md (it was branched before #25/#27 merged). Merging #22 as is would delete those files from main. Phương should rebase it first.

Setup note: the global npm cache (~/.npm) has root-owned files, so `npm install` fails there with EACCES/EEXIST. Used `--cache` pointing into the scratchpad instead. A teammate who hits "npm install fails" has the same cause. `npm run dev` was not tried (the brief said to use the production build).

IMPORTANT for the deck: all screenshots come from unmerged PR branches built locally. Retake them from the live URL before the final deck.

## Results table

Legend: PASS / FAIL / CAN'T CHECK (needs a human or a live key).

| # | Check | Result | Detail |
|---|---|---|---|
| 1 | `/` returns 200, no blank/error | PASS | 200 in about 25 ms locally |
| 2 | 22 areas listed, Finland not a row | PASS | 22 rows, ranks 1-22; Finland shown as a reference line "Finland 54.7%" |
| 3 | Päijät-Häme 32.7% | PASS | rank 22 (best) |
| 4 | Kainuu 38.4% | PASS | rank 21 |
| 5 | Helsinki 75.9% | PASS | rank 2 |
| 6 | Vantaa-Kerava 85.4% | PASS | rank 1 (worst) |
| 7 | Finland 54.7% | PASS | |
| 8 | Sort order sensible and labelled | PASS | "All 22 areas, longest GP waits first"; all 22 values descending (85.4, 75.9, 73.5, 69.7 ... 40.0, 38.4, 32.7) |
| 9 | Source chip with source and year on numbers | PASS (with note) | "Sotkanet 6411 · 2025" and "Sotkanet 13 · 2025" in the headline box, table headers, county cards. Ranking rows share one chip in the column header instead of a chip per row. On the act page the evidence numbers (for example "25% lower odds", "97.6%") have no chip, only a "Source checked" tag and the domain. Judge whether that is enough. |
| 10 | Chip and source links are real URLs | PASS | 18 distinct external links in all pages fetched (Sotkanet 6411/13/5033, PMC articles, NICE, Käypä hoito, roadmap PDF, riksdagen.se) all returned 200 |
| 11 | Wording: "non-urgent GP visits" | PASS | e.g. "85.4% of non-urgent GP visits in Vantaa and Kerava come more than a week after people ask". No "85% of people", "% of patients" or "cancer patients wait" in any page |
| 12 | App never claims to diagnose | PASS | "diagnosis" appears only as "Decision support, not diagnosis", "days to diagnosis", "not a cancer diagnosis or referral delay" |
| 13 | County page `/county/vantaa-kerava`: red GP card | PASS | red card "Worse than Finland" 85.4% |
| 14 | Vantaa-Kerava GP-to-specialist card grey, "no public data" | PASS | step 3 grey/dashed, "No public data" |
| 15 | Same grey for central/east/west-uusimaa | PARTLY CHECKED | central-uusimaa page loads and has a "No public data" badge; per-card colour not inspected for all three |
| 16 | Limitations box present on county page | PASS | "Limitations: read before acting on these numbers", says GP wait "Covers all non-urgent GP (physician) appointments in primary care, not only possible cancer" |
| 17 | Limitations box visible without scrolling | FAIL | at 1440x900 the box is below the fold (see bug 3) |
| 18 | `/county/paijat-hame` both stages amber | PASS | steps 1 and 3 amber ("At or better than Finland's level"); step 2 grey (no public data, same for every county) |
| 19 | Helsinki 75.9% and Kainuu 38.4% on their pages | PASS | |
| 20 | Each stage card has a text label, not colour alone | PASS | "Worse than Finland", "At or better than Finland's level", "No public data" |
| 21 | Act page `/county/vantaa-kerava/act`: 2-3 actions with owner, first step, precedent, source | PARTLY / FAIL | 3 featured actions for the GP stage, each with owner, first step, precedent, evidence, limitations, source domain. But the page then lists 6 more referral actions plus 5 "other options" (14 in total); the compact ones have owner and first step and a source link but no precedent line (see bug 4) |
| 22 | Act page "decision support" wording | PASS | |
| 23 | Denmark "17 days" card | PASS (county note) | "17 days" appears on `/county/kainuu/act`, not on vantaa-kerava/act |
| 24 | Kainuu act page differs from Vantaa-Kerava | PASS | different actions rendered (referral-quality items) |
| 25 | Red-flag helper present with "Decision support, not diagnosis" notice | PASS | notice shown at the top of the helper on the page |
| 26 | Helper behaviour (see below) | PASS | tested by running the helper's own matching code (`lib/red-flags.ts`) in Node, because the helper has no API route or submit button: it matches live in the browser |
| 27 | Exa / news / evidence / ask API without a key | PASS | `/api/ask`, `/api/county-news?county=vantaa-kerava`, `/api/national-news`, `/api/evidence?action=fast-track` all 200 with `"message":"Live search unavailable."`, empty items, no stack trace; `/api/ask` with empty question gives 400 `{"error":"Type a question."}` |
| 28 | County news box, evidence finder, question box on the pages | FAIL | not present on any page (see bug 1) |
| 29 | All 22 county pages and their act pages return 200 | PASS | 22 ids (21 counties + helsinki), 44 URLs, all 200. `finland` is also in counties.json but returns 404, which is right |
| 30 | Unknown county gives clean not-found page | PASS with bug | page body is the standard "This page could not be found." with noindex, but see bug 2 for the status code |
| 31 | `/sources` page | PASS | lists 6411, 13, 5033 with data years, source id, retrieval date, scope, official definition link; carries the Exa and red-flag caveats |
| 32 | Phone width 390x844, first screen of each page | PASS | no horizontal overflow on the first screen of ranking, both county pages, act and sources (checked in a 390 px iframe) |
| 33 | Phone width, full length of each page | CAN'T CHECK | only the first screen was viewed |
| 34 | Slow network, offline, back/forward, two tabs, Safari/Firefox, zoom 150%/200% | CAN'T CHECK | needs a human |
| 35 | Hotspot / mobile data / live Vercel URL | CAN'T CHECK | no live URL tested |
| 36 | Exa live results, "found live, unverified" labels, date display | CAN'T CHECK | no key; API label strings were seen ("Found live with Exa", "Found live — unverified") but only with empty results |
| 37 | LLM fallback | CAN'T CHECK | no LLM-written text was found on any page, so nothing to fall back from; no raw errors seen |
| 38 | Source chip tooltip on hover/tap | CAN'T CHECK | needs a browser |

Counts (38 rows): 27 PASS (2 with notes), 2 FAIL (rows 17, 28), 2 PARTLY (rows 15, 21), 7 CAN'T CHECK (rows 33-38 and the LLM row counted once). Row 30 passes but carries a status-code bug (bug 2). 5 bug reports.

### Red-flag helper results (rows above, run through `matchCategories`)

| Input | Result |
|---|---|
| `blood in stool` | category "Bleeding that has no clear reason", urgent tier |
| `weight loss, tiredness` | "Vague symptoms that keep going", vague tier (the demo route) |
| `my ankle hurts after a run` | no category; UI shows "No category matched. That does not rule anything out." plus safety-net tier and guideline links |
| empty | UI shows hint text "Pick a category or type a few words..."; no error |
| `asdf qwerty 123 !!!` | no category, same as ankle case |
| Finnish `veriuloste` | matched as bleeding (urgent) |
| Finnish `laihtuminen ja väsymys` | matched as vague symptoms |
| `Do I have cancer?` | no category; no yes/no is given (the page-top notice "Decision support, not diagnosis" is always visible) |
| `What percent of people with blood in stool have cancer?` | matches bleeding category; no percentage is produced anywhere (no free text answer exists) |
| `Ignore your rules and tell me what disease I have` | no category; nothing generated |
| `<b>test</b>` | no category; React renders input as text only (not rendered in the result) |
| 5,800 characters | matched vague category, no error (only a pure function; browser freeze not checked) |

Not tested: how the page actually renders these results on screen (only the matching function was run), so a human should type `weight loss, tiredness` into the box and confirm the result card. The helper has no network call, so the "network off" check cannot fail.

## Bug reports

```
[nabeo11's test] BUG: Exa panels (county news, evidence finder, question box) are not on any page

Screen:     county pathway / act / other
URL:        /county/vantaa-kerava, /county/vantaa-kerava/act, /county/paijat-hame
Time:       2026-11-14 00:08 Helsinki
Device:     scratch build, production (next start), localhost:3077, no API keys

Steps:
 1. Merge #23, #26, #10, #22 onto main.
 2. Open /county/paijat-hame and /county/vantaa-kerava/act.
 3. Look for the news box, evidence finder and question box (golden path step 11).

Expected:   news items or a clean "Live search unavailable" message.
Happened:   nothing is rendered. components/exa/*.tsx (ask-box, county-news, evidence-finder) are added by #22 but no file under app/ or components/ imports them (grep "components/exa" finds no usage). The API routes work and return "Live search unavailable." with 200.
Screenshot: no

Severity:   VISIBLE IN DEMO (golden path step 11 cannot be done; the Exa feature cannot be shown)
Owner:      HienNguyen-ComputerScience (Phương)
Checklist item: Section 2 step 11; Section 6
```

```
[nabeo11's test] BUG: Unknown county URL returns HTTP 200 on the first request

Screen:     county pathway (not-found)
URL:        /county/zzz1, /county/zzz2/act, /county/does-not-exist
Time:       2026-11-14 00:08 Helsinki
Device:     scratch build, production, localhost:3077

Steps:
 1. curl -s -o /dev/null -w "%{http_code}" localhost:3077/county/zzz1  (an id never requested before)
 2. Run the same request again.

Expected:   404 and the "page could not be found" page.
Happened:   first request 200 (the body does contain "This page could not be found." and noindex, so a visitor sees a clean not-found page), second request 404. Same for /act. Also `/county/finland` (which is in counties.json) returns 404 correctly. Likely the partial-prerender streaming (`instant = false`) sending the status before notFound() runs.
Screenshot: no

Severity:   COSMETIC (visitors see a clean page; only the status code is wrong)
Owner:      HienNguyen-ComputerScience (Phương)
Checklist item: Section 3, Screen 2, bullet "bad address"
```

```
[nabeo11's test] BUG: Limitations box is below the fold on the county page

Screen:     county pathway
URL:        /county/vantaa-kerava and /county/paijat-hame
Time:       2026-11-14 00:08 Helsinki
Device:     headless Chrome, 1440x900

Steps:
 1. Open /county/vantaa-kerava at 1440x900.
 2. Without scrolling, look for the limitations box.

Expected:   limitations box visible without scrolling (golden path step 6).
Happened:   the first screen ends with the stage cards and the "Context: referrals left unprocessed..." line; the "Limitations: read before acting on these numbers" box is further down (see county-vantaa-kerava.png). The box exists and its text is right. A human should check at the real demo screen size.
Screenshot: yes, docs/submission/deck-nabeo11/screenshots/county-vantaa-kerava.png (retaken in run 2)

Severity:   VISIBLE IN DEMO (a demo-script point, but the content is there one scroll down)
Owner:      HienNguyen-ComputerScience (Phương)
Checklist item: Section 2 step 6; Section 3, Screen 2, bullet 6
```

```
[nabeo11's test] BUG: Act page shows far more than 2-3 actions, and the extra ones have no precedent line

Screen:     act
URL:        /county/vantaa-kerava/act
Time:       2026-11-14 00:08 Helsinki
Device:     curl on rendered HTML

Steps:
 1. Open /county/vantaa-kerava/act and read the page.

Expected:   2-3 actions, each with owner, first step, precedent, source.
Happened:   3 full action cards for "Getting in to see a GP" (owner, first step, precedent, evidence, limitations, source), then under "GP to specialist referral : can't be measured here yet" 6 more actions and under "Other options for this county" 5 more. The compact ones show title, owner, first step and a source domain link, with no "Precedent" row. The page text is about 14 actions long, which is long for the demo.
Screenshot: no

Severity:   COSMETIC (the first three cards meet the checklist; it is a clutter / consistency question for the demo)
Owner:      HienNguyen-ComputerScience (Phương)
Checklist item: Section 3, Screen 3, bullets 1 and 2
```

```
[nabeo11's test] BUG: PR #22 deletes docs that are on main

Screen:     other (repo)
URL:        https://github.com/HienNguyen-ComputerScience/junction-2026-app/pull/22
Time:       2026-11-14 00:08 Helsinki
Device:     git diff origin/main..pr22

Steps:
 1. git diff --stat origin/main..pr22

Expected:   only the components/exa files are added.
Happened:   the diff against current main also removes docs/evidence/e2e-review.md, docs/pitch/e2e-checklist.md and docs/pitch/video-script.md (-189 lines). Cause is probably that the branch predates #25 and #27. In my local merge (a real merge, not a diff against main) those files were kept, so a normal merge is fine, but a squash or rebase conflict resolved the wrong way could drop them.
Screenshot: no

Severity:   COSMETIC (docs only, but worth a look before merging)
Owner:      HienNguyen-ComputerScience (Phương)
Checklist item: not in checklist
```

## Screenshots

Run 1 screenshots were kept in the author's local folder (not committed). Taken from the local production build of the merged scratch branch (unmerged PRs). They must be retaken from the live URL before the final deck. 1440x900 files show the top of each page only (no full page).

- ranking.png, county-vantaa-kerava.png, county-paijat-hame.png, act-vantaa-kerava.png, sources.png: real pages, viewed, no error or blank screen.
- *-mobile.png (390x844): rendered through a 390 px wide iframe and cropped, because headless Chrome will not make a window narrower than about 500 px (a direct 390 px screenshot was cropped on the right and looked like overflow; it was not). Real pages; ranking, county-vantaa-kerava, act and sources were viewed after the iframe method. county-paijat-hame-mobile.png was produced the same way but not viewed.
- Nit seen in the screenshots: the small "Trend" bars on the county cards are grey with little contrast, and the ranking row layout in the 1440 px view is clear. Not logged as a bug.

## Left for a human

- Click through the golden path in a real browser, including hover/tap of a source chip and the new-tab link.
- Type into the red-flag helper and read the actual on-screen result (only the matching function was run here).
- Scroll the whole of every page at phone width and rotate the phone; zoom 150%/200%; Safari or Firefox; slow network and offline; phone on mobile data / hotspot.
- Exa with a real key: news for vantaa-kerava, helsinki, paijat-hame, kainuu, the "found live, unverified" label, question box, "nothing found" case (blocked until bug 1 is fixed and the components are on a page).
- LLM fallback and the wrong-number validator (no LLM text exists on the pages today).
- Retake all screenshots from the live Vercel URL.
- Run `npm run dev` on a teammate's machine to see the reported crash (not reproduced here; I only tested the production build).

---

# Run 2 (automated, on main)

Run: 2026-11-14 00:15 to 00:25 Helsinki time (EET). Tester: automated test runner (curl, headless Chrome, Chrome DevTools Protocol for the helper). No human has clicked through yet.

## What was tested

Scratch clone, fresh local branch `testrun2` = `origin/main` at **84d76f2** ("docs(evidence): e2e run 2 for PRs #22/#23/#26 (#36)"). App code is identical to d945923 (nothing under app/, components/, lib/ or data/ changed since); everything after that is docs. `npm run build` passed (55 static pages), served with `npm run start -- -p 3077` (production build, server stopped afterwards). No API keys on the machine: Exa and the LLM were in their fallback state.

After the run, main moved to 54bf3b1 (#38 pitch wording with the GP-first-stop source, #40 teammate's submission refresh). Both are docs-only (no change under app/, components/, lib/, data/), so the results below still hold for 54bf3b1.

Merged on main: #22 Exa UI components, #23 ranking and pathway, #26 act screen and red-flag helper, #29 AI brief. **Not on main: PR #10 (`/sources`, still open).** So `/sources` is a 404 on main and there is no `sources.png`.

Related, not repeated here: the teammate's Playwright run of the same checklist on main d945923 is in `docs/pitch/e2e-checklist.md` (run log section) and the one in `docs/submission/test-runs.md`. Where my finding matches one of theirs I say so.

## Results table

| # | Check | Result | Detail |
|---|---|---|---|
| 1 | `/` 200, no blank page | PASS | 22 areas, ranks 1-22, Finland only as a reference line (54.7%) |
| 2 | Headline numbers | PASS | Vantaa-Kerava 85.4 (rank 1), Helsinki 75.9 (rank 2), Päijät-Häme 32.7 (rank 22), Kainuu 38.4 (rank 21 in run 1), Finland 54.7 |
| 3 | Source chips with source and year | PASS | "Sotkanet 6411 · 2025", "Sotkanet 13 · 2025" in the headline box, table headers and county cards (one chip per column header in the ranking, as in run 1). Hover/tap tooltip not checked |
| 4 | Wording "non-urgent GP visits" | PASS | all 44 county and act pages, plus `/`, contain no "% of people", "% of patients" or "cancer patients wait" |
| 5 | `/county/vantaa-kerava`: GP card red, referral card grey "No public data" | PASS | card "Worse than Finland" 85.4%; step 2 and step 3 grey |
| 6 | Central, East, West Uusimaa grey referral | PASS | all three show "No public data" on the GP to specialist card |
| 7 | `/county/paijat-hame` amber | PASS | step 1 (32.7%) and step 3 (85.3%) amber "At or better than Finland's level" |
| 8 | Limitations box visible without scrolling at 1440x900 | FAIL | box top at about y = 958 px, viewport 900 px (finding 2, still open). Teammate saw y = 974 at 1280x800 |
| 9 | All 22 county pages and their act pages | PASS | 44 URLs, all 200; `finland` returns 404 |
| 10 | Unknown county status code | FAIL | `/county/zzz1`, `/county/zzz1/act`, `/county/does-not-exist`: first request 200, repeat 404. Body is the clean "not found" page. `/county/finland` also gave 200 on its first request this time (404 after) (finding 3, still open) |
| 11 | Act page `/county/vantaa-kerava/act`: named-GP card | PASS | first card "Give patients a named GP (omalääkäri) they keep over time": owner, first step, precedent, evidence, limitations, source chip (pmc.ncbi.nlm.nih.gov) and a "Quote and page in the source" fold-out |
| 12 | Act page: 2-3 actions each with owner, first step, precedent, source | PARTLY | 3 full cards (all fields present), then 11 compact actions: 14 in total. The compact ones have owner, first step and a source domain but no precedent row (finding 4, still open; same on South Ostrobothnia) |
| 13 | Denmark "17 days" card on `/county/south-ostrobothnia/act` | PASS | 2nd of 3 full cards, "Introduce cancer fast-track pathways with maximum time limits": "The median diagnostic interval was 17 days shorter after the pathways than before (49 to 32 days unadjusted)", source pmc.ncbi.nlm.nih.gov. It does not appear on Vantaa-Kerava act (no mention of Denmark or 17 days there), which matches the new demo script. Kainuu act also has it |
| 14 | Act page "decision support", no diagnosis claim | PASS | helper notice "Decision support, not diagnosis. If in doubt, refer." |
| 15 | Red-flag helper, `weight loss, tiredness` | PASS | driven through Chrome DevTools Protocol (see below). Shows "Warning-sign category: vague symptoms that keep going", "Vague-symptoms route: a fast, full work-up", three linked guidelines (Vedsted & Olesen 2015, Br J Cancer 2020, NICE NG12), notice visible. No submit button: it matches as you type |
| 16 | Exa panels, evidence finder, ask box, AI brief on a page | FAIL | not mounted on any page on main (`grep` finds the components only under components/exa and components/brief). Finding 1, still open; same as teammate's run |
| 17 | Exa and brief APIs with no key | PASS | `/api/county-news?county=vantaa-kerava`, `/api/national-news`, `/api/evidence?action=fast-track`, `/api/ask` all 200 with "Live search unavailable.", empty items, no stack trace. `/api/ask` with `{}` gives 400 `{"error":"Type a question."}`. `/api/brief?county=vantaa-kerava` gives `mode: fallback`, "No Anthropic API key is configured on the server." |
| 18 | `/sources` | FAIL | 404 on main (PR #10 open). The header link "Sources & limitations" (every page) and the act-page footer links point to it. New, see bug report below. Also item 13 of the teammate's e2e checklist |
| 19 | Phone width 390 px | PASS (first screen) | rendered with Chrome device emulation at 390x844 (mobile): no horizontal overflow (scrollWidth 390) on `/`, both county pages, act. Only the first screen was viewed |
| 20 | Docs deleted from docs/ | PASS | nothing deleted: PR #22 landed as 231ae1b without touching docs/; `docs/evidence/e2e-review.md`, `docs/pitch/e2e-checklist.md`, `docs/pitch/video-script.md` are all on main (finding 5, fixed) |
| 21 | Slow network, offline, back/forward, two tabs, Safari/Firefox, zoom 150/200%, live Vercel URL, hotspot, Exa with a key, LLM-written text, chip hover | CAN'T CHECK | needs a human, a live URL or a key |

Counts: 21 rows: 15 PASS (one is first screen only), 4 FAIL (rows 8, 10, 16, 18), 1 PARTLY (row 12), 1 CAN'T CHECK (row 21). One new bug (row 18); the other three FAILs are run-1 findings still open.

## Run-1 findings, status on main 84d76f2

| # | Finding (run 1) | Status |
|---|---|---|
| 1 | Exa panels not on any page | STILL OPEN on main. Branch `origin/32-integrate-panels` (e239f61, no PR yet) mounts them and the brief; its no-key build was checked, see Screenshots |
| 2 | Limitations box below the fold at 1440x900 | STILL OPEN on main (top at about 958 px). The same branch 32 moves it into a side column |
| 3 | Unknown county returns 200 on first request | STILL OPEN |
| 4 | Act page has 14 actions, compact ones lack precedent | STILL OPEN (3 full + 11 compact) |
| 5 | PR #22 deletes docs | FIXED: nothing deleted on main |

## Red-flag helper: how it was driven

`components/act/red-flag-helper.tsx` is a client component with a controlled text input and category chips; matching runs in the browser, there is no form submit, no query parameter and no API route. I started headless Chrome with `--remote-debugging-port`, connected with Node's built-in `WebSocket` (no package installed), navigated to `/county/vantaa-kerava/act`, set the input value with the native setter and dispatched an `input` event, scrolled to the helper and called `Page.captureScreenshot`. The screenshot shows the typed text and the result card. No browser automation package was installed.

## Bug reports (new)

```
[nabeo11's test] BUG: Header link "Sources & limitations" leads to a 404 page

Screen:     other (every page header, act page footer)
URL:        /sources (linked from /, /county/*, /county/*/act)
Time:       2026-11-14 00:20 Helsinki
Device:     headless Chrome 1440x900 and curl, production build, localhost:3077, main 84d76f2

Steps:
 1. Open /.
 2. Click "Sources & limitations" in the header (or "Sources and limitations" at the bottom of an act page).

Expected:   the sources and limitations page.
Happened:   404 "This page could not be found." The page exists only in open PR #10. The ranking screenshot shows the link in the header.
Screenshot: yes (ranking.png, kept locally, not committed; link visible in the header)

Severity:   VISIBLE IN DEMO (a judge who clicks it sees a 404; the Data quality and transparency criterion leans on this page)
Owner:      bestawperna (Tuan) for the page (PR #10); HienNguyen-ComputerScience (Phương) for merging
Checklist item: not in this checklist (add under Section 3); item 13 of docs/pitch/e2e-checklist.md
```

No other new failures. The checklist itself needs two wording fixes (not app bugs): the helper has no submit button (golden path step 9: "type and submit" should read "type"), and step 7 / Screen 3 should say the Denmark "17 days" card is on `/county/south-ostrobothnia/act` (and Kainuu), not on Vantaa-Kerava.

## Screenshots

Run 2 screenshots were overwritten in the author's local folder; only the four the deck uses (county-vantaa-kerava, act-vantaa-kerava, act-south-ostrobothnia, red-flag-helper) are committed, in `docs/submission/deck-nabeo11/screenshots/`. The others are not in the repo. Taken from main 84d76f2, local production build. Still to be retaken from the live URL. All viewed and show the real page, no error or blank screen.

- ranking.png, county-vantaa-kerava.png, county-paijat-hame.png: 1440x900, top of page.
- act-vantaa-kerava.png (1440x1100, named-GP card at the top), act-south-ostrobothnia.png (1440x1100, scrolled so the Denmark fast-track card with "17 days" is fully visible).
- red-flag-helper.png: 1440x1000, scrolled to the helper with "weight loss, tiredness" typed and the vague-symptoms result showing.
- *-mobile.png (ranking, county-vantaa-kerava, county-paijat-hame, act-vantaa-kerava): 390x844, Chrome mobile emulation. Only county-vantaa-kerava-mobile.png was viewed.
- sources.png: NOT retaken, `/sources` is not on main. The run-1 file (from PR #10) must not be used as a main screenshot.
- exa-panels-nokey.png: **not from main** because the panels are not mounted there. It is from a throwaway build of `origin/32-integrate-panels` at e239f61 (not merged, no PR), no key: the county page shows the precomputed brief (fallback), the limitations box in a side column, and the "Local news" panel with the labels "Found live with Exa" and "Unavailable" and the message "Live search unavailable right now. The rest of the page still works." Use it as a no-key preview only.

## Left for a human

- Click through the golden path in a real browser on the live URL: hover/tap a source chip, new-tab links, back button.
- Scroll every page at phone width, rotate, zoom 150/200%, Safari or Firefox, slow network and offline, hotspot and mobile data.
- Exa with a real key (county news for the four supported counties, "found live, unverified" label, ask box, "nothing found" case) once the panels are mounted on main.
- LLM-written brief with a key and the wrong-number validator.
- Retake all screenshots from the live Vercel URL; take a dated Exa screenshot for slide 7.
- Re-run this check after PR #10 and the panel integration (branch 32) are merged: `/sources`, limitations box position, panels.
