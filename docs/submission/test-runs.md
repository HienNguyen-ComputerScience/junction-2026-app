# Test runs

Running log of test passes for FirstLine (junction-2026-app), newest first. Each run records the commit, what was checked, what failed and what is not built yet. Failures are reported as failures. Add a new run above the previous one; do not rewrite old runs.

## How to run a pass

Prerequisites: `node_modules` present (`npm install` if not), and `.env.local` in place with the Exa and LLM keys. Never print or paste key values into this file.

```bash
# 1. Verify (AGENTS.md definition of done)
npm run typecheck && npm run lint && npm run build

# 2. Start the dev server with .env.local in place (free port, stop it afterwards)
npm run dev -- -p 3003

# 3. Pages
curl -s -o /dev/null -w "%{http_code} %{time_total}\n" http://localhost:3003/
#   also: /county/vantaa-kerava  /county/paijat-hame  /county/vantaa-kerava/act  /county/narnia  /sources

# 4. API
curl -s "http://localhost:3003/api/county-news?county=vantaa-kerava"       # also paijat-hame, kainuu, helsinki; unknown -> 404
curl -s  http://localhost:3003/api/national-news
curl -s "http://localhost:3003/api/evidence?action=fast-track"             # also rapid-diagnostic-centres, nurse-triage, gp-recognition, lung-cancer-regional; missing -> 400
curl -s -X POST http://localhost:3003/api/ask -H "content-type: application/json" -d '{"question":"How long do people wait to see a GP in Vantaa?"}'
#   questions: docs/evidence/exa-judge-tests.md (#1, #9, #12, F1, F6); empty question -> 400

# 5. Pre-warm and demo hook
node scripts/exa/prewarm.mjs http://localhost:3003

# 6. Outage switch (add to any request; cached keys still answer, uncached ones degrade)
curl -s -H "x-exa-simulate-outage: 1" "http://localhost:3003/api/evidence?action=fast-track"

# 7. README audit against AGENTS.md "Junction submission" fields; read the dev-server log for warnings

# 8. Stop the server and confirm the port is free
netstat -ano | grep ":3003 " | grep LISTEN      # then: taskkill //PID <pid> //F //T
```

---

## Run 1 — 2026-11-13 21:55–22:05 UTC (23:55–00:05 Helsinki, UTC+2), commit 437b33c

Branch `19-submission-pack` = origin/main. Next.js 16.4.6 (Turbopack), Node 24.14. Dev server on port 3003, stopped afterwards (port confirmed free). Real Exa and LLM keys were loaded for the API checks.

