// The guided briefing for one area as plain data: one model that the six on-screen steps and
// the printed document both render, so the two can never disagree.
//
// Everything here is read from the snapshot through the existing lib/ functions, or is the
// same arithmetic on published shares the rest of the app uses (lib/plan targetPath). No
// number is invented and no effect of any action is assumed:
//  - Sotkanet 6411 counts non-urgent GP VISITS, never people, and covers all such visits, not
//    only cancer-related ones. Every sentence built here says "visits".
//  - A step with no public figure is reported as a finding, in words, never skipped.
//  - "What it could change" carries what a precedent reported where it was tried, in its own
//    unit, plus the published figure the area would watch. No effect size in data/evidence.json
//    is in the unit of 6411 or 13 (see docs/audit/real-user-audit.md), so there is no estimate.

import { bottleneckLede, getBottleneck, pickActions, STAGE_LABELS } from "@/lib/act";
import { plainTitle } from "@/lib/action-title";
import {
  getCounty,
  getMeasureForAction,
  getSource,
  getValue,
  indicators,
  LATEST_YEAR,
  STAGES,
  type County,
  type GapStatus,
  type RoadmapMeasure,
  type Source,
  type Stage,
} from "@/lib/data";
import { bestForStage, betterFor, getMainReason } from "@/lib/main-reason";
import { DEFAULT_TARGET_YEAR, TARGET_YEARS, targetPath, type TargetLevel } from "@/lib/plan";
import {
  CITY_UNITS_ONLY_REFERRAL,
  FIRST_YEAR,
  formatPct,
  getNationalValue,
  getRanking,
  getStageGap,
  GP_WAIT_ID,
  STATUS_LABEL,
  statusLabel,
  YEARS,
} from "@/lib/ranking";
import { describeVisitChange, getRecordedVisitChange, isRecordingSensitiveChange } from "@/lib/recording";
import { diff1, type Better } from "@/lib/what-if";

/** The hospital group's name, spelled out where it is first used. */
const HUS_FULL = "HUS (the Helsinki University Hospital group)";

/** A change since FIRST_YEAR smaller than this many points reads as "about the same" (as lib/main-reason). */
const FLAT_BELOW_POINTS = 1;

export type AreaShare = { id: string; name: string; value: number };

/** Step 1: the one figure every area has, the GP wait, against Finland and the other areas. */
export type BriefingStand = {
  value: number;
  finland: number;
  year: number;
  sourceId: string;
  status: GapStatus;
  /** The sentence that follows the figure: "of non-urgent GP visits in X come more than …". */
  statement: string;
  /** "30.7 percentage points above Finland overall". */
  gapText: string;
  /** 1 is the highest share of late visits. */
  rank: number;
  ranked: number;
  /** "The highest share of Finland's 22 areas." */
  rankText: string;
  /** Every ranked area, highest share first: the rank line and the comparison read this. */
  areas: AreaShare[];
  /** The area with the lowest share, offered first in the comparison. */
  best: AreaShare;
  /** What the figure counts and what it does not. Always shown with the figure. */
  limitation: string;
};

export type BriefingStage = {
  stage: Stage;
  number: number;
  label: string;
  status: GapStatus;
  /** The status in words; a step with only a hospital-group value says "No county figure". */
  statusLabel: string;
  /** A limit on the status that must be read with it, shown on the step itself, or null. */
  note: string | null;
  /** True for a measured step that is slower than Finland overall: where the delay is. */
  isBreak: boolean;
  /** The area's own published share, or null. */
  value: number | null;
  finland: number | null;
  year: number;
  /** The source of every figure in `figures`, or null for a step nobody measures. */
  sourceId: string | null;
  /** The step's figures in one or two plain sentences, or the finding when there are none. */
  figures: string;
  /** Set when the step has no figure of the area's own: stated on screen as a finding. */
  finding: string | null;
  /** What the step's words mean, for a reader who does not use them daily. */
  explains: string;
};

/** Step 2: the three steps, with the one(s) that are slower than Finland overall marked. */
export type BriefingPathway = {
  lede: string;
  anyRed: boolean;
  stages: BriefingStage[];
};

/** Step 3: the share of the step in focus as "about N of every 100", year by year. */
export type BriefingMeaning = {
  stage: Stage;
  stageLabel: string;
  indicatorId: string;
  sourceId: string;
  better: Better;
  /** "non-urgent GP visits" / "referrals to specialist care". */
  things: string;
  /** "came more than a week after people asked" / "were processed within 3 days". */
  did: string;
  /** One entry per year that has the area's value, oldest first. */
  years: { year: number; value: number; finland: number | null }[];
  /** "27.4 percentage points worse than in 2023 (58.0%)", or null with a single year. */
  changeText: string | null;
  /** Set when the share moved and the recorded visits behind it changed a lot. Shown with the change. */
  caveat: string | null;
  /** Set when no measured step is slower than Finland overall: why this figure is still shown. */
  noRedNote: string | null;
  limitation: string;
};

