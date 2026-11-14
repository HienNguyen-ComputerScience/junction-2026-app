// Target arithmetic for the county action plan.
// Pure functions on plain numbers: no snapshot imports, so `npm test` can load this file with
// plain node. The callers read the published shares from lib/data and pass them in.
//
// Honesty rule: this is arithmetic on published shares, never a forecast. A target is a level
// the director chooses (Finland's level or the best area's level) and a year; the functions
// only say how far the published share is from that level and what even pace would close it.
// No effect of any action is assumed.

import { diff1, type Better } from "@/lib/what-if";

/** The levels a director can aim for. Both are published shares, never ours. */
export type TargetLevel = "finland" | "best";

export const TARGET_LEVELS: TargetLevel[] = ["finland", "best"];

/** Target years on offer: the roadmap's two periods end in 2028 and 2031. */
export const TARGET_YEARS = [2027, 2028, 2029, 2030, 2031] as const;
export const DEFAULT_TARGET_YEAR = 2028;

export function parseTargetLevel(value: string | null | undefined, fallback: TargetLevel): TargetLevel {
  return TARGET_LEVELS.includes(value as TargetLevel) ? (value as TargetLevel) : fallback;
}

export function parseTargetYear(value: string | null | undefined): number {
  const year = Number(value);
  return (TARGET_YEARS as readonly number[]).includes(year) ? year : DEFAULT_TARGET_YEAR;
}

export type TargetPathInput = {
  /** The area's latest published share. */
  value: number;
  /** The level aimed for (Finland's or the best area's share). */
  target: number;
  better: Better;
  /** The year of `value` (the latest published year). */
  fromYear: number;
  /** The year the target should be reached. */
  toYear: number;
};

export type TargetPath =
  /** The area is already at the target level or better: nothing to close. */
  | { kind: "hold" }
  | {
      kind: "close";
      /** Percentage points between the share and the target, one decimal, always positive. */
      points: number;
      /** The same spread evenly over the years, one decimal. */
      perYear: number;
      years: number;
      /** One value per year after `fromYear`, on a straight line; the last one is the target. */
      milestones: { year: number; value: number }[];
    };

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * How far a share is from a target level and the even yearly pace that closes it by `toYear`.
 * A share already at the target or better (in the direction that counts as better) is "hold".
 */
export function targetPath({ value, target, better, fromYear, toYear }: TargetPathInput): TargetPath {
  const points = better === "lower" ? diff1(value, target) : diff1(target, value);
  const years = toYear - fromYear;
  if (points <= 0 || years <= 0) return { kind: "hold" };
  const start = Number(value.toFixed(1));
  const end = Number(target.toFixed(1));
  const milestones = Array.from({ length: years }, (_, i) => ({
    year: fromYear + i + 1,
    value: i + 1 === years ? end : round1(start + ((end - start) * (i + 1)) / years),
  }));
  return { kind: "close", points, perYear: round1(points / years), years, milestones };
}

/** A free-text field from the plan's form: trimmed, one line, cut to a sane length. */
export function cleanField(value: string | null | undefined, max = 80): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}
