# Questions for the sponsor booths

## Ask these first (Saturday, before the 18:00 freeze)

Six questions whose answers could still change what we build or say before the freeze. Full wording, reasons and who to ask are in the questions below. Log every answer in `docs/evidence/mentor-log.md`.

AstraZeneca:
1. **P1** (is the normal GP queue a fair measure for early cancer signs?). Yes: keep the headline number and the current wording. No: add a bigger warning on screen and soften the ranking wording before the freeze.
2. **P2** (may we link NICE NG12 as a UK guideline, or is there a Finnish list?). Yes: keep the red-flag helper as is. No: link only the Finnish list, or cut the helper before the freeze.
3. **P3** (any Finnish county with a fast lane or diagnostic centre?). Yes: name it as the local precedent in the Act screen and the pitch. No: keep Denmark and the UK, and say so plainly.

Exa:
1. **E4** (rate and credit limits on our key). Higher than ours: leave the limits. Lower or unclear: tighten the server-side limit and pre-warm the cache before Sunday 10:30.
2. **E2** (is a server-side cache acceptable for "live"?). Yes: keep it and its label. No: show cache results only as a clearly marked fallback, or turn the cache off for the demo.
3. **E1** (will judges type in English or Finnish into our URL?). Finnish: pre-warm Finnish queries. English: add English phrasing to the query rewrite before the freeze.

(Exa question numbers are the E1 to E8 under "Exa" below, not the section E in the AstraZeneca list.)

For: nabeo11 (submission). Written 13 Nov 2026. Each question is one sentence you can say out loud. Fill in the "Answer / who / when" line right after the conversation, then copy it into `docs/evidence/mentor-log.md` (use its answer block, and ask "may we cite you by name?" every time).

Order is priority. At the AstraZeneca stand use the "Ask these first" block; at the other booths ask 1 to 4 first, the rest only if there is time. The AstraZeneca section is the nabeo11 list of 21 questions (the team lead decided it replaces the earlier A1-A8 draft); the Exa and organiser sections are unchanged.

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

### How to record answers

For every answer, write:
- **Who** said it (name) and **the time**.
- **Quote OK?** Tick one: yes, by name / yes, as "an AstraZeneca mentor" / no. If you did not ask, tick "not asked". We may only quote people who said yes.
- Write what they said in their words if you can. Short is fine. "Didn't know" is a useful answer too.
- If they say "ask someone else", write the name.

Who to ask:
- **Taija af Hällström** (Medical Affairs): medical and Finnish-healthcare questions.
- **Kaisa Kaitila** (Saturday morning, booked): medical questions too. She already has a separate list in `docs/evidence/mentor-log.md`, so use this page for the questions that list does not cover, or give her the 5 below.
- **Hanna Rusila, Laura Aaltonen** (Marketing) and **Joanna Tuormaa** (Business Excellence): story and "what wins" questions. They are also the Sunday judges, so keep it light and do not ask them to pre-judge.
- Other mentors: Hanna Toivola.

Say "indicator 6411" only if asked. Plain version: "the share of normal, non-urgent GP appointments that happen more than a week after people ask for one".

---

### ASK THESE FIRST (if you only get 5 minutes)

**P1. When someone has early signs of cancer, such as tiredness, weight loss or a cough that won't go away, do they usually end up in the normal GP queue, so that the normal queue is a fair measure of their wait?**
Why: decides whether our headline number (the wait for a normal GP appointment) is honest or needs a bigger warning on screen. Ask: Taija or Kaisa.
Answer:
&nbsp;
&nbsp;

**P2. Is there a Finnish list of cancer warning signs for GPs that we are allowed to link to? If not, is it OK for us to link to the UK guideline (NICE NG12) and say clearly it is a UK guideline?**
Why: decides what the red-flag helper is built on, and whether we can use it at all. Ask: Taija or Kaisa.
Answer:
&nbsp;
&nbsp;

**P3. Does any Finnish county already run a fast lane for suspected cancer, or a diagnostic centre for vague symptoms, that we can name as a local example?**
Why: a Finnish example is far stronger in the pitch than only Denmark and the UK. Ask: Taija or Kaisa.
Answer:
&nbsp;
&nbsp;

**P4. In a county, who would actually act on this: who owns the time from GP to specialist, and what would they need to see on one screen to start something on Monday?**
Why: decides what the "Act" screen shows and who it names as owner. Ask: Kaisa (Saturday), or any mentor.
Answer:
&nbsp;
&nbsp;

