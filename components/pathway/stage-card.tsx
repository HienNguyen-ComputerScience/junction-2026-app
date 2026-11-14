import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
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
 * Rows every step card fills, in order: title, status row, key content, bar. From lg up the
 * cards sit side by side on a shared subgrid, so the same row lines up across all three. The
 * trends are not part of the cards: they share one strip under the steps (TrendStrip).
 */
export const STAGE_ROWS = 4;

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
 * One step of the pathway: status and source on one row, the key number and its bar against
 * Finland. Always renders the same four rows (see STAGE_ROWS), empty or not, so the three steps
 * share baselines.
 */
export function StageCard({ step, title, status, measure, emptyText }: StageCardProps) {
  return (
    <article className="flex min-w-0 flex-col lg:row-span-4 lg:grid lg:grid-rows-subgrid">
      <h3 className="type-heading lg:pt-2.5">
        <span className="sr-only">Step {step}: </span>
        {title}
      </h3>

      {/* The source sits with the status, so it is on screen with the number it backs. On a
          phone and in the three-column row the chip drops the year (the frame title carries it),
          so even the long amber label and the chip fit on one line. */}
      <div className="flex flex-wrap content-start items-center gap-2 pt-2">
        <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
        {measure && (
          <>
            <span className="contents sm:max-lg:hidden">
              <SourceChip sourceId={measure.sourceId} />
            </span>
            <span className="hidden sm:max-lg:contents">
              <SourceChip sourceId={measure.sourceId} year={measure.year} />
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-4 text-sm text-pretty">
        {measure && measure.value !== null ? (
          <>
            <p className={`numeral text-[3.25rem] ${STATUS_FIGURE[status]}`}>
              {formatPct(measure.value)}
            </p>
            <p className="max-w-[34ch]">{measure.caption}</p>
          </>
        ) : measure ? (
          <>
            <p>{withPercentFigures(measure.note)}</p>
            <p className="text-muted-foreground">
              Finland: <span className="figure">{formatPct(measure.nationalValue)}</span> {measure.caption}
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
    </article>
  );
}

/**
 * A data sentence with its percentages set in the figure face, as on the act page. The words,
 * and "3 days" or "2025", stay in the text face. Presentation only.
 */
export function withPercentFigures(text: string): ReactNode {
  return text.split(/(\d+(?:\.\d+)?%)/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="figure">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Points with a value, in year order. */
const valued = (trend: TrendPoint[]) =>
  trend.filter((point): point is { year: number; value: number } => point.value !== null);

/** "+27.4" / "−7.9" (points): one decimal, a true minus sign, rounded before signing. */
function formatPts(diff: number): string {
  const rounded = Math.round(diff * 10) / 10;
  if (rounded === 0) return "0.0";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(1)}`;
}

/**
 * The trends of every step, in one strip under the steps: per step a compact pair of figures
 * (change since the first year, gap to Finland), then the bars by year with one highlighted
 * bar and the Finland line. A step with an indicator but no values gets one quiet line; the
 * step without an indicator is left out (its card already says so).
 */
export function TrendStrip({ stages, areaName }: { stages: StageCardProps[]; areaName: string }) {
  const withTrend = stages.filter((stage) => stage.measure && valued(stage.measure.trend).length > 0);
  const without = stages.filter((stage) => stage.measure && valued(stage.measure.trend).length === 0);
  const years = stages.find((stage) => stage.measure)?.measure?.trend ?? [];
  if (years.length === 0) return null;
  const span = `${years[0].year}–${years[years.length - 1].year}`;

  return (
    <section aria-labelledby="trend-heading" className="flex flex-col gap-5 border-t border-border px-4 pt-5 pb-6 sm:px-6">
      <h3 id="trend-heading" className="type-heading">
        Trend, {span}
      </h3>
      {withTrend.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {withTrend.map((stage) => (
            <TrendRow key={stage.step} stage={stage} />
          ))}
        </ul>
      )}
      {without.map((stage) => (
        <p key={stage.step} className="type-caption text-muted-foreground">
          <span className="font-medium text-foreground">{stage.title}:</span> no values published for {areaName} in{" "}
          {span}, so there is no trend to draw.
        </p>
      ))}
    </section>
  );
}

/** Bar fills of the trend: the latest year at full strength, earlier years tinted. */
const TREND_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber-bar",
  no_data: "bg-status-grey",
};

function TrendRow({ stage }: { stage: StageCardProps }) {
  const measure = stage.measure;
  if (!measure) return null;
  const points = valued(measure.trend);
  const first = points[0];
  const last = points[points.length - 1];
  const latestIndex = measure.trend.findIndex((point) => point.year === last.year);
  const finland = measure.nationalValue;
  const gap = last.year === measure.year ? last.value - finland : null;
  const higherIsFaster = measure.caption.includes("higher is faster");

  const tiles = [
    first.year < last.year && {
      label: `Since ${first.year}`,
      value: formatPts(last.value - first.value),
      tone: "text-foreground",
      note: `${formatPct(first.value)} in ${first.year}`,
    },
    gap !== null && {
      label: "vs Finland",
      value: formatPts(gap),
      tone: STATUS_FIGURE[stage.status],
      note: `Finland ${formatPct(finland)} in ${measure.year}`,
    },
  ].filter((tile) => tile !== false);

  return (
    <li className="grid gap-x-10 gap-y-5 py-5 first:pt-0 last:pb-0 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-[0.9375rem] leading-snug font-semibold">
          <span
            aria-hidden
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] tabular-nums",
              NODE[stage.status],
            )}
          >
            {stage.step}
          </span>
          <span>
            <span className="sr-only">Step {stage.step}: </span>
            {stage.title}
          </span>
        </p>
        {tiles.length > 0 && (
          <dl
            className={cn(
              "grid divide-x divide-border rounded-lg border border-border bg-muted",
              tiles.length === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {tiles.map((tile) => (
              <div key={tile.label} className="flex min-w-0 flex-col gap-1.5 px-3.5 py-3">
                <dt className="type-note text-muted-foreground">{tile.label}</dt>
                <dd className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className={cn("numeral text-[1.625rem]", tile.tone)}>{tile.value}</span>
                  <span className="type-caption text-muted-foreground">pts</span>
                </dd>
                <dd className="type-note text-muted-foreground">{withPercentFigures(tile.note)}</dd>
              </div>
            ))}
          </dl>
        )}
        {higherIsFaster && <p className="type-note text-muted-foreground">Higher is faster</p>}
      </div>

      <TrendChart
        trend={measure.trend}
        latestIndex={latestIndex}
        finland={finland}
        finlandYear={measure.year}
        sourceId={measure.sourceId}
        status={stage.status}
      />
    </li>
  );
}

/**
 * Columns by year on a zero-based 0 to 100% scale, so 58.0 and 85.4 look as different as they
 * are. The latest year is the one highlighted bar, in its status colour; earlier years are the
 * same colour tinted. The Finland line crosses every column, labelled at its right end.
 */
function TrendChart({
  trend,
  latestIndex,
  finland,
  finlandYear,
  sourceId,
  status,
}: {
  trend: TrendPoint[];
  latestIndex: number;
  finland: number;
  finlandYear: number;
  sourceId: string;
  status: GapStatus;
}) {
  const f = Math.min(100, Math.max(0, finland));
  // Value labels sit 6px above their bar. One that would straddle the Finland line moves just
  // above it instead, so the line stays one unbroken line.
  const PLOT = 128;
  const LABEL = 20;
  const finlandPx = (f / 100) * PLOT;
  const labelBottom = (value: number) => {
    const bottom = (Math.min(100, Math.max(0, value)) / 100) * PLOT + 6;
    return bottom < finlandPx + 3 && bottom + LABEL > finlandPx - 3 ? finlandPx + 5 : bottom;
  };
  return (
    <figure className="flex min-w-0 flex-col gap-3 lg:max-w-[44rem]">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="type-note text-muted-foreground">Share by year, 0 to 100% scale</span>
        <SourceChip sourceId={sourceId} />
      </figcaption>
      <div aria-hidden className="flex flex-col gap-2 pt-6">
        <div className="flex gap-3">
          <div className="relative h-32 flex-1 border-b border-foreground/40">
            <div className="absolute inset-0 flex gap-3 px-1 sm:gap-6 sm:px-3">
              {trend.map((point, i) => (
                <div key={point.year} className="relative flex h-full flex-1 items-end justify-center">
                  {point.value === null ? (
                    <span className="pb-1 type-note text-faint">No data</span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          "w-full max-w-24 rounded-t-[3px]",
                          TREND_FILL[status],
                          i !== latestIndex && "opacity-40",
                        )}
                        style={{ height: `${Math.min(100, Math.max(0, point.value))}%` }}
                      />
                      <span
                        className={cn(
                          "absolute z-10 bg-card px-1 figure text-[0.8125rem] leading-5",
                          i === latestIndex ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                        style={{ bottom: `${labelBottom(point.value)}px` }}
                      >
                        {formatPct(point.value)}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <span className="absolute inset-x-0 h-px bg-foreground" style={{ bottom: `${f}%` }} />
          </div>
          <div className="relative h-32 w-24 shrink-0">
            <span
              className="absolute left-0 flex translate-y-1/2 flex-col type-note"
              style={{ bottom: `${f}%` }}
            >
              <span className="font-medium whitespace-nowrap text-foreground">
                Finland <span className="figure">{formatPct(finland)}</span>
              </span>
              <span className="text-muted-foreground">in {finlandYear}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 gap-3 px-1 sm:gap-6 sm:px-3">
            {trend.map((point) => (
              <span key={point.year} className="flex-1 text-center type-mark text-faint">
                {point.year}
              </span>
            ))}
          </div>
          <div className="w-24 shrink-0" />
        </div>
      </div>
      <p className="sr-only">
        {trend
          .map((point) => `${point.year}: ${point.value === null ? "no data" : formatPct(point.value)}`)
          .join(", ")}
        . Finland {formatPct(finland)} in {finlandYear}.
      </p>
    </figure>
  );
}
