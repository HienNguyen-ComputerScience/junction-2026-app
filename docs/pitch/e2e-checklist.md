# FirstLine: e2e demo checklist

Run this twice: before the Sat 18:00 feature freeze, and right before recording the video. It follows `docs/pitch/demo-script.md` screen by screen. Tick pass or fail; if anything fails, post it on the board with the item number.

Setup: fresh `main`, `npm install`, `npm run typecheck && npm run lint && npm run build`, then `npm run dev` (or the live Vercel URL for the video).

| # | Do this | You should see | Pass | Fail |
|---|---|---|---|---|
| 1 | Open `/` (home). | Preset to Vantaa and Kerava: map, verdict, Recommended action 1 with First step, what-if line (30.7 fewer of every 100). Below, "Compare all 22 areas": 21 wellbeing services counties + Helsinki, no "Finland" row. Every number has a source chip. Hover or tap a chip: it names the indicator and year ("THL Sotkanet 6411, 2025"). | [ ] | [ ] |
| 2 | Find Vantaa–Kerava and Päijät-Häme in the ranking. | Vantaa–Kerava **85.4 %**, Päijät-Häme **32.7 %** for GP wait over 7 days, year 2025. If either number differs, stop: the snapshot or the copy is wrong. | [ ] | [ ] |
| 3 | Read any sentence that mentions the 85 % figure (ranking, county page, pitch). | It says "non-urgent GP visits / appointments", never "85 % of people" and never "cancer patients". | [ ] | [ ] |
| 4 | Click Vantaa–Kerava. | `/county/vantaa-kerava`: three step cards. GP access is **red** ("Worse than Finland's level"); step 2 is grey "No public data"; referral shows **74.1%**, "No county figure", "HUS-wide value, not a county figure" (same for East, Central and West Uusimaa). The 8-step pathway strip sits below with the 127 vs 76 line. | [ ] | [ ] |
| 5 | Open `/county/paijat-hame`. | GP access and referral both slate grey-blue, "At or better than Finland's level". | [ ] | [ ] |
| 6 | On any county page, without scrolling or clicking anything. | The limitations box is already visible and says 6411 covers all non-urgent GP appointments, not only possible cancer. | [ ] | [ ] |
| 7 | Click "Recommended actions" on Vantaa–Kerava. | `/county/vantaa-kerava/act`: 2–3 actions for the county's bottleneck (GP access). Each card shows owner, first step, precedent and a source link that opens the real source. The ids come from `evidence.json` (e.g. `ev-gp-continuity`, `ev-gp-nurse-first-contact`). | [ ] | [ ] |
| 8 | Open the Denmark fast-track card (`ev-ref-denmark-cpp`) on a county with a referral bottleneck. | "−17 days median time to diagnosis", the quote, and the link. This is the number said aloud in the pitch. | [ ] | [ ] |
| 9 | Red-flag helper: type "weight loss, tiredness". | The vague-symptoms (non-specific) route appears. The text "decision support, not diagnosis" is on screen. NICE NG12 is **linked**, not quoted at length (short quote at most). | [ ] | [ ] |
| 10 | Turn Wi-Fi off (or DevTools → Network → Offline), reload `/`, a county page and its act page. | All three still render with the same numbers. The Exa panels show a clean "nothing found / offline" message, not an error. | [ ] | [ ] |
| 11 | Turn the network back on; look at any Exa panel (county news, evidence finder, judge question box). | Every live result is labelled **"found live — unverified"** and sits apart from the checked evidence cards. Ask the judge question box something off-topic: a clean "nothing found" (or "The checker removed N sentences…" if every sentence failed the check), never an invented answer. | [ ] | [ ] |
| 12 | DevTools → device toolbar → 375 px wide (iPhone SE). Walk `/` → county → act. | No horizontal scroll, chips and cards wrap, buttons are tappable, limitations box still visible. | [ ] | [ ] |
| 13 | Open `/sources`. | Six indicators with year, scope and a link to the Sotkanet definition; publishers THL and the Finnish Cancer Registry (screening). "Other sources cited on county pages" lists the HUS 2024 report and Kuitunen 2026. The Exa and red-flag caveats. | [ ] | [ ] |
| 14 | Open `/county/does-not-exist`. | A 404 page, not a crash. | [ ] | [ ] |

Video-only extras: browser zoom 100 %, no bookmarks bar, window at 1920×1080, close other tabs. The app is dark-only since PR #85.

## Run log

### 2026-11-14 (early Sat), main 437b33c, automated smoke (curl, no browser)

Not a pass of the checklist. Only status codes and HTML text were checked; nothing was clicked or looked at. Items 1-9, 12, 13 could not pass: those screens are still placeholders (below).

