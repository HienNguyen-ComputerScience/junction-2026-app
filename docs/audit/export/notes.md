# One "Save or share" control (export, post-freeze experiment)

Branch `t3/unify-export-save-share-control`, on top of `t3/experimental-real-user-audit` with `t3/act-page-small-chunks` and `t3/home-briefing-first-screen` merged in.

The team lead's ask: drop "for the board" and make exporting seamless. Every page that has something to export now has one entry point, the same control in the same style, offering only the options that make sense there.

## The control (`components/share/save-share.tsx`)

```tsx
import { SaveShare, type ShareOption } from "@/components/share";

<SaveShare
  align="end"                       // from 640px the list lines up with the button's end edge (default "start")
  options={[
    { kind: "print" },                                         // "Print or save as PDF"
    { kind: "word", href: "/county/x/plan/export?format=docx&actions=…", hint: "…" },  // "Download for Word"
    { kind: "excel", href: "/compare/export", hint: "…" },     // "Download for Excel"
    { kind: "email", subject: "…", intro: "…", path?: "/briefing/x" },  // "Email a link to this page"
  ]}
/>
```

- **Config is plain data**, so a server page can pass it. Every option can override `label` and add a one-line `hint`. Options appear in the order given; the house order is Print, Word, Excel, Email.
- **Behaviour:**
  - One outline button, "Save or share", opens on click and never on hover.
  - Escape, a click outside, Tab out of the list, or using an option closes it. Escape and using an option return focus to the button.
  - On open, focus moves to the first option. The button has `aria-expanded`/`aria-controls`, and the list is a `role="group"` labelled by the button.
  - Print calls `window.print()`. Word and Excel are plain `<a href download>` links. Email is a real `mailto:` link whose body carries the page's full address and "Every figure in it names its public source."
- **Layout:**
  - On phones the list sits in the page flow under the button, so the briefing's fixed button bar can't cover it.
  - From 640px it floats under the button (`align` start or end) on Mint Veil, 22rem wide.
  - The whole control is `data-print="hide"` and `print:hidden`.
  - It fades in with the shared `animate-fade-up` timing; under reduced motion it simply appears. It resets its own `--i`, because a stagger index inherited from a surrounding Reveal had delayed it by up to 600 ms.
- **Style:** Forest Ink text and edges, 14px corners, no shadow, Inter, 16px text, 52px tall targets.
- **`inline`** shows the options at once with no button. It is used only on the briefing's last step, where saving or sharing is the step's whole job.

### Why a button that opens a short list, not a menu and not a row

- **Not an ARIA menu.** `role="menu"` brings arrow-key roving and a screen-reader mode switch. A director who is not fluent with web apps doesn't expect either. Plain buttons and links in Tab order behave like everything else on the site.
- **Not a row of four buttons.** On the act page a row would compete with the page's statement and figure, and would break the "one export entry point" rule visually. The one place where a row is clearer, the briefing's last step, gets the row (`inline`).
- **Labels are what the file is,** not what the app does: "Download for Word", "Download for Excel". The hint under each says what is inside ("The action plan, with blank lines for names, dates and cost").

## What each page offers now

| Page | Where | Options |
|---|---|---|
| Actions `/county/<id>/act` | Right of the title (under it on phones) | Print the page; Word and Excel of the plan (recommended actions; only when there are any); Email |
| Briefing, step 6 (`…/take-it-to-your-board`) | The step's body, open (`inline`) | Print the whole briefing (the 4-page document, unchanged); Word and Excel of the plan with the briefing's actions, the target level of the action in focus and the year chosen in step 5; Email a link to step 1 of the briefing |
| Compare `/compare` | Where the Excel and Print buttons were, in the lead chunk | Print; Excel (the table of all areas, `/compare/export`) |
| Area `/county/<id>` | Where the plan and Print buttons were, next to "See what to do" | Print; Email |

On compare and the area page the control sits where the old buttons were, under the title, not beside it. Those headers belong to the foundation agent, so only the buttons were swapped.

## What was removed

- **Both "Make the action plan for the board" buttons** on the act page and the one on the area page. Deleted, not renamed.
- **The plan page.** `/county/<id>/plan` is now a route handler answering **307 → `/county/<id>/act`**, so an old link, a bookmark or an emailed plan address still lands somewhere useful. Unknown ids are still 404s (`proxy.ts`).
  - With the page went its form: target-year chooser, target level, fields for names, dates, cost and sign-off, and its toolbar (Print, Word, Excel, Email).
  - The Word and Excel files still have those fields as blank lines to fill in by hand (`____________________`) and empty columns in Excel.
- **Removed files:** `components/plan/email-plan-button.tsx` and `components/briefing/board-actions.tsx` (replaced by `components/briefing/briefing-share.tsx`). `step-board.tsx` was renamed to `step-share.tsx`.
- **The separate Print and Email buttons** on the act page, briefing, compare and area page are now inside the control.

## The download route

`/county/<id>/plan/export?format=docx|xlsx` was kept as is, with the same parameters (`actions`, `target`, `year`, `person1…`, `review1…`, `cost1…`, `approved`, `decided`). A rename would have meant touching `proxy.ts` and the contract for no reader-visible gain, since the address is never shown.

