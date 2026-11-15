import type { GapStatus, Stage } from "@/lib/data";

/**
 * The status in words, for the GP-access step (a longer wait is worse). The referral step has its own wording:
 * use `statusLabel(status, stage)` wherever the step is known. The comparison is always Sotkanet's whole-country
 * value for the same indicator and year, never a target and never an average of the areas.
 * Kept free of data imports so client components can use it.
 */
export const STATUS_LABEL: Record<GapStatus, string> = {
  red: "Longer wait than Finland overall",
  amber: "Same as or better than Finland overall",
  no_data: "No public data",
};

/** The status in words for one step: a longer wait for GP access, slower for the referral (higher is better there). */
export function statusLabel(status: GapStatus, stage: Stage): string {
  if (status === "red" && stage === "referral") return "Slower than Finland overall";
  return STATUS_LABEL[status];
}
