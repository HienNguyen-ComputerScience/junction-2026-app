# FirstLine: 2-minute pitch video script

Owner: Luan (@fraidfax). Hard limit 2:00 (Junction enforces it). Target length 1:50. Voice-over: 262 words at about 140 words/min.
Audience: AstraZeneca judges from Marketing and Business Excellence, not clinicians, plus Exa judges. No jargon.

Judging we are playing to: Actionability 30 · Insight 25 · Data transparency 20 · Execution 15 · Clarity 10. Exa (20% each): info a model can't know · usefulness to a specific group · clarity of sources · originality · works on judges' live queries.

Wording rule (SPEC.md): Sotkanet 6411 counts non-urgent GP **visits**, so say "85% of non-urgent GP visits come more than a week after people ask", never "85% of people".

## Timed script

| Time | Visual / screen | Voice-over | On-screen text |
|---|---|---|---|
| 0:00–0:12 | Two big numbers appear over a muted map of Finland: **85%** (Vantaa–Kerava) and **33%** (Päijät-Häme). Source chip fades in under them. | In Vantaa and Kerava, 85 percent of non-urgent GP visits happen more than a week after people ask. In Päijät-Häme, it's 33 percent. Same country, same law, same cancer. | `85.4% · Vantaa–Kerava` / `32.7% · Päijät-Häme` / `THL Sotkanet 6411, 2025` |
| 0:12–0:28 | Simple line: patient → GP → specialist. The first two arrows light up. | In Finland, lymphoma patients whose first stop was a public health centre waited a median 127 days from first symptom to treatment. Through private or work healthcare: 76. The first step decides the speed. Finland's new cancer strategy says this must be equal everywhere, but no one shows a county director where their own pathway breaks. | `127 vs 76 days · Kuitunen et al. 2026` · `Getting to a GP` · `GP → specialist` · `Who sees where it breaks?` |
| 0:28–0:50 | **Screen 1, `/`:** the county ranking. Scroll slowly; hover one source chip so the tooltip shows the indicator name. | This is FirstLine. Every wellbeing services county, ranked by how long people wait for a GP and how fast referrals reach a specialist. Public THL data. Every number carries its source and year. | `21 counties + Helsinki` · `Every number: source + year` |
| 0:50–1:10 | **Screen 2, `/county/vantaa-kerava`:** stage cards. GP access card is red (85.4%). Referral card is grey. Cursor rests on the limitations box. | Open Vantaa–Kerava. The delay is at the front door: getting in to a GP. Referral data? Grey. There's no public figure, and we say so instead of guessing. | `Red: worse than Finland (54.7%)` · `Grey: no public data` · `6411 is not cancer-specific` |
| 1:10–1:30 | **Screen 3, `/county/south-ostrobothnia/act`** (red on both steps; Vantaa–Kerava's referral card is grey, so the Denmark card may not show there): open the Denmark fast-track card (owner, first step, source link). Then type "weight loss, tiredness" into the red-flag helper; the vague-symptoms route appears. | Then: what to do on Monday. Each action names an owner, a first step, and a country that already did it. Denmark's fast-track pathways cut the median time to diagnosis by 17 days. For the GP: type the symptoms, see the guideline warning signs and the fastest referral route. Decision support, not diagnosis. | `−17 days · Jensen et al. 2015` · `Decision support, not diagnosis` |
| 1:30–1:48 | **Exa beat:** back on the Vantaa–Kerava page, scroll to the county news strip. The newest card shows its date and domain (`2 Nov 2026 · laakarilehti.fi`). Then cut to an action card: "Found live — unverified" sitting next to the checked evidence. | The numbers are from THL. But what Vantaa did this month isn't in any dataset or any AI's memory. Exa finds it live: on 2 November, Vantaa–Kerava announced 26 more doctors. Every line links to its source and is labelled "found live, unverified", kept apart from our checked evidence. | `Found live with Exa` · `2 Nov 2026 · laakarilehti.fi` · `Found live — unverified` vs `Checked` |
| 1:48–2:00 | Close card: FirstLine, live URL, three bullets. | No patient data. Every number sourced. A county director sees their bottleneck and the first step in two minutes. FirstLine: equal first steps, across Finland. | `Public data only` · `Every number sourced` · `No patient data` · URL |

Word count per beat: 31 + 41 + 33 + 29 + 52 + 50 + 26 = **262**.

## Where each number comes from

| Said on screen | Value | Source | Year |
|---|---|---|---|
| Vantaa–Kerava GP wait | 85.4% (rounded to 85%) | `data/values.json`, indicator 6411, THL Sotkanet | 2025 |
| Päijät-Häme GP wait | 32.7% (rounded to 33%) | `data/values.json`, indicator 6411 | 2025 |
| Finland GP wait (on-screen only) | 54.7% | `data/values.json`, indicator 6411 | 2025 |
| Vantaa–Kerava referral stage | grey, `no_data` | `data/gaps.json`, indicator 13 | 2025 |
| 127 vs 76 days to treatment | median, public health centre vs private/work healthcare as first contact (lymphoma) | Kuitunen et al., Cancer Medicine 2026;15:e71920, https://pmc.ncbi.nlm.nih.gov/articles/PMC13158131/ (median symptoms-to-treatment, lymphoma, 160 patients, 7 Finnish hospitals; the challenge speaker's own study). Details: `docs/evidence/challenge-brief.md` | 2026 |
| Denmark −17 days | median diagnostic interval, after vs before pathways | `docs/evidence/evidence.json` → `ev-ref-denmark-cpp` (Jensen et al. BMC Cancer 2015) | 2015 |
| Vantaa–Kerava hiring 26 doctors | news item | `docs/evidence/exa-queries.md` "Best demo items": Lääkärilehti, 2 Nov 2026 (found via Exa 13 Nov) | 2026 |

If the Exa strip shows a newer Vantaa–Kerava item on recording day, say that one instead and update the row above. Never edit or fake a date.

## Recording checklist

**Before recording (Sat evening)**
- [ ] Screen: 1920×1080, browser at 100% zoom, light theme, no bookmarks bar, one tab. Mobile shots are not needed in the video.
- [ ] Use the deployed Vercel URL, not localhost, so the URL bar is a credible close shot.
- [ ] Run Phương's Exa pre-warm script (announced on the board) so the county news and evidence cards load instantly. Re-run after every deploy.
- [ ] Take a dated screenshot of the Vantaa–Kerava news strip as a backup in case live search fails during the take.
- [ ] Check that every number in the script still matches `data/*.json` (run `npm run data:build` only if Phương says the snapshot changed).

**What must be live vs pre-recorded**
- Screens 1–3: screen-record from the deployed app (the `ecc:ui-demo` skill or OBS). Static data, safe to record any time.
- Exa beat: record live on the day. If `freshness` is `unavailable`, use the Sat backup screenshot and say "this month" without naming the date on the voice-over.
- Map + pathway line + close card: slides exported as PNG, no live dependency.

**Sun morning, before the final export**
- [ ] Re-open `/county/vantaa-kerava`, confirm the newest news card's date is still the one said in the voice-over (currently 2 Nov 2026). If a newer item appears, re-record only the 1:30–1:48 beat.
- [ ] Time the final cut. Must be under 2:00 including title and close card. Target 1:50.
- [ ] Export 1080p MP4, upload to hackjunction.app, then switch the project DRAFT → FINAL before 10:00.

## Backup lines if a judge asks (live session)
- *"Is 6411 about cancer?"* No, it is all non-urgent GP visits. It is the best public measure of the first step, and the app says so on every county page.
- *"Did these actions really work?"* We show the honest result. Sweden cut waits but regional gaps stayed. Denmark's direct CT alone didn't help significantly. Both are in the evidence table with sources.
- *"How is Exa different from the checked table?"* Exa results are labelled "found live — unverified" and never mixed into the checked evidence. The validator drops any sentence whose number isn't in a returned source.

## Screen recording and draft cut

Draft cut (14 Nov): **1:43**, 1920×1080 MP4. Slides 1, 2 and 9, the live-site screen take with captions, and a **draft robot voice** (Windows built-in speech) reading the `video-shot-script.md` lines. Saved outside the repo as `Junction 2026/firstline-video-draft.mp4`. Replace the voice with a human one if there's time: it mispronounces "Päijät-Häme".

Rebuild in a scratch folder with `npm i playwright@1.49.1 && npx playwright install chromium` (not a project dependency) and ffmpeg, using the scripts in `docs/pitch/video-build/`:
1. `node record-screens.js`: records the app shots from the live site into `take1/`. If the page timings change, update the take start times in `build.py`.
2. `node frames.js`: renders the slides and caption PNGs.
3. `python build.py`: voice per shot, then cut, caption and join into `firstline-video-draft.mp4`.
