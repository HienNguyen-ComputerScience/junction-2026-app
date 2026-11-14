import { cn } from "cn";

import { gapInWords, type BetterWhen } from "@/lib/gap-words";

/**
 * The distance to Finland in words, never a sign: "30.7 points slower than Finland". The
 * amount is set in the figure face; `inkClassName` colours it (the status ink of a worse step).
 */
export function GapPhrase({
  value,
  finland,
  better,
  unit = "points",
  inkClassName,
  className,
}: {
  value: number;
  finland: number;
  better: BetterWhen;
  unit?: "points" | "percentage points";
  /** Colour of the amount, e.g. STATUS_FIGURE[status]. */
  inkClassName?: string;
  className?: string;
}) {
  const { amount, words } = gapInWords(value, finland, better, unit);
  return (
    <span className={className}>
      {amount && <span className={cn("figure font-medium", inkClassName)}>{amount}</span>}
      {amount ? " " : ""}
      {words}
    </span>
  );
}

/** "lower is better" / "higher is faster" (a step's direction) as the way the share is better. */
export const betterFromDirection = (direction: string): BetterWhen =>
  direction.startsWith("higher") ? "higher" : "lower";
