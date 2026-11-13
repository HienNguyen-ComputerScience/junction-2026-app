# FirstLine (junction-2026-app)

Junction 2026, AstraZeneca challenge "Equal Care Across Finland". FirstLine shows a wellbeing services county director where the first step of early cancer care breaks down in their county (getting to a GP, or GP to specialist) and what to do about it. See `SPEC.md`.

## Problem
Whether you get early cancer care in Finland depends on where you live, and no one shows a county director where their county's pathway breaks.

## Solution
Three screens, all built from a committed data snapshot (`data/`, see `data/README.md`) in which every number has a source:

1. **County ranking** (`/`): the 21 wellbeing services counties and the City of Helsinki ranked by the share of non-urgent GP visits that come more than 7 days after people ask (Sotkanet 6411), with referral speed (Sotkanet 13) alongside. Every number has a source chip.
2. **County pathway** (`/county/[id]`): where the delay sits (getting to a GP, GP recognising warning signs, GP to specialist), as red / amber / grey stage cards; a limitations box that is always on screen; a plain-language brief for the county director (Claude writes it from the snapshot, a validator drops any claim whose number or source is not in the snapshot, and a precomputed brief is shown otherwise); and local news found live with Exa.
3. **Act** (`/county/[id]/act`): up to three recommended actions for the county's red stages, each with an owner, a first step, a precedent and a checked source, plus a live Exa "find more evidence" panel per action (marked "Found live — unverified"); a red-flag helper for GPs (decision support, runs only in the browser, links to NICE NG12 and Käypä hoito instead of reproducing them); and a question box answered only from live Exa search results.

The question box is also on the ranking page (`/#ask`). Sources and limitations: `/sources`.

## Live demo
URL: https://firstline-nu.vercel.app
Demo credentials: none needed (public, no login).

Hosted on Vercel (project `firstline-finland`), deployed from `main` with the Vercel CLI (`vercel deploy --prod`); it is not auto-deployed on push, so the live site can lag behind `main`.
The AI-written brief and live Exa search need `ANTHROPIC_API_KEY` and `EXA_API_KEY` set in the Vercel project; without them the site shows the precomputed brief and dated cached Exa results.

## Stack
Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, shadcn/ui, hosted on Vercel. Data: a static JSON snapshot of THL Sotkanet, rebuilt by a script. Claude API (brief and Exa answers) and Exa search are called server-side only. No database, no patient data.

## How to run
```bash
npm install
npm run dev                  # http://localhost:3000
```

Optional environment variables in `.env.local` (names only; never commit values):
- `ANTHROPIC_API_KEY`: the AI-written county brief and the written answers in the question box.
- `EXA_API_KEY`: county news, the evidence finder and the question box.

The app works without them: the county brief falls back to the precomputed brief, and the live Exa panels show a clear "unavailable" state while the rest of the page works.

On Windows, `npm run dev` (Turbopack) can crash on some machines. `npm run build && npm run start` works.

Other scripts:
- `npm run data:build`: refetch Sotkanet and rewrite `data/*.json` (fails if any `source_id` does not resolve).
- `npm run brief:check`: checks that the brief validator drops untraceable claims and that the precomputed brief passes it for every area.

Before saying "done": `npm run brief:check && npm run typecheck && npm run lint && npm run build`.

## License
MIT, see [LICENSE](LICENSE).

## Team
Phương (@HienNguyen-ComputerScience)

## Built with AI tools
- Code: written by Claude Code agents directed by the team through T3 Code. The agents coordinate on a pinned GitHub issue (the "board", see `tools/board`).
- In the app: the Claude API writes the county brief (numbers checked against the snapshot by a validator) and the answers in the question box (only from Exa results, with a numbered source per sentence).
- Exa search powers the county news, the evidence finder and the question box.
- Research used Agent Reach (https://github.com/Panniantong/agent-reach), a read-only tool for reading Reddit, YouTube, GitHub and similar sources.

## Pre-existing code and templates
- Repo created from the hackathon-agent-board template (https://github.com/azizu06/hackathon-agent-board): `tools/board`, `.claude/hooks/board-*.sh`, the issue template, and the base of `AGENTS.md`
- Agent configuration (AGENTS.md project rules, hooks, `scripts/worktree-setup.sh`) prepared before the event
- App scaffolded at the event with `create-next-app` 16.4.6 (App Router, TypeScript, Tailwind, ESLint) and `shadcn` 4.23 (`button`, `card`, `badge` in `components/ui/`, `lib/utils.ts`)
- No app code predates the event: all screens, data scripts and components were written during Junction 2026.
