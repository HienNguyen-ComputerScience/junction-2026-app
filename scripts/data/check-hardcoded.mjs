#!/usr/bin/env node
// Fails (exit 1) when a figure typed by hand into user-visible copy no longer matches the
// snapshot. Most of the app reads its numbers from data/, so a refresh updates them; these few
// claims are written into the code and would go stale silently. Part of `npm run data:refresh`.
//
//   node scripts/data/check-hardcoded.mjs
//
// Each claim finds its copy by text, never by line number, because the files keep changing. Two
// different failures:
//   COPY NOT FOUND   the text moved or was reworded: update the `find` pattern here.
//   FIGURE MISMATCH  the snapshot no longer supports the copy: change the copy (or the snapshot).
// The full audit (which numbers in app/, components/, lib/ are read from data and which are not)
// is in data/README.md, "Hardcoded figures".

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ANCHORS } from "./anchors.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));

const values = readJson("data/values.json");
const counties = readJson("data/counties.json");
const noWayRound = readJson("data/insights/no-way-round.json");

const areaIds = new Set(counties.filter((c) => c.kind !== "country").map((c) => c.id));
const valueOf = (county, indicator, year) =>
  values.find((v) => v.county_id === county && v.indicator_id === indicator && v.year === year)?.value ?? null;
const latestYear = (indicator) => Math.max(...values.filter((v) => v.indicator_id === indicator).map((v) => v.year));

/** 5033: "0-3% everywhere", in whole percentages, for the latest year the app shows. */
function referralLateRange() {
  const year = latestYear("5033");
  const off = values.filter(
    (v) => v.indicator_id === "5033" && v.year === year && v.value !== null && !(Number.isInteger(v.value) && v.value >= 0 && v.value <= 3),
  );
  return off.length
    ? `5033 in ${year} is not whole percentages of 0-3 everywhere: ${off.map((v) => `${v.county_id} ${v.value}`).join(", ")}`
    : null;
}

/** Every dot of the no-way-round chart (and Finland's lines) must sit inside the hand-set axis. */
function insideAxis(key, min, max) {
  return () => {
    const points = [
      ["finland", noWayRound.finland[key]],
      ...noWayRound.areas.map((a) => [a.county_id, a[key]?.value ?? null]),
    ].filter(([, v]) => v !== null);
    const out = points.filter(([, v]) => v < min || v > max);
    return out.length
      ? `no-way-round ${key} outside the chart axis ${min}-${max}: ${out.map(([id, v]) => `${id} ${v}`).join(", ")}`
      : null;
  };
}

const CLAIMS = [
  ...ANCHORS.map((a) => ({
    what: `quoted figure ${a.county_id} ${a.indicator_id} ${a.year} = ${a.value} (SPEC.md, pitch, video)`,
    file: "scripts/data/anchors.mjs",
    find: new RegExp(`value: ${a.value.toString().replace(".", "\\.")}\\b`),
    check: () => {
      const got = valueOf(a.county_id, a.indicator_id, a.year);
      return got === a.value ? null : `expected ${a.value}, data/values.json has ${got}`;
    },
  })),
  {
    what: '"Most areas wait longer than Finland overall" (compare page headline)',
    file: "app/compare/page.tsx",
    find: /Most areas wait longer than Finland overall/,
    check: () => {
      const year = latestYear("6411");
      const fi = valueOf("finland", "6411", year);
      const rows = values.filter((v) => v.indicator_id === "6411" && v.year === year && areaIds.has(v.county_id));
      const longer = rows.filter((v) => v.value !== null && v.value > fi).length;
      return longer * 2 > areaIds.size
        ? null
        : `only ${longer} of ${areaIds.size} areas have a 6411 value above Finland (${fi}) in ${year}`;
    },
  },
  {
    what: '5033 "0-3% everywhere" (county page limitation)',
    file: "app/county/[id]/page.tsx",
    find: /Whole percentages of 0-3% everywhere/,
    check: referralLateRange,
  },
  {
    what: '5033 "0-3% everywhere" (indicator limitation, written to data/indicators.json)',
    file: "scripts/data/build-snapshot.mjs",
    find: /Published as whole percentages and 0-3% everywhere/,
    check: referralLateRange,
  },
  {
    what: "no-way-round chart: GP wait axis 30-90",
    file: "components/insights/no-way-round-chart.tsx",
    find: /yAxis: Axis = \{ min: 30, max: 90,/,
    check: insideAxis("wait", 30, 90),
  },
  {
    what: "no-way-round chart: occupational-health axis 1000-2400",
    file: "components/insights/no-way-round-chart.tsx",
    find: /xAxis=\{\{ min: 1000, max: 2400,/,
    check: insideAxis("occupational", 1000, 2400),
  },
  {
    what: "no-way-round chart: private-doctor axis 15-35",
    file: "components/insights/no-way-round-chart.tsx",
    find: /xAxis=\{\{ min: 15, max: 35,/,
    check: insideAxis("private", 15, 35),
  },
];

const problems = [];
for (const claim of CLAIMS) {
  const path = join(ROOT, claim.file);
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const at = text.search(claim.find);
  if (at < 0) {
    problems.push(`COPY NOT FOUND: ${claim.file} no longer contains ${claim.find} (${claim.what}). Update this check.`);
    continue;
  }
  const line = text.slice(0, at).split("\n").length;
  const problem = claim.check();
  if (problem) problems.push(`FIGURE MISMATCH: ${claim.file}:${line} ${claim.what}: ${problem}`);
}

if (problems.length) {
  console.error(`check-hardcoded: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-hardcoded: OK (${CLAIMS.length} hand-typed claims match data/)`);
