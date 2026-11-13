# Exa queries for FirstLine (proposal)

Owner: Luan (@fraidfax). Code owner for the Exa layer: Phương (`lib/exa/`, `app/api/`).
Status: **run on 13 Nov 2026, ~23:45 Helsinki** (15 calls, total cost $0.12). Results at the bottom.

Based on current Exa docs (`POST https://api.exa.ai/search`, checked 13 Nov 2026 via Context7).

## Shared settings

- Endpoint: `POST /search` with `contents` in the same call (one round trip).
- `userLocation: "FI"` on every call.
- Highlights, not full text, for the UI (short, cheap): `"highlights": { "maxCharacters": 600 }`.
- Full `text` only for the evidence finder, where Claude writes a cited card: `"text": { "maxCharacters": 4000 }`.
- Cache every response server-side (key = full request JSON). For the demo, pre-warm the cache for the 4 demo counties.
- Show `publishedDate` and the domain on every card. Anything without a date gets the label "date unknown".

### Cost (API key pricing, 13 Nov 2026)

| Call | Price |
|---|---|
| `/search`, `type: "fast"` or `"auto"`, up to 10 results | $0.007 |
| `/search`, `type: "deep"` | $0.012 |
| + `highlights` or `text` | +$0.001 per result |
| + `summary` | +$0.001 per result |

A county news call (fast, 5 results, highlights) is about **$0.012**. The whole demo, with 4 counties × 3 features pre-warmed plus 100 judge questions, stays under **$5** of the $50 credit.

### Domain lists

| Name | Domains |
|---|---|
| `NEWS_FI` | `yle.fi`, `hs.fi`, `mtvuutiset.fi`, `iltalehti.fi`, `is.fi`, `ess.fi` (Lahti), `kainuunsanomat.fi`, `keski-uusimaa.fi`, `vantaansanomat.fi`, `laakarilehti.fi`, `mediuutiset.fi` |
| `GOV_FI` | `thl.fi`, `stm.fi`, `valvira.fi`, `avi.fi`, `syopajarjestot.fi`, `syoparekisteri.fi` |
| `COUNTY` | `vakehyva.fi` (Vantaa–Kerava), `hel.fi` (Helsinki), `paijatsote.fi` (Päijät-Häme), `hyvinvointialue.kainuu.fi` (Kainuu) |
| `CLINICAL` | `kaypahoito.fi`, `duodecim.fi`, `terveysportti.fi` |
| `NORDIC_INTL` | `sundhedsstyrelsen.dk`, `cancer.dk`, `england.nhs.uk`, `nice.org.uk`, `bmj.com`, `thelancet.com`, `ncbi.nlm.nih.gov`, `oecd.org`, `who.int` |

Domains are a check-list for Tuan's testing: if a domain never returns anything, drop it.

---

## 1. County news (county page)

Goal: what changed in the last 12 months in this county's GP access and cancer pathway. Model training data can't know this.

Two calls per county, merged and de-duplicated by URL, sorted newest first, max 5 shown.

**1a. Finnish news + county sites**

```json
{
  "query": "Vantaa–Kerava hyvinvointialue terveysasema lääkärille pääsy jonot 2026",
  "type": "fast",
  "category": "news",
  "numResults": 8,
  "userLocation": "FI",
  "includeDomains": ["<NEWS_FI>", "<COUNTY>"],
  "startPublishedDate": "<today minus 365 days, ISO>",
  "contents": { "highlights": { "maxCharacters": 600, "query": "lääkärille pääsy, jonotusaika, hoitotakuu" }, "maxAgeHours": 24 }
}
```

Note: `category: "news"` may hide county press pages. If 1a returns < 3 results, retry without `category`.

**1b. Cancer pathway news**

```json
{
  "query": "<county> syöpä diagnoosi viive lähete erikoissairaanhoito",
  "type": "fast",
  "numResults": 5,
  "userLocation": "FI",
  "includeDomains": ["<NEWS_FI>", "<COUNTY>", "<GOV_FI>"],
  "startPublishedDate": "<today minus 365 days>",
  "contents": { "highlights": { "maxCharacters": 600 } }
}
```

