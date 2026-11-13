# FirstLine: e2e demo checklist

Run this twice: before the Sat 18:00 feature freeze, and right before recording the video. It follows `docs/pitch/demo-script.md` screen by screen. Tick pass or fail; if anything fails, post it on the board with the item number.

Setup: fresh `main`, `npm install`, `npm run typecheck && npm run lint && npm run build`, then `npm run dev` (or the live Vercel URL for the video).

| # | Do this | You should see | Pass | Fail |
|---|---|---|---|---|
| 1 | Open `/` (county ranking). | 22 areas (21 wellbeing services counties + Helsinki), no "Finland" row in the list. Every number has a source chip. Hover or tap a chip: it names the indicator and year ("THL Sotkanet 6411, 2025"). | [ ] | [ ] |
| 2 | Find Vantaa–Kerava and Päijät-Häme in the ranking. | Vantaa–Kerava **85.4 %**, Päijät-Häme **32.7 %** for GP wait over 7 days, year 2025. If either number differs, stop: the snapshot or the copy is wrong. | [ ] | [ ] |
| 3 | Read any sentence that mentions the 85 % figure (ranking, county page, pitch). | It says "non-urgent GP visits / appointments", never "85 % of people" and never "cancer patients". | [ ] | [ ] |
| 4 | Click Vantaa–Kerava. | `/county/vantaa-kerava`: stage cards for getting to a GP and GP → specialist. GP access is **red**; referral is **grey** with "no public data" (same for East, Central and West Uusimaa). | [ ] | [ ] |
| 5 | Open `/county/paijat-hame`. | GP access and referral both **amber** (at or better than Finland's level, still a wait). | [ ] | [ ] |
| 6 | On any county page, without scrolling or clicking anything. | The limitations box is already visible and says 6411 covers all non-urgent GP appointments, not only possible cancer. | [ ] | [ ] |
| 7 | Click "Recommended actions" on Vantaa–Kerava. | `/county/vantaa-kerava/act`: 2–3 actions for the county's bottleneck (GP access). Each card shows owner, first step, precedent and a source link that opens the real source. The ids come from `evidence.json` (e.g. `ev-gp-continuity`, `ev-gp-nurse-first-contact`). | [ ] | [ ] |
| 8 | Open the Denmark fast-track card (`ev-ref-denmark-cpp`) on a county with a referral bottleneck. | "−17 days median time to diagnosis", the quote, and the link. This is the number said aloud in the pitch. | [ ] | [ ] |
| 9 | Red-flag helper: type "weight loss, tiredness". | The vague-symptoms (non-specific) route appears. The text "decision support, not diagnosis" is on screen. NICE NG12 is **linked**, not quoted at length (short quote at most). | [ ] | [ ] |
| 10 | Turn Wi-Fi off (or DevTools → Network → Offline), reload `/`, a county page and its act page. | All three still render with the same numbers. The Exa panels show a clean "nothing found / offline" message, not an error. | [ ] | [ ] |
| 11 | Turn the network back on; look at any Exa panel (county news, evidence finder, judge question box). | Every live result is labelled **"found live — unverified"** and sits apart from the checked evidence cards. Ask the judge question box something off-topic: a clean "nothing found". | [ ] | [ ] |
| 12 | DevTools → device toolbar → 375 px wide (iPhone SE). Walk `/` → county → act. | No horizontal scroll, chips and cards wrap, buttons are tappable, limitations box still visible. | [ ] | [ ] |
| 13 | Open `/sources` (when PR #10 is in). | The three indicators with year, scope and a link to the THL definition; the Exa and red-flag caveats. | [ ] | [ ] |
| 14 | Open `/county/does-not-exist`. | A 404 page, not a crash. | [ ] | [ ] |

Video-only extras: browser zoom 100 %, no bookmarks bar, light theme, window at 1920×1080, close other tabs.

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
