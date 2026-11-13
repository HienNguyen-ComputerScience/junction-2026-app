# Evidence table — FirstLine

What works to shorten the first steps to a cancer diagnosis, with a real source for every row. Machine-readable copy: [`evidence.json`](evidence.json) (the app imports this). Keep this page and the JSON in sync.

Rules: every row was checked against the opened source (`verified: true`). `effect_size` is `null` when the source gives no single number. Quotes are copied word for word; Finnish and Swedish quotes have an English gloss.

| Bottleneck | Actions |
|---|---|
| 1. Getting in to see a GP | 4 |
| 2. GP recognises the symptoms | 3 |
| 3. GP → specialist | 7 |

## 1. Getting in to see a GP

### Give patients a named GP (omalääkäri) they keep over time
`ev-gp-continuity`

Assign a named GP + nurse pair, starting with older patients and frequent attenders at the health stations with the longest waits. Continuity means the GP knows the patient's baseline and notices a new or persisting symptom sooner.

- **Who does it:** Wellbeing services county: primary care director
- **First step:** Pick the 2-3 health stations with the worst 7-day access and pilot named-GP lists there for patients aged 50+.
- **Precedent:** Norway's regular GP scheme (every resident listed with a named GP); Finland's national omalääkäri programme (roadmap measure 2.5.1).
- **Effect:** In Norway (4.5 million people), patients who had kept the same GP for more than 15 years had 25% lower odds of dying in the year studied than those with a 1-year relationship, and fewer acute hospital admissions. — *effect size: 0.75 odds ratio (mortality, >15 years vs 1 year with the same GP)*
- **Source:** [Sandvik et al. Continuity in general practice as predictor of mortality, acute hospitalisation, and use of out-of-hours care: a registry-based observational study in Norway. Br J Gen Pract 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8510690/)
- **Quote / page:** Abstract, Results: "OR for dying decreased gradually from 0.92 (95% CI = 0.86 to 0.98) after 2-3 years' duration, to 0.75 (95% CI = 0.70 to 0.80) after an RGP-patient relationship of >15 years."
- **Limitations:** Observational study, so association not proven cause (authors argue dose-response suggests causation). Not cancer-specific. Does not measure waiting time to see a GP.

### Add GP capacity in primary care and roll out the named-GP model county-wide
`ev-gp-capacity-roadmap`

Finland's own cancer-strategy roadmap names more primary-care GP capacity and the omalääkäri-omahoitaja (named GP + named nurse) model as the first measure for earlier cancer detection, funded through state grants.

- **Who does it:** STM (national omalääkäri programme, funding); wellbeing services counties, HUS and City of Helsinki (rollout)
- **First step:** Apply for the omalääkäri programme state grant and set a county target for 7-day GP access (Sotkanet 6411).
- **Precedent:** Finnish national cancer strategy implementation roadmap 2026-2031, measure 2.5.1.
- **Effect:** Not quantified in the roadmap. The roadmap's 2028-2031 target is that continuity models are in routine use in every county and delays in access to care have shortened. — *effect size: not quantified*
- **Source:** [Kansallinen syöpästrategia 2026-2035: Toimeenpanon tiekartta vuosille 2026-2031 (STM)](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf)
- **Quote / page:** p. 51, measure 2.5.1: "Syövän varhaisen toteamisen näkökulmasta on keskeistä, että lääkärien saatavuutta perusterveydenhuollossa vahvistetaan ja hoidon jatkuvuutta tukevien mallien, kuten omalääkäri-omahoitaja-mallin, käyttöönottoa vahvistetaan valtakunnallisesti." (EN: For early cancer detection it is essential to strengthen GP availability in primary care and the nationwide adoption of continuity models such as the named GP + named nurse model.)
- **Limitations:** A plan, not an evaluated result. No effect size. Depends on recruiting GPs, which is the hard part in the worst counties.

### Let trained nurses handle suitable first-contact and follow-up visits to free GP slots
`ev-gp-nurse-first-contact`

Nurse practitioners take routine first-contact, urgent physical complaints and chronic-condition follow-ups, so GP appointments go to patients who need a doctor, including those with possible cancer symptoms.

