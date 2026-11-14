// The county action plan as plain data: one model that the page, the Word file and the Excel
// file all render, so the three can never disagree.
//
// Everything here is read from the snapshot (data/) or is arithmetic on it (lib/plan.ts). No
// number is invented: where nothing is published (a county cost, a step without a figure) the
// model says so in words and leaves a field for the area's own entry.

import { STAGE_LABELS, bottleneckLede, getBottleneck, pickActions } from "@/lib/act";
import { plainTitle } from "@/lib/action-title";
import {
  getCounty,
  getDataGaps,
  getMeasure,
  getMeasureForAction,
  getSource,
  getValue,
  indicators,
  LATEST_YEAR,
  STAGES,
  type County,
  type DataGap,
  type GapStatus,
  type RoadmapMeasure,
  type Source,
  type Stage,
} from "@/lib/data";
import { bestForStage, betterFor, getMainReason } from "@/lib/main-reason";
import {
  cleanField,
  parseTargetLevel,
  parseTargetYear,
  targetPath,
  type TargetLevel,
  type TargetPath,
} from "@/lib/plan";
import { CITY_UNITS_ONLY_REFERRAL, FIRST_YEAR, formatPct, getStageGap, STATUS_LABEL } from "@/lib/ranking";
import { getRecordingCaveat } from "@/lib/recording";
import { diff1, formatAmount } from "@/lib/what-if";

export const HUS_FULL = "HUS (the Helsinki University Hospital group)";
export const STRATEGY_SOURCE_ID = "stm-cancer-strategy-2026-2035";

/** How many recommended actions a plan can hold (lib/act MAX_RECOMMENDED). */
const MAX_ACTIONS = 3;

/** What the form on the plan page sends: the target, the year and the fields typed in. */
export type PlanInput = {
  target: TargetLevel;
  year: number;
  /** Per action, in order: the named person, the review date and the area's own cost estimate. */
  person: string[];
  review: string[];
  cost: string[];
  approvedBy: string;
  decisionDate: string;
};

/** What each step's share counts, in the SPEC's wording: visits and referrals, never people. */
const MEASURE: Partial<Record<Stage, { name: string; direction: string; short: string }>> = {
  gp_access: {
    name: "Non-urgent GP visits waiting over 7 days, % of visits",
    direction: "lower is better",
    short: "share of non-urgent GP visits waiting over 7 days",
  },
  referral: {
    name: "Referrals to specialist care processed within 3 days, % of referrals",
    direction: "higher is better",
    short: "share of referrals processed within 3 days",
  },
};

export type PlanStep = {
  stage: Stage;
  number: number;
  label: string;
  /** What the figure counts, or null for a step nobody measures. */
  measure: string | null;
  direction: string | null;
  indicatorId: string | null;
  sourceId: string | null;
  year: number;
  value: number | null;
  finland: number | null;
  status: GapStatus;
  statusLabel: string;
  /** One line where the step needs a word of explanation (no data, a shared value, city units). */
  note: string | null;
  first: { year: number; value: number } | null;
  /** "27.4 points worse than in 2023", "about the same as in 2023", or null. */
  changeText: string | null;
  /** Set when the share rose and the recorded visits behind it changed a lot. */
  caveat: string | null;
  /** Null: no target for this step (no figure of its own). */
  target: { level: number; levelName: string; path: TargetPath } | null;
};

export type PlanAction = {
  number: number;
  id: string;
  title: string;
  step: string;
  stage: Stage;
  detail: string;
  role: string;
  firstStep: string;
  /** The roadmap measure the action belongs to, if the roadmap names it or its model. */
  measure: RoadmapMeasure | null;
  /** The published figure that will show whether it worked, with today's value and the target. */
  success: string;
  successSourceId: string | null;
  triedWhere: string;
  triedResult: string;
  limitations: string;
  sourceId: string;
  person: string;
  review: string;
  cost: string;
};

export type Plan = {
  county: County;
  /** ISO date the plan was drawn up (the day it is opened). */
  date: string;
  input: PlanInput;
  /** The query string that reproduces this plan (target, year and fields), without "?". */
  query: string;
  anyRed: boolean;
  lede: string;
  reason: string;
  reasonCaveat: string | null;
  steps: PlanStep[];
  targetLabel: string;
  actions: PlanAction[];
  dataGaps: (DataGap & { measure: RoadmapMeasure | null; stepLabel: string })[];
  limits: string[];
  sources: Source[];
};

const GAP_STEP_LABEL: Record<DataGap["step"], string> = {
  ...STAGE_LABELS,
  diagnosis: "Diagnosis",
  treatment: "Start of treatment",
};

