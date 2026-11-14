import type { Stage } from "@/lib/data";
import type { MainReason } from "@/lib/main-reason";

// Display wording shared by the pages. Pure string helpers: the data and the lib/ sentences stay
// as they are; only how a gap is said on screen is set here.

/** The hospital group's name, spelled out at its first use on a page. */
export const HUS_FULL = "HUS (Helsinki hospital district)";

/**
 * The gap to Finland in words, from the two one-decimal figures shown on screen: "30.7
 * percentage points above Finland's level", "below", or "level with Finland". No sign, no "pts".
 */
export function gapWords(value: number, finland: number): string {
  const diff = Math.round((Number(value.toFixed(1)) - Number(finland.toFixed(1))) * 10) / 10;
  if (diff === 0) return "Level with Finland";
  return `${Math.abs(diff).toFixed(1)} percentage points ${diff > 0 ? "above" : "below"} Finland's level`;
}

/**
 * The gap to Finland for a step card, in words and without a sign: "13.1 points worse than
 * Finland", "7.9 points better than Finland", "level with Finland". `higherIsBetter` is true for a
 * share where more is faster (referrals processed in time); a GP wait is the other way round.
 */
export function pointsVsFinland(value: number, finland: number, higherIsBetter: boolean): string {
  const diff = Math.round((Number(value.toFixed(1)) - Number(finland.toFixed(1))) * 10) / 10;
  if (diff === 0) return "Level with Finland";
  const better = higherIsBetter ? diff > 0 : diff < 0;
  return `${Math.abs(diff).toFixed(1)} points ${better ? "better" : "worse"} than Finland`;
}

const STEP_NAME: Partial<Record<Stage, string>> = {
  gp_access: "Getting to a GP",
  referral: "The GP to specialist referral",
};

/**
 * The main reason sentence (lib/main-reason) as shown on screen: one short line of about twelve
 * words. The lib text keeps its figures and its gap; on screen the figure stands beside the
 * sentence (the home number, the county tab) and the gap is on the step panel, so the line only
 * names the step and how it moved since the first year: "Getting to a GP is the slowest step,
 * and worse than in 2023". It never says when a wait starts. The lib sentence is not changed.
 */
export function shortReason(reason: Pick<MainReason, "kind" | "gap" | "text">): string {
  const step = reason.gap ? STEP_NAME[reason.gap.stage] : undefined;
  if (reason.kind === "no_data" || !step) return reason.text;
  const trend = /(worse than|better than|about the same as) in (\d{4})/.exec(reason.text);
  const lead = reason.kind === "red" ? `${step} is the slowest step` : `${step} is no worse than Finland`;
  if (!trend) return lead;
  const [, how, year] = trend;
  const worse = how === "worse than";
  // Red and worse (or at or better and better) agree with the lead: "and". Otherwise "though".
  const agrees = reason.kind === "red" ? worse : !worse;
  const joiner = how === "about the same as" ? "," : agrees ? ", and" : ", though";
  return `${lead}${joiner} ${how} in ${year}`;
}
