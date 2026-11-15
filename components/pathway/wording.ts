import type { Stage } from "@/lib/data";
import type { MainReason } from "@/lib/main-reason";

// Display wording shared by the pages. Pure string helpers: the data and the lib/ sentences stay
// as they are; only how a gap is said on screen is set here.

/** The hospital group's name, spelled out at its first use on a page. */
export const HUS_FULL = "HUS (the Helsinki University Hospital group)";

/**
 * The gap to Finland in words, from the two one-decimal figures shown on screen: "30.7
 * percentage points above Finland overall", "below", or "level with Finland". No sign, no "pts".
 */
export function gapWords(value: number, finland: number): string {
  const diff = Math.round((Number(value.toFixed(1)) - Number(finland.toFixed(1))) * 10) / 10;
  if (diff === 0) return "Level with Finland";
  return `${Math.abs(diff).toFixed(1)} percentage points ${diff > 0 ? "above" : "below"} Finland overall`;
}

/**
 * The gap to Finland for a step card, in words and without a sign: "13.1 points above Finland
 * overall", "7.9 points below Finland overall", "level with Finland". Whether above is good is
 * the step's status label beside it: a GP wait is better lower, referrals processed in time higher.
 */
export function pointsVsFinland(value: number, finland: number): string {
  const diff = Math.round((Number(value.toFixed(1)) - Number(finland.toFixed(1))) * 10) / 10;
  if (diff === 0) return "Level with Finland";
  return `${Math.abs(diff).toFixed(1)} points ${diff > 0 ? "above" : "below"} Finland overall`;
}

const STEP_NAME: Partial<Record<Stage, string>> = {
  gp_access: "Getting to a GP",
  referral: "The GP to specialist referral",
};

/**
 * The main reason sentence (lib/main-reason) as shown on screen: one short line of about twelve
 * words. The lib text keeps its figures and its gap; on screen the figure stands beside the
 * sentence (the home number, the county tab) and the gap is on the step panel, so the line only
 * names the step and how it moved since the first year: "Getting to a GP is longer than Finland overall,
 * and worse than in 2023". It never says when a wait starts. The lib sentence is not changed.
 */
export function shortReason(reason: Pick<MainReason, "kind" | "gap" | "text">): string {
  const step = reason.gap ? STEP_NAME[reason.gap.stage] : undefined;
  if (reason.kind === "no_data" || !step) return reason.text;
  const trend = /(worse than|better than|about the same as) in (\d{4})/.exec(reason.text);
  const slower = reason.gap?.stage === "referral" ? "slower" : "longer";
  const lead =
    reason.kind === "red"
      ? `${step} is ${slower} than Finland overall`
      : `${step} is the same as or better than Finland overall`;
  if (!trend) return lead;
  const [, how, year] = trend;
  const worse = how === "worse than";
  // Red and worse (or at or better and better) agree with the lead: "and". Otherwise "though".
  const agrees = reason.kind === "red" ? worse : !worse;
  const joiner = how === "about the same as" ? "," : agrees ? ", and" : ", though";
  return `${lead}${joiner} ${how} in ${year}`;
}
