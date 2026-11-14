# FirstLine: submission checklist

Owner of this file: nabeo11 (submission). Written from repo state on Fri 13 Nov 2026 (about 22:00 Helsinki). All times are Helsinki time. Nothing here is marked done unless the file exists in the repo, a PR is merged, or the step is confirmed on the board; every other human step is `TODO (human)`. Updated Sat 14 Nov 18:50 against the frozen commit 3bc8bc7 (feature freeze was 18:00), from the PR and issue lists, README.md, test Run 4 and Run 4b, `deck-notes.md` and the board.

Legend for status: **Ready in repo** (content exists, still needs pasting or uploading by a human) · **Draft** (exists, will change) · **TODO (human)** (only a person can do it).

## What is built (frozen commit 3bc8bc7, Sat 14 Nov 18:50)

Sources:
- `gh pr list --state all` and `gh issue list --state all` (14 Nov, 18:50);
- [test-runs.md](test-runs.md): Run 4 (pre-freeze, deployed site, commit 96ec1e1) and Run 4b (post-freeze, commit 3bc8bc7: 13 PASS, 0 FAIL, 5 NOTE, 1 NOT RUN);
- the lead agent's live check of 43 questions on this build at 18:07 (board): 43/43, no network errors, plus a browser click-through at 1280 and 390 wide;
- `README.md` and `deck-notes.md`.

