// Everything the "How to read these numbers" page shows, read from the repo's data through the
// existing lib functions. Nothing here makes a new number: every figure below is a published
// value (data/values.json, data/gaps.json), a grade or count already in data/insights/, or a
// count of rows in the snapshot. The page and its tests read only this model.

import { counties, dataGaps, getSource, indicators, sources, type Source } from "@/lib/data";
import { getGrade, getPathwayRow, rules, starterDataset, type GradeBrief, type GradeLevel, type PathwayStepId } from "@/lib/insights";
import { GP_WAIT_ID, REFERRAL_ID, formatPct, getNationalValue, getRanking, getStageGap } from "@/lib/ranking";

export const YEAR = 2025;

// ---- 1. Where the numbers come from -------------------------------------------------------

export type SourceGroup = {
  id: string;
  /** Who publishes, in plain words. */
  who: string;
  /** What we take from them. */
  what: string;
  sources: Pick<Source, "source_id" | "name" | "publisher" | "url" | "retrieved" | "data_updated">[];
};

const GROUPS: { id: string; who: string; what: string; ids: string[] }[] = [
  {
    id: "thl",
    who: "THL, the Finnish Institute for Health and Welfare, on its Sotkanet service",
    what: "Waits for a GP (a health-centre doctor), referral speed and doctor visits.",
    ids: ["sotkanet-6411", "sotkanet-13", "sotkanet-5033", "sotkanet-293", "sotkanet-2371"],
  },
  {
    id: "registry",
    who: "The Finnish Cancer Registry, also on Sotkanet",
    what: "Cancer screening attendance, and survival for breast and bowel cancer.",
    ids: ["sotkanet-3621", "sotkanet-3620", "sotkanet-6103", "sotkanet-3625", "sotkanet-3627"],
  },
  {
    id: "kela",
    who: "Kela, the Social Insurance Institution, also on Sotkanet",
    what: "How many people claimed back part of a private doctor visit.",
    ids: ["sotkanet-692"],
  },
  {
    id: "hus",
    who: "HUS, the Helsinki University Hospital group",
    what: "Its own report on referrals and how fast it processed them.",
    ids: ["hus-referrals-2024"],
  },
];

function pickSource(id: string): SourceGroup["sources"][number] {
  const source = getSource(id);
  if (!source) throw new Error(`walkthrough: source ${id} is missing from data/sources.json`);
  const { source_id, name, publisher, url, retrieved, data_updated } = source;
  return { source_id, name, publisher, url, retrieved, data_updated };
}

export const sourceGroups: SourceGroup[] = GROUPS.map((group) => ({
  id: group.id,
  who: group.who,
  what: group.what,
  sources: group.ids.map(pickSource),
}));

/** Studies and national documents: the evidence behind the recommended actions. */
export const studyCount = sources.filter((source) => source.kind === "evidence").length;
export const sourceCount = sources.length;
/** The day our copy of the data was taken (the same for every source in the snapshot). */
export const retrieved = sources[0]?.retrieved ?? "";

// ---- 2. What one figure really counts -----------------------------------------------------

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

// ---- 3. Why some areas share a number -----------------------------------------------------

export type SharedReferral = {
  areas: { id: string; name: string }[];
  hospital: string;
  value: number;
  text: string;
  confirmedBy: string | null;
  finland: string | null;
  gap: { missing: string; today: string; couldPublish: string } | null;
};

function buildShared(): SharedReferral | null {
  const rows = counties.flatMap((county) => {
    const gap = getStageGap(county.id, "referral");
    return gap?.shared ? [{ county, shared: gap.shared }] : [];
  });
  const first = rows[0];
  if (!first) return null;
  const finland = getNationalValue(REFERRAL_ID, YEAR);
  const gap = dataGaps.find((row) => row.id === "hus-area-referrals");
  return {
    areas: rows.map(({ county }) => ({ id: county.id, name: county.name })),
    hospital: first.shared.name,
    value: first.shared.value,
    text: formatPct(first.shared.value),
    confirmedBy: first.shared.confirmed_by ?? null,
    finland: finland ? formatPct(finland.value) : null,
    gap: gap ? { missing: gap.missing, today: gap.today, couldPublish: gap.could_publish } : null,
  };
}

export const sharedReferral = buildShared();

// ---- 4. How much to trust a figure --------------------------------------------------------

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

// ---- 5. What Finland does not publish -----------------------------------------------------

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

/** The other unpublished figures in data/data-gaps.json that sit on a published step. */
export const suspectedCancerGap = dataGaps.find((gap) => gap.id === "suspected-cancer-gp-wait") ?? null;

// ---- 7. What a county can do from Monday --------------------------------------------------

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
