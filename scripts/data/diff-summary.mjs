#!/usr/bin/env node
// Prints a Markdown summary of what a data refresh changed: the rows of data/values.json that
// differ from the committed version (git HEAD), grouped by indicator, and every other changed file
// under data/. The daily workflow (.github/workflows/data-refresh.yml) uses it as the PR body.
//
//   node scripts/data/diff-summary.mjs

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAX_ROWS = 60;

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const readNow = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const readHead = (path) => {
  try {
    return JSON.parse(git("show", `HEAD:${path}`));
  } catch {
    return [];
  }
};

const before = readHead("data/values.json");
const after = readNow("data/values.json");
const countyName = new Map([...readHead("data/counties.json"), ...readNow("data/counties.json")].map((c) => [c.id, c.name]));
const indicatorName = new Map(
  [...readHead("data/indicators.json"), ...readNow("data/indicators.json")].map((i) => [i.indicator_id, i.short_name]),
);

const key = (v) => `${v.indicator_id}|${v.county_id}|${v.year}`;
const oldRows = new Map(before.map((v) => [key(v), v]));
const newRows = new Map(after.map((v) => [key(v), v]));
const show = (v) => (v ? `${v.value ?? "none"}${v.abs_value != null ? ` (n=${v.abs_value})` : ""}` : "no row");

const changes = [];
for (const k of new Set([...oldRows.keys(), ...newRows.keys()])) {
  const a = oldRows.get(k);
  const b = newRows.get(k);
  if (JSON.stringify(a) === JSON.stringify(b)) continue;
  const [indicator_id, county_id, year] = k.split("|");
  changes.push({ indicator_id, county_id, year, from: show(a), to: show(b) });
}
changes.sort(
  (x, y) =>
    x.indicator_id.localeCompare(y.indicator_id, "en", { numeric: true }) ||
    x.county_id.localeCompare(y.county_id) ||
    x.year.localeCompare(y.year),
);

const files = git("status", "--porcelain", "--", "data/")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3));

const out = [];
out.push("Automatic daily refresh of the THL Sotkanet snapshot (`npm run data:refresh`).", "");
out.push(
  "Built by `.github/workflows/data-refresh.yml`. The refresh, the insight checks, the hardcoded-figure check and the full verify (`npm test`, `brief:check`, `typecheck`, `lint`, `build`) all passed before this PR was opened.",
  "",
);
out.push(`**Changed files:** ${files.length ? files.map((f) => `\`${f}\``).join(", ") : "none"}`, "");

if (changes.length === 0) {
  out.push("**data/values.json:** no figure changed (only other files, such as source metadata, changed).");
} else {
  const indicators = [...new Set(changes.map((c) => c.indicator_id))];
  const areas = [...new Set(changes.map((c) => c.county_id))];
  out.push(
    `**data/values.json:** ${changes.length} row(s) changed across ${indicators.length} indicator(s) and ${areas.length} area(s).`,
    "",
    `- Indicators: ${indicators.map((id) => `${id} (${indicatorName.get(id) ?? "unknown"})`).join(", ")}`,
    `- Areas: ${areas.map((id) => countyName.get(id) ?? id).join(", ")}`,
    "",
    "| Indicator | Area | Year | Before | After |",
    "|---|---|---|---|---|",
  );
  for (const c of changes.slice(0, MAX_ROWS))
    out.push(`| ${c.indicator_id} | ${countyName.get(c.county_id) ?? c.county_id} | ${c.year} | ${c.from} | ${c.to} |`);
  if (changes.length > MAX_ROWS) out.push("", `…and ${changes.length - MAX_ROWS} more rows. See the diff of \`data/values.json\`.`);
}
out.push(
  "",
  "Before merging: the pitch, video and SPEC quote figures from the snapshot. Check that this change does not move a quoted number (the build refuses to change the three anchor values, but other quoted figures are not guarded).",
);
console.log(out.join("\n"));
