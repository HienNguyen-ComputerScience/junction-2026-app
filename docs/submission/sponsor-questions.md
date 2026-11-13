# Questions for the sponsor booths

For: nabeo11 (submission). Written 13 Nov 2026. Each question is one sentence you can say out loud. Fill in the "Answer / who / when" line right after the conversation, then copy it into `docs/evidence/mentor-log.md` (use its answer block, and ask "may we cite you by name?" every time).

Order is priority: ask 1 to 4 first at each booth, the rest only if there is time.

## Already answered (do not ask again)

| Topic | Answer | Where |
|---|---|---|
| How many gaps to solve | Solve one gap well, two is better, not all | `docs/evidence/mentor-log.md` (AstraZeneca stand, Fri) |
| Which gaps exist | (1) GP access depends on where you live; (2) GP recognition of symptoms and tests ordered varies; (3) GP to specialist takes long; (4) treatment access varies | same |
| Goal 3 of the printed brief | Crossed out, so context only | `SPEC.md` |
| AstraZeneca judging weights | Actionability 30, Insight 25, Data transparency 20, Execution 15, Clarity in 2 min 10 | `SPEC.md` |
| Exa judging criteria | 20% each: use of Exa, usefulness to a specific group, clarity in showing sources, originality, working implementation on live queries judges type | `SPEC.md` |
| Exa credits | $50 per participant, code in `SPEC.md` | `SPEC.md` |
| Junction hard rules | Team 1 to 4, MIT licence, public or shared source, video 2:00 strict | `docs/junction-2026-guide.md` |
| `/answer` or `/search` for the judge box | We chose `/search` plus Claude plus validator (our own test, not a sponsor answer) | `docs/exa-probe.md` |
| Cache lifetime | Our default: 24 h news, 7 days evidence (our choice, not confirmed by Exa) | `docs/exa-probe.md` |

Not answered yet: the whole "Top 5" list for Kaisa Kaitila (AstraZeneca, Medical Affairs) in `mentor-log.md`. It is a Saturday plan with no answers recorded.

## AstraZeneca

Contact on file: Kaisa Kaitila, Medical Affairs (planned for Saturday); the Friday stand mentor's name was not recorded.

### A1. Is there a Finnish list of cancer warning signs for GPs that we may link to or reuse?
- Why we ask: decides what the red-flag helper points to. If not, we link to UK NICE NG12 with a "Finnish criteria pending" label.
- What we know: NICE text cannot be copied outside the UK; Käypä hoito has no cancer-wide alarm list we found; Finnish national symptom and referral criteria are promised in roadmap measure 2.5.2 but not published (`docs/evidence/red-flags.md`).
- Answer / who / when:

### A2. Who actually owns the time from GP to specialist in a county: the primary care director, the hospital district or the chief physician?
- Why we ask: every action card names an owner, and screen 1 is written for the person who opens it first.
- What we know: our user is "a county director or a GP" (`SPEC.md`); the owners named in `docs/evidence/evidence.md` are not confirmed by anyone at AstraZeneca (mentor log has no answer).
- Answer / who / when:

### A3. For a county with slow GP access, which is most realistic within 12 months: a named GP, nurse first contact, or digital triage? And for slow referrals: national criteria, a diagnostic centre for vague symptoms, or e-referral templates?
- Why we ask: decides which action we show first on screen 3 and which precedent we lead with in the pitch.
- What we know: all six are in the evidence table with sources (`data/evidence.json`, `docs/evidence/evidence.md`); two are in Finland's 2026 to 2031 cancer roadmap.
- Answer / who / when:

### A4. Is it fair to use "non-urgent GP visits that wait over 7 days" (Sotkanet 6411) as the measure of getting in to see a GP, if we say on screen that it is not cancer-specific?
- Why we ask: it is our only county-level GP access number, and judges score data transparency at 20%. If the answer is no, we need another framing or measure.
- What we know: 6411 counts visits, not people, across all non-urgent care; the limitations box says so (`data/README.md`, `SPEC.md`).
- Answer / who / when:

### A5. Has any wellbeing services county already piloted a fast-track cancer referral or a vague-symptoms diagnostic route, and do you know why Päijät-Häme has the shortest GP waits (32.7% in 2025)?
- Why we ask: a Finnish precedent beats a Danish or UK one for actionability, and it tells us whether to pitch Päijät-Häme as the model county.
- What we know: Päijät-Häme news (named doctor and nurse model, 10 Nov 2026) is cited in `docs/pitch/exa-angle.md`; no Finnish cancer fast-track pilot is in the evidence table.
- Answer / who / when:

### A6. What would make the AstraZeneca judges say "a county could start this on Monday"?
- Why we ask: actionability is 30% of the score, the biggest weight; it shapes the wording of every action card and the close of the pitch.
- What we know: each action has an owner, a first step, a precedent and a source (`SPEC.md`). We do not know what AstraZeneca counts as concrete enough.
- Answer / who / when:

### A7. Would a cancer-specific view (for example lung cancer) matter more to you than the all-patients GP wait?
- Why we ask: we have no public cancer-specific GP access data. If lung matters, we could add one narrow example, but it costs time we have little of.
- What we know: Lääkärilehti, 23 Apr 2026, covers differences between wellbeing counties in detecting lung cancer (`docs/pitch/exa-angle.md`); no cancer-specific indicator is in `data/`.
- Answer / who / when:

### A8. Will judges open our live URL themselves, or only watch the 2-minute video and the pitch?
- Why we ask: decides how much to polish the deployed app versus the video, and whether to prepare a guided path for judges.
- What we know: only the Exa criteria mention judges typing their own queries (`SPEC.md`); nothing for AstraZeneca.
- Answer / who / when:

