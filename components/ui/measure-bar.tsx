import type { CSSProperties } from "react";
import { cn } from "cn";

import type { GapStatus } from "@/lib/data";
import { STATUS_FILL } from "@/components/ui/status-badge";

/**
 * The FirstLine bar: a zero-based share of 0 to 100% with the "Finland line", a thin ink
 * marker at Finland's value. Used wherever a share is drawn (hero, ranking, county step,
 * act stats), so the same mark means the same thing everywhere.
 */

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Fill for a bar track (the parent must be `relative`). When a "worse than Finland" bar runs
 * past Finland's value, the part up to the line is tinted and the part beyond it is solid,
 * so the solid tip is the distance from Finland.
 */
export function BarFill({
  value,
  finland,
  status,
  index = 0,
}: {
  value: number;
  finland?: number | null;
  /** null draws a neutral ink bar (the Finland row itself). */
  status: GapStatus | null;
  /** Stagger position for the load animation. */
  index?: number;
}) {
  const fill = status ? STATUS_FILL[status] : "bg-foreground/50";
  const split = status === "red" && finland != null && value > finland;
  return (
    <span
      className="animate-bar-grow absolute inset-y-0 left-0 flex overflow-hidden rounded-[2px]"
      style={{ width: `${clamp(value)}%`, "--i": index } as CSSProperties}
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
 * Axis under a bar: 0% at the left and the Finland line's label at its value. The label is
 * anchored on the side with more room, so it never runs off a narrow card.
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
  const flip = x > 62;
  const anchor: CSSProperties = flip
    ? { right: `${100 - x}%`, paddingRight: 6 }
    : { left: `${x}%`, paddingLeft: 6 };
  return (
    <div aria-hidden className={cn("relative h-4 type-mark text-faint", className)}>
      {x > 16 && <span className="absolute left-0">0%</span>}
      <span className="absolute font-medium whitespace-nowrap text-foreground" style={anchor}>
        {label}
      </span>
    </div>
  );
}

/**
 * The key for reading the bars, in words. Use it wherever wait bars and referral bars sit
 * together: a wait bar is worse when it runs past the line, a referral bar when it stops short.
 */
export function BarKey({ className }: { className?: string }) {
  return (
    <p className={className}>
      Bars start at 0%; the white line marks Finland&apos;s value. GP wait, lower is better: a red
      bar is tinted up to the line and solid beyond it. Referrals, higher is faster: a bar that
      stops short of the line is slower than Finland.
    </p>
  );
}

/**
 * Bar + Finland line + axis label, as one block. Decorative: the value, the Finland value and
 * the status are always given in text next to it.
 *  - value null: an empty hatched track ("no public data"), never a zero-length bar.
 *  - finland null: no line (there is no indicator to compare).
 */
export function MeasureBar({
  value,
  finland,
  finlandLabel,
  status,
  index,
  className,
}: {
  value: number | null;
  finland: number | null;
  finlandLabel?: string;
  status: GapStatus | null;
  index?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative h-2.5 rounded-[2px]",
          value === null ? "bg-hatch ring-1 ring-status-grey-border ring-inset" : "bg-track",
        )}
      >
        {value !== null && <BarFill value={value} finland={finland} status={status} index={index} />}
        {finland !== null && <FinlandTick finland={finland} />}
      </div>
      {finland !== null && finlandLabel && <FinlandAxis finland={finland} label={finlandLabel} />}
    </div>
  );
}