| Command | Result |
|---|---|
| `npm install` | OK (npm audit reports vulnerabilities, not looked at) |
| `npm run typecheck` | pass |
| `npm run lint` | pass (no output) |
| `npm run build` | pass, 54 static pages. The route list has no `/sources`. |

Still placeholders (a "Placeholder" badge and a TODO paragraph, no real content):
- `/` shows "County ranking: TODO" and one link to a sample county. No ranking, no 22 areas, no 85.4 / 32.7, no source chips.
- `/county/[id]` shows "pathway: TODO": no stage cards, no red/amber/grey, no limitations box (the box exists only as TODO text).
- `/county/[id]/act` shows "recommended actions: TODO": no action cards, no red-flag helper.
- `/sources` does not exist yet (404).

| Route / API | Status | Seen |
|---|---|---|
| `/` | 200 | Placeholder only (above). 0 hits for "85.4" and "32.7". |
| `/county/vantaa-kerava` | 200 | Placeholder; heading "Vantaa and Kerava" |
| `/county/paijat-hame` | 200 | Placeholder; heading "Päijät-Häme" |
| `/county/vantaa-kerava/act` | 200 | Placeholder |
| `/sources` | 404 | Page not built (app/sources/ missing) |
| `/county/does-not-exist` | 404 | Proper 404 page, not a 500 |
| "85% of people" / "cancer patients wait" | not found | Only "non-urgent GP visits" appears (in the TODO text). Not a real test: no figure is shown yet. |
| `GET /api/county-news?county=vantaa-kerava` | 200 | freshness `unavailable`, 0 items |
| `GET /api/national-news?days=30` | 200 | freshness `unavailable`, 0 items |
| `GET /api/evidence?action=fast-track` | 200 | freshness `unavailable`, 0 items |
| `POST /api/ask` (GP wait question) | 200 | freshness `unavailable`, answer null, 0 items |
| county-news `kainuu` + `x-exa-simulate-outage: 1` | 200 | freshness `unavailable`, "Live search unavailable.", no stack trace |
| county-news `county=not-a-county` | 404 | JSON error listing the known counties |
| national-news `days=abc` | 200 | Falls back to 30 days |
| `POST /api/ask` with no body / `{}` | 400 / 400 | Clean JSON errors |
| `POST /api/ask` with a 5000-char question | 200 | Accepted; the route cuts the question to 300 characters |

Live Exa results were NOT tested. This worktree had no `EXA_API_KEY` (dev log: "[exa] EXA_API_KEY is not set"), so every API returned the graceful "unavailable" fallback. That covers checklist item 10's API side only. The "found live — unverified" label (item 11) was not checked. Re-run the four API calls with a key before the freeze.

Findings:
- Item 1-9, 12: `/`, the county page and the act page are still placeholders, so the demo cannot be run yet.
- Item 13: `/sources` returns 404 (the page is not merged).
- Item 11: the API labels (county-news "Found live with Exa", evidence "Found live — unverified") differ; the checklist wants "found live — unverified" everywhere. Recheck on the screens once they exist.
- `/api/ask` accepts a 5000-char question with a 200, but the route cuts it to 300 characters before searching (`app/api/ask/route.ts:11`). No problem.
- `/api/county-news` only knows 4 counties (vantaa-kerava, helsinki, paijat-hame, kainuu); the other counties on the ranking will get a 404 from it.

### 2026-11-14 (Sat), main d945923, browser run (Playwright, 1280×800 and 375×812)

Real browser run against `npm run dev` on port 3017. The dev log says `EXA_API_KEY is not set`. The brief API says no Anthropic key is configured. So live Exa results and the AI-written brief were NOT tested.

| Command | Result |
|---|---|
| `npm install` | OK (npm audit reports vulnerabilities, not looked at) |
| `npm run typecheck` | pass |
| `npm run lint` | pass (no output) |
| `npm run build` | pass, 55 static pages. The route list has no `/sources`. |

