/**
 * Comparisons in words, never a sign: "13.1 points slower than Finland", not "+13.1 pts".
 *
 * The rounding is the one of the figures on screen (each share to one decimal, then the
 * difference), so the words always match the two numbers beside them. A share of visits waiting
 * over 7 days is slower when it is larger; a share of referrals processed within 3 days is
 * slower when it is smaller (`higherIsFaster`).
 */
export type GapUnit = "points" | "percentage points";

export function gapInWords(
  value: number,
  finland: number,
  { higherIsFaster = false, unit = "points" }: { higherIsFaster?: boolean; unit?: GapUnit } = {},
): string {
  const diff = Number(value.toFixed(1)) - Number(finland.toFixed(1));
  const size = Math.abs(diff).toFixed(1);
  if (size === "0.0") return "Same as Finland";
  const slower = higherIsFaster ? diff < 0 : diff > 0;
  return `${size} ${unit} ${slower ? "slower" : "faster"} than Finland`;
}

/** The first use of "HUS" in a line, spelled out once: "HUS (Helsinki University Hospital region)". */
export const HUS_LONG = "HUS (Helsinki University Hospital region)";

export function explainHus(text: string): string {
  return text.replace(/\bHUS\b(?!-)(?! \()/, HUS_LONG);
}
