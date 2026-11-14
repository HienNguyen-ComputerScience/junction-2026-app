# Challenge brief: "Equitable Cancer Care – How Can We Ensure It in Finland"

The official challenge talk, given 13 Nov 2026 in Espoo. Speaker: **Hanne Kuitunen**, oncologist and Service Area Director, Oulu University Hospital (Pohde, North Ostrobothnia). Deck code FI18583-11-26. She declares consulting for AstraZeneca, among other companies.

## What the deck says, and where FirstLine fits

| Slide | Point | FirstLine |
|---|---|---|
| 3–4 | Reform goal: better access and fewer regional differences. Counties built "different delivery models": service networks, digital tools and care pathways differ, and this can create inequity. | This is our core message: compare counties and show where each pathway breaks. |
| 5 | Public, occupational and private care run side by side. Faster routes depend on job, insurance and money ("inverse care law"). | **A caveat for us.** Sotkanet 6411 only measures public health centres. It doesn't show the faster occupational/private routes. Say so if asked. |
| 7, 12–15 | Lower socioeconomic status (SES) means later stage, less treatment and worse survival, across the whole pathway. | Context only. We measure place, not SES. |
| **10** | **The 8-step delay pathway.** Patient delay (steps 1–2), then system delay (3–8). System causes named: symptoms not recognised, **limited access to primary care physicians**, **diagnostic and specialist waiting lists**, fragmented pathways and regional differences. | **This is our scope, in the challenge's own picture.** FirstLine covers steps 3–5: first contact, physician assessment, tests and referrals. The red-flag helper covers "symptoms not recognised". Use this slide's 8-step line in our deck. |
| **11** | Finnish lymphoma (DLBCL) data: patients who started in **public primary care** reached treatment much later than those who started in **private or occupational care**. | **Our best Finnish number** (verified below). |
| 16 | Cancer care costs are set to rise from €1.5 bn (2023) to €2.6 bn (2035). Strategy priorities: timely access and clinical guidelines. "Consistent, evidence-based criteria … across Finland." | Matches our national referral criteria action (`ev-ref-national-criteria`, roadmap 2.5.2). |

## Numbers checked against the papers

✅ = read in the paper (Europe PMC full text or abstract). Quote the paper, not the slide.

