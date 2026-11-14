// Display wording shared by the pages. Pure string helpers: the data and the lib/ sentences stay
// as they are; only how a gap is said on screen is set here.

/** The hospital group's name, spelled out at its first use on a page. */
export const HUS_FULL = "HUS (Helsinki University Hospital region)";

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
 * The main reason sentence (lib/main-reason) as shown in the UI, where the step's value stands
 * right beside it (the home figure, the county page's selected tab) and the earlier year's value
 * is on the trend: the same statement without those two numbers, and the gap said in full.
 * "Main reason: 85.4% of non-urgent GP visits here come …, 30.7 points above Finland and worse
 * than in 2023 (58.0%)." reads "Main reason: the share of non-urgent GP visits here that come …
 * is 30.7 percentage points above Finland's level and worse than in 2023."
 */
export function reasonForDisplay(text: string, { gap = true }: { gap?: boolean } = {}): string {
  // Without the gap (home: the what-if card under it states the same amount): "is above
  // Finland's level and worse than in 2023."
  const shown = gap ? text : text.replace(/, \d+(?:\.\d+)? points (above|below) Finland\b/, ", $1 Finland's level");
  return shown
    .replace(
      /^(Main reason|No measured step is worse than Finland): \d+(?:\.\d+)?% of non-urgent GP visits here come more than a week after people ask, /,
      "$1: the share of non-urgent GP visits here that come more than a week after people ask is ",
    )
    .replace(
      /^(Main reason|No measured step is worse than Finland): \d+(?:\.\d+)?% of referrals here are processed within 3 days, /,
      "$1: the share of referrals here processed within 3 days is ",
    )
    .replace(/ \(\d+(?:\.\d+)?%\)/g, "")
    .replace(/(\d+(?:\.\d+)?) points (above|below) Finland\b/g, "$1 percentage points $2 Finland's level");
}
