# Data coverage check (before building the insights)

Date: 14 Nov 2026. Snapshot: `data/values.json` as merged from `t3/experimental-real-user-audit` (commit `ba9aca2`). Definitions and limits are quoted or summarised from the Sotkanet REST metadata (`https://sotkanet.fi/rest/1.1/indicators/<id>`, English and Finnish text), read on the same day.

Areas: 21 wellbeing services counties, the City of Helsinki and Finland (23 rows). Åland is outside the reform and is not in the snapshot.

## Coverage per indicator

| Sotkanet id | What it measures (plain words) | Unit | Geographic unit | Years in snapshot | Areas with a value | Count behind the figure (`abs_value`) | Publisher, data updated |
|---|---|---|---|---|---|---|---|
| 6411 | Share of non-urgent GP (doctor) visits in public primary care that came more than 7 days after the need was assessed. Waiting time runs from first contact to the visit. All non-urgent doctor visits, not only cancer. | % of visits | Patient's home area | 2023, 2024, 2025 | All 23 in every year | Visits that waited over 7 days. Visits with waiting-time data = count ÷ share (same rule as `lib/recording.ts`) | THL, 13 May 2026 |
| 13 | Share of referrals to specialist (hospital) care that a doctor processed within 3 days of arrival. Not when the patient is seen. | % of referrals | **The hospital organisation that received the referral** (producer), not the patient's home area | 2023, 2024, 2025 | 18 in 2023–2024, 19 in 2025. Missing: East, Central and West Uusimaa and Vantaa–Kerava (HUS handles their referrals; one HUS-wide value exists in `gaps.json` as `shared`), Helsinki before 2025 | Referrals processed within 3 days (HUS 2024 = 246,244, matches HUS's own report) | THL, 5 Jun 2026 |
| 5033 | Share of referrals processed after more than 21 days | % (whole numbers, 0–3 everywhere) | Hospital organisation | 2023–2025 | Same as 13 | Referrals processed after 21 days | THL |
| 3621 | Share of women invited to breast cancer screening who attended | % of invited | Area | 2022, 2023, 2024 | All 23 | Women who attended | Finnish Cancer Registry, 12 Jun 2026 |
| 6103 | Share of people invited to bowel (colorectal) cancer screening who attended. Programme started 2022 and is widening its age band. | % of invited | Area | 2022, 2023, 2024 | All 23 | People who attended | Finnish Cancer Registry, 12 Jun 2026 |
| 3620 | Share of women invited to cervical cancer screening who attended | % of invited | Area | 2022, 2023, 2024 | All 23 | Women who attended | Finnish Cancer Registry, 12 Jun 2026 |
| 2371 | Doctor visits in occupational health care per 1,000 residents aged 15–64. Finnish metadata: service forms T30 statutory, T31 non-statutory and T32 other occupational health care, in-person and remote. | per 1,000 aged 15–64 | Patient's home area | 2023, 2024, 2025 | All 23 | Number of visits | THL, 24 Sep 2026 |
| 293 | Doctor visits in public primary care (outpatient) per 1,000 residents aged 15–64; includes maternity, school, student and mental-health visits; excludes occupational health | per 1,000 aged 15–64 | Patient's home area | 2023, 2024, 2025 | All 23 | Number of visits | THL, 24 Sep 2026 |
| 692 | Share of residents who received a Kela reimbursement for a private doctor visit in the year (any specialty) | % of population | Area | 2023, 2024, 2025 | All 23 | Number of people reimbursed | Kela, 8 Jun 2026 |
| 3627 | Five-year relative survival, bowel cancer, age-standardised. Each year's value covers patients diagnosed that year and the nine before it (2024 = diagnosed 2015–2024). | % (published as whole numbers) | Area (Cancer Registry figures for the wellbeing services areas) | 2022, 2023, 2024 | All 23 | none published | Finnish Cancer Registry, 12 Jun 2026 |
| 3625 | Five-year relative survival, breast cancer, same method | % (whole numbers) | Area | 2022, 2023, 2024 | All 23 | none published | Finnish Cancer Registry, 12 Jun 2026 |

So the snapshot holds **three** years per indicator, not four: 2023–2025 for the waits, referrals and visit rates, 2022–2024 for screening and survival.

## Recording problems found in the publishers' own notes

- **6411, 2371, 293 (THL):** "There are gaps in the data for Vantaa (from 2019 onwards), Helsinki (from 2021 onwards) and Kerava (from 2021 onwards)… From 2024 onwards, the data for Helsinki would seem to have returned to the previous, correct level. Vantaa has a gap of approximately 20 percent in the number of visits in the 2024 data and Kerava has a gap of approximately 30 percent." (6411 limits text; 2371 and 293 carry the same warning in Finnish: "Vantaan (vuodesta 2019 alkaen), Helsingin (vuodesta 2021 alkaen) ja Keravan (vuodesta 2021 alkaen) tiedoissa on puutteita.")
- **13:** "The index describes producer-specific information." A county's value is its hospital's, not its residents'.

