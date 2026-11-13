# FirstLine: demo script

Audience: AstraZeneca judges from Marketing and Business Excellence, **not clinicians**. No jargon. Every number on screen has its source chip.
Judging: Actionability 30 · Insight 25 · Data quality & transparency 20 · Execution 15 · Clarity in under 2 min 10.

> **Accuracy note on the opening line.** Sotkanet 6411 is the share of *non-urgent GP visits* that happened more than 7 days after the need was assessed. It is not "85% of people", and it's not only about cancer. The line below is worded so a judge can't catch us out. Numbers are for 2025.

## 3-minute live pitch

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "In Vantaa–Kerava, 85% of non-urgent GP visits come more than a week after people ask for one. In Päijät-Häme it's a third. Cancer doesn't wait." | Title slide. The two numbers, big, with the source chip "THL Sotkanet 6411, 2025". |
| 0:20–0:45 | "Most cancers are first noticed by a GP. So where you live decides how fast your first step happens. Finland's new cancer strategy says this must be equal everywhere. But no one shows a county director *where* their own pathway breaks." | One line: patient → GP → specialist. Mark the two steps we measure. |
| 0:45–1:15 | "This is FirstLine. Every county, ranked by how long it takes to see a GP and how fast referrals move to a specialist." | **Screen 1: county ranking.** Hover a source chip. |
| 1:15–1:45 | "Pick a county. FirstLine shows where the delay is: getting in to a GP, or getting from the GP to a specialist. Grey means there's no public data, and we say so." | **Screen 2: county pathway.** Stage cards red / amber / grey. Point at the limitations box. |
| 1:45–2:30 | "Then: what to do on Monday. Vantaa–Kerava's problem is getting in to a GP, so FirstLine shows GP-access actions. Each has an owner, a first step, a country that already did it, and the source. In Norway, people who kept the same GP for over 15 years had fewer hospital admissions and lower mortality. Where the delay is after the GP, as in South Ostrobothnia, it shows Denmark's fast-track pathways instead: 17 days off the median time to diagnosis." | **Screen 3: actions** on `/county/vantaa-kerava/act`: open the named-GP card (`ev-gp-continuity`), show the quote and link. Then open `/county/south-ostrobothnia/act` and the Denmark card (`ev-ref-denmark-cpp`). |
| 2:30–2:45 | "And for the GP: type the symptoms, see the matching guideline warning signs and the fastest referral route. Decision support, not diagnosis." | Red-flag helper: enter "weight loss, tiredness" → vague-symptoms route. |
| 2:45–3:00 | "Public data, every number sourced, no patient data. A county director can see their bottleneck and start the first step in two minutes. FirstLine: equal first steps, across Finland." | Close slide: three bullets and the live URL. |

**Backup lines if a judge asks**
- *"Is 6411 about cancer?"* "No, it's all non-urgent GP visits. It's the best public measure of the first step, and the app says so on every county page."
- *"Did these actions really work?"* "We show the honest result. Sweden's pathways cut waits but regional gaps stayed. Denmark's direct CT access alone didn't help significantly. It's all in the evidence table with sources."
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
- Denmark −17 days: `evidence.json` → `ev-ref-denmark-cpp`. It is a referral action, so show it on a county whose referral card is red (South Ostrobothnia is red on both steps). Vantaa–Kerava's referral card is grey (no public data), so the Denmark card may not appear there.
- Norway continuity: `ev-gp-continuity`. Sweden: `ev-ref-sweden-svf`. Denmark CT: `ev-rec-direct-ct-training`.
