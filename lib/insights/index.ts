// Typed access to the derived insight datasets in data/insights/ (built by
// scripts/insights/build-insights.mjs from the snapshot, checked by check-insights.mjs).
// Pure lookups: nothing here computes a new number.

import earlyWarningJson from "@/data/insights/early-warning.json";
import gradesJson from "@/data/insights/grades.json";
import noWayRoundJson from "@/data/insights/no-way-round.json";
import pathwayJson from "@/data/insights/pathway.json";
import rulesJson from "@/data/insights/rules.json";
import starterJson from "@/data/insights/starter-dataset.json";

export type GradeLevel = "solid" | "care" | "shared" | "none";

/** The confidence grade of one figure: area × indicator × year. */
export type Grade = {
  county_id: string;
  indicator_id: string;
  year: number;
  /** The published value, or null when the area has none of its own. */
  value: number | null;
  /** A wider value shown instead (HUS-wide referrals), never the area's own figure. */
  shared_value?: number;
  shared_name?: string;
  confirmed_by?: string;
  base?: number | null;
  level: GradeLevel;
  /** "Solid", "Read with care", "Read the trend with care", "Shared hospital value", "No public data". */
  label: string;
  /** One plain sentence: why this grade. */
  reason: string;
  /** Other rules that also apply, as sentences. */
  also: string[];
  rule_ids: string[];
  /** What the indicator covers (not a reliability statement). */
  scope: string;
  source_id: string;
};

export type GradeBrief = Pick<Grade, "level" | "label" | "reason">;

export type GradeLevelInfo = { level: GradeLevel; label: string; shape: string; meaning: string };
export type GradeRule = { id: string; level: GradeLevel; label: string; rule: string };

export type Rules = {
  constants: {
    recording_change_above: number;
    small_base_below: number;
    about_same_points: number;
    screening_target: number;
  };
  levels: GradeLevelInfo[];
  grade_rules: GradeRule[];
  scope: Record<string, string>;
  nwr_groups: { id: NwrGroupId; label: string; meaning: string }[];
  nwr_tests: NwrTest[];
};

export type NwrGroupId = "long-few" | "long-some" | "short-few" | "short-some";
export type NwrTest = {
  id: string;
  year: number;
  reference: "finland" | "median";
  margin: number;
  label: string;
};
export type NwrFigure = {
  indicator_id: string;
  year: number;
  value: number;
  finland: number;
  source_id: string;
  grade: GradeBrief;
};
export type NwrArea = {
  county_id: string;
  name: string;
  group: NwrGroupId;
  wait: NwrFigure;
  occupational: NwrFigure;
  private: NwrFigure;
  wait_minus_finland: number;
  occupational_minus_finland: number;
  private_minus_finland: number;
  tests: Record<string, boolean>;
  tests_in_group: number;
  /** every: in "long wait, few other routes" in every test. main-only: in it on the main view only
   * (and some other tests). other-only: not on the main view but in some other test. none. */
  tier: "every" | "main-only" | "other-only" | "none";
};
export type NoWayRound = {
  year: number;
  finland: { wait: number; occupational: number; private: number };
  groups: { id: NwrGroupId; label: string; meaning: string; areas: string[] }[];
  tests: (NwrTest & { values: { wait: number; occupational: number; private: number } })[];
  counts: {
    areas: number;
    wait_above_finland: number;
    occupational_below_finland: number;
    private_below_finland: number;
    long_few_main: number;
    long_few_every_test: number;
  };
  robust_areas: string[];
  areas: NwrArea[];
};

export type WarningRow = {
  county_id: string;
  name: string;
  indicator_id: string;
  first_year: number;
  last_year: number;
  series: { year: number; value: number | null; finland: number }[];
  /** Last minus first, in percentage points, as published (sign as the indicator moves). */
  change: number;
  /** The change turned so that positive is always worse. */
  worsening: number;
  kind: "worse" | "better" | "same";
  crossed: boolean;
  trend_level: "solid" | "care";
  trend_reasons: string[];
  flag: { kind: "warning" | "check"; label: string } | null;
  source_id: string;
};
export type EarlyWarning = {
  summary: Record<string, { areas: number; worse: number; crossed: number; warning: number; check: number }>;
  rows: WarningRow[];
};

export type PathwayItem = {
  indicator_id: string;
  year: number;
  value: number | null;
  shared: { name: string; confirmed_by: string } | null;
  finland: number;
  versus: "better" | "same" | "worse" | null;
  grade: GradeBrief;
  scope: string;
  source_id: string;
  target?: number;
  meets_target?: boolean | null;
};
export type PathwayStepId = "detection" | "gp_recognition" | "gp_access" | "referral" | "diagnosis" | "treatment" | "outcome";
export type PathwayStep = { id: PathwayStepId; published: boolean; items: PathwayItem[]; data_gap_id?: string };
export type PathwayRow = { county_id: string; name: string; steps: PathwayStep[] };

