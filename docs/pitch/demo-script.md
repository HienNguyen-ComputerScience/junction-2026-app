# FirstLine: demo script

Audience: AstraZeneca judges from Marketing and Business Excellence, **not clinicians**. No jargon. Every number on screen has its source chip.
Judging: Actionability 30 · Insight 25 · Data quality & transparency 20 · Execution 15 · Clarity in under 2 min 10.

> **Accuracy note on the opening line.** Sotkanet 6411 is the share of *non-urgent GP visits* that happened more than 7 days after the need was assessed. It is not "85% of people", and it's not only about cancer. The line below is worded so a judge can't catch us out. Numbers are for 2025.

## 3-minute live pitch

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "In Vantaa–Kerava, 85% of non-urgent GP visits come more than a week after people ask for one. In Päijät-Häme it's a third. Cancer doesn't wait." | Title slide. The two numbers, big, with the source chip "THL Sotkanet 6411, 2025". |
| 0:20–0:45 | "In Finland, lymphoma patients whose first stop was a public health centre waited a median 127 days from first symptom to treatment. Through private or work healthcare: 76. The first step decides the speed. Finland's new cancer strategy says this must be equal everywhere. But no one shows a county director *where* their own pathway breaks." | One line: patient → GP → specialist. Mark the two steps we measure. |
| 0:45–1:15 | "This is FirstLine. Every county, ranked by how long it takes to see a GP and how fast referrals move to a specialist." | **Screen 1: county ranking.** Hover a source chip. |
| 1:15–1:45 | "Pick a county. FirstLine shows where the delay is: getting in to a GP, or getting from the GP to a specialist. Grey means there's no public data, and we say so." | **Screen 2: county pathway.** Stage cards red / amber / grey. Point at the limitations box. |
| 1:45–2:30 | "Then: what to do on Monday. Vantaa–Kerava's problem is getting in to a GP, so FirstLine shows GP-access actions. Each has an owner, a first step, a country that already did it, and the source. In Norway, people who kept the same GP for over 15 years had fewer hospital admissions and lower mortality. Where the delay is after the GP, as in South Ostrobothnia, it shows Denmark's fast-track pathways instead: 17 days off the median time to diagnosis." | **Screen 3: actions** on `/county/vantaa-kerava/act`: open the named-GP card (`ev-gp-continuity`), show the quote and link. Then open `/county/south-ostrobothnia/act` and the Denmark card (`ev-ref-denmark-cpp`). |
| 2:30–2:45 | "And for the GP: type the symptoms, see the matching guideline warning signs and the fastest referral route. Decision support, not diagnosis." | Red-flag helper: enter "weight loss, tiredness" → vague-symptoms route. |
| 2:45–3:00 | "Public data, every number sourced, no patient data. A county director can see their bottleneck and start the first step in two minutes. FirstLine: equal first steps, across Finland." | Close slide: three bullets and the live URL. |

**Backup lines if a judge asks**
- *"Is 6411 about cancer?"* "No, it's all non-urgent GP visits. It's the best public measure of the first step, and the app says so on every county page."
- *"Did these actions really work?"* "We show the honest result. Sweden's pathways cut waits but regional gaps stayed. Denmark's direct CT access alone didn't help significantly. It's all in the evidence table with sources."
- *"What about occupational and private care?"* "6411 only covers public health centres. That's the point: the challenge talk showed people who start there wait longest, so that's where a county can act."
- *"Isn't 127 versus 76 just lymphoma?"* "Yes: 160 lymphoma patients from 7 Finnish hospitals. It's the Finnish study the challenge talk itself used, so we say 'lymphoma patients', never 'cancer patients'. The county numbers in the app are a different source: THL data on all non-urgent GP visits."
- *"What about income and education?"* "They matter. A Finnish registry study of about 470,000 patients found lower education means higher odds of a stage IV diagnosis. FirstLine measures place, not income, because that's what public county data shows and what a county director can change."
- *"Why only steps 3 to 5?"* "That's where public county data exists and where a county can act. Steps 1 and 2 are the patient's own delay. Steps 6 to 8 are hospital care, which we left out on purpose: one tool, three steps, done well."
- *"Who would pay or act?"* "The wellbeing services county. Every action names the owner, and two of them are already in Finland's 2026–2031 cancer roadmap."

## 2:00 video outline (hard limit, aim for 1:50)

| Time | Shot | Voice-over (short) |
|---|---|---|
| 0:00–0:12 | Map of Finland; Vantaa–Kerava 85%, Päijät-Häme 33% appear | The opening line (above). |
| 0:12–0:30 | Patient → GP → specialist line, two steps highlighted | Why the first step matters and who can fix it. |
| 0:30–0:55 | Screen recording: county ranking, then click into a county | "Rank counties, open one, see where it breaks." |
| 0:55–1:25 | Vantaa–Kerava actions: open the named-GP card. Then South Ostrobothnia actions: open the Denmark fast-track card. | One number each, source visible on screen. |
| 1:25–1:40 | Red-flag helper typing symptoms | "Decision support, not diagnosis." |
| 1:40–1:50 | Close card: product name, URL, "public data only, every number sourced" | Tagline. |

Record the screens with Playwright (the `ecc:ui-demo` skill) once the app is deployed. Upload by Sun 08:00.

## Sources for numbers said aloud
- 85.4% Vantaa–Kerava, 32.7% Päijät-Häme, 54.7% Finland: THL Sotkanet indicator 6411, 2025.
- 127 vs 76 days: Kuitunen et al., Cancer Medicine 2026;15:e71920, https://pmc.ncbi.nlm.nih.gov/articles/PMC13158131/ (median symptoms-to-treatment interval, DLBCL, 160 patients, 7 Finnish hospitals). This is the challenge speaker's own study (slide 11 of the challenge deck). Use the medians, not the 207/123 shown on the slide chart. Details: `docs/evidence/challenge-brief.md`.
- Backup lines on the 8-step pathway: challenge talk slide 10 (Hanne Kuitunen, 13 Nov 2026). How our data maps to the steps: Sotkanet 6411 (wait for a GP visit) is step 3, Sotkanet 13 (share of referrals the hospital processes within 3 days) is step 5; step 4 has no public data.
- Lower education and stage IV (backup line only): Zai et al., BMJ Public Health 2025;3:e002829, https://pmc.ncbi.nlm.nih.gov/articles/PMC12551501/ (469,522 patients, Finland 2000–2019; stage IV odds ratio 1.10 for men, 1.15 for women). Don't use the slide's "27% vs 47%": it isn't checked.
- Backup, if asked why the GP step matters: "75 to 85 percent of cancer patients start at the GP": Vedsted & Olesen, Br J Cancer 2015, https://pmc.ncbi.nlm.nih.gov/articles/PMC4385978/ — "In health-care systems in which GPs form a specialised first line, data show that 75–85% of all cancer patients start in general practice by presenting signs or symptoms". Danish and UK data, not Finnish, so keep the "where the GP is the first stop" part.
- Denmark −17 days: `evidence.json` → `ev-ref-denmark-cpp`. It is a referral action, so show it on a county whose referral card is red (South Ostrobothnia is red on both steps). Vantaa–Kerava's referral card is grey (no public data), so the Denmark card may not appear there.
- Norway continuity: `ev-gp-continuity`. Sweden: `ev-ref-sweden-svf`. Denmark CT: `ev-rec-direct-ct-training`.