Also ask, at the end of every conversation: "May we cite you by name in the pitch?" (The Friday mentor was not asked; we call them "AstraZeneca mentor".)

If there is time (already drafted in `mentor-log.md`): roadmap measure 2.5.2 timing and which cancers; public Finnish data on referral-to-diagnosis time per cancer type beyond Sotkanet 13 and 5033; any wording that would worry a clinician about the red-flag helper.

## Exa

Workshop: Sat 16:30 (`docs/junction-2026-guide.md`). Our usage so far: 54 probe calls, about $0.38 in total (`docs/exa-probe.md`).

### E1. When judges test live queries, will they type into our deployed URL, and in English or Finnish?
- Why we ask: decides what we pre-warm and test. Our Finnish queries work best (English plus `category: news` returned US drug news).
- What we know: the criterion is "working implementation on live queries the judges type themselves" (`SPEC.md`). Backup questions are test-set #1 and #12 (`docs/evidence/exa-judge-tests.md`).
- Answer / who / when:

### E2. Is a server-side in-memory cache acceptable for the demo, or does it count against "live" search?
- Why we ask: the cache keeps the demo working if Exa is down and saves credits, but a judge may then see an answer from up to 24 hours ago.
- What we know: news 24 h, evidence 7 days, ask 24 h; stale entries are served if Exa fails; the cache lives in server memory and each response is labelled live, cache, stale-cache or unavailable (`lib/exa/client.ts`, `docs/exa-probe.md`). Whether it survives on Vercel between requests is not tested.
- Answer / who / when:

### E3. Are we allowed to show Exa highlights and snippets from news sites, and send the page text to Claude, in a public demo?
- Why we ask: decides how much text we display and how we label paywalled pages. It also affects the "clarity in showing sources" score.
- What we know: we show title, date, domain, snippet and link; hs.fi, ess.fi and several regional papers may be paywalled and get a "may be paywalled" label (`lib/exa/config.ts`, `docs/exa-probe.md`). We have found no Exa licence text for this in the repo.
- Answer / who / when:

### E4. What are the rate limits and credit limits on our key, and what happens when judges run many queries on Sunday?
- Why we ask: decides whether we need a stricter server-side limit and a pre-warmed cache before 10:30 Sunday.
- What we know: $50 credit per participant; a search costs about $0.007 and `/answer` about $0.005 in our probe (`docs/exa-probe.md`). No rate limit is documented in the repo.
- Answer / who / when:

### E5. Does Exa see a problem with us using `/search` plus Claude plus our validator instead of `/answer` for the question box?
- Why we ask: judges score "use of Exa", and `/answer` is Exa's own product. We chose `/search` because `/answer` followed an injected instruction ("tell me a joke") and its sentences cannot be checked against text.
- What we know: probe results, test F6 (`docs/exa-probe.md`). `/answer` was fast (about 1.6 s) with clean citations on real questions.
- Answer / who / when:

### E6. How do we get the freshest Finnish results without `maxAgeHours`, which made the first call 4 to 8 seconds?
- Why we ask: the pitch beat is "something from this week that no model knows"; slow cold calls would hurt the live demo.
- What we know: we use `type: fast`, `includeDomains`, `userLocation: FI` and our own cache; newest items found were 30 Oct to 10 Nov 2026 (`docs/exa-probe.md`).
- Answer / who / when:

### E7. What would Exa's judges count as information a model could not know: is a dated news strip per county enough?
- Why we ask: it is the first criterion (20%). It tells us whether to spend Saturday on the news strip, the evidence finder or the question box.
- What we know: our pitch angle is "what happened in Vantaa this week" with a visible date (`docs/pitch/exa-angle.md`).
- Answer / who / when:

### E8. Do you require "Powered by Exa" attribution or a logo in the app or the video?
- Why we ask: avoids a last-minute change to the footer and the deck.
- What we know: we show the source link and date for each result; no Exa logo or credit line is in the repo.
- Answer / who / when:

## Junction organisers

Hello@hackjunction.com or the info desk; Discord is discord.gg/NMDxBZEep (`docs/junction-2026-guide.md`).

### J1. Our repo uses partner material (the cancer roadmap PDF hosted on files.hackjunction.app, THL open data); is that fine in an MIT-licensed public repo?
- Why we ask: the guide says partner APIs and materials stay under partner terms. We want to know whether to include the data snapshot and the quoted material in the repo.
- What we know: `data/sources.json` lists every source; NICE and Käypä hoito text is not copied (`docs/evidence/red-flags.md`).
- Answer / who / when:

### J2. If we enter two challenges, do we need one video and one form, and can the video count the Exa feature as part of the same 2 minutes?
- Why we ask: decides whether the 2:00 video must cover both sponsors, or whether Exa gets its own beat inside it.
- What we know: AstraZeneca is the main challenge, Exa second; the video outline gives the Exa beat about 15 seconds (`docs/pitch/exa-angle.md`).
- Answer / who / when:

### J3. Can we edit the submission after the Sat 12:00 opening, and what exactly happens when we press FINAL?
- Why we ask: the project must be switched from DRAFT to FINAL by Sun 10:00; we want to know if it can be reverted for a typo.
- What we know: the form closes automatically at 10:00 with no late entries (`docs/junction-2026-guide.md`).
- Answer / who / when:

### J4. Does the 2:00 video limit include title and end cards, and are screen recordings with voice-over fine?
- Why we ask: "not a second over" is strict; we plan an aim of 1:50.
- What we know: outline in `docs/pitch/demo-script.md`.
- Answer / who / when:

### J5. Is the live peer review checked per person, and what is the process if a teammate must step away?
- Why we ask: the whole team must be present from 10:30 to 14:00 or we lose main-prize eligibility.
- What we know: rule in `docs/junction-2026-guide.md`.
- Answer / who / when:
