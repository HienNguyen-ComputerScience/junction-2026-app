import { ChevronRight } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FILL, STATUS_INK, StatusBadge } from "@/components/ui/status-badge";
import type { GapStatus } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

export type TrendPoint = { year: number; value: number | null };

export type StageCardProps = {
  step: number;
  title: string;
  status: GapStatus;
  /** Present when the stage has a public indicator. */
  measure?: {
    value: number | null;
    nationalValue: number;
    caption: string;
    note: string;
    sourceId: string;
    year: number;
    trend: TrendPoint[];
  };
  /** Shown instead of a measure when there is no public indicator. */
  emptyText?: string;
};

const NODE: Record<GapStatus, string> = {
  red: "bg-status-red text-white",
  amber: "bg-status-amber text-foreground",
  no_data: "border border-dashed border-status-grey-ink/60 bg-card text-status-grey-ink",
};

/**
 * The path itself: a numbered node per step, joined by one line. Horizontal from md up,
 * a vertical rail down the left on phones. Decorative; the step number is also in the heading.
 */
export function StepRail({
  step,
  status,
  first,
  last,
}: {
  step: number;
  status: GapStatus;
  first: boolean;
  last: boolean;
}) {
  return (
    <div aria-hidden className={`flex flex-col items-center md:flex-row ${first ? "md:pl-6" : ""}`}>
      {!first && (
        <span className="hidden w-6 items-center md:flex">
          <span className="h-px flex-1 bg-foreground/30" />
          <ChevronRight className="-ml-2 size-3.5 shrink-0 text-foreground/45" strokeWidth={1.75} />
        </span>
      )}
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums ${NODE[status]}`}
      >
        {step}
      </span>
      {!last && <span className="w-px flex-1 bg-foreground/30 md:h-px md:w-auto" />}
    </div>
  );
}

/** One step of the pathway: status, the key number against Finland, and its trend. */
export function StageCard({ step, title, status, measure, emptyText }: StageCardProps) {
  return (
    <article className="@container flex h-full min-w-0 flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <h3 className="type-heading">
          <span className="sr-only">Step {step}: </span>
          {title}
        </h3>
        {/* The source sits with the status, so it is on screen with the number it backs. */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
          {measure && <SourceChip sourceId={measure.sourceId} year={measure.year} />}
        </div>
      </div>

      {measure && measure.value !== null ? (
        <div className="grid gap-x-8 gap-y-5 @sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-col gap-3">
            <p className={`numeral text-[2.75rem] @sm:text-[3.5rem] ${STATUS_INK[status]}`}>
              {formatPct(measure.value)}
            </p>
            <p className="max-w-[26ch] text-sm text-pretty">{measure.caption}</p>
            <MeasureBar
              value={measure.value}
              finland={measure.nationalValue}
              finlandLabel={`Finland ${formatPct(measure.nationalValue)}`}
              status={status}
              className="mt-1"
            />
          </div>
          {measure.trend.some((point) => point.value !== null) && (
            <TrendChart
              trend={measure.trend}
              finland={measure.nationalValue}
              finlandYear={measure.year}
              status={status}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm text-pretty">
            {measure ? (
              <>
                <p>{measure.note}</p>
                <p className="text-muted-foreground">
                  Finland: {formatPct(measure.nationalValue)} {measure.caption}
                </p>
              </>
            ) : (
              <p>{emptyText}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <MeasureBar
              value={null}
              finland={measure ? measure.nationalValue : null}
              finlandLabel={measure ? `Finland ${formatPct(measure.nationalValue)}` : undefined}
              status={status}
            />
            {!measure && (
              <p aria-hidden className="type-mark text-muted-foreground">
                No indicator, so nothing to draw
              </p>
            )}
          </div>
        </div>
      )}

    </article>
  );
}

/**
 * Trend as zero-based columns on a 0 to 100% scale, so 58.0 and 85.4 look as different as
 * they are. The latest year carries the status colour; the ink line is Finland's value.
 */
function TrendChart({
  trend,
  finland,
  finlandYear,
  status,
}: {
  trend: TrendPoint[];
  finland: number;
  finlandYear: number;
  status: GapStatus;
}) {
  const lastIndex = trend.length - 1;
  return (
    <figure className="flex w-full flex-col gap-2 @sm:w-44">
      <figcaption className="type-micro text-muted-foreground">
        {trend[0].year} to {trend[lastIndex].year}, on a 0 to 100% scale
      </figcaption>
      <div className="flex flex-col gap-1">
        {/* Values sit in their own row above the plot, so the Finland line never crosses them. */}
        <div className="flex gap-2">
          {trend.map((point, i) => (
            <span
              key={point.year}
              className={`flex-1 text-center type-mark ${i === lastIndex ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {point.value === null ? "n/a" : formatPct(point.value)}
            </span>
          ))}
        </div>
        <div className="relative flex h-24 items-end gap-2 border-b border-foreground/40">
          {trend.map((point, i) => (
            <div key={point.year} className="flex h-full flex-1 items-end justify-center">
              {point.value !== null && (
                <div
                  className={`w-full max-w-12 rounded-t-[2px] ${i === lastIndex ? STATUS_FILL[status] : "bg-foreground/25"}`}
                  style={{ height: `${Math.min(100, Math.max(0, point.value))}%` }}
                />
              )}
            </div>
          ))}
          <span
            aria-hidden
            className="absolute inset-x-0 h-0.5 translate-y-1/2 bg-foreground"
            style={{ bottom: `${Math.min(100, Math.max(0, finland))}%` }}
          />
        </div>
        <div className="flex gap-2">
          {trend.map((point) => (
            <span key={point.year} className="flex-1 text-center type-mark text-muted-foreground">
              {point.year}
            </span>
          ))}
        </div>
      </div>
      <p className="flex items-center gap-1.5 type-mark font-medium text-foreground">
        <span aria-hidden className="h-0.5 w-3 bg-foreground" />
        Finland {formatPct(finland)} ({finlandYear})
      </p>
    </figure>
  );
}
