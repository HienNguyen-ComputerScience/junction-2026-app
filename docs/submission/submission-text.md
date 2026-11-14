# FirstLine: text for the hackjunction.app form

Related: `final-description-draft.md` (a newer draft of the description that supersedes it once checked).

Ready to paste. Written 13 Nov 2026 from repo state. Checked again on Sat 14 Nov 18:50 Helsinki against the frozen commit 3bc8bc7 (see the record at the bottom). Anything in `TODO (human)` can only be filled by a person. Before switching to FINAL (Sun 10:00, aim 08:00), re-read the record at the bottom and check the live site once more.

## Project name

FirstLine

## Punchline (max 120 characters; pick one)

1. `See where early cancer care breaks in your Finnish county, and what to do about it on Monday.` (93 characters)
2. `Equal first steps across Finland: GP access and referral data by county, with a source on every number.` (103 characters)
3. `In Vantaa–Kerava 85% of non-urgent GP visits wait over a week. FirstLine shows where yours breaks.` (98 characters)

Recommended: option 1 (no number to keep in sync). Option 3 is the strongest hook but needs the "visits, not people" wording kept exactly.

## Short description (about 60 words)

Whether you get early cancer care in Finland depends on where you live. FirstLine shows a wellbeing services county director where the first step breaks: getting to a GP, or getting from the GP to a specialist. Every number links to its public source (THL Sotkanet), and each bottleneck comes with actions, an owner and a precedent from another country.

## Full description (about 300 words)

**The problem.** In health systems where the GP is the first stop, 75 to 85 percent of cancer patients start at the GP (Vedsted & Olesen, Br J Cancer 2015; Danish and UK data), so the first step of care decides how early cancer is found. That step varies a lot across Finland. In THL's Sotkanet data for 2025, 85.4% of non-urgent GP visits in Vantaa–Kerava took place more than 7 days after the need was assessed. In Päijät-Häme it was 32.7%, and in Finland overall 54.7%. These count visits, not people, and cover all non-urgent GP visits, not only cancer. Yet no one shows a county director where their own pathway breaks.

**Who it is for.** A wellbeing services county director, or a GP in that county. No patient data is used.

