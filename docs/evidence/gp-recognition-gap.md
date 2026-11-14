# Step 2 "GP recognises warning signs": is there regional data?

Checked 14 Nov 2026 by Luan's Claude. Values below were fetched that day, not recalled.

## Verdict

**No.** No public, aggregate, county-level measure fairly reflects how well primary care spots possible cancer. Step 2 should stay grey ("No public data"). That is honest, and it is itself a finding for the pitch: Finland does not measure this step anywhere, in any county.

## What we checked

| # | Candidate | What exists | Regional? | Usable? |
|---|---|---|---|---|
| 1 | Share of cancers diagnosed after an emergency presentation | Not published for Finland. The England-style "Routes to Diagnosis" data has no Finnish equivalent. The Cancer Registry's bowel cancer report (news coverage only) says most hospital stays before diagnosis **started as emergencies**, but gives national figures only. To our knowledge Finland is not in the International Cancer Benchmarking Partnership study of emergency presentation. | No | No |
| 2 | Primary-care diagnostic interval (first GP visit → referral) | One unpublished lung cancer study (Kuittinen, Univ. Eastern Finland; Kuopio, Tampere, Turku, Rovaniemi) reported by Yle MOT: about 155 days from symptoms to treatment, of which **about 41 days in primary care**, 50+ patient, 58 specialist care. Four hospitals, one cancer, not public data. Cancer Registry bowel report: GP visits rise sharply 3–4 months before diagnosis (national, not by region). | No (4 sites) | No |
| 3 | Urgent suspected-cancer referral volumes or conversion rates | Nothing published by county. HUS publishes cancer access pages (the English page returned 403 to us), covering breast, prostate and bowel treatment timing in hospital, not GP referral rates. | No | No |
| 4 | Use of fast-track / "syöpäepäily" pathways | THL has a spec for monitoring cancer care access (Ohjaus 21/2016, updated 2025: referral arrival → doctor visit → treatment, 62-day limit for first treatment). We found no published regional results from it. Regional care-chain documents (e.g. KYS) describe the pathway but give no numbers. | No | No |
| 5 | Sotkanet (3,797 indicators searched for cancer, referral, emergency, imaging, screening terms) | Only **all-cause** referral and emergency indicators. Cancer-specific ones are screening attendance (3620, 3621, 6103), survival (3625–3627), cancer index and medicine refunds, which the app already covers or which are not about GPs. | Yes | No (not cancer-specific) |

### Sotkanet all-cause indicators we looked at (and why not)

| Indicator | 2024 sample values | Why not a proxy |
|---|---|---|
| 5073 Referrals received by specialised care / 1,000 inhabitants | Finland 228.7, Päijät-Häme 265.1, Lapland 218.9 | All conditions. More referrals can mean careful GPs or weak primary care; no way to tell. Only some counties report. |
| 3056 Specialised-care admissions as emergency, % of care periods | Finland 64.1, Päijät-Häme 71.2, Vantaa-Kerava 59.7, Lapland 65.4 | All conditions (fractures, strokes, infections). Says nothing about cancer. |
| 3051 Admitted with a health-centre referral, % | No values returned for 2023–2024 | No recent data. |

Using any of these as "GP recognises warning signs" would mislabel a county, which breaks our "no data stays grey, never a low score" rule.

## Caveats

- Absence of evidence here is a search result, not proof. Some data may exist inside hospitals or the Cancer Registry but is not public.
- Yle MOT (Oct 2025): Finland "lacks comprehensive national data on cancer treatment delays" and "does not have a national cancer quality registry"; funding for one was cut from the following year's budget.
- The national cancer strategy (Nov 2025) may add this measurement later.

## Questions for the AstraZeneca mentors

1. Does AstraZeneca, or a partner, hold any Finnish data on route to diagnosis (share of cancers found via emergency care) by hospital district or wellbeing county, even for one cancer type?
2. The Cancer Registry and FICAN study pre-diagnosis care use (bowel cancer). Do you know if they can share regional breakdowns, or who at the Registry or FICAN to ask?
3. Has THL started publishing results from its cancer care access monitoring (referral → first visit → treatment) by region, or is it only collected internally?

## Sources

- Sotkanet REST API, indicator list and values: https://sotkanet.fi/rest/1.1/indicators ; https://sotkanet.fi/rest/1.1/json?indicator=5073 (and 3051, 3056), years 2023–2024
- Sotkanet metadata 5073: https://sotkanet.fi/sotkanet/fi/metadata/indicators/5073
- THL, Hoitoonpääsyn seuranta syövän hoidossa (spec): https://www.julkari.fi/server/api/core/bitstreams/f99e6277-82c4-4ef7-9313-588e4b9f0f4f/content
- THL quality report, specialised care access: https://thl.fi/data-ja-tilastot/tiedon-laatu/tilastojen-laaturaportit/laaturaportti-hoitoonpaasy-erikoissairaanhoidossa
- Yle MOT, cancer treatment delays: https://yle.fi/a/74-20251023
- Cancer Registry bowel cancer report (news): https://www.verkkouutiset.fi/a/suolistosyopaan-sairastuneet-kayvat-useasti-laakarissa-ennen-diagnoosia/
- ICBP emergency presentation study: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9046095/
- HUS access to cancer treatment (403 when fetched): https://www.hus.fi/en/access-to-cancer-treatment

## What Finland should measure (proposal, 14 Nov)

The step experts call the bottleneck has no county data, so we show what to start measuring and who owns it. Both sources read in Europe PMC on 14 Nov:

- **England records how every cancer was found.** Linking cancer registrations with hospital and waiting-time data, every cancer diagnosed in England in 2006–2008 was put into one of eight "Routes to Diagnosis". "Most cancers were diagnosed through one of Emergency Presentation (24%), TWW (26%) or GP Referral (21%)". "Patients presenting via Emergency routes have substantially lower 1-year relative survival." Elliss-Brookes et al., *Br J Cancer* 2012, [PMC3494426](https://pmc.ncbi.nlm.nih.gov/articles/PMC3494426/).
- **England audits GP diagnostic work practice by practice.** The National Cancer Diagnosis Audit 2018 covered 53,252 patients in 1,868 practices and found "very large variation between practices in use of investigation". Akter et al., *BMJ Qual Saf* 2025, [PMC12171502](https://pmc.ncbi.nlm.nih.gov/articles/PMC12171502/).
- **Finland has the same building blocks:** the Finnish Cancer Registry and THL's hospital care register (Hilmo). Linking them would give each wellbeing county its share of cancers found through an emergency visit.

Proposed step-2 card (short, per booth feedback): "Not measured in Finland. England records how every cancer is found: 24% after an emergency visit, with much lower survival. Owner to start it here: THL and the Finnish Cancer Registry, by linking registry and hospital records."

Not verified: whether England publishes the route shares by region today (the NHS Digital pages refuse automated reads). Say "England records it", not "England publishes it by region".
