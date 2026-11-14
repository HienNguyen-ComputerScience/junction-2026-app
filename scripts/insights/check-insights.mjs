#!/usr/bin/env node
// Fails (exit 1) if any derived insight row lacks a source, disagrees with the snapshot, or the
// committed data/insights/*.json is out of date with the rules. Run after any snapshot change.
//
//   node scripts/insights/check-insights.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { INSIGHT_SOURCES } from "./add-sources.mjs";
import { derive, loadSnapshot } from "./build-insights.mjs";
import { RECORDING_CHANGE_ABOVE } from "./rules.mjs";
import { FIELDS, SECTIONS, STARTER_INDICATORS } from "./starter.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const problems = [];
const fail = (msg) => problems.push(msg);
const readInsight = (name) => JSON.parse(readFileSync(join(ROOT, "data", "insights", name), "utf8"));

const snapshot = loadSnapshot();
const sourceIds = new Set(snapshot.sources.map((s) => s.source_id));
const valueMap = new Map(snapshot.values.map((v) => [`${v.county_id}|${v.indicator_id}|${v.year}`, v]));
const snap = (area, ind, year) => valueMap.get(`${area}|${ind}|${year}`) ?? null;

// 1. The committed files are exactly what the rules give for this snapshot.
const out = derive(snapshot);
const expected = {
  "rules.json": out.rules,
  "grades.json": out.grades,
  "no-way-round.json": out.noWayRound,
  "early-warning.json": { summary: out.warningSummary, rows: out.warnings },
  "pathway.json": out.pathway,
  "starter-dataset.json": out.starter,
};
const committed = {};
for (const [name, data] of Object.entries(expected)) {
  committed[name] = readInsight(name);
  if (!isDeepStrictEqual(committed[name], JSON.parse(JSON.stringify(data))))
    fail(`data/insights/${name} is out of date: run node scripts/insights/build-insights.mjs`);
}

// 2. Every figure carries a source that resolves, and equals the snapshot's value.
const checkFigure = (where, area, ind, year, value, sourceId, { shared = false } = {}) => {
  if (!sourceId) return fail(`${where}: no source_id`);
  if (!sourceIds.has(sourceId)) fail(`${where}: source_id ${sourceId} not in data/sources.json`);
  if (value == null) return;
  if (shared) {
    const gap = snapshot.gaps.find((g) => g.county_id === area && g.indicator_id === ind && g.shared);
    const point = gap?.shared?.trend.find((t) => t.year === year);
    if (!point || point.value !== value) fail(`${where}: shared value ${value} not in gaps.json`);
    return;
  }
  const row = snap(area, ind, year);
  if (!row) return fail(`${where}: no snapshot row for ${area} ${ind} ${year}`);
  if (row.value !== value) fail(`${where}: ${value} but the snapshot says ${row.value}`);
  if (row.source_id !== sourceId) fail(`${where}: source ${sourceId} but the snapshot says ${row.source_id}`);
};

for (const g of committed["grades.json"]) {
  const where = `grades ${g.county_id} ${g.indicator_id} ${g.year}`;
  checkFigure(where, g.county_id, g.indicator_id, g.year, g.value, g.source_id);
  if (g.shared_value != null) checkFigure(where, g.county_id, g.indicator_id, g.year, g.shared_value, g.source_id, { shared: true });
  if (g.value == null && g.shared_value == null && g.level !== "none") fail(`${where}: no value but graded ${g.level}`);
  if (!g.label || !g.reason) fail(`${where}: grade without a label or reason`);
}

const nwr = committed["no-way-round.json"];
for (const a of nwr.areas)
  for (const key of ["wait", "occupational", "private"]) {
    const f = a[key];
    checkFigure(`no-way-round ${a.county_id} ${key}`, a.county_id, f.indicator_id, f.year, f.value, f.source_id);
    checkFigure(`no-way-round Finland ${key}`, "finland", f.indicator_id, f.year, f.finland, f.source_id);
  }

for (const r of committed["early-warning.json"].rows)
  for (const p of r.series) {
    checkFigure(`early-warning ${r.county_id} ${r.indicator_id} ${p.year}`, r.county_id, r.indicator_id, p.year, p.value, r.source_id);
    checkFigure(`early-warning Finland ${r.indicator_id} ${p.year}`, "finland", r.indicator_id, p.year, p.finland, r.source_id);
  }

for (const area of committed["pathway.json"])
  for (const step of area.steps)
    for (const it of step.items) {
      const where = `pathway ${area.county_id} ${step.id} ${it.indicator_id}`;
      checkFigure(where, area.county_id, it.indicator_id, it.year, it.value, it.source_id, { shared: it.shared != null });
      checkFigure(`${where} Finland`, "finland", it.indicator_id, it.year, it.finland, it.source_id);
    }

// 3. The starter dataset points at real data gaps, roadmap measures and sources.
const gapIds = new Set(snapshot.dataGaps.map((g) => g.id));
const measureIds = new Set(snapshot.roadmap.map((m) => m.measure_id));
for (const s of SECTIONS) {
  if (!gapIds.has(s.data_gap_id)) fail(`starter section ${s.id}: data gap ${s.data_gap_id} not in data/data-gaps.json`);
  if (s.measure_id && !measureIds.has(s.measure_id)) fail(`starter section ${s.id}: measure ${s.measure_id} not in data/roadmap.json`);
  for (const ref of [s.basis, s.abroad]) if (ref && !sourceIds.has(ref.source_id)) fail(`starter section ${s.id}: source ${ref.source_id} missing`);
}
for (const i of STARTER_INDICATORS) {
  if (!sourceIds.has(i.source_id)) fail(`starter indicator ${i.id}: source ${i.source_id} missing`);
  if (i.measure_id && !measureIds.has(i.measure_id)) fail(`starter indicator ${i.id}: measure ${i.measure_id} missing`);
  for (const id of i.formula.match(/\b[A-F]\d\b/g) ?? [])
    if (!FIELDS.some((f) => f.id === id)) fail(`starter indicator ${i.id}: formula uses unknown field ${id}`);
}
// No patient-identifying field may ever enter the template.
const PATIENT = /\b(name|identity|henkilötunnus|social security|birth|address|phone|e-?mail|patient id)\b/i;
for (const f of FIELDS) if (PATIENT.test(`${f.header} ${f.count}`)) fail(`starter field ${f.id} looks patient-identifying`);

// 4. The insight sources are still in data/sources.json (a data:build would drop them).
for (const s of INSIGHT_SOURCES)
  if (!sourceIds.has(s.source_id)) fail(`data/sources.json lost ${s.source_id}: run node scripts/insights/add-sources.mjs`);

// 5. The recording threshold is the one the rest of the app uses.
const recording = readFileSync(join(ROOT, "lib", "recording.ts"), "utf8");
const match = /RECORDING_CHANGE_ABOVE\s*=\s*([\d.]+)/.exec(recording);
if (!match || Number(match[1]) !== RECORDING_CHANGE_ABOVE)
  fail(`lib/recording.ts RECORDING_CHANGE_ABOVE is ${match?.[1]}, the insights use ${RECORDING_CHANGE_ABOVE}`);

if (problems.length) {
  console.error(`check-insights: ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 40)) console.error(`  - ${p}`);
  process.exit(1);
}
const figures =
  committed["grades.json"].length + nwr.areas.length * 3 + committed["early-warning.json"].rows.length;
console.log(`check-insights: OK (${figures} derived rows checked against data/values.json and data/sources.json)`);