export type BriefingTargetPace = { year: number; points: number; perYear: number; years: number };

/** The published figure that would show whether an action worked here, and the pace to a level. */
export type BriefingWatch = {
  stage: Stage;
  indicatorId: string;
  sourceId: string;
  year: number;
  /** "Share of non-urgent GP visits that wait over 7 days". */
  name: string;
  /** "lower is better". */
  direction: string;
  value: number;
  finland: number;
  /** Which published level the pace aims for, or null when the area holds the best level. */
  target: {
    level: TargetLevel;
    /** "Finland overall (54.7%)". */
    levelName: string;
    value: number;
    /** One pace per target year on offer (lib/plan TARGET_YEARS). */
    paces: BriefingTargetPace[];
  } | null;
};

export type BriefingAction = {
  number: number;
  id: string;
  title: string;
  stage: Stage;
  stageLabel: string;
  detail: string;
  owner: string;
  firstStep: string;
  /** Where it was tried. */
  precedent: string;
  /** What was reported there, in the study's own unit. Never a forecast for this area. */
  result: string;
  limitations: string;
  sourceId: string;
  /** The national roadmap measure the action belongs to, with its funding route, if any. */
  measure: RoadmapMeasure | null;
  watch: BriefingWatch | null;
};

export type Briefing = {
  county: County;
  year: number;
  anyRed: boolean;
  stand: BriefingStand;
  pathway: BriefingPathway;
  meaning: BriefingMeaning | null;
  actions: BriefingAction[];
  targetYears: readonly number[];
  defaultTargetYear: number;
  /** The action plan as a file: add format=docx|xlsx, actions, target and year as a query. */
  planFilePath: string;
  /** The actions page, where the same plan downloads with the recommended actions. */
  actPath: string;
  /** Every source a figure or statement in the briefing comes from, each once, in order of use. */
  sources: Source[];
};

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** The gap to Finland in words, from the two one-decimal figures shown on screen. */
function gapWords(value: number, finland: number): string {
  const diff = diff1(value, finland);
  if (diff === 0) return "Level with Finland";
  return `${Math.abs(diff).toFixed(1)} percentage points ${diff > 0 ? "above" : "below"} Finland overall`;
}

const GP_LIMITATION =
  "Visits, not people; all non-urgent GP visits, not only cancer-related ones. A GP is a health-centre doctor.";

function buildStand(county: County): BriefingStand | null {
  const ranking = getRanking();
  const row = ranking.find((candidate) => candidate.county.id === county.id);
  const finland = getNationalValue(GP_WAIT_ID);
  if (!row || !finland) return null;

  const areas = ranking.map(({ county: area, gpWait }) => ({ id: area.id, name: area.name, value: gpWait.value }));
  const ranked = areas.length;
  const rankText =
    row.rank === 1
      ? `The highest share of Finland's ${ranked} areas.`
      : row.rank === ranked
        ? `The lowest share of Finland's ${ranked} areas.`
        : row.rank <= ranked / 2
          ? `The ${ordinal(row.rank)} highest share of Finland's ${ranked} areas.`
          : `The ${ordinal(ranked - row.rank + 1)} lowest share of Finland's ${ranked} areas.`;

  return {
    value: row.gpWait.value,
    finland: finland.value,
    year: row.gpWait.year,
    sourceId: row.gpWait.source_id,
    status: row.gpStatus,
    statement: `of non-urgent GP visits in ${county.name} come more than a week after people ask.`,
    gapText: gapWords(row.gpWait.value, finland.value),
    rank: row.rank,
    ranked,
    rankText,
    areas,
    best: areas[areas.length - 1],
    limitation: GP_LIMITATION,
  };
}

const EXPLAINS: Record<Stage, string> = {
  gp_access:
    "How long a non-urgent visit to a GP (a health-centre doctor) waits, counted from the day the need for care was assessed.",
  gp_recognition:
    "Whether the GP recognises a symptom that could be cancer and acts on it. This is the step between getting in and being referred.",
  referral:
    "A referral is the GP's request for a hospital specialist to see the patient. \"Processed\" means the hospital has started assessing it, not that the patient has been seen.",
};

