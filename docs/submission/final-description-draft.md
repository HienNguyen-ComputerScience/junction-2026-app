# Final submission description — DRAFT (due Sun 15 Nov 10:00, aim 08:00)

Status: draft by nabeo11's Claude, Sat 14 Nov. Replaces the Friday-night text in preliminary.md.
Check before pasting: Luan (wording matches the demo script), Phương (every feature named here is live).
Remember: switch the project from DRAFT to FINAL on hackjunction.app.

## What changed from Friday's text, and why
- Removed "physician supply and cancer outcomes": not in the app.
- Second gap is now "GP to specialist" (what the app measures), not "the GP recognising the warning signs".
- Removed "with an estimated effect": the app shows what a fix achieved elsewhere, with the source, not an estimate for the county.
- Removed "Supports Goal 3": it was crossed out on the printed brief. Mentioned as context only.
- Uses the visits wording rule for indicator 6411.

## Description (paste this)

FirstLine. Where you live in Finland decides how fast you get the first step of cancer care. In Vantaa-Kerava, 85% of non-urgent GP visits come more than a week after people ask for one; in Päijät-Häme it is a third (THL Sotkanet 6411, 2025). Early cancer symptoms are vague, so these patients sit in that same queue.

FirstLine shows each wellbeing services county where its own first step breaks: getting in to see a GP, or getting from the GP to a specialist. It ranks all 22 areas on public THL data, shows the bottleneck for each county as simple stage cards, and recommends two or three fixes that already worked elsewhere in the Nordics and the UK. Every fix names an owner, a first step, the precedent and its source. A red-flag referral helper lets a GP enter symptoms and see the matching guideline warning signs and the fastest referral route. It is decision support, not diagnosis.

Every number carries its source and year. Where no public data exists, the app says so and shows a grey card instead of a guess; the limitations are always on screen. Only public aggregate data is used.

A live-search layer built on Exa adds what no dataset or model has: this month's county news on GP access and cancer care, an evidence finder under each recommended action, and a question box that answers only from linked search results. Live results are labelled "found live, unverified" and kept apart from our checked evidence table.

## Still to fill in on the form (Sunday)
- Live demo URL: [TODO: Vercel URL from Phương]
- Pitch video link, max 2:00: [TODO: Luan]
- Pitch deck PDF: [TODO: nabeo11]
- Challenges: AstraZeneca + Exa both ticked
- Repo: https://github.com/HienNguyen-ComputerScience/junction-2026-app
