# FirstLine: text for the hackjunction.app form

Ready to paste. Written 13 Nov 2026 from repo state; status text updated 14 Nov from test run 2 (commit 18daaeb). Anything in `TODO (human)` can only be filled by a person. Re-check the sentences listed at the bottom after feature freeze (Sat 18:00) and before switching to FINAL (Sun 10:00, aim 08:00).

## Project name

FirstLine

## Punchline (max 120 characters; pick one)

1. `See where early cancer care breaks in your Finnish county, and what to do about it on Monday.` (93 characters)
2. `Equal first steps across Finland: GP access and referral data by county, with a source on every number.` (103 characters)
3. `In Vantaa–Kerava 85% of non-urgent GP visits wait over a week. FirstLine shows where yours breaks.` (98 characters)

Recommended: option 1 (no number to keep in sync). Option 3 is the strongest hook but needs the "visits, not people" wording kept exactly.

## Short description (about 60 words)

Whether you get early cancer care in Finland depends on where you live. FirstLine shows a wellbeing services county director where the first step breaks: getting in to see a GP, or getting from the GP to a specialist. Every number links to its public source (THL Sotkanet), and each bottleneck comes with actions, an owner and a precedent from another country.

## Full description (about 300 words)

**The problem.** In health systems where the GP is the first stop, 75 to 85 percent of cancer patients start at the GP (Vedsted & Olesen, Br J Cancer 2015; Danish and UK data), so the first step of care decides how early cancer is found. That step varies a lot across Finland. In THL's Sotkanet data for 2025, 85.4% of non-urgent GP visits in Vantaa–Kerava took place more than 7 days after the need was assessed. In Päijät-Häme it was 32.7%, and in Finland overall 54.7%. These count visits, not people, and cover all non-urgent GP visits, not only cancer. Yet no one shows a county director where their own pathway breaks.

**Who it is for.** A wellbeing services county director, or a GP in that county. No patient data is used.

**What it does, on three screens.**
1. *County ranking:* all counties ranked by GP wait and by how quickly referrals to specialist care are processed.
2. *County pathway:* for one county, whether the delay sits at getting to a GP or at GP-to-specialist. Stage cards are red, amber or grey (grey means no public data) and a limitations box is always visible.
3. *Act:* two or three recommended actions for that bottleneck, each with an owner, a first step, a precedent (for example Denmark's fast-track pathways, UK Rapid Diagnostic Centres, nurse triage) and a source. A red-flag helper links symptoms to published guideline warning signs. It is decision support, not diagnosis.

**Data transparency.** Everything shown comes from a committed snapshot of public data. Every row carries a source, and rows without one are not allowed. By design, an AI model only writes text around fixed numbers, a validator drops any claim whose number or source is not in the snapshot, and the app keeps working if Sotkanet or the model is down.

**The Exa live layer.** Checked data shows where care breaks. Exa shows what is happening about it right now: recent county news (last 12 months, Finnish sources), a finder for research papers and Nordic reports under each action, and a question box that answers only from Exa results and says "nothing found" when there is none. Live finds are labelled "found live, unverified" and kept apart from our checked evidence table.

**What is real and what is planned (14 Nov, commit 18daaeb).** Built, merged and checked in test run 2:
- the three screens: a county ranking of all 22 areas, a county pathway with red, amber and grey stage cards and a limitations box, and recommended actions with owner, first step, precedent and source;
- the red-flag helper;
- the data snapshot (3 indicators, 22 areas);
- the evidence table (14 verified rows);
- the Exa server endpoints with caching (county news, national news, evidence finder, and a question box with a validator);
- the AI county brief API, with a snapshot validator and a precomputed fallback.

Next: wire the Exa panels, the question box and the AI brief into the screens. They are built as components but not yet shown on a page. The sources and limitations page is in review (PR #10), and county news so far covers the 4 demo counties. Not planned: treatment access, diagnosis, accounts, patient data. `TODO (human): update this paragraph on Saturday after feature freeze to say what actually shipped.`

## Challenges

**AstraZeneca: "Equal Care Across Finland" (main).**
FirstLine targets two of the gaps the AstraZeneca mentor named: how long it takes to see a GP depending on where you live, and how long GP-to-specialist takes. It has a red-flag helper for the third gap, GP recognition of symptoms. Against the judging criteria in SPEC.md: actionability (30) via actions with owner, first step and precedent; insight (25) via the county-by-county split of where the delay sits; data transparency (20) via a source and year on every number and a visible limitations box; execution (15) and clarity in 2 minutes (10) via three screens.

**Exa (second).**
Exa finds things a model could not know from training: this week's county news on GP queues, and recent papers behind each recommended action. Results are shown with links and dates, labelled "found live, unverified" and kept separate from the checked table, which maps to the criteria "use of Exa", "clarity in showing sources" and "usefulness to a specific group" (county directors). The question box runs live on queries judges type themselves, answers only from retrieved items and refuses cleanly when nothing is found.

## Technologies used

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Vercel (hosting), Exa search API, Anthropic Claude API (Claude Haiku for the question box and Claude Sonnet for the county brief, via the Messages API, server-side), THL Sotkanet REST API (data snapshot built with a Node script), GitHub. Supabase is in the agreed stack but is not used so far (no database in the app); remove it from this list unless that changes.

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

`TODO (human): live Vercel URL` (not deployed as far as the repo shows).

## Source code link

https://github.com/HienNguyen-ComputerScience/junction-2026-app
`TODO (human): check the repo is public, or shared with organisers, and add an MIT LICENSE file if the lead agrees (none in the repo on 13 Nov).`

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

Re-check each of these against the deployed app before 08:00 Sunday:

1. The "What is real and what is planned" paragraph. It was updated 14 Nov from test run 2 (commit 18daaeb), when the three screens, the red-flag helper and the brief API were merged. On Saturday, move an item from "Next" to "Built" only if it shows on a page in Run 3:
   - Exa panels, question box and AI brief (not mounted at 18daaeb; issue #32);
   - sources page (PR #10);
   - county news beyond the 4 demo counties (issue #33).
2. The numbers 85.4%, 32.7%, 54.7% (Sotkanet 6411, 2025): compare with `data/values.json` and the app screen.
3. "14 verified rows", "22 counties", "3 indicators": compare with `data/evidence.json` and `data/counties.json` (22 counties plus a Finland row).
4. "Last 12 months" for county news and "found live, unverified" label: match the final UI wording.
5. "Validator drops any claim..." and "works if Sotkanet or the model is down". Both validators and the brief fallback exist behind APIs (`/api/ask`, `/api/brief`, PR #29). Once the brief and question box are on a page, the sentence can say "on screen"; until then keep it as "by design".
6. Technologies list: remove or keep Supabase; add anything new in `package.json`.
7. Red-flag helper sentence: screen 3 shipped with the helper (PR #26, Run 2). Keep the sentence. The helper must link to guidelines, never copy NICE or Käypä hoito text.
8. Punchline option 3 only if the 85% wording is kept as "non-urgent GP visits".
9. Demo link, video link, team contacts and publicity setting (all TODO above).
