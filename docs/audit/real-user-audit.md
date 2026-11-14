# Real-user audit of FirstLine (post-freeze experiment)

Date: 14 Nov 2026. Build audited: `main` at `29b69f2`, which is what https://firstline-finland.vercel.app serves. Branch: `t3/experimental-real-user-audit`.

How it was done: every screen of the live site was opened at 1366×850 and at 390×800 with a scripted Chromium (playwright-core; the Playwright MCP could not start because Google Chrome is not installed on this machine). For each screen I saved a full-page screenshot, the visible text and the list of everything clickable, then clicked the main flows: the area picker, the step tabs, the action carousel, "Evidence details", "Find more evidence live", an example question, and the browser's print output (PDF) of the act, county and compare pages.

## Who the audit is for

**Primary persona: a wellbeing services county director or administrator.** Capable, years of experience with Excel, Word, email, reporting systems, PDF reports and intranet forms. Not fluent with web apps. Reads top to bottom, clicks only what clearly looks like a button or a link with a plain label, does not hover, does not guess icons, does not explore. Expects a table that sorts, a Print button, a Download button, a page to forward by email, labelled fields, a visible way back and plain administrative wording.

Secondary checks: a national planner (ministry / THL / FICAN), and an AstraZeneca judge with two minutes.

Severity: **High** = this person gives up or cannot finish the task. **Medium** = hesitates, misreads or loses trust. **Low** = friction.

## What already works (do not redo)