Production runs main 3bc8bc7 (through PR #132). Vercel deploys main automatically from GitHub. Only PR #124 (one-page judge cheat sheet, docs) is still open.

| Part | State | Where |
|---|---|---|
| Next.js scaffold, shadcn/ui | Merged (PR #4) | `app/`, `components/ui/` |
| Data snapshot: 11 Sotkanet indicators, 22 areas plus Finland. Two drive the steps (6411 GP wait over 7 days, 13 referrals processed within 3 days). Nine are context only: referrals waiting over 21 days, three cancer-screening attendance rates, occupational-health and public and private doctor visits, five-year survival for bowel and breast cancer. Also a labelled HUS-wide referral value for four Uusimaa areas | Merged (PR #11, #13, #83, #84, #102, #105) | `data/`, `data/README.md` |
| Evidence table (14 verified rows), mentor log, demo script | Merged (PR #7); later booth-feedback and step-2 updates (PR #111, #112, #117, #118, #120). Final pitch: PR #126, #128 | `docs/evidence/`, `docs/pitch/` |
| Home (`/`): area list and map, one card with the area's figure against Finland, one reason line, top action | Merged (PR #96, #119); passes in Run 4b. Home uses its own area, not the remembered one (PR #130) | `app/page.tsx`, `components/` |
| Compare (`/compare`): all 22 areas ranked, "Getting worse fastest" with the recording caveat | Merged (PR #119, #129); passes in Run 4b (22 rows match `values.json`) | `app/compare/` |
| Ask (`/ask`): question box answered only from live results, national news | Merged (PR #119); Run 4b asked 8 questions, all cited or refused cleanly; lead's 43/43 check | `app/ask/`, `components/exa/` |
| County page: three step tabs, step-2 "Not measured in Finland" card with England's emergency-presentation share, limitations box always visible, recording caveat | Merged (PR #119, #121, #129); passes in Run 4b | `app/county/[id]/`, `components/pathway/` |
| Act page: actions carousel ("Action 1 of 3"), what-if, static panel "The four referral routes a county needs" (replaces the typed symptom and red-flag helper, which was removed in PR #127; there is no symptom input) | Merged (PR #125, #127); passes in Run 4b | `app/county/[id]/act/`, `components/act/` |
| Exa server layer: `/api/county-news`, `/api/national-news`, `/api/evidence`, `/api/ask` (cache, rate limit, answer validator, saved results with their date) | Merged (PR #16, #41, #73 fixes, #91, #92, #115, #116); outage and 429 paths pass in Run 4b | `lib/exa/`, `app/api/`, `data/exa-cache/` |
| Live search panels with a close button | Merged (PR #132). Run 4b: close works on the ask box and the evidence finder; 3 notes (focus drops to the page body after closing; on a 390 px phone the close button of the evidence finder sits about 30 px outside the panel edge; news panels have no close button) | `components/exa/` |
| County brief with snapshot validator and fallback | Merged (PR #29, #39, #89, #93); `brief:check` passes 23 checks in Run 4b. The AI rewrite button was not retried after the freeze | `lib/brief/`, `app/api/brief/`, `components/brief/` |
| Custom "Page not found" page and error page | Merged (PR #130). 404 passes in Run 4b; the error page was read but not seen on screen (NOT RUN) | `app/not-found.tsx`, `app/error.tsx` |
| Sources and limitations page | Reorganised in PR #123 (earlier PR #10, #62, #87, #97); loads at 200 in Run 4b (content not re-read there) | `app/sources/` |
| Submission pack (this folder) | Merged (PR #30, #40, #42, #46, #50, #71, #100, #104). Post-freeze pass (Run 4b, deck v5, this file and the submission text): this PR | `docs/submission/` |
| MIT `LICENSE` | At the repo root (PR #52); README links to it. Repo is public | `LICENSE`, `README.md` |
| Live URL (Vercel) | https://firstline-finland.vercel.app. Vercel project `firstline-finland`, keys set, deployed automatically from `main` through the GitHub integration (README). Checked at 18:07 (board) and in Run 4b | `README.md` "Live demo" |
| Pitch video | A 1:43 draft cut exists (PR #81, build scripts in `docs/pitch/video-build/`; board). Not final: upload, public setting and the link are human steps. The cut was made before the home, act and compare changes, so check it against the frozen screens | `docs/pitch/video-build/`, TODO (human) |

Open notes from Run 4b for the lead (none is a blocker): `docs/pitch/demo-script.md` lines 17, 29 and 55 and `docs/pitch/e2e-checklist.md` line 17 no longer match the screen.

## 1. Preliminary submission: Fri 13 Nov, 23:59 (aim for 23:30)

Platform: hackjunction.app. Needs a draft project and the chosen challenge. Both can change later.

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [x] | Create the project as a DRAFT on hackjunction.app | nabeo11 (submission) | Paste from [submission-text.md](submission-text.md): name, punchline, short description | Done: confirmed by nabeo11 on the board, 13 Nov |
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
| [x] | Merge screens 1 and 2 (issue #17) | HienNguyen-ComputerScience (app) | `app/` | Merged (PR #23); later rebuilt as home, compare and county pages (PR #119). Ticked on the merged PRs |
| [x] | Merge screen 3 (issue #21) | HienNguyen-ComputerScience | `app/` | Merged (PR #26, then PR #125 and #127: the typed helper was replaced by the four referral routes panel). Ticked on the merged PRs |
| [x] | Merge Exa UI panels (PR #22) and mount them, the question box and the AI brief on the pages (issue #32) | HienNguyen-ComputerScience | `app/`, `components/exa/`, `components/brief/` | Mounted (PR #39, issue #32 closed); the question box and national news moved to `/ask` (PR #119); close buttons PR #132. Ticked on the merged PRs |
| [x] | Merge sources and limitations page (PR #10) | bestawperna | `app/sources/` | Merged (PR #10), reorganised in PR #123. Ticked on the merged PRs |
| [x] | Deploy to Vercel and write the live URL into README.md | HienNguyen-ComputerScience (deploy) | `README.md` "Live demo" | Done 14 Nov. Vercel now deploys `main` automatically from GitHub (README, board) |
| [ ] | Decide demo credentials: the app has no accounts, so write "none needed" if still true | HienNguyen-ComputerScience | `README.md` | README says "Demo credentials: none needed (public, no login)". TODO (human): confirm and tick |
| [x] | Run the manual test pass on the deployed URL and fill in `test-runs.md` | nabeo11 (test runs) and bestawperna (manual demo testing, Exa live queries) | `docs/submission/test-runs.md` | Run 4 (pre-freeze, deployed site, commit 96ec1e1, 14 Nov 03:05) and Run 4b (post-freeze, commit 3bc8bc7, 18:20 to 18:35: 13 PASS, 0 FAIL, 5 NOTE, 1 NOT RUN) are logged. Also the lead agent's 43/43 live question check at 18:07 (board). Ticked on `test-runs.md`; Run 5 (Sunday morning) is still to do |
| [x] | Update the sentences in [submission-text.md](submission-text.md) listed under "Update on Saturday" | nabeo11 | [submission-text.md](submission-text.md) | Done in the post-freeze pass: the section is now a dated record (checked 14 Nov 18:50 against 3bc8bc7). Re-check on Sunday before pasting |
| [ ] | Pick the freshest real news item for the demo county and screenshot it with the date visible | fraidfax (pitch) | `docs/pitch/exa-angle.md` prep checklist | TODO (human) |
| [ ] | Feature freeze at 18:00: after this, only fixes | all | `AGENTS.md` | Passed: the lead's board post says production runs the frozen commit 3bc8bc7. Box left for the lead |

## 3. Final submission: Sun 15 Nov, 10:00 (aim for 08:00)

The form closes automatically at 10:00, with no late entries. The project must be switched from DRAFT to FINAL or it is not reviewed.

Mirrors the "Final submission checklist" in [docs/junction-2026-guide.md](../junction-2026-guide.md) and the "Junction submission" rules in `AGENTS.md`.

| Done | Item | Owner | Content | Status |
|---|---|---|---|---|
| [ ] | Project name, punchline, description | nabeo11 | [submission-text.md](submission-text.md), [final-description-draft.md](final-description-draft.md) | Ready in repo (matches the frozen build; the removed typed helper is gone from both). Pasting into the form is TODO (human) |
| [ ] | Challenge(s): AstraZeneca main, Exa second | nabeo11 | [submission-text.md](submission-text.md) | Ready in repo |
| [ ] | Technologies used | nabeo11 | [submission-text.md](submission-text.md) | Ready in repo; checked against `package.json` on 14 Nov 18:50 (Supabase removed: not used). Re-check on Sunday |
| [ ] | 2-minute pitch video, public (YouTube or Vimeo), not a second over | fraidfax (pitch, video) | Outline: [../pitch/demo-script.md](../pitch/demo-script.md) "2:00 video outline"; Exa beat: [../pitch/exa-angle.md](../pitch/exa-angle.md); build scripts `../pitch/video-build/` | Draft cut of 1:43 exists (board, PR #81). TODO (human): final cut from the frozen screens, upload, set public, check length is 2:00 or less, send the link |
| [ ] | Record the video only after re-running Exa on Sunday morning so the "this week" item is real | fraidfax | [../pitch/exa-angle.md](../pitch/exa-angle.md) | TODO (human) |
| [ ] | Demo link (live URL opens for someone not logged in anywhere) | HienNguyen-ComputerScience | `README.md` "Live demo" | URL is in README and the form text: https://firstline-finland.vercel.app. TODO (human): open it in a private window on Sunday |
| [ ] | Source code link: https://github.com/HienNguyen-ComputerScience/junction-2026-app | nabeo11 | `git remote get-url origin` | Ready in repo |
| [x] | Repo is public, or shared so organisers can open it; all submissions are MIT-licensed | HienNguyen-ComputerScience | Repo settings. MIT `LICENSE` exists at the repo root (PR #52) | Done: repo is public (14 Nov); MIT `LICENSE` at the repo root (PR #52) |
| [ ] | Source code publicity setting on the form | nabeo11 | [submission-text.md](submission-text.md) | TODO (human) |
| [ ] | Credit preference on the form | nabeo11 | [submission-text.md](submission-text.md) | TODO (human) |
| [ ] | Pitch deck as PDF | nabeo11 (deck) | `docs/submission/firstline-deck.pdf` (source `deck.html`, notes `deck-notes.md`) | Deck v5 in repo: 9 slides, built from the frozen build 3bc8bc7, screenshots retaken from the live site on 14 Nov 18:22, no Draft footer, no mention of the removed helper (see `deck-notes.md`). A 16-slide alternative is in `deck-nabeo11/`. Which PDF is uploaded on Sunday: TODO (lead decides) |
| [ ] | Team phone numbers and Discord usernames | nabeo11 | Collect from each member; never commit them to the repo | TODO (human) |
| [ ] | Set status to FINAL | nabeo11 | none | TODO (human) |
| [ ] | Re-open the submitted project and check every field saved | nabeo11 | none | TODO (human) |
| [ ] | README.md current: problem, solution, stack, how to run, live URL, demo credentials, AI tools used, pre-existing code and templates (Junction requires declaring these) | HienNguyen-ComputerScience (README) | `README.md` | Draft: live URL, "Demo credentials: none needed", license, team and AI tools are in; README was updated for the removed helper (board). TODO (human): final read on Sunday |
| [ ] | No code written before the event; pre-existing items declared | all | `README.md` "Pre-existing code and templates"; [submission-text.md](submission-text.md) | Ready in repo |
| [ ] | No secrets committed; `.env.local` stays local | all | `AGENTS.md` Security | TODO (human): last scan before Sunday 08:00 |
| [ ] | Pitch video is 2:00 or less and the deck is a PDF (hard limits from `AGENTS.md`) | fraidfax, nabeo11 | n/a | Deck is a PDF in repo (9 pages). TODO (human): the video length once the final cut exists |

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