function buildStage(county: County, stage: Stage, breaks: Set<Stage>): BriefingStage {
  const number = STAGES.indexOf(stage) + 1;
  const label = STAGE_LABELS[stage];
  const gap = stage === "gp_recognition" ? undefined : getStageGap(county.id, stage);
  const base = { stage, number, label, year: LATEST_YEAR, explains: EXPLAINS[stage], note: null };

  if (!gap) {
    const finding =
      "No public data, in any area of Finland. Nobody publishes whether GPs recognise cancer warning signs, so this step cannot be judged anywhere.";
    return {
      ...base, status: "no_data", statusLabel: STATUS_LABEL.no_data, isBreak: false,
      value: null, finland: null, sourceId: null, figures: finding, finding,
    };
  }

  if (gap.value === null) {
    const shared = gap.shared;
    const finding = shared
      ? `No figure for ${county.name} alone. ${shared.name === "HUS" ? HUS_FULL : shared.name}, which handles its hospital referrals, processed ${formatPct(shared.value)} of referrals within 3 days in ${gap.year} (Finland overall: ${formatPct(gap.national_value)}). That value covers several areas, so it is not ${county.name}'s figure.`
      : `No public data: Sotkanet publishes no ${gap.year} figure for ${county.name} on this step.`;
    return {
      ...base, year: gap.year, status: gap.status, statusLabel: shared ? "No county figure" : STATUS_LABEL.no_data,
      isBreak: false, value: null, finland: gap.national_value, sourceId: gap.source_id, figures: finding, finding,
    };
  }

  const own = formatPct(gap.value);
  const national = formatPct(gap.national_value);
  let figures =
    stage === "gp_access"
      ? `${own} of non-urgent GP visits waited more than 7 days in ${gap.year}. Finland: ${national}. Lower is better.`
      : `${own} of referrals to specialist care were processed within 3 days in ${gap.year}. Finland: ${national}. Higher is faster.`;
  const cityOnly = stage === "referral" && CITY_UNITS_ONLY_REFERRAL.has(county.id);
  if (cityOnly) {
    figures += ` This figure covers only the city's own specialist units; most ${county.name} referrals go to ${HUS_FULL}.`;
  }
  return {
    ...base, year: gap.year, status: gap.status, statusLabel: statusLabel(gap.status, gap.stage),
    note: cityOnly ? "The city's own units only. Most referrals go to the HUS hospital group." : null,
    isBreak: gap.status === "red" && breaks.has(stage),
    value: gap.value, finland: gap.national_value, sourceId: gap.source_id, figures, finding: null,
  };
}

const THINGS: Partial<Record<Stage, { things: string; did: string }>> = {
  gp_access: { things: "non-urgent GP visits", did: "came more than a week after people asked" },
  referral: { things: "referrals to specialist care", did: "were processed within 3 days" },
};

function buildMeaning(county: County, anyRed: boolean): BriefingMeaning | null {
  const reason = getMainReason(county.id);
  const gap = reason.gap;
  const words = gap && THINGS[gap.stage];
  if (!gap || gap.value === null || !words) return null;

  const better = betterFor(gap.indicator_id);
  const years = YEARS.flatMap((year) => {
    const own = getValue(county.id, gap.indicator_id, year);
    return own ? [{ year, value: own.value, finland: getNationalValue(gap.indicator_id, year)?.value ?? null }] : [];
  });

  const first = getValue(county.id, gap.indicator_id, FIRST_YEAR);
  let changeText: string | null = null;
  let moved = false;
  if (first && gap.year !== FIRST_YEAR) {
    const worseBy = better === "lower" ? diff1(gap.value, first.value) : diff1(first.value, gap.value);
    const was = `${FIRST_YEAR}: ${formatPct(first.value)}`;
    if (Math.abs(worseBy) < FLAT_BELOW_POINTS) changeText = `About the same (${was}).`;
    else {
      moved = true;
      changeText = `${Math.abs(worseBy).toFixed(1)} percentage points ${worseBy > 0 ? "worse" : "better"} (${was}).`;
    }
  }

  // The recording caveat goes with any stated move of the GP wait, up or down: a share that
  // improved while the recorded visits changed a lot is no more certain than one that worsened.
  let caveat: string | null = null;
  if (moved && gap.indicator_id === GP_WAIT_ID) {
    const visits = getRecordedVisitChange(county.id);
    if (visits !== null && isRecordingSensitiveChange(visits)) {
      caveat = `Read with care: recorded visits ${describeVisitChange(visits)} over the same years, so part of the change may be how visits are recorded.`;
    }
  }

  const indicator = indicators.find((candidate) => candidate.indicator_id === gap.indicator_id);
  return {
    stage: gap.stage,
    stageLabel: STAGE_LABELS[gap.stage],
    indicatorId: gap.indicator_id,
    sourceId: gap.source_id,
    better,
    ...words,
    years,
    changeText,
    caveat,
    noRedNote: anyRed
      ? null
      : `No measured step is slower than Finland overall. This is ${gap.stage === "gp_access" ? "the first step, getting to a GP" : "the last step, the GP to specialist referral"}.`,
    limitation:
      gap.stage === "gp_access"
        ? "Visits, not people; all non-urgent GP visits, not only cancer-related ones. Rounded to whole visits."
        : `${indicator?.limitation.split(" Counted per hospital organisation")[0] ?? "Not cancer-specific."} Rounded to whole referrals.`,
  };
}

