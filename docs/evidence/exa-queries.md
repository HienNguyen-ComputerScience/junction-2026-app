# Exa queries for FirstLine (proposal)

Owner: Luan (@fraidfax). Code owner for the Exa layer: Phương (`lib/exa/`, `app/api/`).
Status: **designed on paper, not yet run.** No `EXA_API_KEY` was available on 13 Nov. The results table at the bottom is empty until someone with the key runs these.

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

## Results (to fill in when the key arrives)

Run each call for the 4 demo counties. Record:

| County | Call | # results | Newest date | Finnish? | Relevant (0–3) | Latency ms | Cost $ | Notes |
|---|---|---|---|---|---|---|---|---|
| Vantaa–Kerava | 1a | | | | | | | |
| Vantaa–Kerava | 1b | | | | | | | |
| Helsinki | 1a | | | | | | | |
| Helsinki | 1b | | | | | | | |
| Päijät-Häme | 1a | | | | | | | |
| Päijät-Häme | 1b | | | | | | | |
| Kainuu | 1a | | | | | | | |
| Kainuu | 1b | | | | | | | |
| — | 2 (each action) | | | | | | | |

Relevance: 0 = off-topic, 1 = right topic, wrong county, 2 = right county, general, 3 = right county, GP access or cancer pathway.

## Open questions for Phương
1. Does `category: "news"` cover Finnish regional papers well? Test 1a with and without it.
2. `/answer` vs `/search` + Claude for the judge box: `/answer` has fewer moving parts. Your call.
3. Cache TTL: 24 h for news, 7 days for evidence?
