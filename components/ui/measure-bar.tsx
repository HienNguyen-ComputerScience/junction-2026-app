import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

import type { GapStatus } from "@/lib/data";

/**
 * The FirstLine bar: a zero-based share of 0 to 100% with the "Finland line", a thin ink
 * marker at Finland's value. Used wherever a share is drawn (hero, ranking, county step,
 * act stats), so the same mark means the same thing everywhere.
 *
 * One treatment for every bar that is worse than Finland, whichever way the share runs:
 * tinted red for the share itself, solid red for the gap to Finland.
 *  - a wait share (lower is better) runs PAST the line: tinted up to the line, solid beyond it;
 *  - a referral share (higher is faster) stops SHORT of the line: tinted up to the value, solid
 *    from the value to the line.
 * At or better: the slate status tone. Grey is only the "Finland overall" bar (status null).
 */

const clamp = (n: number) => Math.min(100, Math.max(0, n));

const NUMBER = /([+−-]?\d+(?:\.\d+)?%?(?:\spts)?)/;

/**
 * Sets the numbers in a short label in the numeral face (`figure`) and leaves the words in the
 * text face: "Finland 54.7%" keeps "Finland" in the sans. For labels that arrive as one string.
 */
export function withFigures(text: string): ReactNode {
  return text.split(NUMBER).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="figure">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Bar fills. Slate is quieter as a bar than as a marker, so the calm end of a chart stays calm. */
const BAR_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber-bar",
  no_data: "bg-status-grey",
};
/** The share itself on a bar that is worse than Finland; the gap to Finland is BAR_FILL.red. */
const RED_TINT = "bg-status-red-tint";
/** The "Finland overall" bar, and nothing else. */
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

  // Referral share that stops short of Finland: tinted red up to the value, then the missing
  // part, solid red, up to the line. The same two reds as a wait bar that runs past the line.
  if (referral && status === "red" && finland != null && value < finland) {
    const f = clamp(finland);
    return (
      <>
        <span
          className={cn("animate-bar-grow absolute inset-y-0 left-0 rounded-l-[2px]", RED_TINT)}
          style={{ width: `${v}%`, ...grow }}
        />
        <span
          className="animate-bar-grow absolute inset-y-0 rounded-r-[2px] bg-status-red"
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
          <span className={cn("h-full", RED_TINT)} style={{ width: `${(finland / value) * 100}%` }} />
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
  // Near the right end the centred label would run into "100%": it sits to the left of its tick
  // instead, ending on the line. Elsewhere it is centred on the tick.
  const leftOfTick = x >= 72;
  const box: CSSProperties = leftOfTick
    ? { left: 0, right: `${100 - x}%`, justifyContent: "flex-end", paddingRight: 6 }
    : { left: `${x - reach}%`, right: `${100 - x - reach}%`, justifyContent: "safe center" };
  return (
    <div aria-hidden className={cn("relative h-4 type-note text-faint", className)}>
      {x > 30 && <span className="absolute left-0 figure">0%</span>}
      <span className="absolute right-0 figure">100%</span>
      <span className="absolute inset-y-0 flex" style={box}>
        <span className="font-semibold whitespace-nowrap text-foreground">{withFigures(label)}</span>
      </span>
    </div>
  );
}

/** Every swatch sits in the same 24px slot, so the labels of a key share one left edge. */
function KeyItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className="relative flex h-2.5 w-6 shrink-0 overflow-visible rounded-[2px]">
        {swatch}
      </span>
      <span>{children}</span>
    </li>
  );
}

type KeyKind = "finland" | "red" | "amber" | "no_data";
const KEY_ITEMS: KeyKind[] = ["finland", "red", "amber", "no_data"];

/**
 * The key for reading the bars and the map: one row of swatches, drawn like the marks they
 * name. One key per page, and nothing else in it.
 *  - `items`: which swatches to show, when a view has no hatched track or names the Finland
 *    line elsewhere. Default: all four.
 * One item per line on a phone, one wrapping row from `sm`.
 */