- **Who does it:** Wellbeing services county: primary care director and chief nurse
- **First step:** List the visit types at one health station that nurses could take over (e.g. chronic-disease follow-ups) and measure the GP hours freed.
- **Precedent:** Cochrane review of 18 randomised trials of nurses substituting for primary care doctors (mostly high-income countries).
- **Effect:** Nurse-led primary care probably gives equal or better health outcomes and slightly higher patient satisfaction than doctor-led care, with little or no difference in referrals or admissions. — *effect size: not quantified*
- **Source:** [Laurant et al. Nurses as substitutes for doctors in primary care. Cochrane Database Syst Rev 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6367893/)
- **Quote / page:** Authors' conclusions: "trained nurses, such as nurse practitioners, practice nurses, and registered nurses, probably provide equal or possibly even better quality of care compared to primary care doctors, and probably achieve equal or better health outcomes for patients."
- **Limitations:** Does not measure GP waiting times directly. Consultations are probably longer with nurses. Cost effect uncertain. Not cancer-specific.

### Use the national digital symptom assessment (Omaolo) to triage contacts
`ev-gp-digital-triage`

Patients fill in an online symptom assessment that recommends urgency and channel, so phone lines and GP slots are less clogged and urgent cases are routed faster.

- **Who does it:** Wellbeing services county: digital services lead (Omaolo is provided by DigiFinland)
- **First step:** Check whether the county already offers Omaolo symptom assessment and what share of non-urgent contacts go through it.
- **Precedent:** Omaolo, Finland's CE-marked national symptom checker (DigiFinland + Duodecim), validated in Finnish health centres.
- **Effect:** In 877 real patients at Finnish health centres, 97.6% of Omaolo's triage assessments were judged safe compared with a triage nurse. Exact agreement with the nurse was only 53.7%. — *effect size: 97.6 % (share of triage assessments judged safe vs nurse)*
- **Source:** [Liu, Kaila & Koskela. Triage Accuracy and the Safety of User-Initiated Symptom Assessment With an Electronic Symptom Checker in a Real-Life Setting. JMIR Hum Factors 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11467609/)
- **Quote / page:** Abstract, Results: "Safe assessments by the ESC accounted for 97.6% (856/877; 95% CI 95.6%-98.0%) of all assessments made."
- **Limitations:** Measures safety vs a nurse, not shorter waits. Exact agreement 53.7%, sensitivity 62.6%. Data collected 2019. Authors are from the developer's network. Not cancer-specific.


## 2. GP recognises the symptoms

### Adopt an explicit, low referral threshold: refer when symptoms carry about 3% or more cancer risk
`ev-rec-nice-threshold`

Give GPs a symptom-by-symptom list of when to refer or order a test, based on a stated risk threshold, so the decision depends less on which GP the patient happens to see.

