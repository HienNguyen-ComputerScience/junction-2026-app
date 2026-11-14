// The one "main reason" sentence per area, and the benchmark its figure is read against.
//
// Honesty rule: the snapshot says WHERE the delay sits and how it moved, never WHY. The sentence
// therefore only restates published shares: the step's 2025 value, its gap to Finland in
// percentage points and how it compares with 2023. It names no cause. The visit-rate context
// indicators (Sotkanet 293, 2371) are left out on purpose: they do not point one way (areas with
// many public GP visits per 1,000 have both long and short waits).

import { getBottleneck } from "@/lib/act";
import { counties, getSource, getValue, indicators, type Gap, type Stage } from "@/lib/data";
import { FIRST_YEAR, formatPct, getStageGap } from "@/lib/ranking";
import { bestArea, diff1, type AreaValue, type Better } from "@/lib/what-if";

/** A change since FIRST_YEAR smaller than this many points reads as "about the same". */
export const FLAT_BELOW_POINTS = 1;

export type MainReason = {
  /** red: a measured step is worse than Finland. none: no measured step is. no_data: nothing published. */
  kind: "red" | "none" | "no_data";
  /** The step the sentence is about, with the area's own value. Null only for no_data. */
  gap: Gap | null;
  /** The whole line as shown, e.g. "Main reason: 85.4% of non-urgent GP visits here …". */
  text: string;
  /** One chip per source a number in the text comes from. */
  chips: { sourceId: string; year: number }[];
};

/** Which way the stage's share is better, read from the indicator's direction. */
export function betterFor(indicatorId: string): Better {
  const direction = indicators.find((indicator) => indicator.indicator_id === indicatorId)?.direction;
  return direction === "lower_is_worse" ? "higher" : "lower";
}

/** The best published share for a step, among the areas with a figure of their own. */
export function bestForStage(stage: Stage): AreaValue | null {
  const withValue = counties.flatMap((county) => {
    const gap = getStageGap(county.id, stage);
    return gap && gap.value !== null ? [{ id: county.id, name: county.name, value: gap.value, gap }] : [];
  });
  if (withValue.length === 0) return null;
  const best = bestArea(withValue, betterFor(withValue[0].gap.indicator_id));
  return best && { id: best.id, name: best.name, value: best.value };
}

/** What each step's share counts, in the SPEC's wording: visits and referrals, never people. */
const WHAT: Partial<Record<Stage, (share: string) => string>> = {
  gp_access: (share) => `${share} of non-urgent GP visits here come more than a week after people ask`,
  referral: (share) => `${share} of referrals here are processed within 3 days`,
};

const ALSO_WORSE: Partial<Record<Stage, string>> = {
  gp_access: "The GP wait is worse too.",
  referral: "Referrals are worse too.",
};

/**
 * The step the sentence (and the figure above it) is about: the worst step when one is worse
 * than Finland, otherwise step 1, getting to a GP. Only steps with the area's own value: a
 * hospital-group-wide referral value (HUS) is never the area's figure.
 */
function reasonGap(countyId: string): { gap: Gap | null; red: Gap[] } {
  const { focus, anyRed } = getBottleneck(countyId);
  const own = focus.filter((gap) => gap.value !== null);
  if (anyRed) return { gap: own[0] ?? null, red: own.filter((gap) => gap.status === "red") };
  const gp = getStageGap(countyId, "gp_access");
  return { gap: gp && gp.value !== null ? gp : (own[0] ?? null), red: [] };
}

export function getMainReason(countyId: string): MainReason {
  const { gap, red } = reasonGap(countyId);
  const what = gap && WHAT[gap.stage];
  if (!gap || gap.value === null || !what) {
    return { kind: "no_data", gap: null, text: "No pathway data is published for this area.", chips: [] };
  }
  const isRed = gap.status === "red";
  const better = betterFor(gap.indicator_id);

  // The gap to Finland, rounded the way the bars round it.
  const points = diff1(gap.value, gap.national_value);
  const position =
    points === 0
      ? "level with Finland"
      : `${Math.abs(points).toFixed(1)} points ${points > 0 ? "above" : "below"} Finland`;

  // Against the first year of the trend: worse, better or about the same, with that year's value.
  const first = getValue(countyId, gap.indicator_id, FIRST_YEAR);
  let trend = "";
  if (first) {
    const worseBy = better === "lower" ? diff1(gap.value, first.value) : diff1(first.value, gap.value);
    const was = `in ${FIRST_YEAR} (${formatPct(first.value)})`;
    if (Math.abs(worseBy) < FLAT_BELOW_POINTS) trend = `, about the same as ${was}`;
    else if (worseBy > 0) trend = isRed ? ` and worse than ${was}` : `, though worse than ${was}`;
    else trend = isRed ? `, though better than ${was}` : ` and better than ${was}`;
  }

  const lead = isRed ? "Main reason" : "No measured step is worse than Finland";
  const also = red.find((other) => other.stage !== gap.stage);
  const tail = also && ALSO_WORSE[also.stage] ? ` ${ALSO_WORSE[also.stage]}` : "";
  return {
    kind: isRed ? "red" : "none",
    gap,
    text: `${lead}: ${what(formatPct(gap.value))}, ${position}${trend}.${tail}`,
    chips: [{ sourceId: gap.source_id, year: gap.year }],
  };
}

/** The chips as plain label and link, for places that cannot render a SourceChip (the Ask reply). */
export function reasonLinks(reason: MainReason): { label: string; url: string }[] {
  return reason.chips.flatMap(({ sourceId, year }) => {
    const source = getSource(sourceId);
    const id = /^sotkanet-(\d+)$/.exec(sourceId)?.[1];
    return source ? [{ label: `${id ? `Sotkanet ${id}` : source.publisher} · ${year}`, url: source.url }] : [];
  });
}