| Claim | Exact source text | Source | Status |
|---|---|---|---|
| Public primary care first: median **127 days** from symptoms to treatment. Private or occupational first: **76 days**. | "Patients who made their first contact through primary healthcare appointments had a median STI of 127 days (mean = 201), which was significantly longer compared to patients who accessed private or occupational healthcare services, where the median STI was 76 days (mean = 126) (Mann–Whitney U, p = 0.027)." STI = symptoms-to-treatment interval. | Kuitunen et al., *Cancer Medicine* 2026;15:e71920, [PMC13158131](https://pmc.ncbi.nlm.nih.gov/articles/PMC13158131/) | ✅ |
| (slide 11 chart: 207 vs 123 days) | The chart plots cumulative days per step, roughly the means. **Don't say 207/123 aloud.** Use the medians above. | same | ⚠️ chart only |
| Symptom-to-biopsy over 7 weeks means worse progression-free survival. | "Prolonged time from symptom onset to diagnostic biopsy > 7 weeks implied inferior progression free survival in the whole study cohort (2 year PFS 89% vs. 74%, p = 0.012)" | Tokola et al., *Cancer Medicine* 2025;14(22), [PMC12640614](https://pmc.ncbi.nlm.nih.gov/articles/PMC12640614/) | ✅ |
| Lower education means higher odds of stage IV and higher mortality, in Finland 2000–2019 (469,522 patients). | Stage IV, men: OR 1.10 (1.08–1.12); women: OR 1.15 (1.13–1.17). Mortality, men: HR 1.13; women: HR 1.14. | Zai et al., *BMJ Public Health* 2025;3:e002829, [PMC12551501](https://pmc.ncbi.nlm.nih.gov/articles/PMC12551501/) | ✅ abstract |
| "Cancer mortality 27% (highest education) vs 47% (lowest)" | Not in the abstract. | Zai et al. 2025 (slide 15) | ⚠️ not checked: don't use |

Limits: Kuitunen and Tokola cover one cancer (DLBCL) with 160 patients from 7 Finnish hospitals, 2014–2020. The 127 vs 76 gap is by *first place of contact*, which itself depends on age, income and job. Say "lymphoma patients", not "cancer patients".

## Suggested pitch line

> "In Finland, lymphoma patients whose first stop was a public health centre waited a median 127 days from first symptom to treatment. Those who went private or through work: 76 days."

Source chip: Kuitunen et al., Cancer Medicine 2026. It's the challenge speaker's own study, so judges will recognise it. It's now in `demo-script.md`, `video-script.md` and `video-shot-script.md`. The Vedsted & Olesen 75–85% line stays as a backup answer. Deck slide 2 (`docs/submission/deck-outline.md`) still uses the 75–85% line: that's nabeo11's call.

## In the app (14 Nov, PR open for the lead)

- County page: the slide-10 pathway as an 8-step strip, steps 3–5 marked, with the 127 vs 76 line and a source chip to the paper. The limitations box says 6411 covers public health centres only.
- Data gap filled: East, Central and West Uusimaa and Vantaa–Kerava had a blank referral card. It now shows the **HUS-wide** value (74.1% of referrals processed within 3 days in 2025; Finland 76.8%), labelled "not a county figure". Source: Sotkanet 13, the HUS row. We checked it is HUS against HUS's own 2024 report: 246,244 referrals processed in 0–3 days, the same count as Sotkanet ([HUS, 31.12.2024, table 3](https://www.hus.fi/sites/default/files/2025-01/hoitoa-odottavat-potilaat-erikoisaloittain-2024-joulukuu.pdf)). The card stays grey and is not used to pick actions.
- Still open, no public source found: whether GPs spot warning signs (step 4); cancer stage at diagnosis by county (the Cancer Registry has stage for under half of cases). 6411 is still not cancer-specific, and 5033 is still too flat to use.

## Data added from the deck

Slide 9 says screening participation is lower in some groups, and slide 10's pathway starts before the GP. Sotkanet has screening attendance for all 22 areas plus Finland, 2022–2024, so it is now in the snapshot (`data/values.json`) as **context only**. Source: Finnish Cancer Registry via Sotkanet, retrieved 14 Nov 2026.

| Sotkanet id | Attended, % of those invited (2024) | Lowest | Highest | Finland |
|---|---|---|---|---|
| 3621 | Breast cancer screening (mammography), women | Helsinki 74.3 | North Ostrobothnia 85.6 | 81.6 |
| 6103 | Colorectal cancer screening | Helsinki 69.6 | South Savo 76.9 | 73.5 |
| 3620 | Cervical cancer screening, women | North Karelia 68.0 | South Ostrobothnia and South Savo 82.3 (tied) | 73.4 |

Limits: this is attendance among people who were **invited**, not coverage of everyone. Breast and cervical count women only. The three programmes invite different age bands, so don't compare one programme with another. It is context, not ranked: it doesn't change a county's rank, stage colour or recommended action. The latest year is 2024, one year behind the GP and referral numbers.

## Occupational and private first contact (added 14 Nov)

Slide 5 says public, occupational and private care run side by side. There is no public count of *first contacts* by route per county, but THL publishes visit rates for all 22 areas, 2023–2025. In the app as **context only**: one line in each county's limitations box, and listed on `/sources`. Not ranked, no status, no actions.

| Sotkanet id | Measure | Finland 2025 | Example |
|---|---|---|---|
| 2371 | Occupational-health doctor visits per 1,000 residents aged 15–64 (THL) | 2,049 | Vantaa and Kerava 2,137 |
| 293 | Public primary-care doctor visits per 1,000 residents aged 15–64 (THL) | 756 | Vantaa and Kerava 687 |
| 692 | Residents reimbursed by Kela for a private doctor visit, % (Kela; `/sources` only) | 26.9 | Vantaa and Kerava 25.4 |

Limits: visits, not people; ages 15–64 only, so it leaves out most cancer patients (over 64); 293 includes maternity, student and mental-health visits; 692 covers all specialties. Still open: GP recognition of warning signs. Cancer stage by county is not published (the Cancer Registry app shows stage nationally only; stage is known for about 38% of cases), so the app shows 5-year relative survival instead (Sotkanet 3627 bowel, 3625 breast; 2024 value = patients diagnosed 2015–2024; e.g. Päijät-Häme bowel 63%, Finland 68%). Survival mixes how early cancer is found with treatment; context only. Checked against all six organiser resources (incl. the source list) on 14 Nov.
