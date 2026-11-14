# Mentor log

Record every mentor conversation here. Only quote someone in the pitch or the app if they said yes to "consent to cite".

## Saturday: Kaisa Kaitila (AstraZeneca, Medical Affairs)

Ask the top 5 first. Keep each answer to a line or two.

**Top 5**
1. **Red-flag source.** Is there a Finnish list of cancer warning signs for GPs we may cite or reuse (Käypä hoito, Duodecim, a county or HUS referral guide)? If not, is linking to NICE NG12 acceptable for a Finnish audience?
2. **Who acts.** For a county director, who actually owns "time from GP to specialist": the primary care director, the hospital district, or the chief physician? Who would open FirstLine first?
3. **Our three picks.** For a county with slow GP access, which of these is most realistic in 12 months: named GP (omalääkäri), nurse first-contact, or digital triage (Omaolo)? For a slow referral step: national referral criteria, a diagnostic centre for vague symptoms, or e-referral templates?
4. **Data honesty.** Sotkanet 6411 covers all non-urgent GP visits, not only cancer. Is that a fair proxy for "getting in to see a GP" in a cancer pitch, if we say so on screen?
5. **Finnish precedent.** Has any wellbeing services county already piloted fast-track cancer referral or a vague-symptoms diagnostic route? (Päijät-Häme has the shortest GP waits in 2025: do you know why?)

**If there is time**
6. Roadmap measure 2.5.2 (national referral criteria): when are the first criteria expected, and for which cancers?
7. Is there public Finnish data on time from referral to diagnosis per cancer type, beyond Sotkanet 13 / 5033?
8. What would make AstraZeneca's judges say "a county could start this on Monday"?
9. Any wording that would worry a clinician about the red-flag helper (we say "decision support, not diagnosis")?

**Added after the challenge talk (13 Nov)**
10. **Is the lymphoma number a fair headline?** Our headline is 127 vs 76 days (Kuitunen 2026, lymphoma, first contact public vs private/occupational). If we say "lymphoma" on screen, is that fair in a pitch about all cancers? Is there a similar Finnish figure for a common cancer such as lung or bowel?
11. **Who is in the public number?** Sotkanet 6411 only covers public health centres. Is there public county-level data on how many people use occupational or private care as their first contact?

## Answers

Copy this block once per conversation.

```
### <Name> — <date YYYY-MM-DD>
- Role / organisation:
- Consent to cite by name in pitch/app: yes / no / only as "AstraZeneca mentor"
- Q#: answer
- Q#: answer
- Changes this causes (which file / which row id in evidence.json):
```

### Mentor at AstraZeneca stand — 2026-11-13 (Fri)
- Role / organisation: AstraZeneca (name not recorded)
- Consent to cite by name: not asked; refer to as "AstraZeneca mentor"
- Said: solve one gap well, two is better, not all. Gaps named: (1) time to see a GP depends on where you live, too few physicians; (2) whether the GP recognises the symptoms and which tests they order varies between GPs; (3) GP → specialist takes long; (4) treatment access varies by physician and budget.
- Changes this causes: FirstLine covers 1 + 3, with a red-flag helper for 2. Gap 4 is a non-goal (SPEC).

### Challenge talk: Hanne Kuitunen — 2026-11-13 (Fri)
- Role / organisation: oncologist and Service Area Director, Oulu University Hospital (Pohde). Declares consulting for AstraZeneca. This was a talk, not a mentor conversation.
- Consent to cite by name: not asked. We cite her published paper and the public talk slides, not a private remark.
- Said (slides): the question "do two patients with the same cancer have an equal chance of recovery, regardless of where they live…?" (slide 6); public, occupational and private care run side by side (slide 5); an 8-step delay pathway with system causes such as "symptoms not recognized" and "limited access to primary care physicians" (slide 10); lymphoma patients who start in public primary care reach treatment later (slide 11).
- Changes this causes: the pitch itself is unchanged. `docs/pitch/demo-script.md` gets backup answers on lymphoma-only data, income/education and why steps 3–5. Numbers checked in `challenge-brief.md`. No new row in `evidence.json`: the talk gives context numbers, not a new action with an owner, first step and precedent. Questions 10–11 above are new.

### AstraZeneca booths (Luan's visit) — 2026-11-14 (Sat)
- Role / organisation: AstraZeneca booth staff (names not recorded)
- Consent to cite by name: not asked; refer to as "AstraZeneca booth feedback"
- First impression: the map of regions, which works as the hook.
- Second impression: "why are they so high, so red?" They need to see how the benchmark works: what the % means, why red (compared with Finland's own level, which is itself 54.7%), and what a good level would be.
- They want the main reason an area is red, in one short sentence a normal person gets at a glance. "Ask the evidence" lists a lot of sources but gives no main reason.
- They want the dashboard cleaner, with fewer words.
- Changes this causes: passed to Phương on the board (UI is Phương's). No change to `evidence.json`.

### AstraZeneca booth, answer on step 2 (GP recognition) — 2026-11-14 (Sat)
- Role / organisation: AstraZeneca booth staff (name not recorded). Consent to cite by name: not asked.
- Said: yes, primary care does not always recognise cancer symptoms; this is one of the bottlenecks. Pointed us to Yle MOT, "Syöpäpotilaan hoito voi viivästyä Suomessa kuukausia – Heidi Rintahaka kyllästyi odottamaan", 12 Oct 2026, https://yle.fi/a/74-20242733 (read in full 14 Nov).
- Checked in the article: the expert is **Outi Kuittinen**, professor of oncology, University of Eastern Finland. Not Hanne Kuitunen (challenge talk). Her points: train primary-care doctors to recognise cancer symptoms; let them order CT scans directly; "Tärkein olisi kuitenkin pikakaista syöpäepäilyssä" ("the most important thing would be a fast lane for suspected cancer"). The lines that a nurse may not see the case as urgent and that a GP may make diagnostic errors are the article's narration, not her quote.
- Numbers in the article (unpublished lung-cancer delay study in Kuopio, Tampere, Turku and Rovaniemi, seen first by MOT): symptoms to treatment about five months on average; patient delay over 50 days, primary care 41 days, specialist care 58 days. National, not by county; not peer-reviewed yet.
- Changes this causes: still no county data for step 2. Background only; see `challenge-brief.md`. Matches our actions: GP training/red-flag helper, direct CT access (`ev-rec-direct-ct-training`), fast-track pathways (`ev-ref-denmark-cpp`).
