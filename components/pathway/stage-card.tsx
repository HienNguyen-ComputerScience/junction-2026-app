import { ChevronRight } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FILL, STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
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
  // Dark ink on the saturated fills: 5.0:1 on red, 9.7:1 on amber.
  red: "bg-status-red text-background",
  amber: "bg-status-amber text-background",
  no_data: "border border-dashed border-status-grey-ink/60 bg-card text-status-grey-ink",
};

/**
 * Rows every step card fills, in order: title, status row, key content, bar, trend. From lg up
 * the cards sit side by side on a shared subgrid, so the same row lines up across all three.
 */
export const STAGE_ROWS = 5;

/**
 * The path itself: a numbered node per step, joined by one line. Horizontal from lg up,
 * a vertical rail down the left below that. Decorative; the step number is also in the heading.
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
    <div aria-hidden className={`flex flex-col items-center lg:flex-row ${first ? "lg:pl-6" : ""}`}>
      {!first && (
        <span className="hidden w-6 items-center lg:flex">
          <span className="h-px flex-1 bg-foreground/30" />
          <ChevronRight className="-ml-2 size-3.5 shrink-0 text-foreground/45" strokeWidth={1.75} />
        </span>
      )}
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums ${NODE[status]}`}
      >
        {step}
      </span>
      {!last && <span className="w-px flex-1 bg-foreground/30 lg:h-px lg:w-auto" />}
    </div>
  );
}

/**
 * One step of the pathway: status and source on one row, the key number, its bar against
 * Finland, then the trend. Always renders the same five rows (see STAGE_ROWS), empty or not,
 * so the three steps share baselines.
 */
export function StageCard({ step, title, status, measure, emptyText }: StageCardProps) {
  const hasValue = measure !== undefined && measure.value !== null;
  const hasTrend = hasValue && measure.trend.some((point) => point.value !== null);

  return (
    <article className="flex min-w-0 flex-col lg:row-span-5 lg:grid lg:grid-rows-subgrid">
      <h3 className="type-heading lg:pt-3">
        <span className="sr-only">Step {step}: </span>
        {title}
      </h3>

      {/* The source sits with the status, so it is on screen with the number it backs. */}
      <div className="flex flex-wrap content-start items-center gap-2 pt-2">
        <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
        {measure && <SourceChip sourceId={measure.sourceId} year={measure.year} />}
      </div>

      <div className="flex flex-col gap-2 pt-4 text-sm text-pretty">
        {measure && measure.value !== null ? (
          <>
            <p className={`numeral text-[3.5rem] lg:text-[3.75rem] ${STATUS_FIGURE[status]}`}>
              {formatPct(measure.value)}
            </p>
            <p className="max-w-[34ch]">{measure.caption}</p>
          </>
        ) : measure ? (
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

      <div className="flex flex-col gap-2 pt-4">
        <MeasureBar
          value={measure ? measure.value : null}
          finland={measure ? measure.nationalValue : null}
          finlandLabel={measure ? `Finland ${formatPct(measure.nationalValue)}` : undefined}
          status={status}
        />
        {!measure && (
          <p aria-hidden className="type-note text-muted-foreground">
            No indicator, so nothing to draw
          </p>
        )}
      </div>

      {hasTrend ? (
        <div className="pt-8">
          <TrendChart
            trend={measure.trend}
            finland={measure.nationalValue}
            finlandYear={measure.year}
            sourceId={measure.sourceId}
            status={status}
          />
        </div>
      ) : measure && measure.trend.length > 0 && !measure.trend.some((point) => point.value !== null) ? (
        // An indicator exists but this area has no values in any year: say so where the trend would be.
        <div className="pt-8">
          <p className="flex max-w-sm flex-col gap-1 border-t border-border pt-4">
            <span className="type-caption font-medium text-foreground">
              Trend, {measure.trend[0].year}–{measure.trend[measure.trend.length - 1].year}
            </span>
            <span className="type-note text-muted-foreground">No values published for this area in any year</span>
          </p>
        </div>
      ) : (
        <div aria-hidden className="max-lg:hidden" />
      )}
    </article>
  );
}

/**
 * Trend as zero-based columns on a 0 to 100% scale, so 58.0 and 85.4 look as different as
 * they are. The latest year carries the status colour; the ink line is Finland's value.
 * It has its own source line, because it covers more years than the step's chip.
 */
function TrendChart({
  trend,
  finland,
  finlandYear,
  sourceId,
  status,
}: {
  trend: TrendPoint[];
  finland: number;
  finlandYear: number;
  sourceId: string;
  status: GapStatus;
}) {
  const lastIndex = trend.length - 1;
  const years = `${trend[0].year}–${trend[lastIndex].year}`;
  return (
    <figure className="flex w-full max-w-sm flex-col gap-3 border-t border-border pt-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="type-caption font-medium text-foreground">
          Trend, {years}
          <span className="sr-only">, on a 0 to 100% scale</span>
        </span>
        <SourceChip sourceId={sourceId} />
      </figcaption>
      <div className="flex flex-col gap-1">
        {/* Values sit in their own row above the plot, so the Finland line never crosses them. */}
        <div className="flex gap-3">
          {trend.map((point, i) => (
            <span
              key={point.year}
              className={`flex-1 text-center type-mark ${i === lastIndex ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {point.value === null ? "n/a" : formatPct(point.value)}
            </span>
          ))}
        </div>
        <div className="relative flex h-20 items-end gap-3 border-b border-foreground/40">
          {trend.map((point, i) => (
            <div key={point.year} className="flex h-full flex-1 items-end justify-center">
              {point.value !== null && (
                <div
                  className={`w-full max-w-14 rounded-t-[2px] ${i === lastIndex ? STATUS_FILL[status] : "bg-foreground/25"}`}
                  style={{ height: `${Math.min(100, Math.max(0, point.value))}%` }}
                />
              )}
            </div>
          ))}
          <span
            aria-hidden
            className="absolute inset-x-0 h-px bg-foreground"
            style={{ bottom: `${Math.min(100, Math.max(0, finland))}%` }}
          />
        </div>
        <div className="flex gap-3">
          {trend.map((point) => (
            <span key={point.year} className="flex-1 text-center type-mark text-faint">
              {point.year}
            </span>
          ))}
        </div>
      </div>
      <p className="flex items-center gap-1.5 type-note font-medium text-foreground">
        <span aria-hidden className="h-px w-3 bg-foreground" />
        Finland {formatPct(finland)} ({finlandYear})
      </p>
    </figure>
  );
}