County query terms (Finnish name forms matter more than English):

| County | Query name | Extra terms |
|---|---|---|
| Vantaa–Kerava | `Vantaan ja Keravan hyvinvointialue` / `Vakehyva` | `Vantaa terveysasema jono` |
| Helsinki | `Helsingin kaupunki terveysasemat` | `Helsinki lääkäriaika` (Helsinki is not a wellbeing county; it runs its own services) |
| Päijät-Häme | `Päijät-Hämeen hyvinvointialue` / `Päijät-Sote` | `Lahti terveysasema` |
| Kainuu | `Kainuun hyvinvointialue` | `Kajaani terveysasema lääkäripula` |

English fallback (only if Finnish returns < 3): `"GP appointment waiting times <county> Finland wellbeing services county 2026"`, no `includeDomains`.

---

## 2. Evidence finder (under each recommended action)

Goal: show that the recommended action worked somewhere, with a paper or official report. Shown as "found live — unverified", next to Luan's checked table.

One call per action. Use `deep` here: fewer calls, quality matters more than speed.

```json
{
  "query": "Danish cancer patient pathways fast-track evaluation time to diagnosis",
  "type": "deep",
  "category": "publication",
  "numResults": 5,
  "startPublishedDate": "2015-01-01",
  "contents": { "text": { "maxCharacters": 4000 }, "highlights": { "maxCharacters": 500 } }
}
```

Second call without `category`, `includeDomains: <NORDIC_INTL> + <GOV_FI>`, to catch official reports (not just papers).

Suggested query per action:

| Action (SPEC precedents) | Query |
|---|---|
| Fast-track cancer pathway | `Danish cancer patient pathways fast-track evaluation time to diagnosis` |
| Rapid Diagnostic Centres | `NHS rapid diagnostic centres non-specific symptoms evaluation outcomes` |
| Nurse triage / first contact | `nurse-led triage primary care access waiting time Nordic evaluation` |
| GP symptom recognition | `primary care cancer red flag symptom recognition intervention diagnostic interval` |
| Finnish context | `syövän hoitopolku Suomi diagnoosiviive tutkimus` with `includeDomains: <GOV_FI> + duodecim.fi` |

Claude may only cite sentences that appear in the returned `text` (same validator rule as the numbers).

---

## 3. Judge question box

Goal: a judge types anything; the answer comes only from Exa results, with links, or a clean "nothing found".

- **Option A (simpler, recommended):** `POST /answer` with `{ "query": "<question>", "text": true }`. Returns an answer plus `citations` in one call.
- **Option B (more control):** `POST /search` (`type: "auto"`, `numResults: 6`, `userLocation: "FI"`, highlights 800 chars) → Claude answers from highlights only, with numbered links.

Rules for either option:
- Append "Finland" to the query if it doesn't name a country.
- If the question names a county, add that county's domain to a second call and merge.
- Show "nothing found" when there are 0 results **or** the question asks about "now / this year / latest" and no result has a `publishedDate` in the last 2 years.
- Always show date + domain on each link. Flag `hs.fi` links as "may be paywalled".

---

## Results (run 13 Nov 2026)

Queries exactly as above (1a with and without `category: "news"`). All 15 calls returned HTTP 200. Cost and latency are the values the API reported.

