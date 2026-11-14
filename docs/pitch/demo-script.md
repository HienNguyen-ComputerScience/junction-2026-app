# FirstLine: demo script

Audience: AstraZeneca judges from Marketing and Business Excellence, **not clinicians**. No jargon. Every number on screen has its source chip.
Judging: Actionability 30 · Insight 25 · Data quality & transparency 20 · Execution 15 · Clarity in under 2 min 10.

> **Accuracy note on the opening line.** Sotkanet 6411 is the share of *non-urgent GP visits* that happened more than 7 days after the need was assessed. It is not "85% of people", and it's not only about cancer. The line below is worded so a judge can't catch us out. Numbers are for 2025.

## 3-minute live pitch (final, rehearsed 14 Nov)

Rehearsed with three agents on the live app (a pitcher, an AstraZeneca judge scoring by the official criteria, and a non-clinical audience member). Changes from that run: red is explained in the first 10 seconds; one foreign example in the main flow (Denmark), the Norway figure moved to the backups; no "42 points" claim (South Ostrobothnia's jump is partly a recording change, see backups); no what-if arithmetic aloud; shorter step-2 segment that ends on the referral-routes panel. About 330 spoken words. Load https://firstline-finland.vercel.app before you start (it shows "Loading the areas…" for a moment); it opens on Vantaa and Kerava.

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "In Vantaa and Kerava, 85% of non-urgent GP visits wait more than a week. Red on this map means worse than Finland, and Finland itself is at 54.7%: more than half of visits wait over a week. Even the average is bad." | **Home**, preset to Vantaa and Kerava: map, big **85.4%**, chip "Sotkanet 6411 · 2025", "Finland 54.7%". |
| 0:20–0:40 | "Those queues include the visit for a vague symptom that turns out to be cancer. In the challenge speaker's own study, lymphoma patients who started at a public health centre waited a median 127 days to treatment. Through private or work care: 76." | Stay on home. |
| 0:40–0:55 | "The best area, Päijät-Häme, is at 32.7%. So the gap isn't fate: it's how each county runs its first step. But no county director can see where their own pathway breaks. FirstLine shows them." | Click **Päijät-Häme** on the map (grey-blue), then back to **Vantaa and Kerava**. |
| 0:55–1:15 | "Pick an area and one line gives the main reason. Vantaa and Kerava: getting to a GP is the slowest step, and it got worse: from 58% in 2023 to 85% now." | The reason line on home, or **Full pathway** → the county page trend (58.0 / 70.4 / 85.4). |
| 1:15–1:50 | "Then: what to do on Monday. For Vantaa and Kerava: give patients a named GP they keep. The first step is concrete: pilot it at the two or three slowest health stations, for patients over 50. Every action names who owns it and links its evidence. Where referrals are the slow step, as in South Ostrobothnia, the app suggests Denmark's fast-track pathways instead: diagnosis 17 days faster." | **See all actions** → `/county/vantaa-kerava/act`: Action 1 of 3, named GP (First step, Owner, evidence chip). Then `/county/south-ostrobothnia/act`: carousel button **2**, "Diagnosis 17 days faster". |
| 1:50–2:15 | "Where data doesn't exist, we say so. Whether GPs spot warning signs is measured nowhere in Finland. England publishes it for every area: 17% of cancers are only found in an emergency. Finland could do the same. Meanwhile, here are the four referral routes a county needs." | `/county/vantaa-kerava`, **step 2** tab: "Not measured in Finland…", chip "NHS England, Fingertips 2024/25"; then the panel "The four referral routes a county needs". |
| 2:15–2:35 | "For anything newer than our data, ask. Answers come only from live, dated sources, each one labelled unverified." | Nav **Ask the evidence** (`/ask`) → chip "Did Denmark's cancer fast-track pathways shorten diagnosis times?" (answer is cached for speed; say so if asked, and invite a judge to type their own). |
| 2:35–3:00 | "Public data only, every number sourced, no patient data. A county director sees the bottleneck and the first step in two minutes. FirstLine: equal first steps, across Finland." | Close slide: three bullets and the live URL. |

Rules while presenting: say "visits", never "people"; say "lymphoma patients", never "cancer patients", for 127 vs 76; read only numbers that are on screen; never say the map measures cancer delay (it measures access to the first step).

**Mock judge result (agent, 14 Nov):** 77/100 on the earlier draft (Actionability 22/30, Insight 19/25, Data 16/20, Execution 12/15, Clarity 8/10). Strongest: "Finland's level is itself 54.7%", "where data doesn't exist, we say so", 127 vs 76. Weakest: Norway odds oversold for a pilot; what-if restates the gap; South Ostrobothnia's jump may be recording. All three are fixed above or answered below.

**Backup lines if a judge asks**
- *"Does your ranking match cancer diagnostic delay? Did you check it against a cancer outcome?"* "We checked, and no: across the 22 areas, GP waits don't track 5-year bowel or breast cancer survival. Survival covers ten years and mixes treatment. So 6411 measures access to the first step, not cancer delay, and we say that on every county page."
- *"Could South Ostrobothnia's jump be a recording change?"* "Partly, yes. Its recorded visits roughly halved in 2025, from about 30,000 to 15,600, so we can't rule it out, and we'd ask THL before anyone acts on it. Vantaa and Kerava is different: about 35,000 recorded visits every year, and the share still rose from 58% to 85%." (North Karelia shows the same drop in recorded visits as South Ostrobothnia.)
- *"Is Päijät-Häme really the best?"* "On the published figure, yes, 32.7%. But its recorded visits more than doubled since 2023, so part of its improvement may be recording too. That's why we show it as 'at or better than Finland's level', not as a target."
- *"Why is occupational care only context, not ranked?"* "Ranking on it would mix two different things: across areas it hardly relates to public waits. So we show it side by side: in Vantaa and Kerava, 2,137 occupational against 687 public doctor visits per 1,000 working-age people. The county can act on the public queue, and people who start there wait longest."
- *"How would a county know in 6 months if the named-GP pilot worked?"* (our proposal, not in the app) "Compare pilot stations with similar ones: the share of visits with the patient's own GP, and the share waiting over seven days. If neither moves, it failed. Six months can't show cancer outcomes."
- *"Does a named GP really help?"* "In Norway, people who kept the same GP for over 15 years had 25% lower odds of dying, and fewer hospital admissions. It's observational and not cancer-specific, and the app says so on the card."
- *"How big is the gap?"* "If Vantaa and Kerava reached Finland's level, 30.7 fewer of every 100 visits would wait over a week. That's arithmetic on the published shares, not a forecast of any action."
- *"Who pays after Junction, and where could AstraZeneca help?"* (our proposal) "No business model yet: it runs on public data and free tools, and the actions are for the counties. AstraZeneca could back open data, like Finland publishing emergency-found cancers by area. Any funding should go through a neutral host with no say over content."
- *"Is 6411 about cancer?"* "No, it's all non-urgent GP visits. It's the best public measure of the first step, and the app says so on every county page."
- *"Did these actions really work?"* "We show the honest result. Sweden's pathways cut waits but regional gaps stayed. Denmark's direct CT access alone didn't help significantly. It's all in the evidence table with sources."
- *"What about occupational and private care?"* "6411 only covers public health centres. The app shows, per county, how many occupational-health doctor visits working-age people make next to public ones: in Vantaa and Kerava, 2,137 against 687 per 1,000. The challenge talk showed people who start in public care wait longest, so that's where a county can act."
- *"Isn't 127 versus 76 just lymphoma?"* "Yes: 160 lymphoma patients from 7 Finnish hospitals. It's the Finnish study the challenge talk itself used, so we say 'lymphoma patients', never 'cancer patients'. The county numbers in the app are a different source: THL data on all non-urgent GP visits."
- *"Why no cancer stage by county?"* "It isn't published: stage is known for only about 38% of cases nationally. The app shows 5-year relative survival by county instead, for bowel and breast cancer, and says plainly that it mixes how early cancer is found with how well it's treated."
- *"What about income and education?"* "They matter. A Finnish registry study of about 470,000 patients found lower education means higher odds of a stage IV diagnosis. FirstLine measures place, not income, because that's what public county data shows and what a county director can change."
- *"Why only steps 3 to 5?"* "That's where public county data exists and where a county can act. Steps 1 and 2 are the patient's own delay. Steps 6 to 8 are hospital care, which we left out on purpose: one tool, three steps, done well."
- *"Why is step 2 grey?"* "Because Finland doesn't measure it by county. England publishes, for every area, the share of cancers found through an emergency visit: 17% nationally, from 10 to 21% by area. Those patients have much lower survival. Finland has the registry and hospital data to do the same. That's our suggestion to THL and the Cancer Registry." If pressed for a Finnish number: "A Finnish lung-cancer study reported by Yle, not yet published, puts about 41 days of the delay in primary care."
- *"Can the AI make numbers up?"* "No. The county brief and the question box are checked: a sentence whose number isn't in its cited source is removed, and the app says so."
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
- South Ostrobothnia +41.7 points since 2023 (26.1% in 2023, 67.8% in 2025): Sotkanet 6411, on `/compare` "Getting worse fastest".
- What-if 30.7 fewer of every 100 visits: 85.4 minus 54.7, Sotkanet 6411 2025, shown on the act page as arithmetic, not a forecast.
- Norway 25% lower odds of dying: odds ratio 0.75, more than 15 years vs 1 year with the same GP; observational, not cancer-specific (`ev-gp-continuity`).
- England 17% (2024/25), 10–21% by area: NHS England NDRS via Fingertips, indicators 91356/91357, our share from published counts; cross-checked with NHS Routes to Diagnosis 2018 (17–22% by Cancer Alliance). Details: `docs/evidence/gp-recognition-gap.md`.
- Occupational 2,137 vs public 687 doctor visits per 1,000 aged 15–64, Vantaa and Kerava 2025: Sotkanet 2371 and 293. Stage known for about 38% of cases: Cancer Registry statistics app (national only). Survival: Sotkanet 3627 and 3625.
