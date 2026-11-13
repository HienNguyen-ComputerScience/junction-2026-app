# SPEC — FirstLine (junction-2026-app)

Challenge: **AstraZeneca — "Equal Care Across Finland"**. Draft from Luan's proposals on the board (issue #1, 13 Nov). Keep it to one page.

## Problem (one sentence)
Whether you get early cancer care in Finland depends on where you live: the first step (getting in to see a GP, and getting from the GP to a specialist) breaks down very differently by wellbeing services county, and no one shows a county director where theirs breaks.

## User
A wellbeing services county director (or a GP in that county). Judges are marketing and business people, not clinicians, so the pitch must work for non-medical people.

## Core flow (3 screens max)
1. **County ranking:** counties ranked by GP wait (Sotkanet 6411) and referral processing (13 / 5033). Every number has a source chip (source, year).
2. **County pathway:** for one county, whether the delay sits at getting to a GP or at GP → specialist, as stage cards (red / amber / grey = no public data). The limitations box is always visible.
3. **Act:** 2–3 recommended actions for that county's bottleneck, each with an owner, a first step, a precedent (Denmark's fast-track pathways, UK Rapid Diagnostic Centres, nurse triage) and a source. Includes the red-flag helper: symptoms in, matching guideline warning signs and the fastest referral route out (decision support, not diagnosis).

## Data model / API contracts
- Static JSON snapshot committed under `data/`: `sources`, `indicators`, `values` (county × indicator × year), `gaps`, `evidence`. Every row has a `source_id`; rows without one are not committed. The demo works if Sotkanet or the LLM is down.
- Sotkanet REST API (no key, CORS open). Use curl or set a user-agent (Python urllib gets 403 without one).
- LLM (Claude) only writes text around fixed numbers. Structured output; a server-side validator drops any claim whose number or `source_id` is not in the context; fallback to a precomputed brief.

## Sponsor API / challenge fit
- Judging: Actionability 30 · Insight 25 · Data transparency 20 · Execution 15 · Clarity in 2 min 10.
- Printed brief: the Goal 3 requirement was crossed out, so Goal 3 is context, not a must.
- Mentor: solve one gap well (two is better). Gaps named: GP access by region, GP recognition of symptoms, GP → specialist time.
- Possible 2nd challenge: **Exa** (decide Sat after the 11:00 check): live county news, evidence search, a question box for judges.

## Research notes (with source links)
- THL Sotkanet: https://sotkanet.fi (6411 GP visits waiting > 7 days: 2025 range Päijät-Häme 32.7% → Vantaa–Kerava 85.4%, Finland 54.7%).
- Indicator 6411 covers all non-urgent GP visits, not only cancer ones. Say so on the limitations panel.
- TODO (Luan): evidence table with sources in `docs/evidence/`.

## Non-goals (things we will NOT build this weekend)
- Patient data of any kind.
- Treatment access (bottleneck 4): the data is flat.
- Diagnosis. The red-flag helper is decision support only.
- Accounts, auth, a database (unless the lead decides otherwise).

## Demo script (3 minutes)
TBD (Luan). Opening line draft: "In Vantaa–Kerava, 85% of people wait more than a week just to see a GP. In Päijät-Häme it's a third. Cancer doesn't wait."
