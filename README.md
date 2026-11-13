# FirstLine (junction-2026-app)

Junction 2026, AstraZeneca challenge "Equal Care Across Finland". FirstLine shows a wellbeing services county director where the first step of early cancer care breaks down in their county (getting to a GP, or GP to specialist) and what to do about it. See `SPEC.md`.

## Problem
Whether you get early cancer care in Finland depends on where you live, and no one shows a county director where their county's pathway breaks.

## Solution
Three screens: county ranking (`/`), county pathway (`/county/[id]`), recommended actions (`/county/[id]/act`). Every number comes from a committed data snapshot with a source (`data/README.md`). Status: scaffold with placeholder pages.

## Live demo
URL: TBD
Demo credentials: TBD

## Stack
Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, hosted on Vercel. Supabase only if the lead decides we need a database.

## How to run
```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

Before saying "done": `npm run typecheck && npm run lint && npm run build`.

## Team
Phương (@HienNguyen-ComputerScience)

## Built with AI tools
Built by a team directing AI coding agents through T3 Code (Claude Code and others). The agents coordinate on a pinned GitHub issue (the "board", see `tools/board`). Research used Agent Reach (https://github.com/Panniantong/agent-reach), a read-only tool for reading Reddit, YouTube, GitHub and similar sources.

## Pre-existing code and templates
- Repo created from the hackathon-agent-board template (https://github.com/azizu06/hackathon-agent-board): `tools/board`, `.claude/hooks/board-*.sh`, the issue template, and the base of `AGENTS.md`
- Agent configuration (AGENTS.md project rules, hooks, `scripts/worktree-setup.sh`) prepared before the event
- App scaffolded at the event with `create-next-app` 16.4.6 (App Router, TypeScript, Tailwind, ESLint) and `shadcn` 4.23 (`button`, `card`, `badge` in `components/ui/`, `lib/utils.ts`)
- Anything else: TBD