const WATCH: Partial<Record<Stage, { name: string; direction: string }>> = {
  gp_access: { name: "Share of non-urgent GP visits that wait more than 7 days", direction: "lower is better" },
  referral: { name: "Share of referrals to specialist care processed within 3 days", direction: "higher is better" },
};

function buildWatch(county: County, stage: Stage): BriefingWatch | null {
  const gap = getStageGap(county.id, stage);
  const words = WATCH[stage];
  if (!gap || gap.value === null || !words) return null;
  const { value } = gap;
  const better = betterFor(gap.indicator_id);

  // An area slower than Finland overall aims for that level first; one at or better, for the best
  // area's level. A referral figure that covers only the city's own units sets no target.
  let target: BriefingWatch["target"] = null;
  if (!(stage === "referral" && CITY_UNITS_ONLY_REFERRAL.has(county.id))) {
    const best = bestForStage(stage);
    const level: TargetLevel = gap.status === "red" ? "finland" : "best";
    const aim =
      level === "finland"
        ? { value: gap.national_value, name: `Finland overall (${formatPct(gap.national_value)})` }
        : best && best.id !== county.id
          ? { value: best.value, name: `the best area's level (${best.name}, ${formatPct(best.value)})` }
          : null;
    if (aim) {
      const paces = TARGET_YEARS.flatMap((year) => {
        const path = targetPath({ value, target: aim.value, better, fromYear: gap.year, toYear: year });
        return path.kind === "close" ? [{ year, points: path.points, perYear: path.perYear, years: path.years }] : [];
      });
      if (paces.length > 0) target = { level, levelName: aim.name, value: aim.value, paces };
    }
  }

  return {
    stage,
    indicatorId: gap.indicator_id,
    sourceId: gap.source_id,
    year: gap.year,
    ...words,
    value,
    finland: gap.national_value,
    target,
  };
}

/** The briefing for one area, or null for an unknown id (or an area with no GP-wait figure). */
export function buildBriefing(countyId: string): Briefing | null {
  const county = getCounty(countyId);
  if (!county) return null;
  const stand = buildStand(county);
  if (!stand) return null;

  const bottleneck = getBottleneck(county.id);
  const breaks = new Set(bottleneck.anyRed ? bottleneck.focus.map((gap) => gap.stage) : []);
  const stages = STAGES.map((stage) => buildStage(county, stage, breaks));

  const actions: BriefingAction[] = pickActions(bottleneck).map((action, index) => ({
    number: index + 1,
    id: action.id,
    title: plainTitle(action.action),
    stage: action.stage,
    stageLabel: STAGE_LABELS[action.stage],
    detail: action.detail,
    owner: action.who_implements,
    firstStep: action.first_step,
    precedent: action.precedent,
    result: action.effect_text,
    limitations: action.limitations,
    sourceId: action.source_id,
    measure: getMeasureForAction(action.id) ?? null,
    watch: buildWatch(county, action.stage),
  }));

  const sourceIds = [
    stand.sourceId,
    ...stages.flatMap((stage) => (stage.sourceId ? [stage.sourceId] : [])),
    ...actions.flatMap((action) => [
      action.sourceId,
      ...(action.measure ? [action.measure.source_id] : []),
      ...(action.watch ? [action.watch.sourceId] : []),
    ]),
  ];
  const sources = [...new Set(sourceIds)].flatMap((id) => {
    const source = getSource(id);
    return source ? [source] : [];
  });

  return {
    county,
    year: LATEST_YEAR,
    anyRed: bottleneck.anyRed,
    stand,
    pathway: { lede: bottleneckLede(bottleneck), anyRed: bottleneck.anyRed, stages },
    meaning: buildMeaning(county, bottleneck.anyRed),
    actions,
    targetYears: TARGET_YEARS,
    defaultTargetYear: DEFAULT_TARGET_YEAR,
    planFilePath: `/county/${county.id}/plan/export`,
    actPath: `/county/${county.id}/act`,
    sources,
  };
}