### Results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1a | `npm run typecheck` | Pass | exit 0, 11 s |
| 1b | `npm run lint` | Pass | exit 0, 27 s, no warnings |
| 1c | `npm run build` | Pass | exit 0, 13 s; 54 static pages. Routes: `/`, `/_not-found`, `ƒ /api/ask`, `ƒ /api/county-news`, `ƒ /api/evidence`, `ƒ /api/national-news`, `/county/[id]` (23 counties prerendered), `/county/[id]/act` (23). No `/sources`. |
| 2 | `GET /` | Pass (page loads), placeholder content | 200, 4.6 s cold. `<title>FirstLine`, `<h1>County ranking`, "Placeholder" badge, "TODO: rank wellbeing services counties by GP wait (Sotkanet 6411)...". No ranking, no numbers, no source chips. Header and footer ("Decision support for service planning. Not medical advice. No patient data.") are real. |
| 2 | `GET /county/vantaa-kerava` | Pass (200), placeholder content | 200, 0.76 s cold. `<h1>Vantaa and Kerava: pathway`, "Placeholder" badge, TODO text for stage cards and for the limitations box. Page title is generic "FirstLine". No data from `data/` rendered. |
| 2 | `GET /county/paijat-hame` | Pass (200), placeholder content | 200, 0.06 s. `<h1>Päijät-Häme: pathway`, same placeholder. |
| 2 | `GET /county/vantaa-kerava/act` | Pass (200), placeholder content | 200, 0.67 s cold. `<h1>Vantaa and Kerava: recommended actions`, "TODO: 2–3 actions ... and the red-flag helper". No actions, no evidence, no Exa evidence finder, no red-flag helper. |
| 2 | `GET /county/narnia` | Pass | 404 in 0.08 s, Next.js not-found page. |
| 2 | `GET /sources` | Fail (Not built) | 404. The header link "Sources & limitations" (`components/site-header.tsx`) points to `/sources`, so every page has a dead link. `app/sources/` does not exist yet (owner: bestawperna). |
| 2 | Other pages | n/a | `/county/kainuu` and `/county/helsinki` also 200 with the same placeholder. No other page routes exist (`app/` has only `page.tsx`, `county/[id]/page.tsx`, `county/[id]/act/page.tsx`). |
| 3 | `GET /api/county-news?county=vantaa-kerava` | Pass | 200, 0.48 s cold, live, 8 items, newest 2026-11-02 |
| 3 | `.../county-news?county=paijat-hame` | Pass | 200, 247 ms, live, 8 items, newest 2026-11-10 |
| 3 | `.../county-news?county=kainuu` | Pass (see oddity 3) | 200, 223 ms, live, 8 items, newest 2026-07-07 |
| 3 | `.../county-news?county=helsinki` | Pass | 200, 205 ms, live, 8 items, newest 2026-10-22 |
| 3 | `.../county-news?county=narnia` | Pass | 404 in 8 ms, `Unknown county "narnia"` plus list of valid ids |
| 3 | `GET /api/national-news` | Pass | 200, 288 ms, live, 5 items, newest 2026-11-09 |
| 3 | `/api/evidence?action=fast-track` | Pass | 200, 320 ms, live, 5 items, newest 2021-02-25 |
| 3 | `/api/evidence?action=rapid-diagnostic-centres` | Pass | 200, 208 ms, live, 5 items, newest 2025-07-23 |
| 3 | `/api/evidence?action=nurse-triage` | Pass | 200, 357 ms, live, 5 items, newest 2026-04-08 |
| 3 | `/api/evidence?action=gp-recognition` | Pass | 200, 203 ms, live, 5 items, newest 2022-11-07 |
| 3 | `/api/evidence?action=lung-cancer-regional` | Pass | 200, 196 ms, live, 5 items, newest 2026-04-23 |
| 3 | `/api/evidence` (no action) | Pass | 400 in 7 ms, `Missing ?action=...` with preset list |
| 3 | `POST /api/ask` #1 (GP wait in Vantaa) | Pass | 200, 3.3 s, live, 6 items (newest 2026-06-03), 4 answer sentences each with source indices, 0 dropped, nothingFound=false. First sentence honestly says the sources give no typical wait. |
| 3 | `POST /api/ask` #9 (Helsinki, Finnish) | Pass | 200, 3.2 s, live, 6 items (newest 2023-08-11), 3 sentences, 0 dropped, answered in Finnish. Sources are old (2021, 2023, one June 2026). |
| 3 | `POST /api/ask` #12 (latest cancer news this week) | Pass with oddity | 200, 3.1 s, live, 6 items (newest 2026-11-11), 3 sentences, 1 dropped. Answer written in Finnish to an English question (oddity 4). |
| 3 | `POST /api/ask` F1 (Narnia county) | Pass | 200, 1.1 s, live, nothingFound=true, "Nothing found in the sources.", no answer text |
| 3 | `POST /api/ask` F6 (prompt injection, joke) | Pass | 200, 1.1 s, nothingFound=true, no joke |
| 3 | `POST /api/ask` empty question | Pass | 400 in 14 ms, "Type a question." |
| 3 | Ask cache (F9) | Pass | Repeat of #1: 63 ms, freshness `cache` |
| 4 | `node scripts/exa/prewarm.mjs http://localhost:3003` | Pass | 13 requests, 12 served from cache (7–62 ms), 1 live (the demo-hook question, 3.1 s). Demo-hook line: `Demo hook OK: Keuhkosyövän toteamisessa eroja hyvinvointialueiden välillä - Lääkärilehti https://www.laakarilehti.fi/terveydenhuolto/keuhkosyovan-toteamisessa-eroja-hyvinvointialueiden-valilla/ (found via GET /api/evidence?action=lung-cancer-regional)`. Whole script took 3 s because the earlier checks had already warmed the cache. |
| 5 | Outage switch, cached | Pass | `county-news?county=vantaa-kerava`: 200, `freshness: cache`, 8 items. `national-news`: `cache`, 5 items. `evidence?action=fast-track`: `cache`, 5 items. `ask` #1: `cache`, 6 items, answer intact. |
| 5 | Outage switch, uncached | Pass | `evidence?action=zebra crossing policy`: 200, `freshness: unavailable`, 0 items, "Live search unavailable." `ask` "What is the cancer screening age in Oulu?": 200, `unavailable`, 0 items, nothingFound=false, "Live search unavailable." (no spinner, no 500). |
| 5 | Outage switch on county-news uncached | Not tested | All four known county keys were cached at that point; unknown counties return 404 before search. Covered by the evidence/ask uncached cases. |
| 7 | Dev-server log | Pass | No warnings or errors. Only two `[exa] Simulated Exa outage` info lines (expected, from step 5). All route statuses as recorded above. |

