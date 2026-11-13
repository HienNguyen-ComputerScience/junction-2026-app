# FirstLine: submission checklist

Owner of this file: nabeo11 (submission). Written from repo state on Fri 13 Nov 2026 (about 22:00 Helsinki). All times are Helsinki time. Nothing here is marked done unless the file exists in the repo; every human step is `TODO (human)`.

Legend for status: **Ready in repo** (content exists, still needs pasting or uploading by a human) · **Draft** (exists, will change) · **TODO (human)** (only a person can do it).

## What is built vs not yet (from git, PRs, issues and test run 2, 14 Nov)

Sources:
- `gh pr list --state all` and `gh issue list --state all` (14 Nov, about 00:20 Helsinki);
- `git log` at commit 18daaeb (main later gained e6661c4, PR #35, docs only);
- [test-runs.md](test-runs.md) Run 2;
- a grep of `app/` for imports of `components/exa` and `components/brief`, which found none (14 Nov).

| Part | State | Where |
|---|---|---|
| Next.js scaffold, shadcn/ui | Merged (PR #4) | `app/`, `components/ui/` |
| Data snapshot: 3 Sotkanet indicators, 22 areas plus Finland, evidence rows | Merged (PR #11, #13) | `data/`, `data/README.md` |
| Evidence table (14 verified rows), red-flag sources, mentor log, demo script | Merged (PR #7); demo script wording fixed (PR #28) | `docs/evidence/`, `docs/pitch/demo-script.md` |
| Exa query plan, judge test set, pitch angle | Merged (PR #5) | `docs/evidence/exa-queries.md`, `docs/evidence/exa-judge-tests.md`, `docs/pitch/exa-angle.md` |
| Source chip and site header | Merged (PR #15) | `components/source-chip.tsx`, `components/site-header.tsx` |
| Exa server layer: `/api/county-news`, `/api/national-news`, `/api/evidence`, `/api/ask` (cache, stale fallback, answer validator) | Merged (PR #16); passes in Run 2 | `lib/exa/`, `app/api/`, `docs/exa-probe.md` |
| Screens 1 and 2 (county ranking, county pathway with stage cards and limitations box) | Merged (PR #23, issue #17 closed); pass in Run 2 | `app/page.tsx`, `app/county/[id]/`, `components/ranking/`, `components/pathway/` |
| Screen 3 (actions plus red-flag helper) | Merged (PR #26, issue #21 closed); passes in Run 2 | `app/county/[id]/act/`, `components/act/` |
| AI county brief API with snapshot validator and fallback | Merged (PR #29, issue #20 closed); `/api/brief` passes in Run 2 | `lib/brief/`, `app/api/brief/` |
| Exa UI panels (county news, evidence finder, question box) | Components merged (PR #22, issue #18 closed). **Not mounted on any page** (Run 2; no import in `app/`) | `components/exa/`; wiring: issue #32 (open) |
| AI brief on the county page | Component exists. **Not mounted on any page** (Run 2; no import in `app/`) | `components/brief/`; wiring: issue #32 (open) |
| County news for all counties | Only the 4 demo counties are accepted (Run 2, oddity 4) | issue #33 (open) |
| Sources and limitations page | In review: issue #9 open, PR #10 open (bestawperna). `/sources` is 404 in Run 2 | `app/sources/` once merged |
| E2E docs and browser run | Merged (PR #25, #27, #35) | `docs/pitch/` |
| Submission pack (this folder) | Merged (PR #30); refresh in progress (issue #31) | `docs/submission/` |
| Live URL (Vercel) | Not deployed as far as the repo shows (README: "URL: TBD") | TODO (human) |
| Pitch video | Not in repo | TODO (human) |

Re-check this table on Saturday before 18:00 (`gh pr list --state all`, `gh issue list --state all`, and Run 3 in [test-runs.md](test-runs.md)).

## 1. Preliminary submission: Fri 13 Nov, 23:59 (aim for 23:30)

Platform: hackjunction.app. Needs a draft project and the chosen challenge. Both can change later.

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [ ] | Create the project as a DRAFT on hackjunction.app | nabeo11 (submission) | Paste from [submission-text.md](submission-text.md): name, punchline, short description | TODO (human) |
| [ ] | Choose challenge: AstraZeneca "Equal Care Across Finland" | nabeo11 | [submission-text.md](submission-text.md) "Challenges" | TODO (human) |
| [ ] | Add Exa as a second challenge (allowed: "multiple challenges") | nabeo11 | [submission-text.md](submission-text.md) "Challenges" | TODO (human); confirm on the form that Exa appears as a challenge |
| [ ] | Confirm the draft saved and the status reads DRAFT | nabeo11 | none | TODO (human) |
| [ ] | Post on the board that the preliminary is in | nabeo11 | `tools/board post` | TODO (human) |

## 2. Before feature freeze: Sat 18:00

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [ ] | Submissions open on the platform (Sat 12:00): open the form and check each field exists | nabeo11 | [submission-text.md](submission-text.md) | TODO (human) |
| [ ] | Ask the sponsor questions at the AstraZeneca and Exa booths; log answers | nabeo11 | [sponsor-questions.md](sponsor-questions.md); answers go to `docs/evidence/mentor-log.md` | Draft |
| [ ] | Attend the Exa workshop (Sat 16:30) | whole team | `docs/junction-2026-guide.md` | TODO (human) |
| [ ] | Merge screens 1 and 2 (issue #17) | HienNguyen-ComputerScience (app) | `app/` | Merged (PR #23); box left for the owner |
| [ ] | Merge screen 3 and red-flag helper (issue #21) | HienNguyen-ComputerScience | `app/` | Merged (PR #26); box left for the owner |
| [ ] | Merge Exa UI panels (PR #22) and mount them, the question box and the AI brief on the pages (issue #32) | HienNguyen-ComputerScience | `app/`, `components/exa/`, `components/brief/` | Draft: components merged (PR #22, #29), not on any page yet (Run 2) |
| [ ] | Merge sources and limitations page (PR #10) | bestawperna | `app/sources/` | Draft: PR open |
| [ ] | Deploy to Vercel and write the live URL into README.md | HienNguyen-ComputerScience (deploy) | `README.md` "Live demo" | TODO (human) |
| [ ] | Decide demo credentials: the app has no accounts, so write "none needed" if still true | HienNguyen-ComputerScience | `README.md` | TODO (human) |
| [ ] | Run the manual test pass on the deployed URL and fill in `test-runs.md` | nabeo11 (test runs) and bestawperna (manual demo testing, Exa live queries) | `docs/submission/test-runs.md` | Draft: Run 2 logged (local dev server, commit 18daaeb); deployed-URL run still to do |
| [ ] | Update the sentences in [submission-text.md](submission-text.md) listed under "Update on Saturday" | nabeo11 | [submission-text.md](submission-text.md) | Draft |
| [ ] | Pick the freshest real news item for the demo county and screenshot it with the date visible | fraidfax (pitch) | `docs/pitch/exa-angle.md` prep checklist | TODO (human) |
| [ ] | Feature freeze at 18:00: after this, only fixes | all | `AGENTS.md` | n/a |

## 3. Final submission: Sun 15 Nov, 10:00 (aim for 08:00)

The form closes automatically at 10:00, with no late entries. The project must be switched from DRAFT to FINAL or it is not reviewed.

Mirrors the "Final submission checklist" in [docs/junction-2026-guide.md](../junction-2026-guide.md) and the "Junction submission" rules in `AGENTS.md`.

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [ ] | Project name, punchline, description | nabeo11 | [submission-text.md](submission-text.md) | Draft |
| [ ] | Challenge(s): AstraZeneca main, Exa second | nabeo11 | [submission-text.md](submission-text.md) | Ready in repo |
| [ ] | Technologies used | nabeo11 | [submission-text.md](submission-text.md) | Ready in repo; re-check against `package.json` on Sunday |
| [ ] | 2-minute pitch video, public (YouTube or Vimeo), not a second over | fraidfax (pitch, video) | Outline: [../pitch/demo-script.md](../pitch/demo-script.md) "2:00 video outline"; Exa beat: [../pitch/exa-angle.md](../pitch/exa-angle.md) | TODO (human): record, upload, set public, check length is 2:00 or less |
| [ ] | Record the video only after re-running Exa on Sunday morning so the "this week" item is real | fraidfax | [../pitch/exa-angle.md](../pitch/exa-angle.md) | TODO (human) |
| [ ] | Demo link (live URL opens for someone not logged in anywhere) | HienNguyen-ComputerScience | `README.md` "Live demo" | TODO (human) |
| [ ] | Source code link: https://github.com/HienNguyen-ComputerScience/junction-2026-app | nabeo11 | `git remote get-url origin` | Ready in repo |
| [ ] | Repo is public, or shared so organisers can open it; all submissions are MIT-licensed | HienNguyen-ComputerScience | Repo settings. No `LICENSE` file found in the repo (checked 13 Nov) | TODO (human): make repo public and add an MIT `LICENSE` if the lead agrees |
| [ ] | Source code publicity setting on the form | nabeo11 | [submission-text.md](submission-text.md) | TODO (human) |
| [ ] | Credit preference on the form | nabeo11 | [submission-text.md](submission-text.md) | TODO (human) |
| [ ] | Pitch deck as PDF | nabeo11 (deck) | `docs/submission/firstline-deck.pdf` (source `deck.html`, notes `deck-notes.md`) | Draft v2 in repo (real screenshots from commit 18daaeb); retake screenshots and re-check numbers after the freeze, then remove the "Draft" footer |
| [ ] | Team phone numbers and Discord usernames | nabeo11 | Collect from each member; never commit them to the repo | TODO (human) |
| [ ] | Set status to FINAL | nabeo11 | none | TODO (human) |
| [ ] | Re-open the submitted project and check every field saved | nabeo11 | none | TODO (human) |
| [ ] | README.md current: problem, solution, stack, how to run, live URL, demo credentials, AI tools used, pre-existing code and templates (Junction requires declaring these) | HienNguyen-ComputerScience (README) | `README.md`. Live URL, credentials and "Team" (only one name listed) are still TBD | Draft |
| [ ] | No code written before the event; pre-existing items declared | all | `README.md` "Pre-existing code and templates"; [submission-text.md](submission-text.md) | Ready in repo |
| [ ] | No secrets committed; `.env.local` stays local | all | `AGENTS.md` Security | TODO (human): last scan before Sunday 08:00 |
| [ ] | Pitch video is 2:00 or less and the deck is a PDF (hard limits from `AGENTS.md`) | fraidfax, nabeo11 | n/a | TODO (human) |

## 4. Live peer review: Sun 10:30–14:00

The whole team must be present. Missing this loses main-prize eligibility.

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [ ] | Every team member at the venue and at the table from 10:30 | all | `docs/junction-2026-guide.md` | TODO (human) |
| [ ] | Laptop ready: deployed URL open, backup screenshots of the Exa news item | HienNguyen-ComputerScience, fraidfax | [../pitch/exa-angle.md](../pitch/exa-angle.md) | TODO (human) |
| [ ] | Judge question box: 2 safe backup questions (test-set #1 and #12) and one honest "nothing found" example | bestawperna (live-query testing) | [../evidence/exa-judge-tests.md](../evidence/exa-judge-tests.md) | Ready in repo |
| [ ] | Backup lines if asked "is 6411 about cancer?", "did these actions work?", "who acts?" | presenter | [../pitch/demo-script.md](../pitch/demo-script.md) "Backup lines" | Ready in repo |
| [ ] | Rehearse the 3-minute pitch before Sunday (no practice time after reviewing ends) | presenter | [../pitch/demo-script.md](../pitch/demo-script.md) | TODO (human) |
| [ ] | If top 5: be on stage at 14:15 (3 min pitch, mic cut at time, then 3 min Q&A) | presenter | `docs/junction-2026-guide.md` | n/a until results |

## Related files

- [submission-text.md](submission-text.md): form text
- [sponsor-questions.md](sponsor-questions.md): booth questions
- `docs/submission/test-runs.md`: test results
- `docs/submission/firstline-deck.pdf`: deck
