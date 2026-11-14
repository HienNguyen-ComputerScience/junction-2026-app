# Post-freeze integration: notes

Branch `t3/post-freeze-build-integration`, from `main` at `29b69f2`. Saturday 14 Nov, evening.

## Merged (local refs, in this order, no conflicts)

| Branch | Head | PR | What it brings |
|---|---|---|---|
| `t3/experimental-real-user-audit` | `1ed1bdc` | #135 (with #136 data insights and #137 guided briefing already merged into it) | Cream-paper theme; shared motion pieces (`Reveal`, `AnimatedNumber`, `ScrollStory`, `Chunk`, `CaveatNote`, `MoreCard`, `FocusGroup`); county, compare and Ask pages; the guided briefing; insights data |
| `t3/act-page-small-chunks` | `0e61291` | #138 | The act page in small chunks |
| `t3/home-briefing-first-screen` | `6c85742` | #139 | Home leads with the guided briefing |
| `t3/rework-insights-scroll-story` | `93081a1` | #140 | `/insights` told on scroll |
| `t3/how-to-read-walkthrough` | `d7d6996` | #141 | `/how-to-read` |
| `t3/unify-export-save-share-control` | `2659af3` | #142 | One "Save or share" control (`components/share/`), the plan page redirected to the act page, "board" wording removed |

## Leftovers fixed (one commit each)

1. **`/insights` export**: the recording template is now the Excel option of one `SaveShare` (print, template, email) in the `#starter-dataset` chunk. No other download button on the page. `PrintButton` and `components/home/what-if-panel.tsx` were unused and are deleted.
2. **`/how-to-read`**: no control, as asked.
3. **Briefing slug**: step 6 is `/briefing/<id>/save-or-share` (`lib/briefing/steps.ts` and `proxy.ts` in one commit). The old `take-it-to-your-board` answers 308 to the new address. No other occurrence in code; older audit notes still mention it as history.
4. **Home nav**: no item is current on `/`.
5. **Home button**: "Start the briefing for <area>"; "about 2 minutes" stays in the line under it. The chooser card is a little wider (11fr / 13fr), so "Central Ostrobothnia", the longest name, fits on one line at 1366×768.
6. **Home first screen**: both cards are the same height (459px at 1366×768). The chooser's content is centred vertically.
7. **`/insights` grid**: the levels are cream, mint, sage with a 2px Forest Ink edge, then Forest Ink. Every box has a 2px edge, so nothing shifts, and the dots are 8px. The dot counts are kept.
8. **`/insights` caveat repeated**: the confidence badge beside the opening caveat note is gone. The grades' reasons stay under "Why?".
9. **Briefing Back / Leave**: "Back: choose another area" on step 1 and "Leave the briefing" go to `/?area=<id>`. "Leave the briefing" used to go to `/compare` under the label "full table of all areas"; now it goes home, and compare is one click away in the nav.
10. **"Found live — unverified" badge**: it already measured 16px on this build (`text-base` wins the class merge), so it needed no change.
11. **Contract docs**: `docs/audit/contract.md` §3 now describes the redirect plus `/plan/export`; `PrintButton` is gone from §2. `docs/audit/insights/contract.md` now covers the `PathwayRow` `strip` prop, the 16px confidence label, and the fact that `/insights` no longer renders the full components.

Found while clicking through and fixed:

- **`/how-to-read` scrolled sideways on a 390px phone** (scroll width 395), because of the two-year table's padding. Fixed.
- **Text under 16px** on the county, act and compare pages: `type-caption` (14px), `type-note` (13px), the status badges (12–14px), "Owner:" (12px), and labels at 15px. `type-caption` and `type-note` are now 16px, and the fixed 12–15px sizes in shared components are now `text-base`. Eyebrows stay at 11px. The map's SVG labels are unchanged. The county, compare and act pages were checked at 1366px with no sideways scroll and no clipping seen. The phone layouts after this change were **not** re-checked; the judges' rounds cover that.

## Verify

`npm test` (517 pass, 0 fail), `npm run brief:check`, `npm run typecheck`, `npm run lint`, `npm run build` and `node scripts/insights/check-insights.mjs` (930 rows OK) all pass.

## Smoke run (production build on :3081, `playwright-core` with the bundled Chromium, 1366×768)

The scope was cut by the team lead: one smoke run at 1366×768. Phone, keyboard, reduced motion, print and the three-area matrix were left to the design judges' rounds.

- Home → Vantaa and Kerava → "Start the briefing for Vantaa and Kerava" → Next ×5 → `/briefing/vantaa-kerava/save-or-share` ("Save or share this briefing") → Word: `firstline-action-plan-vantaa-kerava-2026-11-14.docx`. Read back: it names its sources and contains no "board".
- Act page → Save or share → Excel: `firstline-action-plan-vantaa-kerava-2026-11-14.xlsx`. Read back: it names its sources and contains no "board".
- Every nav page plus the county page, each loaded and scrolled once: 200, no console errors, no visible "board", and every internal link answers under 400. `/no-such-page` answers 404. The current nav item is right on every page and absent on home.
- `/county/kainuu/plan` → 307 → `/county/kainuu/act` (200). `/briefing/kainuu/take-it-to-your-board` → 308 → `.../save-or-share` (200).

An earlier, fuller walk (before the 16px change) also passed these: Kainuu and Central Uusimaa; 390px; keyboard only from home through all six steps (every focus ring drawn); reduced motion on `/insights` and the act page (no running animations, every reveal visible); print-to-PDF of the act page and the briefing (sources present, no "board"); no-JavaScript content on three pages; downloads of the compare Excel and the `/insights` template.

## Still wrong or not checked

- **`/sources` text under 16px** (14–15px in the "How to read FirstLine" panel and the indicator notes). `app/sources/` belongs to bestawperna and was not edited.
- **The phone layout after the 16px change** was not re-checked: status badges and step pills in the compare table or the county stepper could wrap at 390px.
- **Earlier notes still in place:** the briefing's two-minute read is about 2½ minutes for a complete read; no screen-reader pass; no Vercel preview was checked before this push.
- The per-page screenshots asked for in the first brief were dropped when the scope was cut.
