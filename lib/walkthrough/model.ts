// Everything the "How to read these numbers" page shows, read from the repo's data through the
// existing lib functions. Nothing here makes a new number: every figure below is a published
// value (data/values.json, data/gaps.json), a grade or count already in data/insights/, or a
// count of rows in the snapshot. The page and its tests read only this model.

import { counties, dataGaps, indicators } from "@/lib/data";
import { getGrade, getPathwayRow, rules, starterDataset, type GradeBrief, type GradeLevel, type PathwayStepId } from "@/lib/insights";
import { GP_WAIT_ID, formatPct, getRanking } from "@/lib/ranking";

export const YEAR = 2025;

// ---- 1. What one figure really counts -----------------------------------------------------

export type AreaFigure = {
  id: string;
  name: string;
  value: number;
  text: string;
  rank: number;
  grade: GradeBrief | null;
};

/** Every area's GP-wait share for the latest year, worst first (the order of the ranking). */
export const gpWaitAreas: AreaFigure[] = getRanking().flatMap((row) => {
  if (!row.gpWait) return [];
  const grade = getGrade(row.county.id, GP_WAIT_ID, YEAR);
  return [
    {
      id: row.county.id,
      name: row.county.name,
      value: row.gpWait.value,
      text: formatPct(row.gpWait.value),
      rank: row.rank,
      grade: grade ? { level: grade.level, label: grade.label, reason: grade.reason } : null,
    },
  ];
});

const gpIndicator = indicators.find((indicator) => indicator.indicator_id === GP_WAIT_ID);
export const gpDefinition = {
  officialName: gpIndicator?.name ?? "",
  limitation: gpIndicator?.limitation ?? "",
};

// ---- 2. How much to trust a figure --------------------------------------------------------

export const gradeLevels = rules.levels;
export const gradeRules = rules.grade_rules;

/** How the 22 areas' GP-wait figures for the latest year are graded. */
export const gpGradeCounts = (() => {
  const counts: Record<GradeLevel, number> = { solid: 0, care: 0, shared: 0, none: 0 };
  for (const county of counties) {
    const grade = getGrade(county.id, GP_WAIT_ID, YEAR);
    if (grade) counts[grade.level] += 1;
  }
  return { ...counts, areas: counts.solid + counts.care + counts.shared + counts.none };
})();

/** The example of a recording change: the published share and the count behind it, two years. */
export const RECORDING_EXAMPLE_ID = "ostrobothnia";

function buildRecordingExample() {
  const county = counties.find((c) => c.id === RECORDING_EXAMPLE_ID);
  const before = getGrade(RECORDING_EXAMPLE_ID, GP_WAIT_ID, YEAR - 1);
  const after = getGrade(RECORDING_EXAMPLE_ID, GP_WAIT_ID, YEAR);
  if (!county || !before || !after || before.value === null || after.value === null || !before.base || !after.base) {
    return null;
  }
  return {
    name: county.name,
    before: { year: YEAR - 1, value: before.value, text: formatPct(before.value), base: before.base },
    after: { year: YEAR, value: after.value, text: formatPct(after.value), base: after.base },
    grade: { level: after.level, label: after.label, reason: after.reason } satisfies GradeBrief,
  };
}

export const recordingExample = buildRecordingExample();

// ---- 3. What Finland does not publish -----------------------------------------------------

const STEP_TITLE: Record<PathwayStepId, string> = {
  detection: "Screening",
  gp_recognition: "The GP recognises possible cancer",
  gp_access: "Getting to a GP",
  referral: "Referral to hospital",
  diagnosis: "Diagnosis",
  treatment: "Treatment starts",
  outcome: "Survival",
};

const STEP_PUBLISHED_AS: Partial<Record<PathwayStepId, string>> = {
  detection: "Screening attendance",
  gp_access: "GP visits waiting over 7 days",
  referral: "Referrals processed in 3 days, by hospital",
  outcome: "Breast and bowel cancer survival",
};

export type PathwaySlot = {
  id: PathwayStepId;
  number: number;
  title: string;
  published: boolean;
  /** For a published step: what is published. For a gap: what is missing. */
  text: string;
  /** For a gap: what exists instead. */
  today: string | null;
  sourceId: string | null;
};

function buildPathway(): PathwaySlot[] {
  // Every area has the same steps published (checked in tests): read one row.
  const row = getPathwayRow(gpWaitAreas[0]?.id ?? "");
  if (!row) return [];
  return row.steps.map((step, index) => {
    const gap = step.data_gap_id ? dataGaps.find((g) => g.id === step.data_gap_id) : undefined;
    return {
      id: step.id,
      number: index + 1,
      title: STEP_TITLE[step.id],
      published: step.published,
      text: step.published ? (STEP_PUBLISHED_AS[step.id] ?? "") : (gap?.missing ?? "Not published by area."),
      today: step.published ? null : (gap?.today ?? null),
      sourceId: step.published ? (step.items[0]?.source_id ?? null) : (gap?.source_id ?? null),
    };
  });
}

export const pathway = buildPathway();
export const pathwayGapCount = pathway.filter((slot) => !slot.published).length;

// ---- 4. What a county can do --------------------------------------------------

export const starter = {
  sections: starterDataset.sections.map((section) => ({
    id: section.id,
    title: section.title,
    why: section.why,
    fields: section.fields.map((field) => field.header),
  })),
  fieldCount: starterDataset.sections.reduce((n, section) => n + section.fields.length, 0),
  indicatorCount: starterDataset.indicators.length,
  privacy: starterDataset.privacy,
};