- Home answers "where does my county stand?" in one screen: a labelled drop-down ("Choose your area"), one big figure, one sentence, one filled button ("See all actions").
- Every figure has a source chip that opens the official definition; the limitations box is on the county page; Sources & limitations explains what the data cannot say.
- Loading is announced in words ("Searching for more evidence with Exa…", "Searching and writing an answer from the results…").
- The question box shows three example questions and numbered sources under each answer.
- "Getting worse fastest" on Compare is an early-warning list with a recording caveat.
- No horizontal scroll at 390px on any page; breadcrumbs and "Back to …" links exist on county and act pages.
- Earlier plans 001–007 (`plans/README.md`) are all merged (PRs #89–#95); none of the findings below repeats them. The AI Canvas report recommended installing nothing; that still holds.

## Findings, task by task

### Task 1. "Where does my county stand?" (Home → county page)

| # | Where | What happens to this person | They expected | Severity |
|---|---|---|---|---|
| 1.1 | Home, source chip "Sotkanet 6411 · 2025 ↗" | Reads it as a code. Nothing says it is the source. | "Source: THL Sotkanet, 2025" | Medium |
| 1.2 | Home, "The three steps" tiles | Tiles have only a small chevron; not clearly buttons. "No county figure" is not explained here. | A labelled link ("See step 1") | Low |
| 1.3 | County page, "Pick a step" | The three step tiles are tabs. The page content under them changes without a page change; the person does not know tabs. | Three sections one under the other, or a clear "Show" button | Medium |
| 1.4 | County page, "Rewrite with AI" | Does not know what will be rewritten or why; will not click. Harmless, but it is the only button in the section. | Nothing; the fixed brief is enough | Low |
| 1.5 | County page | No way to print or save the county's position. See task 4. | A "Print" button | High |

### Task 2. "What exactly do I do on Monday?" (Act page)

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 2.1 | Act page, "Action 1 of 3" with buttons "1 2 3" and two arrow-only buttons | Sees one action. The numbered squares and the unlabelled arrows are not understood as "there are two more". Many will leave believing there is one recommendation. | All three actions listed one under the other, numbered | High |
| 2.2 | Action card | "First step" and "Owner" are there, which is good. Missing: by when, who signs it off, how we will know it worked, what national programme or funding it belongs to. | A row per action: who, first step, by when, how measured | High |
| 2.3 | Action card, big evidence line ("25% lower odds of dying from any cause") | Reads as a promise for their county. The Norwegian context is in small grey text. | "Result where it was tried: …" | Medium |
| 2.4 | "Find more evidence live" → panel "Found live — unverified · Web results via Exa" with an unlabelled ✕ | "Live", "unverified" and "Exa" are tech words. The ✕ has no label. | "Search the web for more studies" and a "Close" button with the word | Medium |
| 2.5 | "Show 11 other evidence-backed options" | Fine once opened; the closed state is a small chevron line. | A button | Low |
| 2.6 | "What if" panel | "30.7 fewer of every 100 visits" is clear. It stops there: no target year, no "per year", nothing to take into a plan. | "To reach Finland's level by 2028 we must improve by X a year" | Medium |

### Task 3. "What will it cost and what will I get?"

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 3.1 | Whole app | Cost is not mentioned anywhere, not even to say that no public cost figure exists. | Either a figure with a source, or a plain "no published cost; enter your own estimate" | High |
| 3.2 | Act page | The national roadmap names a funding route for the named-GP model (the national omalääkäri programme, state grants) and a schedule (2026–2028, 2028–2031). The app quotes the roadmap but never shows the schedule or the funding route. | "Funding: national programme, state grant" on the action | Medium |
| 3.3 | Act page | "What will I get" is answered only with results from other countries in other units. Nothing says which published figure the county should watch to see its own result. | "Measure of success: Sotkanet 6411, now 85.4%, Finland 54.7%" | High |

### Task 4. "Can I take this to my board?"

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 4.1 | Every page | There is no Print, Download or "Send by email" button anywhere. | A Print button and a Download (Word / Excel / PDF) button at the top | High |
| 4.2 | Browser print (Ctrl+P) of the act page | The site has no print styles. Checked by generating the PDF: pale grey text on white, the dark layout's boxes gone, only action 1 of 3 printed, "Evidence details" closed, link addresses not shown, the action card's text out of reading order, and a nearly empty second page. Not usable as a board paper. | A clean black-on-white page with everything on it | High |
| 4.3 | Act + county pages | The material for a board paper is spread over three pages (figure and trend on the county page, actions on the act page, limitations on Sources). | One document: situation, target, actions, how we measure, sources, limits | High |
| 4.4 | Any page | The address can be forwarded (`/?area=`, `/county/<id>`), but nothing says so. | "Send this page by email" | Low |

### Task 5. "Can I trust this number?"

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 5.1 | Source chips | Work, but open sotkanet.fi's English metadata page in a new tab with no warning in words. | "Opens thl.fi in a new window" is acceptable; a "Source:" label would help | Low |
| 5.2 | County page limitations | Good content, but ten items behind "Show 7 more limitations"; on a phone all ten are behind one closed line. | The three that matter stay visible (they do on desktop) | Low |
| 5.3 | Sources page | Does not list every source the chips cite (known, owned by @bestawperna, listed in `plans/README.md`). | — | Low (not ours) |

### Task 6. "How do I compare with a similar county?"

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 6.1 | Compare | A fixed ranking by GP wait. It cannot be sorted by name, by referral speed or by change since 2023. It is not a table (0 `<table>` elements), so it cannot be copied into Excel either. | Click a column heading to sort; "Download for Excel" | High |
| 6.2 | Compare | No way to put two areas side by side. | "Compare my area with: [choose]" | Medium |
| 6.3 | Compare | "HUS-wide", "City units only" are explained only behind a closed "More marks" line. | A footnote that is always visible | Low |

### Task 7. "Is it getting worse?"

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| 7.1 | County page trend | Clear: "27.4 percentage points worse since 2023", three columns. | — | none |
| 7.2 | Compare → "Getting worse fastest" | Good list, but only the five largest rises, and only for the GP wait. A director whose area is sixth sees nothing. | The change since 2023 as a sortable column for all areas | Medium |

### National planner (ministry, THL, FICAN)

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| N.1 | Whole app | The header says "For county directors". There is no page for Finland as a whole: how many areas are worse at each step, how wide the gap between areas is and whether it is widening, which actions only the national level can take. The brief asks for proposals "at national or account level". | A "Finland overall" page | High |
| N.2 | Whole app | The data gap is described as limitations (what we cannot say), never as a to-do list (what should be published, by whom, under which roadmap measure). "Addressing this data gap is part of the challenge." | A list: missing figure → who could publish it → what a county can record meanwhile | High |
| N.3 | Whole app | Goal 3 of the national cancer strategy ("Ensure equal and effective cancer care") is never named. The roadmap is cited only for measures 2.5.1 and 2.5.2 (Goal 2). Goal 3's own indicator, "patients reach care within target times" (measure 3.1.2), is not mentioned. | An explicit line: which Goal 3 measure this supports and which indicator stands in for it today | High (a stated minimum requirement) |

### AstraZeneca judge with two minutes

| # | Where | What happens | They expected | Severity |
|---|---|---|---|---|
| J.1 | Home → Act | Gap and location are clear inside 30 seconds. The recommendation is one card in a carousel. "Concrete enough for a county to implement" (30% of the score) rests on a "First step" sentence. | Something that looks like what a county would actually adopt: a plan with owners, dates, measures | High |
| J.2 | Act | "A simulation showing the potential impact of an intervention" is one of the named formats. The "What if" is arithmetic on shares, clearly labelled, but not interactive and not tied to a target. | A target the judge can move and see the consequence | Medium |
| J.3 | Whole app | Nothing a judge can hold: no output artefact. | A one-page plan that prints | Medium |

### Phone width (390px)

- Home, act and compare all fit without sideways scroll. The act page is 3,500px long with one action visible; the same carousel problem (2.1) applies.
- Compare at 390px is 4,800px of stacked cards; no sort, so finding one's own area means scrolling.
- Header: four short links fit in one row. A fifth item needs checking.

## Wanted tools and features (from the findings)

1. A board-ready action plan per area: one document with the situation, a target, the actions as rows (who, first step, by when, how measured, national measure and funding route, cost field), what to start recording locally, sources and limits. With Print, Word and Excel. (2.2, 3.1–3.3, 4.1–4.3, J.1–J.3)
2. A target the person can set (level and year) with the yearly improvement it implies, in percentage points, from published figures only. (2.6, J.2)
3. Print styles for the whole site and a visible Print button. (4.1, 4.2)
4. All recommended actions visible without a carousel. (2.1)
5. A "Finland overall" page: counts per step, the gap between areas over time, national-level actions with the roadmap's schedule, the data-gap to-do list, Goal 3 linkage. (N.1–N.3)
6. Compare as a real table that sorts, with a download for Excel and a side-by-side with a chosen area; change since 2023 for every area. (6.1, 6.2, 7.2)
7. Plain wording: "Source:" on chips, "Search the web for more studies", "Close", "Result where it was tried". (1.1, 2.3, 2.4)
8. An intervention estimate where a cited effect exists in a usable unit. (J.2)

## Why not a full "intervention simulator"

I checked the unit of every measured effect in `data/evidence.json` against the two indicators the app ranks on (Sotkanet 6411, share of non-urgent GP visits waiting over 7 days; Sotkanet 13, share of referrals processed within 3 days):

| Action | Published effect | Unit |
|---|---|---|
| Named GP | 0.75 | odds ratio, mortality |
| Omaolo triage | 97.6% | share judged safe |
| Fast-track pathways (Denmark) | −17 days (95% CI 15–19) | median diagnostic interval |
| E-consultation | 0.9 days | specialist response time |
| Referral templates | +18% | referral quality score |
| Rapid diagnostic centre | 8% | cancers found per referral |

None is in the unit of 6411 or 13. A slider that moved a county's 6411 "after the action" would need an invented effect size, which the data-honesty rule (20% of the score) forbids. The one effect measured in time with a range is Denmark's −17 days, and Finland publishes no county baseline for the diagnostic interval. So the honest forms of "simulation" here are: (a) a target calculator on published shares (what the gap is, what pace closes it by a chosen year), and (b) for the fast-track action only, the Danish effect applied to a baseline the county types in itself, labelled as an estimate with its range. Counts of visits are avoided as headline figures: the count behind 6411 is the number of recorded visits, which changed by more than 20% in 18 of 22 areas between 2023 and 2025.

## Direction added by the team lead after the first version of this audit

Two instructions arrived while the build was starting. Both are folded into the list below.

1. **Deliver the stand-out as a guided briefing.** Do not make the director dig through the data; bring it to them one small piece at a time, with motion and plainly labelled buttons: pick the area → where you stand (one number, with its source) → where on the pathway it breaks → whether it is getting worse → what to do on Monday → what the target means → a page to print or send to the board. Motion only moves when a button is pressed, every number keeps its source and its limitation, reduced-motion is respected, and the old pages stay as "the full table" behind it.
2. **Restyle the whole app** to a light "cream paper" theme (Forest Ink `#0f3e17`, Cream Paper `#fffefc`, keylime / mint / sage / slate surfaces, a light display serif with a plain sans, 14px radii, pills, no shadows), at the theme level first and then by sweeping components. Status colours keep their meaning and their text labels. `app/sources/` is a teammate's and is not edited; it takes the look from the shared tokens.

How this fits the audit: the guided briefing answers findings 1.3, 2.1, 4.3 and J.1–J.3 directly (one thing per screen, one obvious button, nothing to discover), and the action plan becomes its last step and its printable output rather than a separate destination. The light theme removes finding 4.2 at the root: a page that is already dark-on-light prints as it looks.

## Ranked build list (revised)

| Rank | Item | Findings | Rubric |
|---|---|---|---|
| 1 | **Guided briefing** (`/briefing/<id>`): six steps, one statement or one figure each, a labelled Next and Back, "Step n of 6", buttons inside the steps (show the source, compare with another area, choose an action, set the target). Ends in the action plan. | 1.3, 2.1, 2.6, 4.3, J.1–J.3 | Clarity, Actionability, Execution |
| 2 | **County action plan** (`/county/<id>/plan`), the briefing's last step and its output: target, action rows (responsible role, first step, national measure, schedule and funding route, measure of success, fields for the named person, review date and local cost), what to start recording, limits, sources. Print, Word, Excel, email. | 2.2, 3.1–3.3, 4.1–4.4 | Actionability, Data transparency |
| 3 | **Cream-paper theme for the whole app**, tokens first, then components, the map and the bars. | 4.2, lead's instruction | Clarity, Execution |
| 4 | Print styles, Print buttons, closed sections opened on paper | 4.1, 4.2 | Execution |
| 5 | Act page: the three actions as a numbered list, one obvious button onward | 2.1, 2.3 | Actionability, Clarity |
| 6 | Finland overall (`/national`): counts per step, the gap between areas over time, national actions with the roadmap's schedule, the data-gap to-do list, the Goal 3 line | N.1–N.3 | Insight, Actionability, Data transparency, minimum requirement |
| 7 | Compare: a table that sorts, change since 2023 for every area, Excel download | 6.1, 7.2 | Insight, Clarity |
| 8 | Plain wording pass (live search labels, close buttons, example-question label) | 1.1, 2.4, 5.1 | Clarity |
| 9 | Fast-track estimate with the county's own baseline (Denmark, −17 days, range 15–19) | J.2 | Actionability, Data transparency |
| 10 | County page: step tabs as plain sections | 1.3 | Clarity |

## The stand-out feature: a guided briefing that ends in a board-ready action plan

**What it is.** The director picks their area and presses "Start the briefing". Six screens follow, each with one statement or one figure that moves into place, its source and its limitation beside it, and one large button that says where it goes next ("Next: where the delay is"). Inside the steps there are buttons for the questions this person actually asks: "Show me the source", "Compare with another area", "Action 1 / 2 / 3", "Set the target". The last screen is the action plan: where the area stands, the target the director set and the yearly pace it implies, the recommended actions as rows (responsible role, first step, the national roadmap measure, schedule and funding route, the published figure that will show whether it worked, fields for the named person, the date and the local cost), what the county must start recording because nobody publishes it, and the sources and limits in full. Three buttons: Print or save as PDF, Download as Word, Download for Excel.

**Why this one.**

- **Actionability (30%)** asks whether a health centre or county could implement the proposal. Today the answer rests on one "First step" sentence inside a carousel. A plan with owner, first step, schedule, measure and sign-off fields is the form in which a county actually adopts something, and it is what AstraZeneca can carry into the follow-up project with a county.
- **Two-minute test (Clarity 10%, Execution 15%).** The briefing is the two-minute test turned into the product: six presses of one button take a judge from the gap, to where it sits, to what to do, to a page that prints. Nothing has to be found.
- **Data transparency (20%).** No number appears without its source chip and the limitation that applies; the plan prints every source in full, states what is not published (cost, the diagnostic interval, GP recognition) instead of filling it in, and turns each gap into a line the county can act on.
- **The primary persona.** One thing per screen, a visible step count, a labelled way forward and back, and at the end what their old software gave them: a report with labelled fields that prints, downloads and can be forwarded. The three hardest findings of the audit (4.1, 4.2, 4.3) are all "I cannot take this out of the browser".
- **Why not a simulator as the headline.** See above: an honest one is small. The target setter is a step of the briefing and a section of the plan, where it is useful, instead of standing alone.

## Status after the build

To be filled in at the end of the branch: each item above marked done or skipped with the reason, and what still falls short after a second pass as the same persona.