- **Who does it:** County chief physician with FICAN / national pathway groups (Finnish criteria are being written under roadmap measure 2.5.2)
- **First step:** Compare the county's local referral instructions for 2-3 common cancers with the NICE NG12 symptom lists and note the gaps.
- **Precedent:** UK NICE guideline NG12 'Suspected cancer: recognition and referral' (2015, last updated April 2026).
- **Effect:** Not quantified here. NICE bases its suspected-cancer referral recommendations on symptoms with a 3% or more probability of cancer. — *effect size: not quantified*
- **Source:** [NICE NG12 Suspected cancer: recognition and referral, Update information](https://www.nice.org.uk/guidance/ng12/chapter/Update-information)
- **Quote / page:** Update information, May 2025: "We amended recommendations 1.2.1 and 1.2.7 to recommend a suspected cancer referral for people with symptoms indicating a 3% or more probability of having oesophageal or stomach cancer"
- **Limitations:** UK guideline; UK referral routes differ from Finland's. NICE content may not be reproduced outside the UK without permission: link and cite only, do not copy the lists into the app.

### Make safety-netting standard: book a review for symptoms that don't yet meet referral criteria
`ev-rec-safety-netting`

When a patient has a symptom linked to cancer risk but doesn't meet referral criteria, the GP agrees a review date or tells the patient exactly when to come back. Test results always have a named owner.

- **Who does it:** Health station medical lead; patient record system owner (a reminder field)
- **First step:** Add a 'safety-net review date' field to the visit template at one health station.
- **Precedent:** NICE NG12 recommendations 1.15.1-1.15.2 (safety netting).
- **Effect:** Not quantified in the guideline. — *effect size: not quantified*
- **Source:** [NICE NG12, Recommendations on patient support, safety netting and the diagnostic process](https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-on-patient-support-safety-netting-and-the-diagnostic-process)
- **Quote / page:** Rec. 1.15.2: "Consider a review for people with any symptom that is associated with an increased risk of cancer, but who do not meet the criteria for referral or other investigative action."
- **Limitations:** Guideline recommendation, no effect size. Needs GP time, which is scarce in the counties with the longest waits. UK copyright: link, don't copy.

### Give GPs direct access to imaging, paired with a short training session
`ev-rec-direct-ct-training`

GPs can order a low-dose chest CT themselves instead of referring first. In the Danish trial the access alone did not help significantly; practices that also attended a one-hour education meeting had much shorter diagnostic intervals.

- **Who does it:** County imaging services + primary care medical lead
- **First step:** Check which imaging tests GPs in the county can already order directly, and run a 1-hour lung-cancer symptom session for GPs.
- **Precedent:** Aarhus, Denmark: cluster-randomised trial in 119 general practices.
- **Effect:** Overall no significant effect (median 36 vs 44 days, p = 0.299). Subgroup: practices that attended the education meeting had a median diagnostic interval of 23 vs 66 days. — *effect size: not quantified*
- **Source:** [Guldbrandt et al. The effect of direct access to CT scan in early lung cancer detection: an unblinded, cluster-randomised trial. BMC Cancer 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4660800/)
- **Quote / page:** Abstract, Conclusion: "Direct low-dose CT from primary care ... did not statistically significantly decrease time to diagnosis or change stage at diagnosis in lung cancer patients." Results, Primary outcomes: "diagnostic interval median: 23 vs. 66, p = 0.008" (practices attending the education meeting)
- **Limitations:** Main result is null. The positive finding is a subgroup, so treat it as a hint, not proof. Lung cancer only.


## 3. GP → specialist

### Use standardised national referral criteria for suspected cancer
`ev-ref-national-criteria`

Clear symptom-based criteria that, when met, send the patient straight to the right diagnostic tests, the same in every county. Finland's roadmap commits to building these on the Danish, Swedish and Norwegian models.

- **Who does it:** FICAN (coordination) with national multi-professional cancer groups; counties implement
- **First step:** Ask FICAN which cancer types get criteria first and adopt the drafts locally as they are published.
- **Precedent:** Finnish roadmap measure 2.5.2, modelled on Denmark's Kræftpakkeforløb, Sweden's SVF and Norway's Pakkeforløp.
- **Effect:** Not quantified in the roadmap. See the Danish and Swedish rows for measured effects of the same model. — *effect size: not quantified*
- **Source:** [Kansallinen syöpästrategia 2026-2035: Toimeenpanon tiekartta vuosille 2026-2031 (STM)](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf)
- **Quote / page:** p. 52, measure 2.5.2: "Osana kansallisia syöpäkohtaisia hoitoketjukuvauksia (toimenpide 3.1.2) määritellään selkeät, standardoidut lähetekriteerit ja toimintamallit, jotka tukevat perusterveydenhuollon ammattilaisia syövän varhaisessa tunnistamisessa, diagnostiikan käynnistämisessä ja jatkotutkimuksiin ohjaamisessa." (EN: As part of national cancer-specific care pathway descriptions, clear standardised referral criteria and operating models are defined to support primary care professionals in early recognition, starting diagnostics and referring for further tests.)
- **Limitations:** A plan, not yet in place. Covers GP recognition too (the criteria guide GPs).

### Introduce cancer fast-track pathways with maximum time limits
`ev-ref-denmark-cpp`

Each cancer type gets a pathway with maximum waits for each step from referral to treatment. Denmark introduced these nationally in 2007-2009.

- **Who does it:** National health authority sets the pathways; county hospital districts reserve diagnostic slots
- **First step:** Measure the county's current time from GP referral to first specialist test for 2-3 cancers to set a baseline.
- **Precedent:** Denmark's cancer patient pathways (Kræftpakkeforløb), 2007-2009.
- **Effect:** The median diagnostic interval was 17 days shorter after the pathways than before (49 to 32 days unadjusted). Three-year relative survival for patients diagnosed via primary care rose from 45% to 54%. — *effect size: -17 days (median diagnostic interval, after vs before pathways (adjusted))*
- **Source:** [Jensen et al. Diagnostic intervals before and after implementation of cancer patient pathways. BMC Cancer 2015;15:308](https://pmc.ncbi.nlm.nih.gov/articles/PMC4412104/)
- **Quote / page:** Abstract, Results: "The median diagnostic interval was 14 (95% CI: 11;16) days shorter during and 17 (95% CI: 15;19) days shorter after the implementation of CPPs than before." Survival: Jensen et al. BMC Cancer 2017 (https://pmc.ncbi.nlm.nih.gov/articles/PMC5585953/), Abstract: "the RS3years rose from 45% (95% CI: 42;47) before to 54% (95% CI: 52;56) after CPP implementation."
- **Limitations:** Before/after comparison, not randomised. Survival gain may partly reflect lead-time and selection bias (authors say so). 63% of Danish cancer patients in 2010 were not initially referred to a pathway.

### Fund pathways on condition that regions report their waiting times
`ev-ref-sweden-svf`

Sweden copied Denmark's model (SVF, from 2015) and tied state money to regions reporting lead times. It shortened waits but regional differences stayed.

- **Who does it:** STM / national funder; counties report
- **First step:** Publish each county's referral-to-diagnosis times next to Sotkanet access data (this is what FirstLine shows).
- **Precedent:** Sweden's standardiserade vårdförlopp (SVF), about 3.6 billion SEK of state funding.
- **Effect:** The Swedish National Audit Office found SVF shortened waiting times for several cancer diagnoses at introduction, but regional differences remained, and 2022 lead-time compliance was the lowest since recording began. — *effect size: not quantified*
- **Source:** [Regeringens skrivelse 2023/24:48, Riksrevisionens rapport om statens arbete med väntetider i vården (RiR 2023:12)](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/regeringens-skrivelse/riksrevisionens-rapport-om-statens-arbete-med_hb0348/html/)
- **Quote / page:** Skr. p. 4, section 2: "Enligt Riksrevisionens granskning ledde SVF vid införandet till kortare väntetider för flera cancerdiagnoser." "Dock kvarstår de regionala skillnaderna." (EN: According to the audit, SVF led to shorter waits for several cancer diagnoses at introduction. However, regional differences remain.)
- **Limitations:** Mixed result: the honest lesson is that pathways alone don't fix regional inequality. No single effect size in the audit summary.

### Open a fast diagnostic route for vague but serious symptoms
`ev-ref-dk-diagnostic-centre`

Patients with weight loss, fatigue, unexplained pain or nausea don't fit a single-cancer pathway, so they wait longest. A diagnostic centre gives GPs one place to refer them for a fast full work-up.

- **Who does it:** County hospital district (internal medicine) with primary care
- **First step:** Name one internal-medicine unit as the county's 'vague symptoms' referral point with a fixed weekly slot allocation.
- **Precedent:** Denmark: national urgent route to diagnostic centres since 2012, at least one per region (~15 centres).
- **Effect:** About 15-20% of patients referred to Danish diagnostic centres have cancer. — *effect size: not quantified*
- **Source:** [Vedsted & Olesen. A differentiated approach to referrals from general practice to support early cancer diagnosis - the Danish three-legged strategy. Br J Cancer 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4385978/)
- **Quote / page:** Section 'Urgent referral for unspecific, serious symptoms and the diagnostic centres': "Each of the five Danish regions must have at least one diagnostic centre, and ∼15 centres have now been established." "The proportion with cancer among those referred is ∼15–20%."
- **Limitations:** Descriptive paper, not an evaluation of time saved. 15-20% is approximate, so no single effect size is given.

### Pilot a rapid diagnostic centre for non-specific symptoms
`ev-ref-uk-rdc`

England piloted multidisciplinary diagnostic centres (later Rapid Diagnostic Centres) for patients whose symptoms could be cancer but don't fit a site-specific route.

- **Who does it:** County hospital district + primary care; could start as one pilot site
- **First step:** Track referrals, cancers found and days to diagnosis from day one, using the UK pilot's measures so results are comparable.
- **Precedent:** England's ACE programme: 5 MDC projects (Airedale, Greater Manchester, Leeds, London, Oxford), 2016-2018; now NHS Rapid Diagnostic Centres.
- **Effect:** 2,961 patients were referred and 241 cancers diagnosed: a conversion rate of 8%, across a broad range of cancer types including rare ones. — *effect size: 8 % (conversion rate (cancers diagnosed / patients referred))*
- **Source:** [First results from five multidisciplinary diagnostic centre (MDC) projects for non-specific but concerning symptoms, possibly indicative of cancer. Br J Cancer 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7462853/)
- **Quote / page:** Abstract, Results: "In total, 2961 patients were referred into the MDCs and 241 cancers were diagnosed." Conclusions: "The MDC model diagnoses cancer in patients with non-specific symptoms, with a conversion rate of 8%"
- **Limitations:** No comparison group, so we don't know how much faster diagnosis was than usual care. Conversion rate is a yield measure, not a speed measure.

### Use structured e-referral templates so referrals arrive complete
`ev-ref-templates`

Incomplete referrals bounce back or get triaged wrongly. A template that asks for the key clinical facts for each suspected condition makes referrals better first time.

- **Who does it:** County patient record system owner + hospital specialty leads
- **First step:** Build a template for one suspected cancer (e.g. colorectal) in the county's referral system and audit returned referrals before and after.
- **Precedent:** Northern Norway (Harstad) cluster-randomised trial, 14 GP surgeries, including suspected colorectal cancer.
- **Effect:** Referrals from practices using templates scored 18% higher on a referral quality score. — *effect size: 18 % (referral quality score, template vs control)*
- **Source:** [Wåhlberg et al. Impact of referral templates on the quality of referrals from primary to secondary care: a cluster randomised trial. BMC Health Serv Res 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4553012/)
- **Quote / page:** Abstract, Results: "referrals in the intervention group scored 18% higher (95% CI (11%, 25%), p < 0.001) on the referral quality score than the control group."
- **Limitations:** Measures referral quality, not time to diagnosis. Included study-staff visits to practices, not just the template.

### Let GPs ask a specialist online (e-consultation) before or instead of a referral
`ev-ref-econsult`

The GP sends a question to a specialist and gets an answer in about a day. Unneeded referrals drop out of the queue, so suspected-cancer referrals move faster. Not a replacement for an urgent cancer referral.

- **Who does it:** County hospital district specialty leads + primary care
- **First step:** Start with one specialty that has a long queue and track answer time and avoided referrals.
- **Precedent:** Champlain BASE eConsult, Ontario, Canada (100,000+ cases).
- **Effect:** GPs get an answer in a median of 0.9 days, and two-thirds of cases are resolved without a face-to-face specialist visit. — *effect size: 0.9 days (median specialist response time)*
- **Source:** [Fung & Liddy. eConsult improves access to specialist advice for primary care providers. Innovation in Aging 2022 (conference abstract)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9771088/)
- **Quote / page:** Abstract: "PCPs receive responses in a median of 0.9 days" ... "two-thirds of cases are resolved without the patient needing a face-to-face specialist visit"
- **Limitations:** Conference abstract by the programme's own team. Avoided referrals are GP-reported. Not cancer-specific; must never delay an urgent suspected-cancer referral.

## Not used / still open

- Käypä hoito: no cancer-wide alarm-symptom recommendation found; see [red-flags.md](red-flags.md).
- Remote/digital GP capacity (etälääkäri) and Päijät-Häme's own model: no evaluated source found yet. Ask the mentor (see [mentor-log.md](mentor-log.md)).
- Swedish audit detail "four of the six cancer diagnoses" (RiR 2023:12, section 3.2.1) was seen only in a summary, so it is not used.