**P5. For you, what does "actionable" look like, and if we have two minutes with someone who is not a doctor, what should they remember when we finish?**
Why: Actionability is 30% of the score, and the Sunday judges are not clinicians. It shapes the whole pitch. Ask: Hanna Rusila, Laura Aaltonen or Joanna Tuormaa.
Answer:
&nbsp;
&nbsp;

---

### A. Is our data measuring the right thing?

**A1. Is there any reason the share of normal GP visits that happen more than a week after people ask would mislead us when comparing counties (for example because some counties count or book visits differently)?**
Why: if yes, we add a warning or change how we rank counties. Ask: Taija.
Answer:
&nbsp;

**A2. The two numbers we use for GP-to-specialist are the share of specialist referrals processed within 3 days and the share taking over 21 days. Is that a fair picture of that step for cancer, or does it hide something important (for example it covers all referrals, not only cancer)?**
Why: decides how strongly we word the "GP to specialist" stage card. Ask: Taija.
Answer:
&nbsp;

**A3. Is there any public county-level number we have missed that shows time from first symptoms to diagnosis or to treatment, even for one cancer type?**
Why: a better number could replace our indirect ones. Ask: Taija or Kaisa.
Answer:
&nbsp;

**A4. Is there any public figure about counties and cancer that you have seen people read wrongly or that you would warn us not to use?**
Why: stops us putting a misleading number on a judge's screen. Ask: Taija.
Answer:
&nbsp;

### B. The red-flag helper

**B1. Is it acceptable to you if the helper only shows our own plain-language warning-sign categories and links out to the guideline, without copying any guideline text?**
Why: this is our legal and safe design. If they would rather see something else, we change it. Ask: Taija.
Answer:
&nbsp;

**B2. Is there any wording or feature in a "symptoms in, referral route out" tool that would worry a doctor, even with "decision support, not diagnosis" on every screen?**
Why: tells us what to remove or reword before Sunday. Ask: Taija or Kaisa.
Answer:
&nbsp;

### C. Fixes and local examples

**C1. For a county where GP waits are long, which of these could a county realistically start within a year: a named GP, nurse first-contact visits, or online symptom check (Omaolo)? And for a slow specialist step: national referral criteria, a diagnostic centre, or standard e-referral forms?**
Why: decides which fix we put first for each type of county. Ask: Taija or Kaisa.
Answer:
&nbsp;

**C2. Päijät-Häme has the shortest GP waits in 2025. Do you know why, and may we say so?**
Why: gives the "what good looks like" story, or stops us guessing wrongly. Ask: Taija or Kaisa.
Answer:
&nbsp;

### D. The pilot with a county

**D1. If a county did pick this up after the weekend, what would a pilot look like in practice: who from the county, who from AstraZeneca, how long, and what would it need from us?**
Why: lets us write a believable "next step" on the final slide instead of guessing. Ask: Hanna Rusila, Joanna Tuormaa or Kaisa.
Answer:
&nbsp;

**D2. What would make a county director say yes to a pilot, and what would make them say no straight away?**
Why: tells us what to leave out. Ask: Kaisa or Joanna Tuormaa.
Answer:
&nbsp;

### E. Story and judging

**E1. What have past winning teams in this challenge done in their 2 minutes that the others did not?**
Why: shows us what judges reward. Ask: Hanna Rusila, Laura Aaltonen or Joanna Tuormaa.
Answer:
&nbsp;

**E2. Which is better for your judges: one striking county comparison told as a story, or the full ranking of all counties?**
Why: decides what we open the pitch with. Ask: Marketing judges.
Answer:
&nbsp;

### F. Using what you tell us

**F1. May we quote what mentors tell us in our pitch and evidence page, and if so, by name, or only as "an AstraZeneca mentor"?**
Why: decides whether mentor words go on screen or only help us privately. Ask: any mentor, and ask again for each quote you want to use.
Answer:
&nbsp;

### G. Live web search next to checked evidence

**G1. We also show live web search results (county news, research papers) next to our checked evidence, labelled "found live, unverified". Does that help or hurt trust for you? Would you rather see it off, or kept visibly separate?**
Why: it is a choice about the whole screen. We cut it if it harms the AstraZeneca story. Ask: Taija and Joanna Tuormaa.
Answer:
&nbsp;

---

### Optional (only if time is left)

**O1. Finland's cancer roadmap (measure 2.5.2) promises national referral criteria. Do you know when the first ones are due, and for which cancers?**
Why: lets us say "coming soon" accurately. Ask: Taija or Kaisa.
Answer:
&nbsp;

**O2. Is there anything you would want us to say less loudly, because it is likely to be wrong?**
Why: last catch-all before we finish. Ask: anyone.
Answer:
&nbsp;

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
