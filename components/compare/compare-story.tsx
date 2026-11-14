"use client";

import { cn } from "cn";

import { useStoryStep } from "@/components/motion";
import type { CompareRow } from "@/lib/compare";

const pct = (value: number) => `${value.toFixed(1)}%`;

/**
 * The compare page's picture: all 22 areas as bars (share of non-urgent GP visits waiting more
 * than 7 days), longest wait first, with Finland overall as a line. While the story is told, the
 * area the text is about is marked and the other bars step back; for the area with the largest
 * rise, a tick shows where it stood in the first year. In its final state (no script, reduced
 * motion, phones, print) every bar is at full strength and the three areas the text names are
 * marked in words.
 */
export function CompareBars({
  rows,
  finland,
  focus,
  firstYear,
}: {
  rows: CompareRow[];
  finland: number;
  /** The area each story step is about, in step order. */
  focus: (string | null)[];
  firstYear: number;
}) {
  const step = useStoryStep();
  const sorted = [...rows].sort((a, b) => b.gp - a.gp);
  const current = step === null ? null : (focus[step] ?? null);
  const risingId = focus[2] ?? null;
  const scale = (value: number) => `${Math.min(100, Math.max(0, value))}%`;
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="type-eyebrow">Non-urgent GP visits waiting over 7 days, 2025, % of visits</figcaption>
      <ol className="relative flex flex-col gap-[3px]" aria-label="All areas, longest wait first">
        {/* Finland overall, drawn across every row. */}
        <li aria-hidden className="pointer-events-none absolute inset-y-0 left-[12rem] right-[3.75rem]">
          <span className="absolute inset-y-0 w-0 border-l-2 border-dashed border-forest-ink" style={{ left: scale(finland) }} />
        </li>
        {sorted.map((row) => {
          const isCurrent = current === row.id;
          const dim = current !== null && !isCurrent;
          const named = step === null && focus.includes(row.id);
          return (
            <li key={row.id} className="grid grid-cols-[11.5rem_1fr_3.25rem] items-center gap-2">
              <span
                className={cn(
                  "truncate text-base leading-6",
                  isCurrent || named ? "font-semibold text-forest-ink" : "text-foreground",
                )}
              >
                {row.name}
              </span>
              <span className="relative h-4">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-r-sm transition-[opacity,box-shadow] duration-500",
                    row.gpStatus === "red" ? "bg-status-red" : "bg-status-amber",
                    dim && "opacity-35",
                    isCurrent && "ring-2 ring-forest-ink ring-offset-1 ring-offset-cream-paper",
                  )}
                  style={{ width: scale(row.gp) }}
                />
                {row.id === risingId && row.gpFirst !== null && (step === 2 || step === null) ? (
                  <span
                    aria-hidden
                    title={`${firstYear}: ${pct(row.gpFirst)}`}
                    className="absolute -inset-y-1 w-[3px] rounded-full bg-forest-ink"
                    style={{ left: scale(row.gpFirst) }}
                  />
                ) : null}
              </span>
              <span className={cn("figure text-right text-base leading-6", isCurrent ? "font-semibold text-forest-ink" : "text-foreground")}>
                {pct(row.gp)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-4 w-0 border-l-2 border-dashed border-forest-ink" />
          Finland overall: {pct(finland)}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm bg-status-red" />
          Longer wait than Finland overall
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-sm bg-status-amber" />
          Same as or better
        </span>
        {risingId ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-4 w-[3px] rounded-full bg-forest-ink" />
            Largest rise: its {firstYear} level
          </span>
        ) : null}
      </p>
    </figure>
  );
}
