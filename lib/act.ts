// Screen 3 ("Act"): find a county's bottleneck and pick the actions to show.
//
// Selection rule (deterministic, also stated in one line on the page):
// 1. Focus stages: every measured stage that is red (worse than Finland),
//    worst first by relative gap to Finland's value. If no stage is red, the
//    single measured stage closest to (or furthest below) Finland's level.
// 2. Recommended actions (max 3): one action per focus stage first, then fill
//    up to 3 from the focus stages in the same order.
// 3. Within a stage, actions with a measured effect size come first, then the
//    order of the evidence table (data/evidence.json). Nothing is filtered out.
// 4. Stages without county data (referral in parts of Uusimaa, where only a
//    HUS-wide value exists) and GP
//    recognition (no public data anywhere) are never recommended, but their
//    actions are listed as "can't be measured here yet", not hidden.

import {
  evidence,
  getGaps,
  indicators,
  type Evidence,
  type Gap,
  type Stage,
} from "@/lib/data";

export const STAGE_LABELS: Record<Stage, string> = {
  gp_access: "Getting in to see a GP",
  gp_recognition: "GP recognises warning signs",
  referral: "GP to specialist referral",
};

export const SELECTION_RULE =
  "How we pick: stages worse than Finland first (worst first), one action per stage, then up to three; actions with a measured effect come before those without. Stages with no public data are listed, not hidden.";

/** How much worse than Finland a measured gap is, as a share of Finland's value. Positive = worse. */
export function relativeGap(gap: Gap): number | null {
  if (gap.value === null) return null;
  const indicator = indicators.find((i) => i.indicator_id === gap.indicator_id);
  const diff =
    indicator?.direction === "lower_is_worse"
      ? gap.national_value - gap.value
      : gap.value - gap.national_value;
  return diff / gap.national_value;
}

export type Bottleneck = {
  /** Stages the recommendations target, worst first. */
  focus: Gap[];
  /** True when at least one focus stage is red; false when we picked the weakest amber stage. */
  anyRed: boolean;
  /** Measured stages for which the county has no value (e.g. referral in Vantaa–Kerava). */
  noData: Gap[];
};

export function getBottleneck(countyId: string): Bottleneck {
  const gaps = getGaps(countyId);
  const measured = gaps
    .filter((gap) => gap.status !== "no_data")
    .map((gap) => ({ gap, rel: relativeGap(gap) ?? -Infinity }))
    .sort((a, b) => b.rel - a.rel);
  const red = measured.filter((m) => m.gap.status === "red").map((m) => m.gap);
  const focus = red.length > 0 ? red : measured.slice(0, 1).map((m) => m.gap);
  return {
    focus,
    anyRed: red.length > 0,
    noData: gaps.filter((gap) => gap.status === "no_data"),
  };
}

const STAGE_PHRASES: Record<Stage, string> = {
  gp_access: "getting in to see a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

/** One-paragraph summary of the bottleneck, built only from gaps.json notes. */
export function bottleneckSentence(countyName: string, bottleneck: Bottleneck): string {
  const { focus, anyRed, noData } = bottleneck;
  const parts: string[] = [];
  if (focus.length === 0) {
    parts.push(`Sotkanet publishes no 2025 pathway data for ${countyName}.`);
  } else if (!anyRed) {
    const [gap] = focus;
    parts.push(
      `No measured stage in ${countyName} is worse than Finland. The one closest to Finland's level is ${STAGE_PHRASES[gap.stage]}: ${gap.note}`,
    );
  } else if (focus.length === 1) {
    const [gap] = focus;
    parts.push(`In ${countyName} the bottleneck is ${STAGE_PHRASES[gap.stage]}: ${gap.note}`);
  } else {
    parts.push(
      `In ${countyName} both measured stages are worse than Finland. ` +
        focus
          .map(
            (gap, i) =>
              `${i === 0 ? "Worst is" : "Then"} ${STAGE_PHRASES[gap.stage]}: ${gap.note}`,
          )
          .join(" "),
    );
  }
  for (const gap of noData) {
    parts.push(
      gap.shared
        ? `For ${STAGE_PHRASES[gap.stage]} there is only a ${gap.shared.name}-wide value, not one for this county, so it is not used to pick actions.`
        : `There is no county data for ${STAGE_PHRASES[gap.stage]}, so it can't be measured here yet.`,
    );
  }
  parts.push(
    `Whether GPs recognise cancer warning signs has no public data anywhere in Finland.`,
  );
  return parts.join(" ");
}

/** Actions for one stage, measured effect first, then evidence-table order. */
export function rankedActions(stage: Stage): Evidence[] {
  const rows = evidence.filter((row) => row.stage === stage);
  return [
    ...rows.filter((row) => row.effect_size !== null),
    ...rows.filter((row) => row.effect_size === null),
  ];
}

export const MAX_RECOMMENDED = 3;

export function pickActions(bottleneck: Bottleneck): Evidence[] {
  const queues = bottleneck.focus.map((gap) => rankedActions(gap.stage));
  const picked: Evidence[] = [];
  // Round 1: the best action for each focus stage.
  for (const queue of queues) {
    const next = queue.shift();
    if (next && picked.length < MAX_RECOMMENDED) picked.push(next);
  }
  // Then fill from the focus stages, worst stage first.
  for (const queue of queues) {
    while (queue.length > 0 && picked.length < MAX_RECOMMENDED) {
      picked.push(queue.shift()!);
    }
  }
  return picked;
}

export type OtherGroup = {
  stage: Stage;
  /** Why this group is not measured for the county, if it isn't. */
  unmeasured: string | null;
  actions: Evidence[];
};

/** Every action not recommended, grouped by stage in pathway order. */
export function otherActions(countyId: string, picked: Evidence[]): OtherGroup[] {
  const gaps = getGaps(countyId);
  const pickedIds = new Set(picked.map((row) => row.id));
  const stages: Stage[] = ["gp_access", "referral", "gp_recognition"];
  return stages
    .map((stage) => {
      const gap = gaps.find((g) => g.stage === stage);
      let unmeasured: string | null = null;
      if (!gap) {
        unmeasured = "No public data in any county, so this can't be measured here yet.";
      } else if (gap.status === "no_data") {
        unmeasured = gap.shared
          ? `Sotkanet has only a ${gap.shared.name}-wide value, not one for this county, so this can't be measured here yet.`
          : "No county data on Sotkanet, so this can't be measured here yet.";
      }
      return {
        stage,
        unmeasured,
        actions: rankedActions(stage).filter((row) => !pickedIds.has(row.id)),
      };
    })
    .filter((group) => group.actions.length > 0);
}
