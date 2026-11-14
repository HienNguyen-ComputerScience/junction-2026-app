// A share's distance to Finland's, in words instead of a sign: "30.7 points slower than Finland".
// Pure: plain numbers in, plain strings out. No snapshot imports.

/** Which way a share is better: a wait share is better lower, a referral share higher. */
export type BetterWhen = "lower" | "higher";

export type GapWords = {
  /** The distance, one decimal, no sign ("30.7"). Empty when level with Finland. */
  amount: string;
  /** The words after the amount ("points slower than Finland"), or the whole phrase when level. */
  words: string;
  /** True when the area is on the slow side of Finland. */
  slower: boolean;
};

/**
 * The gap between two shares as shown on screen: each rounded to one decimal, then the
 * difference. Slower or faster is read from the direction, never from the sign alone.
 * `unit`: "points" in rows and cards; "percentage points" where the gap is first explained.
 */
export function gapInWords(
  value: number,
  finland: number,
  better: BetterWhen,
  unit: "points" | "percentage points" = "points",
): GapWords {
  const diff = Number(value.toFixed(1)) - Number(finland.toFixed(1));
  const amount = Math.abs(diff).toFixed(1);
  if (amount === "0.0") return { amount: "", words: "Level with Finland", slower: false };
  const slower = better === "lower" ? diff > 0 : diff < 0;
  const one = amount === "1.0";
  const noun = unit === "points" ? (one ? "point" : "points") : one ? "percentage point" : "percentage points";
  return { amount, words: `${noun} ${slower ? "slower" : "faster"} than Finland`, slower };
}
