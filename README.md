# FirstLine (junction-2026-app)

Junction 2026, AstraZeneca challenge "Equal Care Across Finland". FirstLine shows a wellbeing services county director where the first step of early cancer care breaks down in their county (getting to a GP, or GP to specialist) and what to do about it. See `SPEC.md`.

## Problem
Whether you get early cancer care in Finland depends on where you live, and no one shows a county director where their county's pathway breaks.

## Solution
Five screens, all built from a committed data snapshot (`data/`, see `data/README.md`) in which every number has a source. FirstLine is for county administrators, not for patients or GPs.

1. **Home** (`/`): pick an area from a list or the map. One answer card shows the area's figure against Finland's level and its top action.
2. **Compare** (`/compare`): all areas ranked by the share of non-urgent GP visits that come more than 7 days after people ask (Sotkanet 6411), with referral speed (Sotkanet 13) alongside. Every number has a source chip.
3. **County pathway** (`/county/[id]`): where the delay sits (getting to a GP, GP recognising warning signs, GP to specialist), shown as three steps compared with Finland; a limitations box that is always on screen; a plain-language brief for the county director (Claude writes it from the snapshot, a validator drops any claim whose number or source is not in the snapshot, and a precomputed brief is shown otherwise); and local news found live with Exa.
4. **Act** (`/county/[id]/act`): recommended actions, each with an owner, a first step, a precedent and a checked source, plus a live Exa "find more evidence" panel per action (marked "Found live — unverified"); a what-if that shows how many fewer non-urgent GP visits would wait over 7 days if the area reached a better level (arithmetic on the published shares, not a forecast); and "The four referral routes a county needs", a static panel (decision support, not diagnosis) that links to NICE NG12 and Käypä hoito instead of reproducing them. It has no symptom input.
5. **Ask** (`/ask`): a question box answered only from live Exa search results, with a numbered source for every sentence, plus national cancer-care news.

Sources and limitations: `/sources` (data sources, the evidence behind each recommended action, and what is found live and unverified).

## Live demo
URL: https://firstline-finland.vercel.app
Demo credentials: none needed (public, no login).

Hosted on Vercel (project `firstline-finland`), deployed automatically from `main` through the GitHub integration.
The AI-written brief and live Exa search need `ANTHROPIC_API_KEY` and `EXA_API_KEY` set in the Vercel project. Without `ANTHROPIC_API_KEY` the site shows the precomputed brief. Without `EXA_API_KEY` (or when Exa is down) an Exa panel shows saved results with their date when a committed cache entry exists for that request, and otherwise a clear "unavailable" state.

## Stack
Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, shadcn/ui, hosted on Vercel. Data: a static JSON snapshot of THL Sotkanet, rebuilt by a script. Claude API (brief and Exa answers) and Exa search are called server-side only. No database, no patient data.

## How to run
Needs Node.js 22.18 or later (the tests and `brief:check` load TypeScript files directly).
```bash
npm install
npm run dev                  # http://localhost:3000
```

Optional environment variables in `.env.local` (names only; never commit values):
- `ANTHROPIC_API_KEY`: the AI-written county brief and the written answers in the question box.
- `EXA_API_KEY`: county news, the evidence finder and the question box.

The app works without them: the county brief falls back to the precomputed brief, and an Exa panel shows saved results with their date when a committed cache entry exists for that request (`data/exa-cache/`), otherwise a clear "unavailable" state, while the rest of the page works.

On Windows, `npm run dev` (Turbopack) can crash on some machines. `npm run build && npm run start` works.

Other scripts:
- `npm run data:build`: refetch Sotkanet and rewrite `data/*.json` (fails if any `source_id` does not resolve).
- `npm run brief:check`: checks that the brief validator drops untraceable claims and that the precomputed brief passes it for every area.
- `npm test`: unit tests (ranking, area status, the act page data and what-if, recording caveats, the question-box route and answer checker, Exa relevance, caching and rate limits).
- `npm run exa:prewarm`: fills the Exa caches for the demo questions and county pages (needs `EXA_API_KEY`).

Before saying "done": `npm test && npm run brief:check && npm run typecheck && npm run lint && npm run build`.

## License
MIT, see [LICENSE](LICENSE).

## Team
- @HienNguyen-ComputerScience (Phương): team lead, app, data snapshot, Exa live-search layer
- @fraidfax: evidence table, pitch, video, code review and end-to-end checks
- @bestawperna: sources and limitations page, manual and live-query testing
- @nabeo11: submission, deck, sponsor questions, test runs

## Built with AI tools
- Code: written by Claude Code agents directed by the team through T3 Code. The agents coordinate on a pinned GitHub issue (the "board", see `tools/board`).
- In the app: the Claude API writes the county brief (numbers checked against the snapshot by a validator) and the answers in the question box (only from Exa results, with a numbered source per sentence).
- Exa search powers the county news, the evidence finder and the question box.
- Codex (OpenAI) was also used by a teammate (@bestawperna) for the sources and limitations page and the Exa live-query test plan.
- Research used Agent Reach (https://github.com/Panniantong/agent-reach), a read-only tool for reading Reddit, YouTube, GitHub and similar sources.

## Pre-existing code and templates
- Repo created from the hackathon-agent-board template (https://github.com/azizu06/hackathon-agent-board): `tools/board`, `.claude/hooks/board-*.sh`, the issue template, and the base of `AGENTS.md`
- Agent configuration (AGENTS.md project rules, hooks, `scripts/worktree-setup.sh`) prepared before the event
- App scaffolded at the event with `create-next-app` 16.4.6 (App Router, TypeScript, Tailwind, ESLint) and `shadcn` 4.23 (`button`, `card`, `badge` in `components/ui/`, `lib/utils.ts`)
- Map boundaries: Statistics Finland, wellbeing services counties 2025 (1:4 500 000), CC BY 4.0 (https://stat.fi/en/services/statistical-data-services/geographic-data/statistical-areas/municipality-based-statistical-units), in `components/map/finland-paths.ts`
- No app code predates the event: all screens, data scripts and components were written during Junction 2026.
