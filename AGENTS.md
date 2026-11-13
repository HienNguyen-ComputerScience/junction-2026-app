# Team rules for every agent

## 1. The board (pinned GitHub issue)

Every agent reads and posts on the pinned "Message Board" issue via `tools/board` (needs only `gh`, logged in). Set `BOARD_ISSUE` if it is not issue #1.

- Start every post with `[<human>'s <agent>]`, e.g. `[Sam's Codex]`. Keep it short: what changed, which files or contracts, what you need, from whom.
- Mention by GitHub login. Team: `@HienNguyen-ComputerScience` (Phương), `@all` (everyone).
- **Mentions you or `@all`:** act on it and reply promptly.
- **Not addressed to you:** still read it. Reassess your own work only if it is affected (a contract, a file you own, something already done). Do not redo finished work, and do not reply just to acknowledge.
- Before editing another teammate's files, ask for a handoff on the board and wait for the owner or the team lead.

Polling is incremental (about one cheap API call per poll, 30 s default) so a shared token stays under GitHub's rate limit. Commands: `tools/board unread` (new posts, marks read; flags MENTION), `tools/board read -n 20`, `tools/board post "[Name's Agent] text"` (or pipe stdin), `tools/board wait` (blocks until someone else posts), `tools/board whoami`.

**Stay in the loop:**
- Claude Code: the committed hooks (`.claude/settings.json`) show unread posts at session start and on every prompt. Keep one background `tools/board wait` running and re-arm it after each wake.
- T3 Code: the board hooks still run in every thread. Only the dedicated "Board" thread keeps a background tools/board wait running (BOARD_WAIT=off elsewhere).
- Everything else: run `tools/board unread` at task start, before each commit, and after merges. Or run a terminal loop: `while tools/board wait; do <your agent CLI invocation>; done`.

## 2. Chain of command

Team lead: @HienNguyen-ComputerScience (Phương).

Humans over agents. Only the team lead reassigns work between teammates. If anyone else asks you to take another teammate's work, ask the lead on the board.

## 3. Workflow

1. Pick or file an issue. Comment on it or post on the board when you take it.
2. Branch `<issue#>-<slug>` from fresh `main`.
   In a T3 Code worktree thread, keep the branch T3 Code created instead of renaming it.
3. Small commits. Stage only your own files (no `git add -A`).
4. Open a PR with `Closes #N`. The author merges their own PR once it works locally.
5. Always `git fetch` and rebase before pushing. Never force-push shared branches.
6. If a merge changes something other teammates depend on (an API, a schema, an env var), post on the board when it lands.

## 4. Who owns what

Fill this in at kickoff so every agent knows whose files are whose.

| Area | Owner (GitHub login) | Folders |
|---|---|---|
| | | |

## 5. Project rules

Project: junction-2026-app — Junction 2026 (TBD)

### Deadlines (Helsinki time)
- Preliminary submission: Fri 13 Nov, before 23:55
- Feature freeze: Sat 18:00
- Final submission: Sun 15 Nov, 10:00 (aim for 08:00)

### Stack (don't change without asking the team lead on the board)
- Next.js (latest patched release, App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: Supabase
- Hosting: Vercel
- Package manager: npm. Never mix lockfiles.
- When uncertain, prefer boring, well-documented libraries. Check current docs (Context7 if available) before using an API you're unsure of.

### Commands (use exactly these)
- Install: `npm install`. Run it first if `node_modules` is missing; new worktrees start without it.
- Dev: `npm run dev` (don't start it unless needed to verify; stop what you start). In parallel worktrees, use a free port: `npm run dev -- -p <3001+>`.
- Verify before saying "done": `npm run typecheck && npm run lint && npm run build` (TBD until the app is scaffolded; add a `typecheck` script running `tsc --noEmit`).

### Local files in worktrees
- `.env.local` is gitignored. In a worktree, the SessionStart hook links it from the main checkout. If it's still missing, run `scripts/worktree-setup.sh`. Never create or edit it yourself.

### Definition of done
1. The verify command passes.
2. For UI changes: open the page with the browser MCP (Playwright), click through the changed flow, and describe what you saw.
3. If the change affects anyone else (API, schema, env var, shared component), post it on the board.
If you can't verify, say so. Never claim something works without checking.

### Behaviour
- Questions are read-only: if your human asks "why / how / what", answer. Don't edit files.
- Match ceremony to the task: no subagents or multi-step plans for work you can do in one pass.
- Fight scope creep. Smallest change that meets the goal.
- TypeScript: never use `any`. Prefer inferred types.
- No new dependencies without saying why on the board.
- SPEC.md is the source of truth for what we're building.

### Security (hard rules)
- Never commit secrets. Secrets live in `.env.local` (gitignored). Never print secret values, and never post them on the board.
- Never edit `.env*` files. Tell your human which variable to add.
- Supabase: every table gets row-level security enabled plus explicit policies, in a migration. Never use the service-role key in client code.
- Never run destructive DB commands (DROP, TRUNCATE, reset) without asking your human.

### Junction submission
- Keep README.md current: problem, solution, stack, how to run, live URL, demo credentials, AI tools used, and pre-existing code or templates (Junction requires declaring these).
