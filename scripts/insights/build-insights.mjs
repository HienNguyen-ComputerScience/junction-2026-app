#!/usr/bin/env node
// Builds data/insights/*.json from the committed snapshot in data/. No network, no randomness:
// the same snapshot always gives the same files.
//
//   node scripts/insights/build-insights.mjs
//
// Every derived row keeps the snapshot's own value, year and source_id; computed fields
// (differences, groups, grades) say how they were computed in data/insights/rules.json.
// Check with: node scripts/insights/check-insights.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABOUT_SAME_POINTS,
  GRADE_RULES,
  GRADED,
  HUS_AREAS,
  LEVELS,
  NWR_GROUPS,
  NWR_INDICATORS,
  NWR_TESTS,
  PUBLISHER_GAPS,
  RECORDING_CHANGE_ABOVE,
  SCOPE,
  SCREENING_TARGET,
  SMALL_BASE_BELOW,
  WARNING_INDICATORS,
} from "./rules.mjs";
import { BANDS, CANCER_GROUPS, FIELDS, PRIVACY, SECTIONS, STARTER_INDICATORS } from "./starter.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (name) => JSON.parse(readFileSync(join(ROOT, "data", name), "utf8"));

export function loadSnapshot() {
  return {
    values: read("values.json"),
    counties: read("counties.json"),
    indicators: read("indicators.json"),
    gaps: read("gaps.json"),
    dataGaps: read("data-gaps.json"),
    roadmap: read("roadmap.json"),
    sources: read("sources.json"),
  };
}

const round1 = (n) => Math.round(n * 10) / 10;

