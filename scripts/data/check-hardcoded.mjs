#!/usr/bin/env node
// Safety net for figures in the app's copy after a data refresh. Part of `npm run data:refresh`.
//
//   node scripts/data/check-hardcoded.mjs
//
// The app reads its numbers from data/. The claims that used to be typed by hand (the /compare
// headline, the 5033 "0-3%" range, the no-way-round chart axes) are now computed from the data.
// This script fails (exit 1) when:
//   FIGURE MISMATCH  a value the spec, pitch and video quote (anchors.mjs) changed, or the 5033
//                    limitation in data/indicators.json no longer states the range in the data;
//   TYPED FIGURE     one of those claims is typed into the code again (compute it from data/).
// See data/README.md, "Hardcoded figures".

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ANCHORS } from "./anchors.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const values = readJson("data/values.json");
const indicators = readJson("data/indicators.json");
const valueOf = (county, indicator, year) =>
  values.find((v) => v.county_id === county && v.indicator_id === indicator && v.year === year)?.value ?? null;

const problems = [];

// 1. The quoted anchor values.
for (const a of ANCHORS) {
  const got = valueOf(a.county_id, a.indicator_id, a.year);
  if (got !== a.value)
    problems.push(
      `FIGURE MISMATCH: quoted figure ${a.county_id} ${a.indicator_id} ${a.year} (SPEC.md, pitch, video): expected ${a.value}, data/values.json has ${got}`,
    );
}

// 2. The 5033 limitation the build writes states the latest year's range.
{
  const year = Math.max(...values.filter((v) => v.indicator_id === "5033").map((v) => v.year));
  const shares = values.filter((v) => v.indicator_id === "5033" && v.year === year).map((v) => v.value);
  const whole = shares.every(Number.isInteger);
  const show = (n) => (whole ? String(n) : n.toFixed(1));
  const [min, max] = [Math.min(...shares), Math.max(...shares)];
  const range = min === max ? `${show(min)}%` : `${show(min)}-${show(max)}%`;
  const limitation = indicators.find((i) => i.indicator_id === "5033")?.limitation ?? "";
  if (!limitation.includes(range))
    problems.push(`FIGURE MISMATCH: data/indicators.json 5033 limitation does not state the ${year} range ${range}: "${limitation}"`);
}

// 3. The computed claims must not be typed back in.
const TYPED = [
  ["app/compare/page.tsx", /statement="[^"]*(longer|shorter) than Finland overall"/, "the /compare headline"],
  ["app/county/[id]/page.tsx", /\d+-\d+% everywhere/, "the 5033 range on the county page"],
  ["scripts/data/build-snapshot.mjs", /whole percentages and \d/, "the 5033 range in its limitation"],
  ["components/insights/no-way-round-chart.tsx", /\{ ?min: \d+, max: \d+, ticks: \[/, "a no-way-round chart axis"],
];
for (const [file, pattern, what] of TYPED) {
  const path = join(ROOT, file);
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const at = text.search(pattern);
  if (at >= 0)
    problems.push(
      `TYPED FIGURE: ${file}:${text.slice(0, at).split("\n").length} types ${what} by hand; compute it from data/ instead.`,
    );
}

if (problems.length) {
  console.error(`check-hardcoded: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-hardcoded: OK (${ANCHORS.length} anchors, the 5033 limitation, ${TYPED.length} computed claims)`);
