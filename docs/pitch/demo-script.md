# FirstLine: demo script

Audience: AstraZeneca judges from Marketing and Business Excellence, **not clinicians**. No jargon. Every number on screen has its source chip.
Judging: Actionability 30 · Insight 25 · Data quality & transparency 20 · Execution 15 · Clarity in under 2 min 10.

> **Accuracy note on the opening line.** Sotkanet 6411 is the share of *non-urgent GP visits* that happened more than 7 days after the need was assessed. It is not "85% of people", and it's not only about cancer. The line below is worded so a judge can't catch us out. Numbers are for 2025.

## 3-minute live pitch (final, 14 Nov)

Built on the live app after the 14 Nov redesign and the AstraZeneca booth feedback: start on the map (it was their first impression), explain the benchmark in one breath ("why so red?"), give the main reason in one line, use few words. About 340 spoken words, which leaves time for the clicks. Open https://firstline-finland.vercel.app before you start; it opens on Vantaa and Kerava.

| Time | Say | Show |
|---|---|---|
| 0:00–0:20 | "In Vantaa and Kerava, 85% of non-urgent GP visits wait more than a week. In Päijät-Häme, a third. Same country. When cancer starts with a vague symptom, that queue is the first step." | **Home**, preset to Vantaa and Kerava: the map and the big **85.4%** with its chip "Sotkanet 6411 · 2025". |
| 0:20–0:40 | "The first step decides the speed. In the challenge speaker's own study, lymphoma patients who started at a public health centre waited a median 127 days to treatment. Through private or work care: 76. Yet no county director can see where their own pathway breaks. FirstLine shows them." | Stay on home. Point at the map. |
| 0:40–1:00 | "Why so much red? Red means worse than Finland's own level, and Finland's level is itself 54.7%: more than half of visits wait over a week. So no area is 'good'. Päijät-Häme, at 32.7%, shows what is possible in Finland today." | Point at "Finland 54.7%" next to the big figure, then click **Päijät-Häme** on the map (grey-blue). |
| 1:00–1:25 | "Pick an area and one line gives the main reason. Vantaa and Kerava: getting to a GP is the slowest step, and worse than in 2023. And it's moving fast: South Ostrobothnia got 42 points worse in two years." | Pick **Vantaa and Kerava** again and show the reason line. Then **Compare all 22 areas** (`/compare`): "Getting worse fastest", South Ostrobothnia first (+41.7). |
| 1:25–2:05 | "Then what to do on Monday. Every action has an owner, a first step and checked evidence. For Vantaa and Kerava: give patients a named GP. In Norway, people who kept the same GP for over 15 years had 25% lower odds of dying. First step: pilot it at the 2–3 slowest health stations, for patients over 50. If Vantaa and Kerava reached Finland's level, 31 fewer of every 100 visits would wait over a week. Where referrals are slow, Denmark's fast-track pathways made diagnosis 17 days faster." | **See all actions** → `/county/vantaa-kerava/act`: Action 1 of 3, the named-GP card (stat "25% lower odds of dying", First step, Owner), then the what-if (30.7). Then `/county/south-ostrobothnia/act`: arrow to the fast-track card ("Diagnosis 17 days faster"). |
| 2:05–2:30 | "Where data doesn't exist, we say so. Whether GPs spot warning signs is measured nowhere in Finland. England publishes it for every area: 17% of cancers are first found through an emergency visit. Finland could do the same by linking registry and hospital records." | County page `/county/vantaa-kerava`, **step 2** tab: "Not measured in Finland…" with the chip "NHS England, Fingertips 2024/25". |
| 2:30–2:45 | "For anything newer than our data, ask. Answers come only from live, dated sources, each one labelled unverified." | Nav **Ask the evidence** (`/ask`) → click the chip "Did Denmark's cancer fast-track pathways shorten diagnosis times?". |
| 2:45–3:00 | "Public data only, every number sourced, no patient data. A county director sees the bottleneck and the first step in two minutes. FirstLine: equal first steps, across Finland." | Close slide: three bullets and the live URL. |

Rules while presenting: say "visits", never "people"; say "lymphoma patients", never "cancer patients", for 127 vs 76; don't read numbers that aren't on screen. If the four-referral-routes panel (replacing the red-flag helper) is live by then, you can point at it during 2:05–2:30: "and the four referral routes a county needs". Rehearse the clicks on the live site after the 18:00 freeze: the layout changed several times on 14 Nov.

**Backup lines if a judge asks**
- *"Why is everything so red?"* "Red only means worse than Finland's own level. Finland's level is itself 54.7%, so even grey-blue areas aren't good. The best area, Päijät-Häme, is at 32.7%."
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