The writers (`lib/export/*`, `lib/plan-export.ts`) and the plan model are unchanged apart from two code comments. So the files carry exactly what the old plan carried:
- the area's figures with Sotkanet sources;
- the recommended actions, each with responsible role, first step, roadmap measure, result where it was tried, limits of that evidence and source;
- what to start recording, the limits of the plan, the sources table;
- blank lines for named person, review date, cost, approved by and date of decision.

**Target section:** the documents still hold the "Target" section. On the act page it uses the default year (2028). From the briefing it uses the year chosen in step 5. It is labelled as arithmetic, not a forecast, as before. Keeping it was the cheapest way to keep every source and limitation the plan had. Nothing new was computed.

The read-back of every downloaded file found no "board", and found "visits", "Sotkanet", "Limits of this plan", "First step" and the blank lines.

## "Board": what is left

- **User-facing text:** none. Checked by scanning `document.body.innerText` and the page title on home, act, the briefing's last step, compare and the area page at both sizes, and by grepping `app components lib` and the Word and Excel files. `data/*.json` has no "board".
- **Step 6 label:** "Save or share this briefing". It feeds the pill, the page title ("Step 6 of 6: Save or share this briefing") and step 5's Next button. On paper, section 6 is headed "The action plan as a file" and points to the act page for the Word and Excel files.
- **Home:** "6 short steps · about 2 minutes · download or print at the end".
- **One leftover, in an address:** step 6's URL slug is still `take-it-to-your-board`. `proxy.ts` (repo root config, not this branch's) duplicates the slug list to return real 404s, so changing it only in `lib/briefing/steps.ts` would 404 the step. To finish it, the owner of `proxy.ts` does both of these in one commit:
  1. In `lib/briefing/steps.ts`, set the step's slug to `save-or-share`.
  2. In `proxy.ts`, replace `"take-it-to-your-board"` with `"save-or-share"` in `briefingSteps`. Optionally keep the old slug there too and add a redirect from it.
- **Internal names:** the step id is now `share`. The dev tool `tools/board` is unrelated.

## How `/insights` and `/how-to-read` should adopt the control

Not edited here (other agents own them).

- **`/insights`**: `app/insights/page.tsx` has a header row with `<PrintButton />` and `<StarterDownload />` (the recording template, `STARTER_TEMPLATE_URL = "/api/insights/starter-template"`). Replace that row with:
  ```tsx
  <SaveShare options={[
    { kind: "print" },
    { kind: "excel", href: STARTER_TEMPLATE_URL, label: "Download the recording template for Excel", hint: "Columns for the figures nobody publishes yet" },
    { kind: "email", subject: "Where cancer care access is hardest in Finland", intro: "Where access to early cancer care is hardest across Finland, from published figures:" },
  ]} />
  ```
  Put it beside or under the page title, and remove any other print or download button on the page (the starter-dataset section's own download link included) so the control is the one entry point. If the template must stay visible in its section, link to it as text ("the template is under Save or share") rather than as a second button.
- **`/how-to-read`**: nothing to download. If it should print, use `<SaveShare options={[{ kind: "print" }, { kind: "email", subject: "How to read FirstLine's numbers", intro: "How to read the figures in FirstLine:" }]} />` beside the title. Otherwise leave it without a control. The rule is one entry point, and only where there is something to export.
- **`PrintButton`** (`components/motion/print-button.tsx`) stays exported (contract §2). After this branch its only user is `/insights`. Once `/insights` adopts the control it can be removed.

## Stale documentation (not edited: not this branch's file)

`docs/audit/contract.md` §3 still describes the plan page as a page with a form. The export route and its parameters are unchanged; the page part is now a redirect.

## Verification

See the PR body for the verify command output. The click-through script (playwright-core with the cached Chromium, 1366×768 and 390×844, keyboard only for the control) checked:
- Tab to the button, Enter opens, focus lands on the first option, Escape closes and returns focus, an outside click closes, and hover doesn't open.
- Every option was used:
  - Print: `window.print` was stubbed and its call counted. The print preview was rendered with `page.pdf()`: the briefing is still 4 pages and the control is `display: none` on paper.
  - Word and Excel were downloaded and read back with an unzip script.
  - The email link's address was fetched and answered 200.
- No horizontal scroll at 390px. One control per page and no other export buttons. The old `/plan` address lands on `/act`.

The final run was made against the production build (`next start`) after the last foundation merge: 107 checks, 0 failures. The dev server, run before that merge, showed both labels of every Disclosure ("Why?" and "Hide why") after hot-reloading the foundation's new `globals.css`. The production build shows one label, so this is stale dev CSS, not a bug; restart `npm run dev` after merging.

On the briefing's last step at 1366×768, the first option sits under the step's fixed Back bar until the reader scrolls a little, as the old buttons did. Moving the options above the three-line summary would fix that. It was left alone to keep this change small.

Screenshots: `docs/audit/export/screenshots/` (`<page>-<desktop|phone>[-open].png`, `act-print-media.png`, etc.).