**What it does, on three main screens.**
1. *Home:* pick an area from the list or on the map of Finland. One card shows that area's share of non-urgent GP visits that wait over 7 days against Finland's level, one reason line in plain words, and the top recommended action. The page has no ranking.
2. *County pathway:* for one county, the three steps of the pathway as tabs: getting to a GP, GP recognising warning signs, GP to specialist. Each step is marked "Worse than Finland's level" (red), "At or better than Finland's level" (slate) or "No public data" (grey). Step 2 says "Not measured in Finland" and shows what England publishes: the share of cancers first found through an emergency visit (17% in 2024/25, from 10% to 21% by area). A limitations box is always visible. Four Uusimaa areas have no referral figure of their own, so they show the HUS-wide value, labelled as not a county figure. Where recorded GP visits changed by more than 20% from 2023 to 2025, a note says part of the change may be how visits are recorded.
3. *Act:* two or three recommended actions for that bottleneck, shown one at a time ("Action 1 of 3"), each with an owner, a first step, a precedent (for example Denmark's fast-track pathways, UK Rapid Diagnostic Centres, nurse triage) and a source. Under them is a static panel, "The four referral routes a county needs". Each route shows the concerns it covers, what the GP does and the evidence, with links to the guidelines (NICE NG12, Käypä hoito). It says Finland has no national referral criteria yet. It has no symptom input. It is decision support, not diagnosis.

Two more pages: *Compare* ranks all 22 areas by GP wait and by how quickly referrals are processed, and lists the 5 areas getting worse fastest since 2023. *Ask* is the question box.

**Data transparency.** Everything shown comes from a committed snapshot of public data. Every row carries a source, and rows without one are not allowed. An AI model only writes text around fixed numbers, a validator drops any claim whose number or source is not in the snapshot, and the app keeps working if Sotkanet or the model is down.

**The Exa live layer.** Checked data shows where care breaks. Exa shows what is happening about it right now: recent county news (last 12 months, Finnish sources) on each county page, a finder for research papers and Nordic reports under each action, and an Ask page. The Ask page has a question box that answers only from Exa results and says so when nothing is found, and it shows this month's national news. Live finds are labelled "Found live — unverified" and kept apart from our checked evidence table. Each live panel on the question box and the evidence finder has a close button. If live search is down, the app shows saved results with their date.

**What is real and what is planned (14 Nov, frozen commit 3bc8bc7).** Built, merged and live:
- the home page (area list and map, one card with the area's figure, the reason line and the top action), the Compare page (22 areas ranked), the county pathway (three step tabs, a limitations box, the England card for step 2, the recording note) and the act page (actions one at a time, a what-if line, the static panel "The four referral routes a county needs");
- a custom "Page not found" page, and a sources and limitations page organised for a quick read;
- the data snapshot (22 areas plus a Finland row; 11 indicators). Two drive the steps on screen: Sotkanet 6411 (GP wait over 7 days) and 13 (referrals processed within 3 days). The other nine are context only: referrals waiting over 21 days (5033), three cancer-screening attendance rates, occupational-health, public and private doctor visits, and five-year survival for bowel and breast cancer. The evidence table has 14 verified rows;
- on the county page: the county brief (precomputed from the snapshot, with a button to rewrite it with AI) and local news, for all 22 areas;
- on the act page: a "Find more evidence live" button under each recommended action, and the question box, which is also on the home page;
- on the Ask page: the question box and the national news strip;
- a rate limit on live search, and saved demo results, shown with their date, when live search is down;
- the live deploy at firstline-finland.vercel.app, built automatically from the main branch.

Run 4 (before the freeze, deployed site, commit 96ec1e1) and Run 4b (after the freeze, commit 3bc8bc7) clicked the live panels, the question box, the county and act pages and the sources page in a real browser: 13 checks passed, 0 failed, 5 notes, 1 not run (the error page, which cannot be triggered without changing code). Another check on the same build asked 43 questions on the live site and all 43 got a result. Not tested after the freeze: the AI rewrite of the county brief. No public county data exists for whether GPs spot warning signs, cancer stage at diagnosis, or first contacts through work or private care: the app says so instead of guessing. Not planned: treatment access, diagnosis, accounts, patient data.

## Challenges

**AstraZeneca: "Equal Care Across Finland" (main).**
FirstLine targets two of the gaps the AstraZeneca mentor named: how long it takes to see a GP depending on where you live, and how long GP-to-specialist takes. For the third gap, GP recognition of symptoms, there is no public county data. Step 2 says "Not measured in Finland" and shows what England publishes. The act page has a static panel of the four referral routes a county needs, linked to the guidelines. Against the judging criteria in SPEC.md: actionability (30) via actions with owner, first step and precedent; insight (25) via the county-by-county split of where the delay sits; data transparency (20) via a source and year on every number and a visible limitations box; execution (15) and clarity in 2 minutes (10) via three main screens.

**Exa (second).**
Exa finds things a model could not know from training: this week's county news on GP queues, and recent papers behind each recommended action. Results are shown with links and dates, labelled "Found live — unverified" and kept separate from the checked table, which maps to the criteria "use of Exa", "clarity in showing sources" and "usefulness to a specific group" (county directors). The question box runs live on queries judges type themselves, answers only from retrieved items and refuses cleanly when nothing is found.

## Technologies used

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Vercel (hosting, deployed from GitHub), Exa search API, Anthropic Claude API (Claude Haiku for the question box and Claude Sonnet for the county brief, via the Messages API, server-side), THL Sotkanet REST API (data snapshot built with a Node script), GitHub. No database: the app reads a committed JSON snapshot.

## AI tools used

- Claude Code and other coding agents, run through T3 Code, wrote and reviewed most of the code and docs under direction of the team. They coordinated on a pinned GitHub issue (the "board", `tools/board`).
- Claude inside the app, server-side, each with a validator:
  - Claude Haiku answers the question box from Exa results (`lib/exa/answer.ts`).
  - Claude Sonnet writes the AI county brief around fixed snapshot numbers (`lib/brief/generate.ts`, PR #29), with a precomputed fallback.
- Agent Reach (https://github.com/Panniantong/agent-reach), a read-only tool for reading Reddit, YouTube, GitHub and similar sources, was used for research (from README.md).
- Exa API for live search.
- `TODO (human): list any other AI tools each teammate used (name each tool), or confirm none.`

## Pre-existing code and templates

From `README.md` (checked against the repo on 13 Nov):
- The repo was created from the hackathon-agent-board template (https://github.com/azizu06/hackathon-agent-board): `tools/board`, `.claude/hooks/board-*.sh`, the issue template and the base of `AGENTS.md`.
- Agent configuration (`AGENTS.md` project rules, hooks, `scripts/worktree-setup.sh`) was prepared before the event. No app code.
- The app was scaffolded at the event with `create-next-app` 16.4.6 (App Router, TypeScript, Tailwind, ESLint) and `shadcn` 4.23 (`button`, `card`, `badge`, `lib/utils.ts`).
- Open-source libraries from `package.json` (React, Next.js, Tailwind, Base UI, lucide-react and others).
- All application code, the data pipeline, the evidence table and the Exa layer were written at the event.
- `TODO (human): confirm no teammate reused code written before the event, then keep this section as is.`

## Demo link

https://firstline-finland.vercel.app

## Source code link

https://github.com/HienNguyen-ComputerScience/junction-2026-app
The repo is public and has an MIT `LICENSE` at the root (checked in the repo on 14 Nov; the checklist records both). `TODO (human): confirm the repo link opens when logged out.`

## Video link

`TODO (human): public YouTube or Vimeo link, 2:00 or less.` Outline: `docs/pitch/demo-script.md`.

## Source code publicity

`TODO (human): choose the form's option (the guide says the repo must be public or shared by submission).`

## Credit preference

`TODO (human): team's choice on the form.`

## Team contacts (phone numbers and Discord usernames)

`TODO (human): one line per member.` GitHub logins in the repo: HienNguyen-ComputerScience, fraidfax, bestawperna, nabeo11. Do not commit phone numbers.

- `TODO (human): Phương, phone and Discord`
- `TODO (human): Luan (fraidfax), phone and Discord`
- `TODO (human): Tuan (bestawperna), phone and Discord`
- `TODO (human): nabeo11, phone and Discord`

(Team size limit is 4. The mapping of GitHub logins to first names comes from `docs/evidence/` and the PR list; confirm names.)

## Update on Saturday after feature freeze

Checked 14 Nov 18:50 Helsinki against commit 3bc8bc7 (the frozen build, live at https://firstline-finland.vercel.app).

1. "What is real and what is planned": rewritten against README.md and test Run 4b. It now describes the home page, Compare, Ask, the county step tabs, the act page with the four routes panel, the close buttons, the 404 page and the sources page. Not retested after the freeze: the AI rewrite of the county brief.
2. Numbers 85.4%, 32.7%, 54.7% (Sotkanet 6411, 2025): confirmed against `data/values.json` (Vantaa and Kerava 85.4, Päijät-Häme 32.7, Finland 54.7). Run 4b saw the same numbers on the live site.
3. Counts: 14 rows in `data/evidence.json` confirmed. `data/counties.json` has 23 entries: 22 areas plus Finland, confirmed. `data/indicators.json` has 11 indicators. The text now says 11, with two driving the steps and nine as context only.
4. News window and label: `components/exa/county-news.tsx` says "Local news, last 12 months", `national-news.tsx` says "Finland, this month", and `result-list.tsx` shows "Found live — unverified". All match the text. Changed: the national news and question box are on the Ask page, not the home page.
5. Validator and fallback claims: kept. Run 4b tested the saved-results path for county news, national news, evidence and ask with live search switched off locally, and `npm run brief:check` passed 23 checks.
6. Technologies: Supabase removed. There is no Supabase dependency in `package.json` and no use in `app/`, `lib/` or `components/` (only a line in `.env.example` and the team rules). The rest of the list matches `package.json` and the model names in `lib/`.
7. Red-flag helper: removed from the app in PR #127. Every sentence about it is gone from this file. The act page now has a static panel of the four referral routes, and the text says so.
8. Punchline option 3 still works: the "non-urgent GP visits" wording is kept in the description and on screen.
9. Demo link https://firstline-finland.vercel.app is correct. The repo is public with an MIT `LICENSE`. Still human TODO: video link, team contacts, source code publicity setting, credit preference, and the switch from DRAFT to FINAL.