export function BarKey({ className, items = KEY_ITEMS }: { className?: string; items?: KeyKind[] }) {
  return (
    <ul
      data-slot="bar-key"
      className={cn(
        "flex flex-col gap-x-6 gap-y-1.5 type-legend sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {items.includes("finland") && (
        <KeyItem
          swatch={
            <>
              <span className="h-full w-full rounded-[2px] bg-track" />
              <span className="absolute -inset-y-0.5 left-1/2 w-0.5 -translate-x-1/2 bg-foreground" />
            </>
          }
        >
          Finland&apos;s value
        </KeyItem>
      )}
      {items.includes("red") && (
        <KeyItem
          swatch={
            <>
              <span className={cn("h-full w-1/2 rounded-l-[2px]", RED_TINT)} />
              <span className="h-full w-1/2 rounded-r-[2px] bg-status-red" />
            </>
          }
        >
          Worse than Finland's level
        </KeyItem>
      )}
      {items.includes("amber") && (
        <KeyItem swatch={<span className="h-full w-full rounded-[2px] bg-status-amber-bar" />}>
          At or better than Finland&apos;s level
        </KeyItem>
      )}
      {items.includes("no_data") && (
        <KeyItem
          swatch={
            <span className="h-full w-full rounded-[2px] bg-hatch ring-1 ring-status-grey-border ring-inset" />
          }
        >
          No public data
        </KeyItem>
      )}
    </ul>
  );
}

/**
 * Bar + Finland line + axis label, as one block. Decorative: the value, the Finland value and
 * the status are always given in text next to it.
 *  - value null: an empty hatched track ("no public data"), never a zero-length bar.
 *  - finland null: no line (there is no indicator to compare).
 *  - higherIsBetter: optional override of the inferred direction (see BarFill).
 *  - size "lg": the tall bar of the home comparison card (16px on a phone, 20px from sm);
 *    size "sm": the 6px bar of the compact step strip.
 *  - gapLabel: the distance to Finland in words ("+30.7 pts", "−7.9 pts"; use `gapToFinland`),
 *    for wait bars and referral bars alike. With size "lg" it is written inside the span between
 *    the bar's end and the Finland line, i.e. on the distance it measures (hidden if that span
 *    is too short). With the default size it sits just above the bar, against the Finland line
 *    on the side of the gap, in the status ink.
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
  size?: "sm" | "md" | "lg";
  gapLabel?: string;
}) {
  const hasGap = Boolean(gapLabel) && value !== null && finland !== null && value !== finland;
  const below = value !== null && finland !== null && value < finland;
  // The gap span is solid red for a wait bar past the line and for a referral bar short of it.
  const onRed =
    status === "red" &&
    value !== null &&
    finland !== null &&
    readsHigherIsBetter(value, finland, status, higherIsBetter) === below;
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {hasGap && size === "md" && finland !== null && (
        <div className="relative -mb-1 h-4">
          <span
            className={cn(
              "absolute inset-y-0 flex items-center figure type-note font-medium whitespace-nowrap",
              below ? "justify-end pr-1.5" : "justify-start pl-1.5",
              status === "red" ? "text-status-red-ink" : "text-muted-foreground",
            )}
            style={
              below
                ? { left: 0, right: `${100 - clamp(finland)}%` }
                : { left: `${clamp(finland)}%`, right: 0 }
            }
          >
            {gapLabel}
          </span>
        </div>
      )}
      <div
        className={cn(
          "relative rounded-[2px]",
          size === "lg" ? "h-4 sm:h-5" : size === "sm" ? "h-1.5" : "h-2.5",
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
        {hasGap && size === "lg" && value !== null && finland !== null && (
          <span
            className="@container absolute inset-y-0 flex items-center justify-center"
            style={{
              left: `${clamp(Math.min(value, finland))}%`,
              width: `${Math.abs(clamp(value) - clamp(finland))}%`,
            }}
          >
            <span
              className={cn(
                "invisible figure type-note font-semibold whitespace-nowrap @min-[4rem]:visible",
                // On solid red the label is dark; on the empty track it is light.
                onRed ? "text-background" : "text-foreground/90",
              )}
            >
              {gapLabel}
            </span>
          </span>
        )}
        {finland !== null && <FinlandTick finland={finland} className={size === "sm" ? "-inset-y-1" : undefined} />}
      </div>
      {finland !== null && finlandLabel && <FinlandAxis finland={finland} label={finlandLabel} />}
    </div>
  );
}