## Checked: the visit count behind 6411 changes a lot

Visits with waiting-time data = count ÷ share. Change 2023 → 2025, per area (22 areas, Finland left out):

| Area | 2023 | 2024 | 2025 | 2023→2025 | 2023→2024 | 2024→2025 |
|---|---|---|---|---|---|---|
| Central Finland | 25,101 | 42,929 | 27,493 | +10% | +71% | −36% |
| Central Ostrobothnia | 4,483 | 3,458 | 7,936 | +77% | −23% | +129% |
| Central Uusimaa | 40,439 | 86,655 | 70,373 | +74% | +114% | −19% |
| East Uusimaa | 12,640 | 13,706 | 18,923 | +50% | +8% | +38% |
| Helsinki | 40,137 | 71,842 | 84,502 | +111% | +79% | +18% |
| Kainuu | 408 | 653 | 2,563 | +528% | +60% | +292% |
| Kanta-Häme | 18,869 | 14,685 | 9,514 | −50% | −22% | −35% |
| Kymenlaakso | 21,295 | 18,893 | 14,513 | −32% | −11% | −23% |
| Lapland | 36,894 | 55,347 | 49,545 | +34% | +50% | −10% |
| North Karelia | 35,118 | 46,777 | 26,455 | −25% | +33% | −43% |
| North Ostrobothnia | 59,848 | 44,271 | 34,806 | −42% | −26% | −21% |
| North Savo | 33,950 | 83,736 | 91,876 | +171% | +147% | +10% |
| Ostrobothnia | 23,579 | 26,493 | 8,485 | −64% | +12% | −68% |
| Päijät-Häme | 10,473 | 15,729 | 23,520 | +125% | +50% | +50% |
| Pirkanmaa | 171,174 | 231,844 | 275,138 | +61% | +35% | +19% |
| Satakunta | 40,158 | 45,928 | 22,943 | −43% | +14% | −50% |
| South Karelia | 9,467 | 8,579 | 9,526 | +1% | −9% | +11% |
| South Ostrobothnia | 24,958 | 29,855 | 15,642 | −37% | +20% | −48% |
| South Savo | 7,456 | 8,000 | 6,257 | −16% | +7% | −22% |
| Southwest Finland | 150,872 | 150,276 | 232,591 | +54% | −0% | +55% |
| Vantaa–Kerava | 36,426 | 32,384 | 34,985 | −4% | −11% | +8% |
| West Uusimaa | 26,629 | 95,625 | 119,428 | +348% | +259% | +25% |

**Confirmed: 18 of 22 areas moved by more than 20% between 2023 and 2025.** The four that did not (Central Finland, South Karelia, South Savo, Vantaa–Kerava) are not all steady: Central Finland rose 71% and then fell 36%, which nets to +10%. So the confidence grade checks each year against the year before, not only the first against the last. Vantaa–Kerava looks steady, but THL itself reports a 20–30% gap in its records, so it gets the "publisher reports gaps" grade instead. Kainuu's 2023 and 2024 shares rest on 408 and 653 visits.

The other counts are steadier: occupational-health visits (2371) and private-doctor reimbursements (692) moved less than 10% a year everywhere except Kainuu 2371 (+20% 2023→2024). Referral counts (13) moved less than 15% a year except South Karelia (+19%, +27%).

## Checked and not used

- **2022 values** exist in Sotkanet for 6411 (all 23 areas), 2371, 293, 692 and for 13 (17 areas). Not fetched: 2022 is before the wellbeing services counties took over (1 Jan 2023), THL says 2022 is the year the Helsinki/Vantaa/Kerava gaps hit national visit counts hardest (about 7% fewer), and the rest of the app works with 2023–2025. Adding a pre-reform year would add a point but not reliability. The early warning therefore says "three years".
- **Sotkanet 10024** (EU standardised cancer death rate) would match Goal 3's mortality measure, but its series ends in 2015 and has no wellbeing-services-county rows.
- **Sotkanet 3626** (cervical cancer survival) exists; not added, since bowel and breast already show the outcome step and match two of the three screening programmes.
- No figure for cancer stage, route to diagnosis, days to diagnosis or days to treatment exists by area in Sotkanet. Those steps are shown as "not published".

## What this means for the build

1. The GP-wait trend cannot be read at face value in most areas; any "getting worse" flag on 6411 must carry the recording grade.
2. Referral speed (13) describes hospitals, not residents; for four Uusimaa areas only a HUS-wide value exists.
3. Occupational-health and private-doctor use are steady enough to compare areas, but 16 of 22 areas sit below Finland on occupational-health visits (Finland's figure is pulled up by the large cities), so that comparison alone separates little.
4. Survival is published in whole numbers with a narrow spread (breast 89–94%), so small differences from Finland are treated as "about the same".