### Not built yet / placeholders

- Screen 1, county ranking (`/`): placeholder. No ranking, no Sotkanet numbers, no source chips on the page.
- Screen 2, county pathway (`/county/[id]`): placeholder. No stage cards (red/amber/grey), no limitations box (only a TODO card), no county-news strip wired to `/api/county-news`.
- Screen 3, act (`/county/[id]/act`): placeholder. No 2–3 actions, no owner / first step / precedent, no Exa evidence finder under each action, no red-flag helper.
- Judge question box: the `/api/ask` endpoint works, but there is no UI for it on any page.
- `/sources` (Sources & limitations): not built; the header links to it (404).
- `SourceChip` and site header/footer components exist (`components/source-chip.tsx`, `components/site-header.tsx`) but are not used for data on any page yet.
- The data snapshot under `data/` is committed and read by `lib/data.ts` (county list), but no page displays its values.
- Per-page `<title>`: every page is just "FirstLine".
- Live URL and demo credentials: TBD (see README audit).

### Failures and oddities

1. **`/sources` returns 404 and every page links to it.** Reproduce: start dev server, open `/`, click "Sources & limitations" in the header, or `curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/sources` returns 404. Fix: build `app/sources/` (bestawperna) or drop the link until it exists.
2. **All three SPEC screens are placeholders at this commit.** Reproduce: open `/`, `/county/vantaa-kerava`, `/county/vantaa-kerava/act`; each shows a "Placeholder" badge and "TODO:" text. Only the Exa API layer is real.
3. **Kainuu county news is older than the probe suggested.** `/api/county-news?county=kainuu` newest item is 2026-07-07; `docs/exa-probe.md` recorded newest 2026-10-30 for Kainuu. Reproduce: `curl -s "http://localhost:3003/api/county-news?county=kainuu"` and read the newest `publishedDate`. Could be result variance in Exa; it still returns 8 items within 12 months. Check before the demo so the Kainuu card does not look stale.
4. **`/api/ask` #12 answers in Finnish to an English question.** Reproduce: POST `{"question":"Latest news on cancer care in Finland this week"}` to `/api/ask`; all 3 sentences are Finnish. Correct sources, but a judge typing English may expect English. #9 (Finnish question, Finnish answer) is correct.
5. **`/api/ask` #1 and #9 sources are mostly old.** #9's newest item is 2023-08-11 and the answer leans on 2021 and 2023 material, labelled by year in the sentences. Not wrong, but weak for a "how long now" question. #1's first sentence correctly says there is no typical wait figure.
6. **Evidence results can be old.** `fast-track` newest 2021-02-25, `gp-recognition` newest 2022-11-07. These are research papers, so age is acceptable, but the UI should show the date next to each item (they are labelled "Found live — unverified" by the API).
7. **Cold page compile times in dev** (`/` 4.6 s, county pages 0.7 s on first hit). Dev-mode only; the production build prerenders these.
8. Not a failure: `npm run typecheck` runs `next typegen`; `npm run build` ran with no env error. No tracked files were modified by `next dev` or `next build` (the only untracked path is `docs/submission/`, written by other agents).

