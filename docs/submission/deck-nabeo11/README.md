# FirstLine deck, draft 2

Two deck drafts exist: the 9-slide `../firstline-deck.pdf` (source `../deck.html`, notes `../deck-notes.md`) and this 16-slide draft. Which one is uploaded on Sunday: TODO (lead decides). See also `../deck-outline.md`.

Files: `deck.html` (source, 16 slides at 1280x720), `FirstLine-deck-draft2.pdf` (export), `build.py` (generates `deck.html` from `data/values.json` and `counties.json` in the repo root, so the chart and big numbers always match the data; the slide 1 headline and the hand-typed B4 evidence tables are checked against the data, and the build stops with a message if they no longer match).

## Regenerate the PDF

```
python3 -I build.py && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=$PWD/FirstLine-deck-draft2.pdf file://$PWD/deck.html
```
Run it from this folder. On Windows, use `python -X utf8 -I build.py`, then Edge headless print-to-pdf with a throwaway `--user-data-dir` (see `../deck-notes.md`). (To edit text only, you can edit `deck.html` directly and run just the Chrome command, but `build.py` will overwrite those edits next time.)

## Swap a screenshot

Screenshots live in `screenshots/` (this folder). Overwrite the file with the same name (1440x900) and re-run the command above. Slide 4 crops `county-vantaa-kerava.png`; slide 5 crops `act-vantaa-kerava.png` (named-GP card) and `act-south-ostrobothnia.png` (Denmark card); slide 6 crops `red-flag-helper.png`. If the layout of the real screen changes, adjust the `margin-left` / `margin-top` / `width` on that `<img>` in `build.py`. Draft 2 screenshots come from `main` at 84d76f2 (local production build, test run 2). Each has a grey tag "screenshot: main 84d76f2, local build; retake from live URL" (the `tag()` call). Remove the tag once the screenshots are retaken from the live URL. Slide 7 and B3 still have dashed placeholders: replace the `.ph` div with a `.crop` block like slide 4's.

## What changed in draft 2

- Slides 4 and 5: new screenshots from main 84d76f2. Slide 5 shows the Vantaa-Kerava named-GP card (Norway, 25%) and the South Ostrobothnia Denmark fast-track card (17 days), as in `docs/pitch/demo-script.md`.
- Slide 6: real red-flag helper screenshot ("weight loss, tiredness" entered, vague-symptoms route). Pill "Decision support, not diagnosis" kept.
- Slide 2: title now "Where the GP is the first stop, 75 to 85 percent of cancer patients start there", with the source line (Vedsted & Olesen, Br J Cancer 2015, Danish and UK data), as in `docs/pitch/demo-script.md`. Fixed in the 14 Nov review fixes (PR #42).
- B3: the /sources screenshot is not in the deck yet; `/sources` is on main now (PR #10 merged), so add `../screenshots/09-sources.png` or a fresh crop.

## Open TODOs (yellow tags on the slides)

| Slide | TODO | Owner (outline) |
|---|---|---|
| 2 | Source line added: Vedsted & Olesen, Br J Cancer 2015, from `docs/pitch/demo-script.md` (added by PR #38, merged after test run 2). It is Danish and UK data, so the title says "where the GP is the first stop", with the 75 to 85 percent figure from the demo script. No Finnish figure exists; Luan to confirm the wording | Luan |
| 3 | Indicator 13 values (South Ostrobothnia 68.9, Kanta-Häme 88.7, Kainuu 75.2, Finland 76.8) are already on the slide and match `data/values.json`; Phương to confirm | Phương (N1) |
| 4, 5, 6 | Retake screenshots from the live URL after the 18:00 freeze (1920x1080, light theme), then remove the grey "local build" tags | Phương (N3) |
| 7 | Dated Exa county-news screenshot (redo Sun 07:00). The county news strip is mounted on main (test run 3b); take it with a real Exa key | Phương (N4) |
| 8 | Live URL and repo URL | Phương (N5) |
| B1 | Mentor answer to P1, only if consent is recorded in mentor-log.md | Luan (N6) |
| B2 | Source for the "treatment access data is flat" figure (indicator 5093; not in data) | Phương (N1) |
| B3 | /sources screenshot (PR #10 is merged) | Tuan (N3) |
| B5 | Exa judge tests X/15 and median latency | Tuan (N10) |
| all | Review of draft 2 against script and app | Luan, Tuan (N11) |