export type StarterField = { id: string; section: string; header: string; count: string };
export type StarterRef = { text: string; source_id: string };
export type StarterSection = {
  id: string;
  title: string;
  why: string;
  data_gap_id: string;
  measure_id: string | null;
  basis: StarterRef | null;
  abroad: StarterRef | null;
  data_gap: { id: string; missing: string } | null;
  measure: { id: string; title: string; indicator: string | null; pages: string } | null;
  fields: StarterField[];
};
export type StarterIndicator = {
  id: string;
  name: string;
  formula: string;
  compare_with: string;
  source_id: string;
  measure_id: string | null;
};
export type StarterDataset = {
  privacy: string[];
  cancer_groups: string[];
  bands: Record<string, string[]>;
  sections: StarterSection[];
  indicators: StarterIndicator[];
};

// The JSON is written by the build script and checked against these shapes' sources by the
// check script; the casts narrow string fields (level, group ids) the JSON import widens.
export const rules = rulesJson as Rules;
const grades = gradesJson as Grade[];
export const noWayRound = noWayRoundJson as NoWayRound;
export const earlyWarning = earlyWarningJson as EarlyWarning;
const pathways = pathwayJson as PathwayRow[];
export const starterDataset = starterJson as StarterDataset;

const gradeIndex = new Map(grades.map((g) => [`${g.county_id}|${g.indicator_id}|${g.year}`, g]));

/**
 * The confidence grade for any area × indicator × year in the snapshot. Graded indicators:
 * 6411, 13, 5033, 2371, 293, 692, 3621, 6103, 3620, 3627, 3625. Areas: the 22 and "finland".
 * Undefined only for an indicator or year outside the snapshot.
 */
export function getGrade(countyId: string, indicatorId: string, year: number): Grade | undefined {
  return gradeIndex.get(`${countyId}|${indicatorId}|${year}`);
}

export function getPathwayRow(countyId: string): PathwayRow | undefined {
  return pathways.find((row) => row.county_id === countyId);
}

export const pathwayAreas = pathways.map((row) => ({ id: row.county_id, name: row.name }));

/** Plain short names for the indicators the insights show. */
export const INDICATOR_NAME: Record<string, string> = {
  "6411": "GP wait over 7 days",
  "13": "Referrals processed within 3 days",
  "5033": "Referrals processed after 21 days",
  "2371": "Occupational-health doctor visits",
  "293": "Public primary-care doctor visits",
  "692": "People reimbursed for a private doctor visit",
  "3621": "Breast screening attendance",
  "6103": "Bowel screening attendance",
  "3620": "Cervical screening attendance",
  "3627": "Bowel cancer five-year survival",
  "3625": "Breast cancer five-year survival",
};

/** "54.7%", "2,049 per 1,000". One decimal for shares as published; survival is whole. */
export function formatValue(indicatorId: string, value: number): string {
  if (indicatorId === "2371" || indicatorId === "293") return `${Math.round(value).toLocaleString("en-GB")} per 1,000`;
  if (indicatorId === "3627" || indicatorId === "3625" || indicatorId === "5033") return `${Math.round(value)}%`;
  return `${value.toFixed(1)}%`;
}

/** "+18.2 points", "−3.0 points". */
export function formatPoints(points: number): string {
  const sign = points > 0 ? "+" : points < 0 ? "−" : "±";
  return `${sign}${Math.abs(points).toFixed(1)} points`;
}

export function groupLabel(id: NwrGroupId): string {
  return rules.nwr_groups.find((g) => g.id === id)?.label ?? id;
}

/** How many of the 22 areas have this rule among their grade reasons for an indicator and year. */
export function countAreasWithRule(indicatorId: string, year: number, ruleId: string): number {
  return grades.filter(
    (g) => g.county_id !== "finland" && g.indicator_id === indicatorId && g.year === year && g.rule_ids.includes(ruleId),
  ).length;
}

/** "about 7 in 10" when every share rounds to the same tenth, else "between 69.7% and 73.5%". */
export function inTen(shares: number[]): string {
  const tenths = new Set(shares.map((s) => Math.round(s / 10)));
  if (tenths.size === 1) return `about ${[...tenths][0]} in 10`;
  return `between ${Math.min(...shares).toFixed(1)}% and ${Math.max(...shares).toFixed(1)}% of`;
}

/**
 * Areas whose count behind an indicator moved by more than the recording threshold between two
 * years (first to last, not year on year), and how many areas could be compared.
 */
export function countBaseChange(indicatorId: string, fromYear: number, toYear: number) {
  let changed = 0;
  let compared = 0;
  for (const g of grades) {
    if (g.county_id === "finland" || g.indicator_id !== indicatorId || g.year !== toYear) continue;
    const from = getGrade(g.county_id, indicatorId, fromYear)?.base;
    if (!from || !g.base) continue;
    compared++;
    if (Math.abs(g.base / from - 1) > rules.constants.recording_change_above) changed++;
  }
  return { changed, compared };
}