/** Everything derived, as plain objects. Exported so the check script can rebuild and compare. */
export function derive(snapshot) {
  const { values, counties, indicators, gaps, dataGaps, roadmap } = snapshot;
  const areas = counties.filter((c) => c.kind !== "country").sort((a, b) => a.name.localeCompare(b.name));
  const nameOf = new Map(counties.map((c) => [c.id, c.name]));
  const indicatorOf = new Map(indicators.map((i) => [i.indicator_id, i]));
  const valueMap = new Map(values.map((v) => [`${v.county_id}|${v.indicator_id}|${v.year}`, v]));
  const getValue = (area, ind, year) => valueMap.get(`${area}|${ind}|${year}`) ?? null;
  const yearsOf = (ind) => [...new Set(values.filter((v) => v.indicator_id === ind).map((v) => v.year))].sort();

  // ------------------------------------------------------------------ grades
  const sharedOf = (area, ind, year) => {
    if (ind !== "13" || !HUS_AREAS.includes(area)) return null;
    const gap = gaps.find((g) => g.county_id === area && g.indicator_id === "13" && g.shared);
    const point = gap?.shared?.trend.find((t) => t.year === year);
    return point ? { name: gap.shared.name, value: point.value, confirmed_by: gap.shared.confirmed_by } : null;
  };

  /** The count behind a figure: visits with waiting-time data for shares, the count itself otherwise. */
  const baseOf = (row) => {
    const kind = GRADED[row.indicator_id]?.base;
    if (!kind || row.abs_value == null) return null;
    if (kind === "count") return row.abs_value;
    return row.value > 0 ? Math.round(row.abs_value / (row.value / 100)) : null;
  };
  const countWord = (ind) => GRADED[ind]?.count ?? "items";
  const ruleLabel = (id) => GRADE_RULES.find((r) => r.id === id);

  function gradeFor(area, ind, year) {
    const row = getValue(area, ind, year);
    const reasons = [];
    const scope = SCOPE[ind];
    const out = (extra) => {
      const first = ruleLabel(reasons[0].rule_id);
      return {
        county_id: area,
        indicator_id: ind,
        year,
        value: row ? row.value : null,
        ...extra,
        level: first.level,
        label: first.label,
        reason: reasons[0].text,
        also: reasons.slice(1).map((r) => r.text),
        rule_ids: reasons.map((r) => r.rule_id),
        scope,
        source_id: indicatorOf.get(ind).source_id,
      };
    };
    if (!row) {
      const shared = sharedOf(area, ind, year);
      if (shared) {
        reasons.push({
          rule_id: "shared-hospital",
          text: `Only a ${shared.name}-wide value is published (${shared.value}% in ${year}); it covers several areas, not ${nameOf.get(area)} alone.`,
        });
        return out({ shared_value: shared.value, shared_name: shared.name, confirmed_by: shared.confirmed_by });
      }
      reasons.push({ rule_id: "no-data", text: `Sotkanet publishes no ${year} value for ${nameOf.get(area)}.` });
      return out({});
    }
    const gap = PUBLISHER_GAPS.areas[area];
    if (gap && PUBLISHER_GAPS.indicators.includes(ind) && gap.years.includes(year))
      reasons.push({ rule_id: "publisher-gap", text: gap.reason });
    const base = baseOf(row);
    if (ind === "6411" && base !== null && base < SMALL_BASE_BELOW)
      reasons.push({
        rule_id: "small-base",
        text: `The share rests on about ${base.toLocaleString("en-GB")} visits, so a few visits move it a lot.`,
      });
    if ((ind === "13" || ind === "5033") && area === "helsinki")
      reasons.push({
        rule_id: "partial-unit",
        text: "Covers the city's own specialist units only; most Helsinki referrals go to HUS.",
      });
    const prev = getValue(area, ind, year - 1);
    const prevBase = prev ? baseOf(prev) : null;
    if (base !== null && prevBase !== null && prevBase > 0) {
      const change = base / prevBase - 1;
      if (Math.abs(change) > RECORDING_CHANGE_ABOVE) {
        const pct = Math.round(Math.abs(change) * 100);
        const moved = change >= 1 ? "more than doubled" : `${change < 0 ? "fell" : "rose"} ${pct}%`;
        reasons.push({
          rule_id: "recording-change",
          text: `The number of ${countWord(ind)} behind this figure ${moved} from ${year - 1}, so part of the change may be in what was recorded.`,
          change: round1(change * 100),
        });
      }
    }
    if (ind === "6103")
      reasons.push({
        rule_id: "programme-widening",
        text: "The bowel screening programme started in 2022 and is still adding age groups, so years are not fully comparable.",
      });
    if (reasons.length === 0) reasons.push({ rule_id: "solid", text: "Published for this area and year; the count behind it is steady." });
    return out({ base });
  }

  const gradedIndicators = Object.keys(GRADED);
  const grades = [];
  for (const ind of gradedIndicators) {
    const years = yearsOf(ind);
    for (const area of [...areas.map((a) => a.id), "finland"])
      for (const year of years) grades.push(gradeFor(area, ind, year));
  }
  const gradeMap = new Map(grades.map((g) => [`${g.county_id}|${g.indicator_id}|${g.year}`, g]));
  const getGrade = (area, ind, year) => gradeMap.get(`${area}|${ind}|${year}`);
  const gradeBrief = (g) => ({ level: g.level, label: g.label, reason: g.reason });

  const distribution = {};
  for (const g of grades) {
    if (g.county_id === "finland") continue;
    distribution[g.indicator_id] ??= {};
    const key = `${g.year} ${g.level}`;
    distribution[g.indicator_id][key] = (distribution[g.indicator_id][key] ?? 0) + 1;
  }

  // ------------------------------------------------------------------ no way round
  const median = (list) => {
    const s = [...list].sort((a, b) => a - b);
    const m = s.length / 2;
    return s.length % 2 ? s[Math.floor(m)] : round1((s[m - 1] + s[m]) / 2);
  };
  const references = NWR_TESTS.map((test) => {
    const ref = {};
    for (const [key, ind] of Object.entries(NWR_INDICATORS))
      ref[key] =
        test.reference === "finland"
          ? getValue("finland", ind, test.year).value
          : median(areas.map((a) => getValue(a.id, ind, test.year).value));
    return { ...test, values: ref };
  });
  const groupOf = (w, o, p, ref, margin) => {
    const long = w > ref.wait * (1 + margin);
    const few = o < ref.occupational * (1 - margin) && p < ref.private * (1 - margin);
    return `${long ? "long" : "short"}-${few ? "few" : "some"}`;
  };
  const MAIN = references[0];
  const nwrAreas = areas.map((area) => {
    const tests = {};
    for (const ref of references) {
      const [w, o, p] = ["wait", "occupational", "private"].map((k) => getValue(area.id, NWR_INDICATORS[k], ref.year).value);
      tests[ref.id] = groupOf(w, o, p, ref.values, ref.margin) === "long-few";
    }
    const figure = (key) => {
      const ind = NWR_INDICATORS[key];
      const row = getValue(area.id, ind, MAIN.year);
      return {
        indicator_id: ind,
        year: MAIN.year,
        value: row.value,
        finland: MAIN.values[key],
        source_id: row.source_id,
        grade: gradeBrief(getGrade(area.id, ind, MAIN.year)),
      };
    };
    const wait = figure("wait");
    const occupational = figure("occupational");
    const priv = figure("private");
    const inGroup = Object.values(tests).filter(Boolean).length;
    const tier = inGroup === NWR_TESTS.length ? "every" : tests.main ? "main-only" : inGroup > 0 ? "other-only" : "none";
    return {
      county_id: area.id,
      name: area.name,
      group: groupOf(wait.value, occupational.value, priv.value, MAIN.values, 0),
      wait,
      occupational,
      private: priv,
      wait_minus_finland: round1(wait.value - wait.finland),
      occupational_minus_finland: Math.round(occupational.value - occupational.finland),
      private_minus_finland: round1(priv.value - priv.finland),
      tests,
      tests_in_group: inGroup,
      tier,
    };
  });
  const robust = nwrAreas.filter((a) => a.tier === "every");
  const noWayRound = {
    year: MAIN.year,
    finland: MAIN.values,
    groups: NWR_GROUPS.map((g) => ({ ...g, areas: nwrAreas.filter((a) => a.group === g.id).map((a) => a.county_id) })),
    tests: references,
    counts: {
      areas: nwrAreas.length,
      wait_above_finland: nwrAreas.filter((a) => a.wait.value > a.wait.finland).length,
      occupational_below_finland: nwrAreas.filter((a) => a.occupational.value < a.occupational.finland).length,
      private_below_finland: nwrAreas.filter((a) => a.private.value < a.private.finland).length,
      long_few_main: nwrAreas.filter((a) => a.tests.main).length,
      long_few_every_test: robust.length,
    },
    robust_areas: robust.map((a) => a.county_id),
    areas: nwrAreas,
  };

  // ------------------------------------------------------------------ early warning
  const worseIsHigher = (ind) => indicatorOf.get(ind).direction === "higher_is_worse";
  const warnings = [];
  for (const ind of WARNING_INDICATORS) {
    const years = yearsOf(ind);
    const [first, last] = [years[0], years[years.length - 1]];
    for (const area of areas) {
      const series = years.map((y) => getValue(area.id, ind, y));
      if (!series[0] || !series[series.length - 1]) continue; // no trend without both ends
      const fin = years.map((y) => getValue("finland", ind, y).value);
      const sign = worseIsHigher(ind) ? 1 : -1;
      const change = round1(series[series.length - 1].value - series[0].value);
      const worsening = round1(change * sign);
      const kind = worsening > ABOUT_SAME_POINTS ? "worse" : worsening < -ABOUT_SAME_POINTS ? "better" : "same";
      const worseThanFinland = (v, f) => (sign > 0 ? v > f : v < f);
      const crossed = !worseThanFinland(series[0].value, fin[0]) && worseThanFinland(series[series.length - 1].value, fin[fin.length - 1]);
      const yearGrades = years.map((y) => getGrade(area.id, ind, y));
      const trendReasons = [];
      for (const g of yearGrades.slice(1))
        if (g.rule_ids.includes("recording-change"))
          trendReasons.push(`${g.year}: ${[g.reason, ...g.also].find((t) => t.startsWith("The number of"))}`);
      for (const g of yearGrades)
        for (const id of ["publisher-gap", "small-base"])
          if (g.rule_ids.includes(id)) trendReasons.push(`${g.year}: ${[g.reason, ...g.also][g.rule_ids.indexOf(id)]}`);
      if (ind === "6103") trendReasons.push("The bowel screening programme is still adding age groups, so years are not fully comparable.");
      const trendLevel = trendReasons.length ? "care" : "solid";
      const flagged = kind === "worse" || crossed;
      const flag = !flagged
        ? null
        : trendLevel === "solid"
          ? { kind: "warning", label: kind === "worse" ? "Getting worse" : "Now worse than Finland" }
          : ind === "6103" && !trendReasons.some((t) => /^\d{4}: /.test(t))
            ? { kind: "check", label: "Possible, check comparability" }
            : { kind: "check", label: "Possible, check recording" };
      warnings.push({
        county_id: area.id,
        name: area.name,
        indicator_id: ind,
        first_year: first,
        last_year: last,
        series: years.map((y, i) => ({ year: y, value: series[i]?.value ?? null, finland: fin[i] })),
        change,
        worsening,
        kind,
        crossed,
        trend_level: trendLevel,
        trend_reasons: [...new Set(trendReasons)],
        flag,
        source_id: indicatorOf.get(ind).source_id,
      });
    }
  }
  const warningSummary = {};
  for (const ind of WARNING_INDICATORS) {
    const rows = warnings.filter((w) => w.indicator_id === ind);
    warningSummary[ind] = {
      areas: rows.length,
      worse: rows.filter((r) => r.kind === "worse").length,
      crossed: rows.filter((r) => r.crossed).length,
      warning: rows.filter((r) => r.flag?.kind === "warning").length,
      check: rows.filter((r) => r.flag?.kind === "check").length,
    };
  }

  // ------------------------------------------------------------------ pathway row
  const compare = (ind, value, finland) => {
    const sign = worseIsHigher(ind) ? 1 : -1;
    const diff = round1((value - finland) * sign);
    return diff > ABOUT_SAME_POINTS ? "worse" : diff < -ABOUT_SAME_POINTS ? "better" : "same";
  };
  const item = (area, ind, year, extra = {}) => {
    const row = getValue(area, ind, year);
    const g = getGrade(area, ind, year);
    const finland = getValue("finland", ind, year).value;
    const value = row ? row.value : (g.shared_value ?? null);
    return {
      indicator_id: ind,
      year,
      value,
      shared: row ? null : g.shared_value != null ? { name: g.shared_name, confirmed_by: g.confirmed_by } : null,
      finland,
      versus: value == null || !row ? null : compare(ind, value, finland),
      grade: gradeBrief(g),
      scope: g.scope,
      source_id: indicatorOf.get(ind).source_id,
      ...extra,
    };
  };
  const latest = (ind) => yearsOf(ind).at(-1);
  const pathway = areas.map((area) => ({
    county_id: area.id,
    name: area.name,
    steps: [
      {
        id: "detection",
        published: true,
        items: ["3621", "6103", "3620"].map((ind) => {
          const it = item(area.id, ind, latest(ind));
          return { ...it, target: SCREENING_TARGET, meets_target: it.value != null ? it.value >= SCREENING_TARGET : null };
        }),
      },
      { id: "gp_recognition", published: false, items: [], data_gap_id: "route-to-diagnosis" },
      { id: "gp_access", published: true, items: [item(area.id, "6411", latest("6411"))] },
      { id: "referral", published: true, items: [item(area.id, "13", latest("13"))] },
      { id: "diagnosis", published: false, items: [], data_gap_id: "diagnostic-interval" },
      { id: "treatment", published: false, items: [], data_gap_id: "treatment-within-target" },
      { id: "outcome", published: true, items: ["3627", "3625"].map((ind) => item(area.id, ind, latest(ind))) },
    ],
  }));

  // ------------------------------------------------------------------ starter dataset
  const gapById = new Map(dataGaps.map((g) => [g.id, g]));
  const measureById = new Map(roadmap.map((m) => [m.measure_id, m]));
  const starter = {
    privacy: PRIVACY,
    cancer_groups: CANCER_GROUPS,
    bands: BANDS,
    sections: SECTIONS.map((s) => ({
      ...s,
      data_gap: gapById.has(s.data_gap_id) ? { id: s.data_gap_id, missing: gapById.get(s.data_gap_id).missing } : null,
      measure: s.measure_id && measureById.has(s.measure_id)
        ? { id: s.measure_id, title: measureById.get(s.measure_id).title, indicator: measureById.get(s.measure_id).indicator, pages: measureById.get(s.measure_id).pages }
        : null,
      fields: FIELDS.filter((f) => f.section === s.id),
    })),
    indicators: STARTER_INDICATORS,
  };

  const rules = {
    constants: {
      recording_change_above: RECORDING_CHANGE_ABOVE,
      small_base_below: SMALL_BASE_BELOW,
      about_same_points: ABOUT_SAME_POINTS,
      screening_target: SCREENING_TARGET,
    },
    levels: LEVELS,
    grade_rules: GRADE_RULES,
    scope: SCOPE,
    nwr_groups: NWR_GROUPS,
    nwr_tests: NWR_TESTS,
  };

  return { rules, grades, distribution, noWayRound, warnings, warningSummary, pathway, starter };
}

function main() {
  const snapshot = loadSnapshot();
  const out = derive(snapshot);
  const dir = join(ROOT, "data", "insights");
  mkdirSync(dir, { recursive: true });
  const write = (name, data) => {
    writeFileSync(join(dir, name), `${JSON.stringify(data, null, 2)}\n`);
    console.log(`  data/insights/${name}`);
  };
  write("rules.json", out.rules);
  write("grades.json", out.grades);
  write("no-way-round.json", out.noWayRound);
  write("early-warning.json", { summary: out.warningSummary, rows: out.warnings });
  write("pathway.json", out.pathway);
  write("starter-dataset.json", out.starter);

  console.log("\nGrade distribution (22 areas, Finland left out):");
  for (const [ind, d] of Object.entries(out.distribution)) console.log(`  ${ind.padEnd(5)} ${JSON.stringify(d)}`);
  console.log("\nNo way round:", JSON.stringify(out.noWayRound.counts));
  for (const a of out.noWayRound.areas.filter((x) => x.tests_in_group > 0))
    console.log(`  ${a.name.padEnd(22)} ${a.group.padEnd(11)} ${a.tests_in_group}/6 ${a.tier}`);
  console.log("\nEarly warning:", JSON.stringify(out.warningSummary));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
