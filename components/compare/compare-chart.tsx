import type { ReactNode } from "react";
import { cn } from "cn";

import type { CompareRow } from "@/lib/compare";
import { STATUS_LABEL } from "@/lib/ranking";

const pct = (value: number) => `${value.toFixed(1)}%`;
const scale = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

/** The compare page's framed unit: a cream card with a hairline, like the units on /sources. */
export const COMPARE_FRAME = "rounded-[14px] border border-frame-border bg-cream-paper p-4 sm:p-[21px]";

/**
 * The compare page's one picture: every area as a bar (share of non-urgent GP visits waiting more
 * than 7 days), longest wait first, on a 0–100% track, with Finland overall as a dashed line through
 * every bar. A fixed picture: no motion, the same on screen, without script and on paper. Status is
 * in the legend and, for screen readers, in words on every bar; the table below says it per row.
 * Each area is one line: name, bar, figure (the name column fits the longest name on a phone).
 */
export function CompareChart({
  rows,
  finland,
  year,
  caption,
}: {
  rows: CompareRow[];
  finland: number;
  year: number;
  /** One line under the picture: the extremes, and the source chip. */
  caption?: ReactNode;
}) {
  const sorted = [...rows].sort((a, b) => b.gp - a.gp);
  return (
    <figure className={cn(COMPARE_FRAME, "print-keep flex flex-col gap-4")}>
      <figcaption className="type-eyebrow">Non-urgent GP visits waiting over 7 days, {year}, % of visits</figcaption>
      <ol className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 gap-y-[3px] sm:grid-cols-[11.5rem_minmax(0,1fr)_3.5rem] sm:gap-x-3" aria-label="All areas, longest wait first">
        {sorted.map((row) => (
          <li
            key={row.id}
            className="col-span-3 grid grid-cols-subgrid items-center"
          >
            <span className="truncate text-base leading-6 text-foreground">{row.name}</span>
            <span className="relative h-3 rounded-r-sm bg-track sm:h-4">
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-0 left-0 rounded-r-sm",
                  row.gpStatus === "red" ? "bg-status-red" : row.gpStatus === "amber" ? "bg-status-amber-bar" : "bg-status-grey",
                )}
                style={{ width: scale(row.gp) }}
              />
              <span
                aria-hidden
                className="absolute -inset-y-[2px] w-0 border-l-2 border-dashed border-forest-ink"
                style={{ left: scale(finland) }}
              />
            </span>
            <span className="figure text-right text-base leading-6 text-foreground">
              {pct(row.gp)}
              <span className="sr-only">, {STATUS_LABEL[row.gpStatus].toLowerCase()}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-base text-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-4 w-0 border-l-2 border-dashed border-forest-ink" />
          Finland overall: <span className="figure">{pct(finland)}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm bg-status-red" />
          {STATUS_LABEL.red}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm bg-status-amber-bar" />
          {STATUS_LABEL.amber}
        </span>
      </p>
      {caption ? <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-frame-border pt-3 text-base text-pretty text-foreground">{caption}</div> : null}
    </figure>
  );
}
