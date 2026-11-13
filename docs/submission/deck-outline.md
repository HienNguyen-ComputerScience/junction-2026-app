# FirstLine: pitch deck outline

For: nabeo11 (builds the deck). Working outline, not final copy.
Built on: `app/SPEC.md`, `app/docs/pitch/demo-script.md` (Luan's script: the deck follows its order and reuses its words), `app/docs/pitch/exa-angle.md`, `app/docs/evidence/*`, `app/data/*`, and the team board.

## Rules from the guide and sponsors that shape the deck

- **Pitch deck as a PDF** is part of the final submission (guide, "Final submission checklist"). The guide sets **no slide limit**, so this outline has 8 main slides plus backup slides.
- **Final submission: Sun 15 Nov 10:00**, after which the form closes. Team target is 08:00. The project must also be switched from **DRAFT to FINAL**.
- **Pitch video: 2:00 maximum**, public on YouTube or Vimeo. Luan owns it. The deck's slides 1, 2 and 8 can be reused as video title cards.
- **Top-5 stage pitch: exactly 3 minutes** (the mic is cut), then 3 minutes of questions. You can do a live demo from your own laptop. There is no practice time on Sunday, so rehearse on Saturday.
- **Live peer review: Sun 10:30-14:00.** The whole team must be there, or we lose main-prize eligibility. Have the PDF open on a laptop.
- **AstraZeneca judges** (Hanna Rusila and Laura Aaltonen from Marketing, Joanna Tuormaa from Business Excellence) are not clinicians. Use plain words, put one big number on each slide, and spell out what a county gets. Medical detail goes in the backup slides.
- **Wording rule (always):** "85% of non-urgent GP visits in Vantaa-Kerava come more than a week after people ask." Never write "85% of people", and never "cancer patients wait".
- **Goal 3** of the cancer strategy is context only. It was crossed out on the printed brief, so never present it as a requirement we meet.
- **Missing numbers** are written as `[TODO: ...]`. Never type a number that is not in `app/data/` or `evidence.md`.

---

## 1. Story and the one action

**One-sentence story:** Where you live in Finland decides how fast you get the first step of cancer care. FirstLine shows each county where its own first step breaks, and which proven fix to start on Monday.

**The one action to remember:** *A county director opens FirstLine, sees their bottleneck, and starts the first step of one sourced fix this week.* The example is Vantaa-Kerava, where getting in to a GP is the bottleneck: pilot named-GP lists for patients aged 50+ at the 2-3 health stations with the longest waits (`ev-gp-continuity`).

**Tagline (from the demo script):** "FirstLine: equal first steps, across Finland."

---

## 2. Main slides (8)

The "time" column follows the 3-minute live script in `demo-script.md`. The spoken lines are Luan's words, lightly shortened. If Luan changes the script, change the deck to match.

### Slide 1 (0:00-0:20) · "In Vantaa-Kerava, 85% of non-urgent GP visits come more than a week after people ask. In Päijät-Häme it's a third."
- **On the slide:** two big numbers side by side: **85.4%** for Vantaa-Kerava and **32.7%** for Päijät-Häme. A small grey line under them: "Finland 54.7%". Source chip: "THL Sotkanet 6411, 2025". Product name "FirstLine" in small type at the top.
- **Say:** "In Vantaa-Kerava, 85% of non-urgent GP visits come more than a week after people ask for one. In Päijät-Häme it's a third. Cancer doesn't wait."
- **Criteria:** Insight (25), Clarity (10).
- **Needs:** nothing. The numbers are confirmed in `app/data/values.json`. You can build this slide now.

### Slide 2 (0:20-0:45) · "Most cancers are first noticed by a GP, yet no one shows a county where its own first step breaks"
- **On the slide:**
  1. A simple line: Patient → GP → Specialist. Highlight the two steps we measure: (a) getting in to a GP and (b) getting from the GP to a specialist.
  2. One small line: "National cancer strategy 2026-2035: equal care everywhere." This is context only.
- **Say:** "Most cancers are first noticed by a GP. So where you live decides how fast your first step happens. Finland's new cancer strategy says this must be equal everywhere. But no one shows a county director *where* their own pathway breaks."
- **Criteria:** Insight (25), Clarity (10).
- **Needs:** nothing, so build it now. Optional: a mentor answer to P1 in `docs/submission/sponsor-questions.md` ("do early-symptom patients go through the normal GP queue?"). If the mentor agreed to be quoted, put the answer here as one line.

### Slide 3 (0:45-1:15) · "Counties break at different steps, so one national fix won't work"
- **On the slide:**
  1. **Chart:** a horizontal bar chart of the 22 areas ranked by indicator 6411 for 2025, with a vertical line at Finland's 54.7%. Label only Vantaa-Kerava 85.4, Helsinki 75.9, Kainuu 38.4 and Päijät-Häme 32.7. Source chip: "THL Sotkanet 6411, 2025".
  2. **Contrast box:** "Kainuu: quick to see a GP, slower from the GP to a specialist. Vantaa-Kerava: slow to see a GP." Value for referrals processed within 3 days: `[TODO: indicator 13, Kainuu 2025, and Finland 2025, from data/ (Phương confirms)]`.
  3. Small print: "Referral speed = Sotkanet 13, referrals processed within 3 days, 2025. Worst `[TODO: 13 worst county + value]`, best `[TODO: 13 best county + value]`."
- **Say:** "This is FirstLine. Every county, ranked by how long it takes to see a GP and how fast referrals move to a specialist. And they don't break in the same place. Kainuu gets you to a GP fast but is slower from the GP to a specialist. Vantaa-Kerava is the opposite."
- **Criteria:** **Insight (25)**, Data transparency (20).
- **Needs:** Phương confirms the indicator 13 numbers (see "Contradictions" below: they are already in `data/values.json`). The chart can come from Phương's export or the ranking screen. Option: a screenshot of the ranking screen (`/`) instead of a chart. The script says to show Screen 1 here.

### Slide 4 (1:15-1:45) · "For each county, FirstLine shows where the delay is, and says openly where public data is missing"
- **On the slide:**
  1. **Screenshot:** the Vantaa-Kerava county page (`/county/vantaa-kerava`). The GP-access card is **red**, the referral card is **grey ("no public data")**, and the limitations box is visible.
  2. Three-word legend: red = worse than Finland · amber = Finland's level or better, still a wait · grey = no public data.
- **Say:** "Pick a county. FirstLine shows where the delay is: getting in to a GP, or getting from the GP to a specialist. Grey means there's no public data, and we say so."
- **Criteria:** **Data transparency (20)**, Execution (15).
- **Needs:** a screenshot of `/county/vantaa-kerava` after the feature freeze (this screen was still a placeholder on 14 Nov early Saturday, per the run log in `e2e-checklist.md`).

### Slide 5 (1:45-2:30) · "Every county gets 2-3 fixes that already worked elsewhere, each with an owner and a first step for Monday"
- **On the slide:**
  1. **Screenshot:** one open action card on `/county/vantaa-kerava/act` showing the owner, first step, precedent and source link. Preferred card: named GP (`ev-gp-continuity`). Owner: primary care director. First step: pilot named-GP lists for patients aged 50+ at the 2-3 health stations with the longest waits.
  2. **Two proof numbers, each with its source chip:**
     - "Denmark's fast-track pathways: median time to diagnosis 17 days shorter" (`ev-ref-denmark-cpp`).
     - "Norway: patients who kept the same GP for 15+ years had 25% lower odds of dying in the year studied, and fewer hospital admissions" (`ev-gp-continuity`).
  3. Footer: "2 of these fixes are already in Finland's 2026-2031 cancer roadmap (measures 2.5.1, 2.5.2)."
- **Say:** "Then: what to do on Monday. Each action has an owner, a first step, a country that already did it, and the source. Denmark's fast-track pathways cut the median time to diagnosis by 17 days. Norway shows that keeping the same GP goes with fewer hospital admissions and lower mortality."
- **Criteria:** **Actionability (30)**, Data transparency (20).
- **Needs:** a screenshot of the act page after the freeze. Note: Denmark is a referral fix, so its card does not appear on Vantaa-Kerava (referral is grey there). Take the Denmark card from a county with a red referral stage, for example `/county/kainuu/act`, or show it as a small second card. See conflict C6.

### Slide 6 (2:30-2:45) · "For the GP: symptoms in, guideline warning signs and the fastest referral route out (decision support, not diagnosis)"
- **On the slide:**
  1. **Screenshot:** the red-flag helper with "weight loss, tiredness" entered and the vague-symptoms route showing. The label "decision support, not diagnosis" must be visible.
  2. One line: "Links to the guideline (NICE NG12, UK); Finnish national criteria pending (roadmap 2.5.2)."
- **Say:** "And for the GP: type the symptoms, see the matching guideline warning signs and the fastest referral route. Decision support, not diagnosis."
- **Criteria:** Actionability (30), Execution (15).
- **Needs:** a screenshot of the helper after the freeze. Do not paste NICE or Käypä hoito text into the slide: link and cite only (`red-flags.md`).

### Slide 7 (Exa, not in the 3-minute live script; ~15 s in the video) · "Checked data shows where care breaks; Exa shows what's happening about it this week, with a link for every claim"
- **On the slide:**
  1. **Screenshot:** the county news strip under the Vantaa-Kerava numbers. The newest card shows its date and site, for example Lääkärilehti, 2 Nov 2026, on Vantaa-Kerava hiring 26 more doctors. Re-check this item on Sunday morning.
  2. **Label callout:** "found live - unverified", shown beside "checked evidence".
  3. Small line: "Judges can ask their own question; answers come only from linked results, or 'nothing found'."
- **Say (from `exa-angle.md`):** "The numbers are from THL. But what happened in Vantaa this week isn't in any dataset or any AI's memory. Exa finds it live, and every line links to its source."
- **Criteria:** all 5 Exa criteria. For AstraZeneca, it supports data transparency (keeping checked and unverified material apart).
- **Needs:** a dated screenshot of the county news strip (Sat evening, redone Sun morning). Never edit a date.
- If the stage pitch runs long, skip this slide on stage. It stays in the PDF.

### Slide 8 (2:45-3:00) · "A county director can see their bottleneck and start the first step in two minutes, using public data only"
- **On the slide:** three bullets plus the URL.
  - Every number is sourced. No patient data.
  - 22 areas, one bottleneck view each, 2-3 fixes each.
  - Next step: a pilot with one wellbeing services county. The AstraZeneca brief mentions a follow-up project with a county.
  - Live URL `[TODO: Vercel URL]` and repo URL. Tagline.
- **Say:** "Public data, every number sourced, no patient data. A county director can see their bottleneck and start the first step in two minutes. FirstLine: equal first steps, across Finland."
- **Criteria:** Actionability (30), Clarity (10).
- **Needs:** the deployed URL from Phương.

---

## 3. Criteria map

| AstraZeneca criterion | Weight | Main slides | Backup |
|---|---|---|---|
| Actionability | 30 | **5, 6, 8** (3 slides) | B4 evidence table |
| Insight | 25 | **1, 2, 3** (3 slides) | B1 |
| Data quality & transparency | 20 | 4, plus a source chip on every number | B1, B2, B3 |
| Execution | 15 | 4, 6 (real screenshots) and the live demo | B5 |
| Clarity in 2 minutes | 10 | 1, 2, 8 (one number or one sentence each) | |

**Exa:** covered on slide 7 and backup B5 only. The question box is shown live in peer review, not in the main story. The criteria it serves: information a model couldn't know from training (dated news), usefulness to a specific group (county directors), clarity in showing sources (a link on every line, the "unverified" label), originality (live finds kept beside checked evidence) and working on live queries (the judge box, with an honest "nothing found"). The AstraZeneca story never depends on Exa: slides 1-6 and 8 still work if Exa is down.

---

## 4. Backup slides (after slide 8, titled "Backup")

- **B1 · "What our main number does and doesn't measure"**
  - What 6411 measures: the % of non-urgent GP (physician) visits in primary care that were kept more than 7 days after the need was assessed.
  - It covers all non-urgent visits, not only cancer ones. It counts visits, not people.
  - Why we still use it: early cancer symptoms (tiredness, weight loss, a cough) are vague, so these patients land in the normal queue. Add the mentor answer to P1 if one is recorded.
  - Indicator 13 shows when the hospital starts assessing a referral, not when the patient sees a specialist.
  - 5033 is 0-3% everywhere and published as whole numbers, so it is context only and not used for ranking.
- **B2 · "Grey means no public data, and we don't guess"**
  - No public indicator exists for "GP recognises the symptoms", so that stage is grey for every county.
  - There is no referral data for Vantaa-Kerava or for East, Central and West Uusimaa. Sotkanet region 599 is unnamed, so we left it out.
  - Helsinki has referral data for 2025 only.
  - Åland is excluded.
  - Treatment access is out of scope because the data is flat (5093: 1.8-2.2%).
  - Source: `app/data/README.md`.
- **B3 · "Method and sources"**
  - Sotkanet REST API → a static JSON snapshot. Every row has a `source_id`, so the demo works offline.
  - Status rule: each county's 2025 value is compared with Finland's 2025 value.
  - The AI only writes text around fixed numbers. A validator drops any claim whose number or source is not in the data.
  - Source list: Sotkanet 6411 / 13 / 5033 with retrieval date 13 Nov 2026, the cancer-strategy roadmap 2026-2031, plus the evidence sources.
  - Tuan's `/sources` page screenshot `[TODO]`.
- **B4 · "14 checked actions, matched to 3 bottlenecks"**
  - A table from `docs/evidence/evidence.md` with the columns bottleneck, action, owner, precedent, effect and source. Counts: 4 for getting to a GP, 3 for GP recognition, 7 for GP → specialist.
  - Include the honest results: Sweden's pathways cut waits but regional gaps stayed (`ev-ref-sweden-svf`), and Denmark's direct CT access alone had no significant effect (`ev-rec-direct-ct-training`).
- **B5 · "Exa layer: what is live, what is checked"**
  - The three features: county news (last 12 months, yle.fi, thl.fi and county sites), the evidence finder under each action, and the judge question box.
  - The Exa key stays on the server. Results are cached. If Exa is down, the page shows "Live search unavailable" and the checked table stays visible.
  - Test results from `exa-judge-tests.md`: `[TODO: X/15 pass, median latency]`.
- **B6 · "Likely questions"**
  - The three backup lines from `demo-script.md`: "Is 6411 about cancer?", "Did these actions really work?" and "Who would pay or act?"
  - Red-flag sources and licensing from `red-flags.md`: NICE and Käypä hoito are linked only, never copied.

---

## 5. Needs from teammates

| # | What | Owner | For slide | Latest sensible time |
|---|---|---|---|---|
| N1 | Confirm the indicator 13 values for 2025: worst county, best county, Kainuu and Finland. Confirm that 5033 stays context only. | Phương | 3, B1 | **Sat 12:00** |
| N2 | A 6411 ranking chart (or a CSV export of the 22 areas for 2025) | Phương | 3 | Sat 15:00 |
| N3 | App screenshots at 1920×1080, light theme: `/`, `/county/vantaa-kerava`, `/county/vantaa-kerava/act` (named-GP card open), the Denmark card on a county with a red referral stage, the red-flag helper with "weight loss, tiredness", and `/sources` | Phương (Tuan for `/sources`) | 3-6, B3 | **Sat 19:30** (after the 18:00 freeze) |
| N4 | A dated screenshot of the Exa county news strip, plus one judge-box answer and one "nothing found" | Phương | 7, B5 | Sat 21:00; redo **Sun 07:00** |
| N5 | Live Vercel URL | Phương | 8 | Sat 20:00 |
| N6 | Mentor quotes with consent recorded (Kaisa's Saturday answers to P1 and P3 / Q4 and Q5), in `mentor-log.md` | Luan | 2, B1 | **Sat 14:00** |
| N7 | Demo script frozen (or a note of the changes), plus a decision on C6 (which county shows the Denmark card) and C5 (whether the Exa beat is in the video) | Luan | all | **Sat 16:00** |
| N8 | Final evidence table: which rows are verified, and which 2 proof numbers go on slide 5 | Luan | 5, B4 | Sat 16:00 |
| N9 | The limitations and sources text, final wording | Tuan | B1-B3 | Sat 18:00 |
| N10 | Exa judge test results (X/15, latency) | Tuan | B5 | Sat 22:00 |
| N11 | Review of PDF v1: Luan checks the wording against the script, Tuan checks the numbers against the app | Luan, Tuan | all | Sat 23:00 |

---

## 6. Build timeline for nabeo11 (Helsinki time)

| When | Do |
|---|---|
| Sat 09:00-10:30 | Pick a plain template: white background, one accent colour, red/amber/grey matching the app. Make slides 1, 2 and 8 and the empty backup frames. |
| Sat 10:30-12:00 | Fill B4 from `evidence.md` and B1-B2 from `data/README.md` (draft text). Also fix the final submission text (C3). |
| Sat 12:00-15:00 | Get N1, then build the slide 3 chart and contrast box. Add the slide 5 proof numbers once N8 is in. |
| Sat 14:00-16:00 | Add the mentor line (N6) if consent was given. Align every spoken line with Luan's frozen script (N7). |
| Sat 18:00 | Feature freeze. Do not ask for new app changes to suit the deck. |
| Sat 18:30-21:00 | Drop in the screenshots (N3, N4, N5). Read every number aloud against the app. Check the 85% wording on every slide. |
| Sat 21:00 | **Export PDF v1** and post it on the board for N11. |
| Sat 21:00-23:30 | Apply the review fixes. Rehearse the 3 minutes with Luan against the slides. Then leave: sleeping at the venue is not allowed. |
| Sun 07:00-07:30 | Check that the Exa news screenshot is still the freshest, and swap it if needed (N4). Re-read slides 1, 3 and 5 against the live app. |
| Sun 07:30-07:50 | Export the final PDF, open it once to check fonts and images, keep the file name simple (`FirstLine-deck.pdf`). |
| **Sun 08:00** | Upload the PDF with the submission. Check that the video, demo link, repo link and description are in, and that the status is **FINAL**. The hard deadline is 10:00. |

---

## 7. Contradictions and conflicts found in the repo

- **C1 · The indicator 13 and 5033 numbers ARE pulled.** `app/data/values.json` already has 13 and 5033 for 2023-2025 (19 areas in 2025), and `gaps.json` already marks the referral stages red, amber or grey. This outline still uses `[TODO]` placeholders until Phương confirms (N1). Snapshot values to confirm, Sotkanet 13 for 2025 (referrals processed within 3 days, higher is better):
  - Lowest: South Ostrobothnia 68.9%.
  - Highest: Kanta-Häme 88.7%.
  - Kainuu 75.2%, Finland 76.8%.
  - 5033 is 0-3% everywhere. That is why the data README makes it "context only", which conflicts with SPEC's "ranked by 13 / 5033" and with the brief's "5033 worst and best county".
- **C2 · The "85% of people" wording.** The board post (fraidfax, 13 Nov 20:53) has the pitch line "85% of people wait more than a week", and `app/docs/pitch/exa-angle.md:7` has "85% wait over a week for a GP". Both break the wording rule. Luan should fix `exa-angle.md`.
- **C3 · The preliminary submission text** (the preliminary submission text (local file, not in this repo), from the 21:01 board draft) says:
  - "Supports Goal 3 of the national cancer strategy" (crossed out).
  - "physician supply and cancer outcomes" (not built).
  - "the GP recognising the warning signs" as the second step. The built second step is GP → specialist.
  - "an estimated effect" (the app shows sourced effects, not estimates).
  Rewrite all of these for the final submission.
- **C4 · SPEC is stale in places.**
  - It says "Demo script (3 minutes) TBD", but `demo-script.md` exists.
  - It says counties are "ranked by 13 / 5033", but the data README says 5033 is context only.
- **C5 · Exa is not in the demo script.** `demo-script.md` has no Exa beat in either the 3-minute live pitch or the 2:00 video outline. `exa-angle.md` asks for about 15 seconds in the video. Luan decides; the deck keeps Exa on slide 7 either way.
- **C6 · The Denmark card is not on Vantaa-Kerava.** Screen 3 in the script quotes Denmark's −17 days, a referral fix. Vantaa-Kerava's referral stage is grey (no data), so its act page shows GP-access fixes. `e2e-checklist.md` item 8 already says to take the Denmark card from a county with a red referral stage.
- **C7 · Exa labels differ.** The APIs return "Found live with Exa" (county news) and "Found live — unverified" (evidence). The checklist and the deck use "found live - unverified" everywhere. The county news API also knows only 4 counties (`e2e-checklist.md` run log).
- **C8 · `exa-queries.md:171`** says the best demo items are "all from the last 2 weeks", but two of them date from Apr 2026 and Jun 2026.
- **C9 · Stale files in the repo root.** `PITCH.md` and `BUILD-PLAN.md` (in the team's local working folder, not in this repo) belong to an earlier, different project ("Reitti", 9 slides, "5-10 allowed"). Ignore them. The guide gives no slide limit.
- **C10 · The app was still placeholders** at the last smoke run (14 Nov, early Saturday): the ranking, county and act screens, with `/sources` returning 404. Slides 3-6 depend on these being finished by the freeze.