/** Read the plan's form values from a query string. Unknown or missing values take the default. */
export function readPlanInput(params: URLSearchParams, anyRed: boolean): PlanInput {
  const list = (name: string) => Array.from({ length: MAX_ACTIONS }, (_, i) => cleanField(params.get(`${name}${i + 1}`)));
  return {
    // An area with a step worse than Finland aims for Finland's level first; one without, for the best area's.
    target: parseTargetLevel(params.get("target"), anyRed ? "finland" : "best"),
    year: parseTargetYear(params.get("year")),
    person: list("person"),
    review: list("review"),
    cost: list("cost"),
    approvedBy: cleanField(params.get("approved")),
    decisionDate: cleanField(params.get("decided")),
  };
}

function planQuery(input: PlanInput): string {
  const params = new URLSearchParams({ target: input.target, year: String(input.year) });
  input.person.forEach((value, i) => value && params.set(`person${i + 1}`, value));
  input.review.forEach((value, i) => value && params.set(`review${i + 1}`, value));
  input.cost.forEach((value, i) => value && params.set(`cost${i + 1}`, value));
  if (input.approvedBy) params.set("approved", input.approvedBy);
  if (input.decisionDate) params.set("decided", input.decisionDate);
  return params.toString();
}

function buildStep(countyId: string, stage: Stage, input: PlanInput): PlanStep {
  const number = STAGES.indexOf(stage) + 1;
  const label = STAGE_LABELS[stage];
  const gap = getStageGap(countyId, stage);
  const measure = MEASURE[stage];
  if (!gap || !measure) {
    return {
      stage, number, label, measure: null, direction: null, indicatorId: null, sourceId: null,
      year: LATEST_YEAR, value: null, finland: null, status: "no_data", statusLabel: STATUS_LABEL.no_data,
      note: "No public figure exists for this step anywhere in Finland.",
      first: null, changeText: null, caveat: null, target: null,
    };
  }

  const better = betterFor(gap.indicator_id);
  const base = {
    stage, number, label, measure: measure.name, direction: measure.direction,
    indicatorId: gap.indicator_id, sourceId: gap.source_id, year: gap.year,
    finland: gap.national_value, status: gap.status,
  };
  if (gap.value === null) {
    const shared = gap.shared;
    return {
      ...base, value: null, statusLabel: shared ? "No county figure" : STATUS_LABEL.no_data,
      note: shared
        ? `No figure for this area alone. ${shared.name === "HUS" ? HUS_FULL : shared.name}, which handles its hospital referrals, processed ${formatPct(shared.value)} within 3 days. That value covers several areas, so it sets no target here.`
        : "Sotkanet publishes no figure for this area.",
      first: null, changeText: null, caveat: null, target: null,
    };
  }

  const firstValue = getValue(countyId, gap.indicator_id, FIRST_YEAR);
  let changeText: string | null = null;
  let rose = false;
  if (firstValue) {
    const worseBy = better === "lower" ? diff1(gap.value, firstValue.value) : diff1(firstValue.value, gap.value);
    if (Math.abs(worseBy) < 1) changeText = `About the same as in ${FIRST_YEAR} (${formatPct(firstValue.value)})`;
    else {
      rose = worseBy > 0;
      changeText = `${formatAmount(Math.abs(worseBy))} points ${rose ? "worse" : "better"} than in ${FIRST_YEAR} (${formatPct(firstValue.value)})`;
    }
  }

  const cityOnly = stage === "referral" && CITY_UNITS_ONLY_REFERRAL.has(countyId);
  let target: PlanStep["target"] = null;
  if (!cityOnly) {
    const best = bestForStage(stage);
    const useBest = input.target === "best" && best !== null;
    const level = useBest ? best.value : gap.national_value;
    const levelName = useBest
      ? best.id === countyId
        ? "its own level, the best published"
        : `the best area's level (${best.name}, ${formatPct(best.value)})`
      : `Finland's level (${formatPct(gap.national_value)})`;
    target = {
      level,
      levelName,
      path: targetPath({ value: gap.value, target: level, better, fromYear: gap.year, toYear: input.year }),
    };
  }

  return {
    ...base,
    value: gap.value,
    statusLabel: STATUS_LABEL[gap.status],
    note: cityOnly
      ? "This figure covers the city's own specialist units only. Most Helsinki referrals go to HUS, so it sets no target here."
      : null,
    first: firstValue ? { year: FIRST_YEAR, value: firstValue.value } : null,
    changeText,
    caveat: rose && stage === "gp_access" ? (getRecordingCaveat(countyId)?.text ?? null) : null,
    target,
  };
}