| County | Call | # | Newest | Finnish? | Relevant (0–3) | Latency ms | Cost $ | Notes |
|---|---|---|---|---|---|---|---|---|
| Vantaa–Kerava | 1a | 8 | 2026-11-02 | yes | 3 | 637 | 0.007 | Vantaan Sanomat, Yle, vakehyva.fi, Lääkärilehti. All on GP queues / staffing |
| Vantaa–Kerava | 1a no cat | 8 | 2026-11-02 | yes | 3 | 374 | 0.007 | Same plus more vakehyva.fi pages |
| Vantaa–Kerava | 1b | 5 | 2026-11-05 | yes | 2 | 499 | 0.007 | National cancer-delay news (HS, Yle, THL), not Vantaa-specific |
| Helsinki | 1a | 8 | 2026-10-07 | yes | 3 | 455 | 0.007 | hel.fi, HS. 1 Vantaa result leaked in |
| Helsinki | 1a no cat | 8 | 2026-11-05 | yes | 3 | 385 | 0.007 | HS 5 Nov "every Helsinki resident gets their own doctor next year" |
| Helsinki | 1b | 5 | 2026-11-05 | yes | 2 | 476 | 0.007 | National, plus HS patient story |
| Päijät-Häme | 1a | 8 | 2026-11-10 | yes | 3 | 414 | 0.007 | ess.fi, Yle, Lääkärilehti. Named-doctor model, queues cleared |
| Päijät-Häme | 1a no cat | 8 | 2026-11-10 | yes | 3 | 373 | 0.007 | Identical to 1a |
| Päijät-Häme | 1b | 5 | 2026-11-05 | yes | 2 | 502 | 0.007 | 1 county item (Lääkärilehti, cancer support network) |
| Kainuu | 1a | 8 | 2026-10-30 | yes | 3 | 397 | 0.007 | Kainuun Sanomat: "Kajaani patients still queue for months" (13 Mar) |
| Kainuu | 1a no cat | 8 | 2026-10-30 | yes | 3 | 413 | 0.007 | Identical to 1a |
| Kainuu | 1b | 5 | 2026-11-05 | yes | 1 | 394 | 0.007 | National only |
| — | 2 fast-track | 5 | 2020 | no | 3 | 7209 | 0.012 | Danish GP survey before/after cancer patient pathways (2015) etc. |
| — | 2 RDC | 5 | 2025-07-23 | no | 3 | 4938 | 0.012 | Guy's RDC evaluations, South East London rollout 2025 |
| — | 2 nurse triage | 4 | 2026-04-08 | no | 2 | 9341 | 0.012 | GP→nurse task shifting (2026), Danish telephone triage |

### What we learned

1. **County news works very well.** 8/8 results on topic for every county, all in Finnish, most from 2026, and newest items only 3–11 days old. Local papers (Vantaan Sanomat, ESS, Kainuun Sanomat) carry it.
2. **`category: "news"` makes almost no difference.** Without it we get a few more county press pages. Recommendation: **drop the category** for 1a.
3. **1b (cancer) is national, not county-level.** The same 4 national articles come back for every county. Recommendation: show 1b once as a "Finland, cancer pathway, this month" strip, not per county. Fewer calls, honest labelling.
4. **Evidence finder (deep + publication) finds the right papers**, but takes 5–9 s. It must be cached or pre-warmed; never call it live during the pitch.
5. **Speed:** fast search ~0.4–0.6 s, so live judge questions are fine.
6. **Cost:** $0.007 per fast call and $0.012 per deep call, so the $50 credit is no constraint.

### Best demo items (all from the last 2 weeks; re-check on Sun morning)

- **Lääkärilehti, 23 Apr 2026: "Keuhkosyövän toteamisessa eroja hyvinvointialueiden välillä"** (differences between wellbeing counties in detecting lung cancer). This is exactly our thesis, and AstraZeneca is a lung-cancer company.
- HS, 5 Nov 2026: "Syövän hoitoviiveitä on tarkasteltava koko hoitopolun näkökulmasta" (cancer delays must be looked at across the whole pathway). Paywalled.
- ESS, 10 Nov 2026: more Päijät-Häme residents get a named nurse and doctor (the county ranked best on GP wait).
- Lääkärilehti, 2 Nov 2026: Vantaa–Kerava hires 450–500 staff, 26 of them doctors (the county ranked worst).
- THL, 3 Jun 2026: waits for primary care are getting longer.

## Open questions for Phương
1. Does `category: "news"` cover Finnish regional papers well? Test 1a with and without it.
2. `/answer` vs `/search` + Claude for the judge box: `/answer` has fewer moving parts. Your call.
3. Cache TTL: 24 h for news, 7 days for evidence?
