# FirstLine deck: speaker notes and sources (v5, post-freeze)

Files: `docs/submission/deck.html` (source) and `docs/submission/firstline-deck.pdf` (rendered: 9 pages, 1280×720 each, MediaBox 960×540 pt, about 540 KB). Story and wording follow the final pitch in `docs/pitch/demo-script.md` (PR #126/#128).

Related: the 16-slide alternative in `deck-nabeo11/` (not touched by v5) and the older outline `deck-outline.md`. **Which deck is uploaded on Sunday is the lead's decision.**

## v5 at a glance

- **App version:** frozen commit 3bc8bc7 (feature freeze Sat 14 Nov 18:00 Helsinki), auto-deployed to https://firstline-finland.vercel.app.
- **Screenshots:** all taken from the live site on Sat 14 Nov 2026, 18:22 to 18:25 Helsinki (UTC+2), with playwright-core and the cached headless Chromium (same method as `test-runs.md` Run 3b; script kept outside the repo). Viewport 1440×900, device scale 2, dark colour scheme, animations disabled, fonts and map loaded, mouse parked at 0,0 before each shot.
- **Images are pre-cropped files.** `deck.html` now shows each PNG whole (`.shot` and `.livecrop img` are plain `max-width/width: 100%`). The v4 margin-trim and `.livecrop` pixel offsets are gone, so a retake needs only a new crop, not new CSS offsets.
- **Removed:** every mention of the red-flag / symptom helper (removed from the app; the act page now has the static panel "The four referral routes a county needs"). The "TODO: real names" chip on slide 9. No "Draft" footer anywhere.
- **Em dashes:** the only one left is the verbatim UI label "Found live — unverified" on slide 7.

## Rebuild

From PowerShell (bare `--headless` from Git Bash wrote no PDF before; without `--user-data-dir` Edge can hand off to a running instance and exit without writing):

```powershell
Start-Process -Wait -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList '--headless=new','--disable-gpu','--no-pdf-header-footer','--user-data-dir=<abs scratch dir>\edge','--print-to-pdf=<repo>\docs\submission\firstline-deck.pdf','file:///<repo>/docs/submission/deck.html'
```

Check after every rebuild: the PDF's modified time changed, 9 `/Type /Page` objects, and each slide looks right. v5 check: each `section` of `deck.html` rendered with print media at 1280×720 and viewed one by one; a script asserted that no element sits outside its slide, no `overflow:hidden` box clips its content, and every `img` loaded.

## Screenshot inventory (`docs/submission/screenshots/`)

| File | What (live site, 14 Nov 18:22–18:25) | Used by |
|---|---|---|
| `10-home.png` | `/` (opens on Vantaa and Kerava): 85.4%, "Worse than Finland's level", chip "Sotkanet 6411 · 2025", "Finland 54.7%", main reason line, the three steps. Crop 736×424 CSS px. New file (the home page no longer is a ranking). | Slide 4, screen 1 |
| `02-county-pathway.png` | `/county/vantaa-kerava`: title, main reason, the three step tabs (step 1 85.4%, step 2 "No public data", step 3 "No county figure"), gap bar. Crop 668×440. | Slide 4, screen 2 |
| `03-act.png` | `/county/vantaa-kerava/act`: "Action 1 of 3", named GP card, First step, Owner. Crop 644×322 (left half of the card, so it stays legible). | Slide 4, screen 3 |
| `05-exa-live.png` | County page "Local news, last 12 months" panel: "Found live — unverified · Web results via Exa, saved 14 Nov 2026", 3 of 8 dated items (2 Nov, 29 Jul, 23 Jul 2026). Crop 1128×352. | Slide 7 |
| `01-ranking.png` | `/compare` top: "Compare all 22 areas", ranking (viewport). Name kept so `test-runs.md` links still work. | Not in deck |
| `04-act-south-ostrobothnia.png` | `/county/south-ostrobothnia/act`, carousel on action 2: "Diagnosis 17 days faster" (viewport). | Not in deck (backs slide 5) |
| `06-act-tall.png` | Full `/county/vantaa-kerava/act`: actions carousel, where the delay sits (step 2 "Not measured in Finland", England 17%), what-if, "The four referral routes a county needs". Replaces the old tall shot that showed the removed red-flag helper. | Not in deck |
| `07-ask-answer.png` | `/ask` after the chip "Did Denmark's cancer fast-track pathways shorten diagnosis times?": AI answer with [1]–[5], 6 sources (3 dated, 3 "date unknown"), "saved 14 Nov 2026". | Not in deck |
| `08-evidence-finder.png` | Act card 1 after "Find more evidence live": "Found live — unverified", 5 results (4 dated, 1 "date unknown"). | Not in deck |
| `09-sources.png` | `/sources` top (viewport). | Not in deck |

Paid calls while capturing: one `/ask` question and one evidence-finder click (each also run once while exploring); both were served from the saved cache ("saved 14 Nov 2026").

## Changes per slide (v4 → v5)

1. **Title.** No change.
2. **Problem.** Headline now "Your area decides how long a GP visit waits." (close to the app's home headline). The sentence now explains the benchmark (booth feedback): "Share of non-urgent GP visits that wait over a week. Red means worse than Finland, and Finland itself is at 54.7%." Labels say "Vantaa and Kerava" (app name). Chart unchanged; all 23 bars re-diffed by script against `data/values.json` (6411, 2025): 0 mismatches.
3. **Who it's for.** Stage names match the app ("1 Getting to a GP", "2 GP recognises warning signs", "3 GP to specialist referral"). Step 2 now says "not measured in Finland" with England's comparison (17%, NHS England Fingertips 2024/25). The generic "numbers sit in national tables" line is replaced by the demo script's 127 vs 76 days lymphoma line, with its source chip.
4. **Product.** New crops of home, county page and act page. Captions: "Map of 22 areas. One number, one main reason." / "Three steps, each against Finland's level." / "Each action: owner, first step, checked source. Plus the four referral routes a county needs." Removed "red-flag helper", "precedent" (not shown on the card any more), "what-if" and "ranking below" on home (the what-if is on the act page, the ranking is on `/compare`). Shot note: live site, 14 Nov 2026 18:22 Helsinki, commit 3bc8bc7.
5. **Act.** App wording: "17 days" + "faster diagnosis (median)" (app: "Diagnosis 17 days faster"), "odds of dying from any cause". "In the app" lines: South Ostrobothnia, slow referrals; Vantaa and Kerava, action 1.
6. **Trust.** Middle card is now "Limits on every page": 6411 counts all non-urgent GP visits, plus the recording caveat (shown on `/compare` and `/sources`). The four HUS areas line is dropped from the slide (still in the app; say it if asked). Validator card: "A sentence whose number isn't in its source is removed." Chip "On page: Ask the evidence" (the question box lives on `/ask` now). Bottom line moved down so it no longer touches the cards.
7. **Live layer (Exa).** New crop of the local news panel with dated items and the "Found live — unverified" label. Chip "each item dated and linked" (true for all 8 news items; not true for the `/ask` sources, which is why the slide shows the news panel). Caption says the results were saved that day. Left column: "Ask the evidence: a numbered live source on every sentence, or “nothing found”."
8. **How it's built.** "Real today" rewritten for the frozen app: home (map, one number, one main reason); county page (3 steps, limitations, AI brief, local news); act page (actions, what-if, four referral routes); Compare (ranking, getting worse fastest); Ask the evidence, national news, sources page; live on Vercel with saved results if search is down. Red-flag helper removed.
9. **Close.** "TODO: real names" chip removed; GitHub logins only.

Body word count stays about the same as v4 (slide 3 gained the lymphoma line, slides 4, 6 and 8 got shorter).

## Claims and sources

### Slide 2
| Claim | Source |
|---|---|
| 85.4% Vantaa and Kerava, 32.7% Päijät-Häme, 54.7% Finland, all 23 bars | `data/values.json`, `indicator_id: "6411"`, `year: 2025`. THL Sotkanet 6411 (https://sotkanet.fi/sotkanet/en/metadata/indicators/6411) |
| "visits", never "people"; access, not cancer delay | SPEC wording rules; `data/indicators.json` 6411 limitation ("Counts all non-urgent GP visits, not only possible cancer" is on the slide) |

Say: "In Vantaa and Kerava, 85% of non-urgent GP visits wait more than a week. Red on the map means worse than Finland, and Finland itself is at 54.7%: more than half of visits wait over a week."

### Slide 3
| Claim | Source |
|---|---|
| 17% of cancers first found in an emergency, England 2024/25 | `data/sources.json` `ndrs-emergency-presentations` (NHS England NDRS via Fingertips, indicators 91356/91357); `docs/evidence/gp-recognition-gap.md`; same text in the app (`components/pathway/pathway-steps.tsx`) |
| Step 2 not measured in Finland | `data/README.md` (`gp_recognition` has no public indicator); app step-2 card |
| Referrals processed within 3 days | Definition of Sotkanet 13 (`data/indicators.json`) |
| 127 vs 76 days, lymphoma patients, median from first symptoms to treatment | `data/sources.json` `kuitunen-2026`; `docs/evidence/challenge-brief.md`. Kuitunen et al., Cancer Medicine 2026;15:e71920 (DLBCL, 160 patients, 7 Finnish hospitals). Say "lymphoma patients", never "cancer patients" |
| Roadmap measure 2.5.1 | `docs/evidence/evidence.json` `ev-gp-capacity-roadmap` (p. 51), STM roadmap 2026–2031 |

### Slide 4
| Claim | Source |
|---|---|
| 22 areas | `data/counties.json` (21 counties + Helsinki; 23rd row is Finland as reference); `/compare` "Compare all 22 areas" |
| One number, one main reason; three steps; owner, first step, checked source; four referral routes | Seen on the live site in the v5 screenshots (`10-home.png`, `02-county-pathway.png`, `03-act.png`, `06-act-tall.png`) |

### Slide 5
| Claim | Source |
|---|---|
| 17 days faster diagnosis (median, adjusted), Denmark | `data/evidence.json` `ev-ref-denmark-cpp`, `effect_size.value: -17`. Jensen et al., BMC Cancer 2015;15:308. App card: "Diagnosis 17 days faster" (`04-act-south-ostrobothnia.png`) |
| 25% lower odds of dying from any cause, same GP over 15 years vs 1 year, Norway, observational | `ev-gp-continuity`, OR 0.75. Sandvik et al., Br J Gen Pract 2022. App card wording |
| Nurse-led: equal or better outcomes, probably; 18 trials | `ev-gp-nurse-first-contact`. Laurant et al., Cochrane 2018 |
| Sweden: shorter waits, regional gaps remained | `ev-ref-sweden-svf`. Riksrevisionen RiR 2023:12, via Riksdagen |
| South Ostrobothnia slow referrals | `data/gaps.json`: referral 68.9% vs Finland 76.8%, `red`; GP access 67.8%, `red` |

The demo script moved Norway to the backups (oversold for a pilot). It stays on this slide as checked evidence with "observational"; say "goes with", never "cuts deaths".

### Slide 6
| Claim | Source |
|---|---|
| 6411 counts all non-urgent GP visits | `data/indicators.json` 6411 limitation |
| Recording caveat: where recorded visits changed by more than 20%, part of a rise may be recording | `/compare` "Getting worse fastest" footnote and `/sources` ("18 of 22 areas; for Finland they rose 43%"); demo-script backup on South Ostrobothnia |
| Sentences whose number is not in the cited source are removed | `lib/brief/validate.ts` (county brief), `validate()` in `lib/exa/answer.ts` (`/api/ask`) |

### Slide 7
| Claim | Source |
|---|---|
| 14 actions, each quoted from its source | `data/evidence.json`: 14 rows |
| News items dated and linked; "Found live — unverified" | `05-exa-live.png` (8 items, all dated). The panel showed "saved 14 Nov 2026": the live deploy served saved Exa results. Say "found live and saved today", not "loaded just now" |

### Slide 8
| Claim | Source |
|---|---|
| Real today list | Seen on the live site at 3bc8bc7 while taking the v5 screenshots (home, county, act, `/compare`, `/ask`, `/sources`); saved-results fallback per README |
| Not in public data yet | `data/README.md` known gaps; demo-script backups (stage known for about 38% of cases nationally; 6411 covers public health centres only) |

### Slide 9
| Claim | Source |
|---|---|
| 2–3 health stations, aged 50+ | `ev-gp-continuity` `first_step`; the same "First step" text is on the act page |
| 7-day GP access | Definition of Sotkanet 6411 |

## Removed or not used
- Red-flag / symptom helper (slides 4 and 8): removed from the app.
- "Rank / ranking below" on home, "what-if" on home, "precedent" on the card: no longer true of the screens.
- Four HUS areas without a county referral figure (old slide 6): still true in the app, dropped from the slide for words.
- "Cached" badge and "dated link on every item": the badge is gone from the panel; `/ask` sources can be "date unknown".
- The brief for v5 said source chips read "THL · Sotkanet 6411". The live site shows "Sotkanet 6411 · 2025"; the deck keeps "THL Sotkanet 6411 · 2025".

## Left for a human
- [ ] Lead decides which deck is uploaded: this 9-slide deck or the 16-slide `deck-nabeo11/`.
- [ ] Real names on slide 9 if the team wants them (only GitHub logins are in the repo).
- [ ] Sunday morning: open the county page and check the local news panel still shows dated items with "Found live — unverified". Never edit a date. Retake `05-exa-live.png` only if the panel changes.
- [ ] If the data snapshot changes (`npm run data:build`), regenerate the slide-2 chart from `values.json` and re-check slides 2, 3 and 9.
