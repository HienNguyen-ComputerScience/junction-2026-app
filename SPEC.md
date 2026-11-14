# SPEC — FirstLine (junction-2026-app)

Challenge: **AstraZeneca — "Equal Care Across Finland"**. Draft from Luan's proposals on the board (issue #1, 13 Nov). Keep it to one page.

## Problem (one sentence)
Whether you get early cancer care in Finland depends on where you live: the first step (getting in to see a GP, and getting from the GP to a specialist) breaks down very differently by wellbeing services county, and no one shows a county director where theirs breaks.

## User
A wellbeing services county director (or a GP in that county). Judges are marketing and business people, not clinicians, so the pitch must work for non-medical people.

## Core flow (3 screens max)
1. **County ranking:** counties ranked by GP wait (Sotkanet 6411) and referral processing (13 / 5033). Every number has a source chip (source, year).
2. **County pathway:** for one county, whether the delay sits at getting to a GP or at GP → specialist, as stage cards (red / amber / grey = no public data). The limitations box is always visible.
3. **Act:** 2–3 recommended actions for that county's bottleneck, each with an owner, a first step, a precedent (Denmark's fast-track pathways, UK Rapid Diagnostic Centres, nurse triage) and a source. Includes "The four referral routes a county needs": a static panel for the director showing the fast-track, vague-symptoms, see-a-GP-soon and safety-net routes, the concerns each covers, and the guideline or precedent behind each (decision support, not diagnosis). FirstLine is a tool for county administrators, not patients or GPs, so it has no symptom input.

## Data model / API contracts
- Static JSON snapshot committed under `data/`: `sources`, `indicators`, `values` (county × indicator × year), `gaps`, `evidence`. Every row has a `source_id`; rows without one are not committed. The demo works if Sotkanet or the LLM is down.
- Sotkanet REST API (no key, CORS open). Use curl or set a user-agent (Python urllib gets 403 without one).
- LLM (Claude) only writes text around fixed numbers. Structured output; a server-side validator drops any claim whose number or `source_id` is not in the context; fallback to a precomputed brief.

## Sponsor API / challenge fit
- Judging: Actionability 30 · Insight 25 · Data transparency 20 · Execution 15 · Clarity in 2 min 10.
- Printed brief: the Goal 3 requirement was crossed out, so Goal 3 is context, not a must.
- Mentor: solve one gap well (two is better). Gaps named: GP access by region, GP recognition of symptoms, GP → specialist time.
- 2nd challenge: **Exa**. Judging, 20% each: use of Exa (info a model couldn't know from training) · usefulness to a specific group · clarity in showing sources · originality · working implementation on live queries the judges type themselves.
  - **County news:** on the county page, an Exa search of the last 12 months (domains such as yle.fi, thl.fi, county sites) about GP access and cancer care, with source links.
  - **Evidence finder:** under each action, an Exa search of research papers and Nordic reports, with Contents text so Claude can write a cited card. Shown as "found live — unverified", next to Luan's checked table.
  - **Judge question box:** a free-text question answered only from Exa results, with links and a clean "nothing found".
  - Server-side only (`EXA_API_KEY` in `.env.local`, never in client code). Cache results for the demo; must degrade gracefully if Exa is down.
  - Credits: $50 per participant, code `EXA50JUNCTION` at dashboard.exa.ai/billing.

## Research notes (with source links)
- THL Sotkanet: https://sotkanet.fi (6411 GP visits waiting > 7 days: 2025 range Päijät-Häme 32.7% → Vantaa–Kerava 85.4%, Finland 54.7%).
- Indicator 6411 covers all non-urgent GP visits, not only cancer ones. Say so on the limitations panel.
- TODO (Luan): evidence table with sources in `docs/evidence/`.

## Non-goals (things we will NOT build this weekend)
- Patient data of any kind.
- Treatment access (bottleneck 4): the data is flat.
- Diagnosis, and any symptom checker or patient-facing input. The referral-routes panel describes routes a county should offer; it never judges an individual's symptoms.
- Copying guideline text. NICE NG12 and Käypä hoito may not be reproduced in the app without permission: link and cite only.
- Accounts, auth, a database (unless the lead decides otherwise).

## Demo script (3 minutes)
TBD (Luan). Script: `docs/pitch/demo-script.md` (Luan, PR #7). Wording rule for all app and pitch copy: Sotkanet 6411 counts non-urgent GP *visits*, so say "85% of non-urgent GP visits in Vantaa–Kerava come more than a week after people ask", never "85% of people".
