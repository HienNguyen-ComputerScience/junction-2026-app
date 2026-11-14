import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import type { GapStatus } from "@/lib/data";
import { gapToFinland } from "@/components/ranking/ranking-list";
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
    /** Finland's value for each year of the trend, where published (same indicator). */
    nationalTrend?: TrendPoint[];
    /** Which way is better: "lower is better", "higher is faster". */
    direction?: string;
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
 * Rows every step fills, in the act page's order: title, status and source, key figure, change
 * against Finland, sentence, bar. From lg up the three steps sit in equal columns on a shared
 * subgrid, so each row lines up across them. The trends are not part of the cards: they share
 * one strip under the steps (TrendStrip).
 */
export const STAGE_ROWS = 6;

/** The mark of a step: a numbered dot, coloured by status. Decorative; the title carries the number. */
function StepMark({ step, status, className = "" }: { step: number; status: GapStatus; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums",
        NODE[status],
        className,
      )}
    >
      {step}
    </span>
  );
}

/**
 * Below lg the steps stack and a vertical rail joins their marks. From lg up the marks sit in
 * the step's own title row (StageCard) and the path is drawn there, so the rail is hidden.
 */
export function StepRail({
  step,
  status,
  last,
}: {
  step: number;
  status: GapStatus;
  last: boolean;
}) {
  return (
    <div aria-hidden className="flex flex-col items-center lg:hidden">
      <StepMark step={step} status={status} className="flex" />
      {!last && <span className="w-px flex-1 bg-foreground/30" />}
    </div>
  );
}

/**
 * One step of the pathway, built like a column of the act page's stat strip: mark and title,
 * status with its source chip beside it, the figure, the gap to Finland, the sentence, the
 * bar. Always the same rows (STAGE_ROWS), empty or not, so the three steps share baselines.
 * From lg up a thin line runs from the end of the title to the next step's mark.
 */
export function StageCard({ step, title, status, measure, emptyText, last = false }: StageCardProps & { last?: boolean }) {
  const hasValue = measure !== undefined && measure.value !== null;
  return (
    <article className="flex min-w-0 flex-col lg:row-span-6 lg:grid lg:grid-rows-subgrid">
      <div className="flex items-start gap-3">
        <StepMark step={step} status={status} className="hidden lg:flex" />
        <h3 className="font-heading text-base leading-7 font-semibold tracking-normal text-pretty">
          <span className="sr-only">Step {step}: </span>
          {title}
        </h3>
        {!last && (
          <span aria-hidden className="mt-3.5 mr-[-1.5rem] ml-1 hidden h-px min-w-3 flex-1 items-center bg-foreground/30 lg:flex" />
        )}
      </div>

      <div className="flex flex-wrap content-start items-center gap-x-2 gap-y-2 pt-3">
        <StatusBadge status={status} size="xs">
          {STATUS_LABEL[status]}
        </StatusBadge>
        {/* On a phone the year drops off so badge and chip share a line; the frame title says 2025. */}
        {measure && (
          <>
            <span className="contents sm:hidden">
              <SourceChip sourceId={measure.sourceId} />
            </span>
            <span className="hidden sm:contents">
              <SourceChip sourceId={measure.sourceId} year={measure.year} />
            </span>
          </>
        )}
      </div>

      {hasValue ? (
        <>
          <p className={cn("pt-5 numeral text-[2rem]", STATUS_FIGURE[status])}>{formatPct(measure.value ?? 0)}</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 pt-2 type-note text-muted-foreground">
            <span className={cn("figure font-medium", STATUS_FIGURE[status])}>
              {gapToFinland(measure.value ?? 0, measure.nationalValue)}
            </span>
            <span>vs Finland{measure.direction ? `, ${measure.direction}` : null}</span>
          </p>
          <p className="pt-3 type-caption text-pretty text-muted-foreground">{measure.caption}</p>
        </>
      ) : measure ? (
        <>
          <p className="pt-5 text-[0.9375rem] leading-snug text-pretty text-muted-foreground lg:self-end">
            {withPercentFigures(measure.note)}
          </p>
          <span aria-hidden className="max-lg:hidden" />
          <p className="pt-3 type-caption text-pretty text-muted-foreground">
            Finland: <span className="figure">{formatPct(measure.nationalValue)}</span> {measure.caption}
          </p>
        </>
      ) : (
        <>
          <p className="pt-5 text-[0.9375rem] leading-snug text-pretty text-muted-foreground lg:self-end">
            No public data anywhere in Finland
          </p>
          <span aria-hidden className="max-lg:hidden" />
          <p className="pt-3 type-caption text-pretty text-muted-foreground">{emptyText}</p>
        </>
      )}

      <div className="flex flex-col gap-2 pt-5 lg:self-end">
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

/** The one judged bar of a trend (the latest year), in its status colour. */
const TREND_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber-bar",
  no_data: "bg-status-grey",
};
/** Earlier years are not judged against the latest Finland value: neutral grey. */
const TREND_PAST_FILL = "bg-foreground/25";

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
          <StepMark step={stage.step} status={stage.status} className="flex size-5 text-[0.6875rem]" />
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
        nationalTrend={measure.nationalTrend ?? []}
        latestIndex={latestIndex}
        latestYear={measure.year}
        sourceId={measure.sourceId}
        status={stage.status}
      />
    </li>
  );
}