### README audit

Checked `README.md` against the fields in AGENTS.md "Junction submission".

| Required field | Status | Notes |
|---|---|---|
| Problem | Present | One sentence, matches SPEC. |
| Solution | Present, outdated | Describes the 3 screens, then "Status: scaffold with placeholder pages". Accurate today, but must be updated once the screens ship; it does not mention the Exa live-search layer (county news, evidence finder, judge question box) that is already merged. |
| Stack | Present, incomplete | Lists Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Vercel, Supabase (conditional). Missing: Exa API, the Claude LLM for the helper and judge box, Sotkanet snapshot. |
| How to run | Present, incomplete | `npm install`, `cp .env.example .env.local`, `npm run dev`, verify command. Does not name the required variables (`EXA_API_KEY`, LLM key) or mention `node scripts/exa/prewarm.mjs`. `.env.example` exists. |
| Live URL | Missing | "URL: TBD". |
| Demo credentials | Missing | "TBD". The app has no auth (SPEC non-goal), so this should say "none needed" once decided. |
| AI tools used | Present | T3 Code, Claude Code and others; Agent Reach. Does not list the runtime AI use (Claude LLM in the app, Exa) or name other agents (Codex, OpenCode) the teammates use. |
| Pre-existing code and templates | Present, incomplete | Lists hackathon-agent-board template, agent config, `create-next-app`, shadcn. Ends with "Anything else: TBD". |
| Team | Present, incomplete | Lists only Phương; the other teammates (fraidfax, bestawperna, nabeo11) are not named. |
| License (MIT) | Missing | Junction requires MIT licensing; README does not mention it and there is no LICENSE file in the repo root. |

---

## Run 2 — Saturday after feature freeze (Sat 14 Nov, 18:00 Helsinki), commit `<sha>`

Environment: dev / production build / deployed URL: `<...>`

| # | Check | Result (Pass / Fail / Not built) | Evidence |
|---|---|---|---|
| 1 | typecheck / lint / build | | |
| 2 | Pages: `/`, `/county/<id>`, `/county/<id>/act`, `/sources`, unknown county | | |
| 3 | County news x4 + unknown, national news | | |
| 4 | Evidence x5 + missing | | |
| 5 | Ask: #1, #9, #12, F1, F6, empty | | |
| 6 | Prewarm + demo hook | | |
| 7 | Outage switch (cached and uncached) | | |
| 8 | Judge question box UI end to end (click-through) | | |
| 9 | Mobile width check | | |
| 10 | README audit | | |

Not built / placeholders: `<...>`

Failures and oddities (with reproduction steps): `<...>`

## Run 3 — Sunday morning (Sun 15 Nov, before final submission 10:00 Helsinki), commit `<sha>`

Environment: deployed URL `<...>`; submission status DRAFT / FINAL: `<...>`

| # | Check | Result (Pass / Fail / Not built) | Evidence |
|---|---|---|---|
| 1 | Deployed URL loads on a clean browser, no login | | |
| 2 | 3 screens show real data (no "Placeholder" / "TODO") | | |
| 3 | Live Exa queries from the deployed app (county news, evidence, judge box) | | |
| 4 | Outage fallback on the deployed app | | |
| 5 | Demo script walk-through end to end (`docs/pitch/demo-script.md`) | | |
| 6 | README fields complete (problem, solution, stack, run, live URL, credentials, AI tools, pre-existing code, MIT) | | |
| 7 | Project switched DRAFT to FINAL on hackjunction.app | | |

Failures and oddities (with reproduction steps): `<...>`
