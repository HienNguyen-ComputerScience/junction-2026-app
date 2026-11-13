# Red-flag helper: which guideline can it cite?

The helper takes symptoms and shows the matching guideline warning signs plus the fastest referral route. It is **decision support, not diagnosis** (SPEC non-goal). This page lists the public sources it can point to and what each one lets us do.

Checked 13 Nov 2026. ✅ = opened and read. ⚠️ = found, not fully read.

| Source | What it gives | Can we copy text into the app? | Status |
|---|---|---|---|
| **NICE NG12** *Suspected cancer: recognition and referral* (UK). [nice.org.uk/guidance/ng12](https://www.nice.org.uk/guidance/ng12) | Symptom → action lists by cancer site and by symptom. Referral threshold about 3% cancer probability. Safety-netting recs 1.15.1–1.15.2. Published 23 June 2015, **last updated 15 April 2026**. | **No.** NICE terms 18.2: outside the UK, NICE content "may not be used, reproduced, translated, distributed or transmitted in any form ... without the prior written agreement of NICE" (personal use, study and research are exempt). **Link and cite only.** | ✅ |
| **Käypä hoito** (Duodecim, Finland). [kaypahoito.fi](https://www.kaypahoito.fi/) | National treatment guidelines. **No cancer-wide alarm-symptom list found**; the cancer guidelines are per cancer type. | **No** without permission: republishing tables or figures needs a request to the editors ([Uudelleenjulkaisu](https://www.kaypahoito.fi/kaypa-hoito/kayttooikeudet/uudelleenjulkaisu)). Linking and citing are fine. © Suomalainen Lääkäriseura Duodecim. | ✅ terms, ⚠️ no list found |
| **Finnish cancer-strategy roadmap 2026–2031**, measure 2.5.2. [PDF](https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf), p. 52 | Commits FICAN to writing **national symptom and referral criteria** on the Danish/Swedish/Norwegian model. Not published yet. | It's a public government document, so we can quote it with the source named. | ✅ |
| **Sundhedsstyrelsen (Denmark), cancer pathway "indgangspapir til almen praksis"**, e.g. [upper-GI entry paper (2023)](https://www.sundhedsstyrelsen.dk/-/media/Udgivelser/2023/Kraeft/Indgangspapir-til-almen-praksis_Pakkeforloeb-for-kraeft-BUGL.ashx) | Short GP-facing papers: which alarm symptoms send a patient into each cancer pathway. Also the diagnostic pathway for vague symptoms. | Licence not checked. | ⚠️ server blocked us (HTTP 429) |
| **Danish three-legged strategy** (Vedsted & Olesen 2015). [PMC4385978](https://pmc.ncbi.nlm.nih.gov/articles/PMC4385978/) | Why alarm symptoms alone aren't enough: only "40–45%" of cancer patients go into specific pathways. Vague symptoms most often seen at referral: "weight loss, fatigue, unspecific pain and nausea". | Open-access article, quote with citation. | ✅ |

## Recommendation for the app (team lead decides)

1. **Don't ship a copied symptom list.** Show our own short plain-language categories (e.g. "unexplained weight loss", "blood in stool/urine/cough", "a lump that doesn't go away") with a **link** to the matching NICE NG12 section and a "see the Finnish pathway criteria when they're published" note.
2. Always show three things next to the result: "Not a diagnosis", the guideline name and date, and "UK guideline, Finnish criteria pending (roadmap 2.5.2)".
3. Add a vague-symptoms route (Danish diagnostic centre / UK RDC; see `evidence.json` rows `ev-ref-dk-diagnostic-centre`, `ev-ref-uk-rdc`), because red flags alone miss most patients.
4. Ask the AstraZeneca mentor whether a Finnish source exists that we may reuse (question 1 in [mentor-log.md](mentor-log.md)).
