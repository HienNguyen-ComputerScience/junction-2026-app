import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

import type { GapStatus } from "@/lib/data";

/**
 * The FirstLine bar: a zero-based share of 0 to 100% with the "Finland line", a thin ink
 * marker at Finland's value. Used wherever a share is drawn (hero, ranking, county step,
 * act stats), so the same mark means the same thing everywhere.
 *
 * Two kinds of share are drawn, and the red part always shows the distance from Finland:
 *  - a wait share (lower is better) is worse when it runs PAST the line: tinted red up to the
 *    line, solid red beyond it;
 *  - a referral share (higher is faster) is worse when it stops SHORT of the line: a neutral
 *    fill up to the value, then a red outlined segment from the value to the line.
 */

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Bar fills. Amber is quieter as a bar than as a marker, so the calm end of a chart stays calm. */
const BAR_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber-bar",
  no_data: "bg-status-grey",
};
const NEUTRAL_FILL = "bg-foreground/45";

/**
 * Is this a higher-is-better share? The status comes from the data, so the direction can be
 * read off it: "worse than Finland" below Finland's value, or "at or better" above it, can
 * only be a share where higher is better. `higherIsBetter` overrides the inference.
 */
function readsHigherIsBetter(
  value: number,
  finland: number | null | undefined,
  status: GapStatus | null,
  higherIsBetter?: boolean,
): boolean {
  if (higherIsBetter !== undefined) return higherIsBetter;
  if (finland == null) return false;
  return (status === "red" && value < finland) || (status === "amber" && value > finland);
}

/**
 * Fill for a bar track (the parent must be `relative`). See the file comment for the two kinds.
 */
export function BarFill({
  value,
  finland,
  status,
  index = 0,
  higherIsBetter,
}: {
  value: number;
  finland?: number | null;
  /** null draws a neutral ink bar (the Finland row itself). */
  status: GapStatus | null;
  /** Stagger position for the load animation. */
  index?: number;
  /** Optional override; by default the direction is inferred from status and value. */
  higherIsBetter?: boolean;
}) {
  const v = clamp(value);
  const grow = { "--i": index } as CSSProperties;
  const referral = readsHigherIsBetter(value, finland, status, higherIsBetter);

  // Referral share that stops short of Finland: the missing part is the problem, so it is the
  // red part. Outlined, not hatched: hatching already means "no public data".
  if (referral && status === "red" && finland != null && value < finland) {
    const f = clamp(finland);
    return (
      <>
        <span
          className={cn(
            "animate-bar-grow absolute inset-y-0 left-0 rounded-l-[2px]",
            NEUTRAL_FILL,
          )}
          style={{ width: `${v}%`, ...grow }}
        />
        <span
          className="animate-bar-grow absolute inset-y-0 rounded-r-[2px] border border-l-0 border-status-red bg-status-red/25"
          style={{ left: `${v}%`, width: `${f - v}%`, "--i": index + 14 } as CSSProperties}
        />
      </>
    );
  }

  const fill = status ? BAR_FILL[status] : NEUTRAL_FILL;
  const split = !referral && status === "red" && finland != null && value > finland;
  return (
    <span
      className="animate-bar-grow absolute inset-y-0 left-0 flex overflow-hidden rounded-[2px]"
      style={{ width: `${v}%`, ...grow }}
    >
      {split ? (
        <>
          <span
            className={cn("h-full opacity-55", fill)}
            style={{ width: `${(finland / value) * 100}%` }}
          />
          <span className={cn("h-full flex-1", fill)} />
        </>
      ) : (
        <span className={cn("h-full w-full", fill)} />
      )}
    </span>
  );
}

/** The Finland line on one bar: an ink tick that extends past the track. Parent must be `relative`. */
export function FinlandTick({ finland, className }: { finland: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute -inset-y-1.5 w-0.5 -translate-x-1/2 bg-foreground", className)}
      style={{ left: `${clamp(finland)}%` }}
    />
  );
}

/**
 * Axis under a bar: the Finland line's label centred on its tick, with 0% and 100% at the ends
 * where there is room. The label only leaves the centre when it would run off the bar: it sits
 * in a box that is centred on the tick and reaches the nearer end of the bar, and "safe" centring
 * lets a label wider than that box overflow towards the far end only. No measuring, no script.
 */
export function FinlandAxis({
  finland,
  label,
  className,
}: {
  finland: number;
  /** Visible label, e.g. "Finland 54.7%". */
  label: string;
  className?: string;
}) {
  const x = clamp(finland);
  const reach = Math.min(x, 100 - x);
  const box: CSSProperties = {
    left: `${x - reach}%`,
    right: `${100 - x - reach}%`,
    justifyContent: "safe center",
  };
  return (
    <div aria-hidden className={cn("relative h-4 type-note text-faint", className)}>
      {x > 30 && <span className="absolute left-0 type-mark">0%</span>}
      {x < 70 && <span className="absolute right-0 type-mark">100%</span>}
      <span
        className={cn("absolute inset-y-0 flex justify-center", x > 50 && "flex-row-reverse")}
        style={box}
      >
        <span className="font-medium whitespace-nowrap text-foreground">{label}</span>
      </span>
    </div>
  );
}

const SWATCH = "h-2.5 shrink-0";

function KeyItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className="flex shrink-0 items-center">
        {swatch}
      </span>
      <span>{children}</span>
    </li>
  );
}

/**
 * The key for reading the bars: a row of swatches drawn exactly like the marks they name.
 *  - `kinds="both"` (default): true wherever wait bars and referral bars sit together.
 *  - `kinds="wait"`: a chart of wait bars only (the ranking).
 *  - `finlandLabel`: names the line with its value ("Finland 54.7%") when one value applies to
 *    every bar in view; leave it out where bars have different Finland values.
 */
export function BarKey({
  className,
  kinds = "both",
  finlandLabel,
}: {
  className?: string;
  kinds?: "both" | "wait";
  finlandLabel?: string;
}) {
  const line = (
    <KeyItem
      swatch={<span className="h-3.5 w-0.5 bg-foreground" />}
    >
      {finlandLabel ?? "Finland's value"}
    </KeyItem>
  );
  const amber = (
    <KeyItem swatch={<span className={cn(SWATCH, "w-5 rounded-[2px] bg-status-amber-bar")} />}>
      at or better than Finland&apos;s level{" "}
      {kinds === "wait" ? "(still a delay)" : "(not the same as good)"}
    </KeyItem>
  );
  const noData = (
    <KeyItem
      swatch={
        <span
          className={cn(SWATCH, "w-5 rounded-[2px] bg-hatch ring-1 ring-status-grey-border ring-inset")}
        />
      }
    >
      no public data
    </KeyItem>
  );

  return (
    <ul
      data-slot="bar-key"
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-1.5 type-legend", className)}
    >
      {kinds === "wait" ? (
        <>
          <KeyItem
            swatch={<span className={cn(SWATCH, "w-5 rounded-[2px] bg-status-red opacity-55")} />}
          >
            up to Finland&apos;s level
          </KeyItem>
          <KeyItem swatch={<span className={cn(SWATCH, "w-5 rounded-[2px] bg-status-red")} />}>
            beyond Finland&apos;s level
          </KeyItem>
          {line}
        </>
      ) : (
        <>
          {line}
          <KeyItem
            swatch={
              <>
                <span className={cn(SWATCH, "w-3 rounded-l-[2px] bg-status-red opacity-55")} />
                <span className={cn(SWATCH, "w-3 rounded-r-[2px] bg-status-red")} />
              </>
            }
          >
            GP wait: tinted up to Finland&apos;s level, solid beyond it
          </KeyItem>
          <KeyItem
            swatch={
              <>
                <span className={cn(SWATCH, "w-3 rounded-l-[2px]", NEUTRAL_FILL)} />
                <span
                  className={cn(
                    SWATCH,
                    "w-3 rounded-r-[2px] border border-l-0 border-status-red bg-status-red/25",
                  )}
                />
              </>
            }
          >
            Referrals, higher is faster: outlined where short of Finland&apos;s level
          </KeyItem>
        </>
      )}
      {amber}
      {noData}
    </ul>
  );
}

/**
 * Bar + Finland line + axis label, as one block. Decorative: the value, the Finland value and
 * the status are always given in text next to it.
 *  - value null: an empty hatched track ("no public data"), never a zero-length bar.
 *  - finland null: no line (there is no indicator to compare).
 *  - higherIsBetter: optional override of the inferred direction (see BarFill).
 *  - size "lg": the tall bar of the home comparison card (16px on a phone, 20px from sm).
 *  - gapLabel: with size "lg", written inside the span between the bar's end and the Finland
 *    line, i.e. on the distance it measures ("+30.7 pts"). Hidden if the span is too short.
 */
export function MeasureBar({
  value,
  finland,
  finlandLabel,
  status,
  index,
  className,
  higherIsBetter,
  size = "md",
  gapLabel,
}: {
  value: number | null;
  finland: number | null;
  finlandLabel?: string;
  status: GapStatus | null;
  index?: number;
  className?: string;
  higherIsBetter?: boolean;
  size?: "md" | "lg";
  gapLabel?: string;
}) {
  const showGap = size === "lg" && gapLabel && value !== null && finland !== null && value !== finland;
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative rounded-[2px]",
          size === "lg" ? "h-4 sm:h-5" : "h-2.5",
          value === null ? "bg-hatch ring-1 ring-status-grey-border ring-inset" : "bg-track",
        )}
      >
        {value !== null && (
          <BarFill
            value={value}
            finland={finland}
            status={status}
            index={index}
            higherIsBetter={higherIsBetter}
          />
        )}
        {showGap && (
          <span
            className="@container absolute inset-y-0 flex items-center justify-center"
            style={{
              left: `${clamp(Math.min(value, finland))}%`,
              width: `${Math.abs(clamp(value) - clamp(finland))}%`,
            }}
          >
            <span
              className={cn(
                "invisible type-note font-semibold whitespace-nowrap @min-[3.75rem]:visible",
                // On the solid red tip the label is dark; on the track or the outline it is light.
                status === "red" && value > finland ? "text-background" : "text-foreground/90",
              )}
            >
              {gapLabel}
            </span>
          </span>
        )}
        {finland !== null && <FinlandTick finland={finland} />}
      </div>
      {finland !== null && finlandLabel && <FinlandAxis finland={finland} label={finlandLabel} />}
    </div>
  );
}