/** The sentence that says which published figure will show whether an action worked. */
function successLine(step: PlanStep | undefined, year: number): string {
  if (!step || step.value === null || !step.indicatorId) {
    return "No published figure follows this step for the area yet. Use the area's own records (see what to start recording).";
  }
  const what = MEASURE[step.stage]?.short ?? "share";
  const now = `Sotkanet ${step.indicatorId}, ${what}: ${formatPct(step.value)} in ${step.year}`;
  if (!step.target) return `${now}. Follow it yearly.`;
  return step.target.path.kind === "close"
    ? `${now}. Target: ${formatPct(step.target.level)} by the end of ${year}.`
    : `${now}. Already at the target level: hold it.`;
}

/**
 * The plan for one area, or null for an unknown id. `params` are the plan page's query
 * parameters (target, year and the typed fields); anything missing takes its default.
 */
export function buildPlan(countyId: string, params: URLSearchParams, today: Date = new Date()): Plan | null {
  const county = getCounty(countyId);
  if (!county) return null;

  const bottleneck = getBottleneck(county.id);
  const input = readPlanInput(params, bottleneck.anyRed);
  const steps = STAGES.map((stage) => buildStep(county.id, stage, input));
  const reason = getMainReason(county.id);

  const actions: PlanAction[] = pickActions(bottleneck).map((action, i) => {
    const step = steps.find((candidate) => candidate.stage === action.stage);
    return {
      number: i + 1,
      id: action.id,
      title: plainTitle(action.action),
      step: STAGE_LABELS[action.stage],
      stage: action.stage,
      detail: action.detail,
      role: action.who_implements,
      firstStep: action.first_step,
      measure: getMeasureForAction(action.id) ?? null,
      success: successLine(step, input.year),
      successSourceId: step?.sourceId ?? null,
      triedWhere: action.precedent,
      triedResult: action.effect_text,
      limitations: action.limitations,
      sourceId: action.source_id,
      person: input.person[i] ?? "",
      review: input.review[i] ?? "",
      cost: input.cost[i] ?? "",
    };
  });

  const gaps = getDataGaps(county.id).map((gap) => ({
    ...gap,
    measure: gap.measure_id ? (getMeasure(gap.measure_id) ?? null) : null,
    stepLabel: GAP_STEP_LABEL[gap.step],
  }));

  const gpWait = indicators.find((indicator) => indicator.indicator_id === "6411");
  const referral = indicators.find((indicator) => indicator.indicator_id === "13");
  const finlandGp = steps.find((step) => step.stage === "gp_access")?.finland ?? null;
  const limits = [
    gpWait ? `GP wait (Sotkanet 6411): ${gpWait.limitation}` : null,
    referral ? `Referrals (Sotkanet 13): ${referral.limitation.split(" Counted per hospital organisation")[0]}` : null,
    "Sotkanet 6411 is a share of recorded visits. Where the number of recorded visits changed a lot between 2023 and 2025, part of a change in the share may be how visits are recorded, not how long visits waited.",
    finlandGp !== null
      ? `The status words compare the area with Finland's level in ${LATEST_YEAR}, not with a clinical standard. Finland's level is itself a delay: ${formatPct(finlandGp)} of non-urgent GP visits waited over 7 days.`
      : null,
    "The target path is arithmetic on published shares: an even pace from the latest figure to the chosen level. It is not a forecast and assumes no effect of any action.",
    "Results listed as tried elsewhere come from other countries or settings and are measured in their own units. They are not predictions for this area.",
    "No county-level cost figure is published for these actions. The cost fields are for the area's own estimate. Euro figures quoted from the national roadmap are national funding needs.",
    "Decision support for service planning. Not medical advice. No patient data.",
  ].filter((line): line is string => line !== null);

  // Every source a figure or a statement in the plan comes from, each once, in order of use.
  const sourceIds = [
    ...steps.flatMap((step) => (step.sourceId ? [step.sourceId] : [])),
    ...actions.flatMap((action) => [action.sourceId, ...(action.measure ? [action.measure.source_id] : [])]),
    ...gaps.flatMap((gap) => [gap.source_id, ...(gap.measure ? [gap.measure.source_id] : [])]),
    STRATEGY_SOURCE_ID,
  ];
  const sources = [...new Set(sourceIds)].flatMap((id) => {
    const source = getSource(id);
    return source ? [source] : [];
  });

  const targetLabel =
    input.target === "best" ? "The best area's level on each step" : "Finland's level on each step";

  return {
    county,
    date: today.toISOString().slice(0, 10),
    input,
    query: planQuery(input),
    anyRed: bottleneck.anyRed,
    lede: bottleneckLede(bottleneck),
    reason: reason.text,
    reasonCaveat: reason.caveat?.text ?? null,
    steps,
    targetLabel,
    actions,
    dataGaps: gaps,
    limits,
    sources,
  };
}