| # | Result | What I saw |
|---|---|---|
| 1 | pass | 22 rows (21 counties + Helsinki). "Finland 54.7%" appears only as a reference line and in the intro, not as a row. Chips read "Sotkanet 6411 · 2025" and "Sotkanet 13 · 2025" and link to the Sotkanet indicator page. I did not test hover. |
| 2 | pass | Vantaa and Kerava 85.4 % (rank 1), Päijät-Häme 32.7 % (rank 22), both 2025. |
| 3 | pass | Wording is "non-urgent GP visits / appointments". No "% of people" or "cancer patients" on `/` or the county pages. |
| 4 | pass | `/county/vantaa-kerava`: GP access red ("Worse than Finland"), referral grey "No public data" (also step 2, grey). |
| 5 | pass | `/county/paijat-hame`: GP access and referral both amber, "At or better than Finland's level". |
| 6 | fail | The limitations box starts at y = 974 px at 1280×800 (viewport 800). It is below the fold, so it is not visible without scrolling. The page has no AI county brief and no Exa panels (see 11). |
| 7 | partial | `/county/vantaa-kerava/act` has 3 full cards: named GP (ev-gp-continuity), Omaolo triage, GP capacity and named-GP roadmap. Each has owner, first step, precedent, evidence and a "Quote and page in the source" link. Source links open in a new tab; I checked hrefs only (PMC, files.hackjunction.app, nice.org.uk). I opened the act page by URL, not by clicking the link (href confirmed on the county page). The page then lists 7 more referral actions and 4 "other options". That is more than 2–3 on screen. |
| 8 | pass | `/county/south-ostrobothnia/act` shows the Denmark fast-track card under "GP to specialist referral": "The median diagnostic interval was 17 days shorter after the pathways than before (49 to 32 days unadjusted)". It is the 2nd card on the page. |
| 9 | pass | "weight loss, tiredness" gives "Vague symptoms that keep going" with the "Vague-symptoms route". "Decision support, not diagnosis. If in doubt, refer." is on screen. NICE NG12, Käypä hoito and the roadmap are linked; no long quotes. There is no submit button: it matches as you type. `blood in stool` gives "Bleeding that has no clear reason" and "Fast track". The empty field shows a prompt to pick a category. `asdfgh` gives "no category matched. That does not rule anything out" with a safety-net route. Finnish `laihtuminen, väsymys` gives the same vague-symptoms route. |
| 10 | partial | I could not switch the browser offline. Static pages (`/`, county, act) use no network at render time, so they would still show the numbers. With no key, `/api/county-news`, `/api/evidence` and `/api/ask`, and `x-exa-simulate-outage: 1`, all return 200 with "Live search unavailable." and no stack trace. But no Exa panel is shown on any page (see 11), so the clean message is never visible to a user. |
| 11 | fail | `CountyNews`, `EvidenceFinder`, `AskBox` and `CountyBrief` are not imported by any page or component (`app/` and `components/`). None of them is on screen. Labels in the code: evidence finder "Found live — unverified"; county news and ask box "Found live with Exa" (not the wording the checklist wants). API results: off-topic and on-topic `/api/ask` questions both returned `freshness: unavailable`, `answer: null`, "Live search unavailable." (no key, so the off-topic "nothing found" case was not reached). |
| 12 | pass | At 375×812, `/`, county and act: no horizontal scroll (scrollWidth 360 is the viewport minus the scrollbar), no element past the right edge, cards wrap. On the county page the limitations box starts at about y = 1664, so it is not visible without scrolling. 22 links are under 24 px tall (inline text links); not checked further. |
| 13 | fail | `/sources` returns 404. The header link "Sources & limitations" and the act-page footer link "Sources and limitations" point to it. |
| 14 | pass | `/county/does-not-exist` and `/county/does-not-exist/act` both show the site 404 page (status 404), no crash. |

Console: no errors or hydration warnings on any page. The only console errors are the expected 404 resource lines for `/sources` and the two `does-not-exist` URLs.

Also checked: `GET /api/brief?county=vantaa-kerava` returns `mode: fallback`, reason "No Anthropic API key is configured on the server", a headline and claims with source ids; the numbers match the page (85.4 %, 54.7 %, 58.0 % in 2023, 27.4 points). Rank "1 of 22" matches. This is only visible through the API, because no page shows the brief.

Findings:
- Item 11 (all pages): the Exa panels and the AI county brief are merged but not mounted on any screen. The demo and the Exa challenge cannot show them. Mount `CountyNews`, `EvidenceFinder`, `AskBox` and `CountyBrief`, or cut them from the script.
- Item 13 (header and act-page footer links, every page): `/sources` is a 404, and the header link to it is on every page.
- Item 6 (county pages): the limitations box is below the fold at 1280×800 (top at 974 px). The checklist and the demo script expect it visible at once.
- Item 11: label wording differs. County news and ask box say "Found live with Exa"; only the evidence finder says "Found live — unverified".
- Item 7 (`/county/vantaa-kerava/act`): the page is long (3 main cards, 7 referral actions, 4 other options, then the helper). The 2–3 actions are easy to find, but the rest could distract in the 3-minute pitch.

Not tested:
- Live Exa results, the "found live — unverified" label on screen, the off-topic "nothing found" answer: no `EXA_API_KEY`, and the panels are not mounted.
- The AI-written brief: no Anthropic key, and it is not mounted. Only the fallback was read through the API.
- Offline mode in the browser: the Playwright tools here have no offline switch; I used the API outage header instead.
- Chip hover or tap tooltips on `/` (I read the chip text and href only).
- Opening an external source page (not asked, stayed on the site).
- Wi-Fi off, dark mode, 1920×1080 video setup.
