# /how-to-read rework: notes

Branch `t3/rework-how-to-read-page`, built on `t3/post-freeze-build-integration` (merged locally). Checked on a production build (`npm run start -- -p 3102`) with playwright-core 1.65 and its bundled Chromium. The pattern is `/sources` (`docs/audit/sources/notes.md`), and the brief is the round-3 judge's "Bigger moves" section.

## The page now

1. **Top**: the breadcrumb, then the eyebrow and one serif statement: "Three things to know before you read any figure here." Then one "Save or share" (Print, Email), as on `/sources`. The sticky "See the full list of sources" bar and the "On this page" list are gone.
2. **Three framed cards** (keylime with a sage hairline, the `/sources` limitation look). They sit in one row from 1024px and stack below that and on paper. Each card shows its figure, source chip and main caveat, with the rest behind "Show detail".
   - **What one figure counts** (`#one-figure`): Vantaa and Kerava, 85.4% of non-urgent GP (health-centre doctor) visits waited over 7 days, 2025, with the Sotkanet 6411 · 2025 chip and its "Read with care" label. Visible caveat: "Visits, not people, and every non-urgent visit, not only cancer."
     - Detail: visits, not people; not only cancer; THL's English name; the plain definition and limitation; why this area's figure is marked "Read with care"; and the **"Finland overall" explanation**: Sotkanet's whole-country value for the same indicator and year, a reference, not a target, and not an average of the areas.
   - **What "Read with care" means** (`#trust`): 16 of 22 areas' GP-wait figures for 2025, with the 6411 chip. Visible: "Most often because the way visits were recorded changed." The label's full meaning is the second row of the four-labels list in the detail, so it is not repeated.
     - Detail: the Ostrobothnia example (43.8% → 56.7% while recorded visits went from 26,493 to 8,485, chip 6411 · 2025, and the grade's reason); the four labels with their shapes; the eight rules in order; "The labels are ours, not THL's."
   - **Gaps stay gaps** (`#not-published`): 3 of 7 steps from screening to survival have no public figure by area. Visible: "What isn't published by area is shown as missing, never filled in with an estimate."
     - Detail: each missing step (missing / instead / its source chip); "No forecasts"; the five AI-checker rules and the pre-written fallback; the "Found live — unverified" badge and the question-box rule.
3. **One row** (`#from-monday`, kept for old links): "A county can start counting its own figures now: 18 counts in 6 groups, kept once a quarter. Counts only: no names, identity codes or details about a patient." It has a "Get the recording template" link to `/insights#starter-dataset`. "Show the counts" opens the six groups, their fields, the privacy lines and a link to the 7 derived figures.
4. **Read next** (`MoreCard`, screen only): "Sources & limitations" (`/sources`), and "What Vantaa and Kerava can do about its wait" → "Recommended actions" (`/county/vantaa-kerava/act`). The row names the area because, unlike the nav, a static page cannot know the reader's last area; it uses the lead area, the nav's own default.

Every count comes from `lib/walkthrough/model.ts` (`gpWaitAreas`, `gpGradeCounts`, `pathwayGapCount`, `pathway`, `starter`, `recordingExample`). None is typed into the page. No new numbers.

Anchors: `#one-figure`, `#trust`, `#not-published` and `#from-monday` remain. `#where-from` and `#what-we-did` are gone. `grep -rn "how-to-read#" app components lib` finds no link to any anchor on this page.

Code removed: `components/walkthrough/figure-picture.tsx` and `pathway-picture.tsx` (the ScrollStory pictures, used only here); the model's source groups, shared-referral and suspected-cancer exports; `longDate`; and the sticky-bar `scroll-padding` and hatch CSS. A grep showed `lib/walkthrough` is imported only by this page.

## Word count and height

Visible words are counted in `<main>` with every "Show …" closed, excluding screen-reader-only text. Raw `innerText` is in brackets.

| | Before | After |
|---|---|---|
| Visible words on screen | 662 (731 raw) | **193** (192 raw) |
| Height at 1366×768 | 8,237px | **1,515px** |
| Height at 390×844 | 8,555px | **2,555px** |
| Height at 1366, everything open | 11,828px | 4,360px |
| Height at 390, everything open | 16,733px | 9,117px |
| "Show …" buttons | 10 | 4 |
| Print, after `beforeprint` | 1,958 words, 0 closed | 1,396 words, 0 closed |

The target was about 2,200px. The page came in under it, so nothing was cut to reach it.

## Checks (production build, port 3102)

- 1366×768 and 390×844, with and without reduced motion: one h1, no console errors, no sideways scroll (`scrollWidth − clientWidth = 0`). No text under 16px, closed or with every detail open. The only small text is the 11px eyebrow.
- Width sweep with every detail open, at 390, 768, 800, 1023, 1024, 1100 and 1366: no element pokes out of its card.
  - The first pass had the cards in three columns from 768, and in print at A4 width the Ostrobothnia table was clipped. The cards now go three-up only from 1024 (`lg`).
  - A source chip in the gaps list was 12px too wide at 1024. Its row is now `max-w-full`, so the chip truncates as the contract specifies.
- Real clicks (`page.click` on each summary) at 1366 and 390: all three "Show detail" and "Show the counts" open.
- Reduced motion and no JavaScript: same height and word count as the default (1,515px, 193 words) and the full page. Without script the shared `Reveal` plays its CSS fade once; every block measured at opacity 1 after 2.5s (at the instant of `load` they are still fading in). Every figure is in its final state.
- A first version of the "Read next" link ("Recommended actions for Vantaa and Kerava") overflowed 13px at 390; the area now sits in the row label and the link is short.
- Print (A4 width, `beforeprint`): 0 of 4 `<details>` closed, cards stacked, "Save or share" and "Read next" hidden. See `screenshots/after-print-full.png`.
- Wording on the fully open page: "Finland overall" appears. Neither "Finland's level" nor a bare "worse than Finland" appears.
- Contrast uses the existing tokens only: charcoal and Forest Ink on keylime and on cream, and the existing chips and badges. All are listed as AA in the contract.

## Fact-diff

Method: every line of three or more words in the old page's print text (`before-print.txt`, all expanded) was searched in the new page's print text. Each line not found was then searched in the expanded print text of `/sources`, `/county/vantaa-kerava`, its act page, `/insights` and `/compare`, and reworded lines were checked by hand.

**Still on this page (same fact, sometimes shorter words):** the "GP (health-centre doctor)" gloss (found on no other page, so restored); visits, not people; every non-urgent visit, not only cancer; 6411's official name, plain definition and limitation; the 2025 share for the lead area with its grade and reason; 16 of 22 marked "Read with care" and "most often because recording changed"; the Ostrobothnia two-year example and its explanation; the four labels and the eight rules; 3 of 7 steps not published by area; each missing step, what exists instead and its source; "we never fill one with an estimate"; no forecasts; the five AI-checker rules and the pre-written fallback (these exist nowhere else); the live-results badge and the question-box rule; 18 counts, the groups, fields, privacy lines and the 7 derived figures with their link.

**Added:** the "Finland overall" explanation (it was not on the old page; it is the same wording as the `/sources` limitation).

**Cut, and where it still lives:**

| Cut from this page | Where it lives now |
|---|---|
| "31 public sources, 15 of them studies and national documents" | `/sources` header ("31 public sources · 11 indicators") and "Evidence for actions" ("15 studies, guidelines and strategies …") |
| "Our copy was taken on 14 November 2026" | `/sources`, "retrieved 2026-11-14" on every source |
| The four publisher groups (THL, Cancer Registry, Kela, HUS) and what each gives | `/sources`, indicator cards and rows: full publisher and full name for every indicator; the HUS report under "Other sources" |
| Each statistic's full name and the publisher's last update date (behind "Show when each publisher last updated") | `/sources`, each indicator's "Show definition and scope" ("publisher updated YYYY-MM-DD"). The HUS report's date (31.12.2024) is in its name under "Other sources" |
| The area chooser (any area's 2025 share and grade) | Each county page, and the `/compare` table |
| "Counted / Not counted" picture pairs | The same facts as text in card 1 ("Visits, not people, and every non-urgent visit, not only cancer") |
| "4 areas in Uusimaa share one referral figure": HUS 74.1% within 3 days, 2025, the four area names, "Shared hospital value" | The county page of each of the four areas ("No figure for this area alone. HUS … processed 74.1% within 3 days"); `/sources` "Four Uusimaa areas share one HUS referral value"; the "Shared hospital value" label and rule are in card 2's detail here |
| The published steps (screening attendance, GP visits waiting over 7 days, referrals in 3 days by hospital, breast and bowel survival) and "4 steps are published" | `/insights` pathway rows (published or not per step), and `/sources` indicators |
| "Start the guided briefing", "See where access is hardest" links | The main nav on every page (Guided briefing, Where access is hardest) |
| Table of contents, sticky "See the full list of sources" bar | The "Read next" card links to `/sources` |

Nothing that existed only on this page was dropped.

## Screenshots (`screenshots/`)

- Before: `before-d-s00.png`, `before-d-full.png`, `before-m-full.png`.
- After: `after-d-s00.png`, `after-m-s00.png`, `after-d-full.png` and `after-m-full.png` (closed); `after-d-all-open-full.png` and `after-m-all-open-full.png` (every "Show …" open); `after-print-full.png` (print media, A4 width); `after-nojs-full.png` (no JavaScript).

## Needs from others

- `/insights#starter-dataset` must survive the parallel `/insights` rework: this page's "Get the recording template" and "the insights page" links go there.
- The fact-diff names `/insights` pathway rows as the home of the published-steps list. If the `/insights` rework drops them, `/sources` still lists every published indicator.