/**
 * Columns by year on a zero-based 0 to 100% scale, so 58.0 and 85.4 look as different as they
 * are. Only the latest year is judged and drawn in its status colour; earlier years are neutral
 * grey. Finland is drawn per year: a short white tick at that year's own Finland value on that
 * year's bar, with a small label beside it (below the year on a phone). A year without a
 * published Finland value has no tick, and the legend says so.
 */
function TrendChart({
  trend,
  nationalTrend,
  latestIndex,
  latestYear,
  sourceId,
  status,
}: {
  trend: TrendPoint[];
  nationalTrend: TrendPoint[];
  latestIndex: number;
  latestYear: number;
  sourceId: string;
  status: GapStatus;
}) {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const finlandOf = (year: number) => nationalTrend.find((point) => point.year === year)?.value ?? null;
  // Value labels sit 6px above their bar. One that would cover the Finland tick of its own
  // column moves just above the tick instead.
  const PLOT = 128;
  const LABEL = 20;
  const labelBottom = (value: number, finland: number | null) => {
    const bottom = (clamp(value) / 100) * PLOT + 6;
    if (finland === null) return bottom;
    const tickPx = (clamp(finland) / 100) * PLOT;
    return bottom < tickPx + 3 && bottom + LABEL > tickPx - 3 ? tickPx + 5 : bottom;
  };
  const judged = trend[latestIndex]?.year === latestYear;
  const shown = trend.filter((point) => point.value !== null);
  const ticks = shown.filter((point) => finlandOf(point.year) !== null);
  const colourText = judged
    ? `${latestYear} is coloured by its status; earlier years are grey.`
    : "All bars are grey.";
  const tickText =
    ticks.length === 0
      ? "No Finland value is drawn for these years."
      : ticks.length === shown.length
        ? "The white tick on each bar is Finland's value in that same year."
        : `The white tick is Finland's value in that same year, drawn only where it is published (${ticks
            .map((point) => point.year)
            .join(", ")}).`;

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="type-note text-muted-foreground">Share by year, 0 to 100% scale</span>
        <SourceChip sourceId={sourceId} />
      </figcaption>
      <div aria-hidden className="flex flex-col gap-2 pt-6">
        <div className="relative h-32 border-b border-foreground/40">
          <div className="absolute inset-0 flex gap-3 px-1 sm:gap-6 sm:px-3">
            {trend.map((point, i) => {
              const finland = finlandOf(point.year);
              return (
                <div key={point.year} className="relative flex h-full flex-1 items-end justify-center">
                  {point.value === null ? (
                    <span className="pb-1 type-note text-faint">No data</span>
                  ) : (
                    <>
                      <div className="relative h-full w-full max-w-24">
                        <span
                          className={cn(
                            "absolute inset-x-0 bottom-0 rounded-t-[3px]",
                            judged && i === latestIndex ? TREND_FILL[status] : TREND_PAST_FILL,
                          )}
                          style={{ height: `${clamp(point.value)}%` }}
                        />
                        {finland !== null && (
                          <>
                            <span
                              className="absolute -inset-x-1 h-0.5 bg-foreground"
                              style={{ bottom: `calc(${clamp(finland)}% - 1px)` }}
                            />
                            <span
                              className="absolute left-full ml-2.5 flex translate-y-1/2 flex-col whitespace-nowrap type-note leading-4 text-muted-foreground max-sm:hidden"
                              style={{ bottom: `${clamp(finland)}%` }}
                            >
                              <span>Finland</span>
                              <span className="figure text-foreground">{formatPct(finland)}</span>
                            </span>
                          </>
                        )}
                      </div>
                      <span
                        className={cn(
                          "absolute z-10 bg-card px-1 figure text-[0.8125rem] leading-5",
                          i === latestIndex ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                        style={{ bottom: `${labelBottom(point.value, finland)}px` }}
                      >
                        {formatPct(point.value)}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3 px-1 sm:gap-6 sm:px-3">
          {trend.map((point) => {
            const finland = finlandOf(point.year);
            return (
              <span key={point.year} className="flex flex-1 flex-col items-center text-center">
                <span className="figure text-[0.8125rem] text-muted-foreground">{point.year}</span>
                {finland !== null && point.value !== null && (
                  <span className="type-note text-muted-foreground sm:hidden">
                    Finland <span className="figure">{formatPct(finland)}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <p className="type-note text-muted-foreground">
        {colourText} {tickText}
      </p>
      <p className="sr-only">
        {trend
          .map((point) => {
            const finland = finlandOf(point.year);
            return `${point.year}: ${point.value === null ? "no data" : formatPct(point.value)}${
              finland === null ? "" : `, Finland ${formatPct(finland)}`
            }`;
          })
          .join("; ")}
        .
      </p>
    </figure>
  );
}
