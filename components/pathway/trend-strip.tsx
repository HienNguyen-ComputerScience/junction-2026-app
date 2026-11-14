import { cn } from "cn";

import { StepMark } from "@/components/pathway/pathway-steps";
import { SourceChip } from "@/components/source-chip";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import type { GapStatus } from "@/lib/data";
import { formatPct } from "@/lib/ranking";

export type TrendPoint = { year: number; value: number | null };

/** One step's trend: its values by year, Finland's by year, and the step it belongs to. */
export type TrendStage = {
  step: number;
  title: string;
  status: GapStatus;
  sourceId: string;
  /** The year the status judges (the latest). */
  year: number;
  /** Which way is better: "lower is better", "higher is faster". */
  direction: string;
  trend: TrendPoint[];
  /** Finland's value for each year of the trend, where published (same indicator). */
  nationalTrend: TrendPoint[];
};

/** Points with a value, in year order. */
const valued = (trend: TrendPoint[]) =>
  trend.filter((point): point is { year: number; value: number } => point.value !== null);

/**
 * The trends of the measured steps, in one panel under the steps: per step the change since the
 * first year, then the bars by year with one highlighted bar and the Finland line. A step with
 * an indicator but no values gets one quiet line.
 */
export function TrendStrip({ stages, areaName }: { stages: TrendStage[]; areaName: string }) {
  const withTrend = stages.filter((stage) => valued(stage.trend).length > 0);
  const without = stages.filter((stage) => valued(stage.trend).length === 0);
  const years = stages[0]?.trend ?? [];
  if (years.length === 0) return null;
  const span = `${years[0].year}–${years[years.length - 1].year}`;
  // Said once for the panel: only the latest year is judged, so only its column has a status colour.
  const judgedYear = withTrend.find((stage) => {
    const points = valued(stage.trend);
    return points[points.length - 1].year === stage.year;
  })?.year;
  // The chips of the panel's numbers, once each, in the label strip.
  const sourceIds = [...new Set(withTrend.map((stage) => stage.sourceId))];

  return (
    <FramePanel padding="none" role="group" aria-labelledby="trend-heading">
      <FramePanelLabel>
        <h3 id="trend-heading" className="font-sans type-caption font-medium tracking-normal">
          Trend, {span}
          {judgedYear !== undefined && (
            <span className="font-normal text-muted-foreground"> · Only {judgedYear} has a status</span>
          )}
        </h3>
        <span className="flex flex-wrap items-center gap-1.5 font-normal">
          {sourceIds.map((id) => (
            <SourceChip key={id} sourceId={id} />
          ))}
        </span>
      </FramePanelLabel>
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
        {withTrend.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {withTrend.map((stage) => (
              <TrendRow key={stage.step} stage={stage} />
            ))}
          </ul>
        )}
        {without.map((stage) => (
          <p key={stage.step} className="type-caption text-muted-foreground">
            <span className="font-medium text-foreground">{stage.title}:</span> no values published for{" "}
            {areaName} in {span}.
          </p>
        ))}
      </div>
    </FramePanel>
  );
}

/** The one judged column of a trend (the latest year), in its status colour. */
export const TREND_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber-bar",
  no_data: "bg-status-grey",
};
/** Earlier years have no status (only the latest year is judged): quiet and neutral. */
export const TREND_PAST_FILL = "bg-foreground/25";

/**
 * The judged column when it is worse than Finland, drawn by the bar rule of measure-bar.tsx
 * turned upright: tinted red, with the solid red on the gap to Finland's value. A wait share
 * runs past the tick (solid above it); a referral share stops short of it (solid up to it).
 */
export function WorseColumn({ value, finland }: { value: number; finland: number }) {
  const low = Math.min(value, finland);
  const high = Math.max(value, finland);
  return (
    <>
      <span className="absolute inset-x-0 bottom-0 bg-status-red-tint" style={{ height: `${low}%` }} />
      <span
        className="absolute inset-x-0 rounded-t-[3px] bg-status-red"
        style={{ bottom: `${low}%`, height: `${high - low}%` }}
      />
    </>
  );
}

function TrendRow({ stage }: { stage: TrendStage }) {
  const points = valued(stage.trend);
  const first = points[0];
  const last = points[points.length - 1];
  const latestIndex = stage.trend.findIndex((point) => point.year === last.year);
  const change = Math.round((last.value - first.value) * 10) / 10;
  // In words, never an arrow or a sign: a rising wait share is worse, a rising referral share faster.
  const faster = stage.direction === "higher is faster";
  const word = change > 0 ? (faster ? "faster" : "worse") : faster ? "slower" : "better";

  return (
    <li className="grid gap-x-10 gap-y-5 py-5 first:pt-0 last:pb-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 lg:py-2">
        <p className="flex items-center gap-2 text-[0.9375rem] leading-snug font-semibold">
          <StepMark step={stage.step} status={stage.status} className="size-5 text-[0.6875rem]" />
          <span>
            <span className="sr-only">Step {stage.step}: </span>
            {stage.title}
          </span>
        </p>
        {first.year < last.year && (
          <dl className="flex flex-col gap-1.5">
            <dt className="type-caption text-muted-foreground">Since {first.year}</dt>
            <dd className="flex items-baseline gap-1.5 whitespace-nowrap">
              {change === 0 ? (
                <span className="numeral text-[2.25rem] leading-none text-foreground">No change</span>
              ) : (
                <>
                  <span className="numeral text-[2.25rem] leading-none text-foreground">{Math.abs(change).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">pts {word}</span>
                </>
              )}
            </dd>
            <dd className="type-caption text-muted-foreground">
              <span className="figure">{formatPct(first.value)}</span> in {first.year}
            </dd>
          </dl>
        )}
      </div>

      <TrendChart
        trend={stage.trend}
        nationalTrend={stage.nationalTrend}
        latestIndex={latestIndex}
        latestYear={stage.year}
        status={stage.status}
      />
    </li>
  );
}

/**
 * Columns by year on a zero-based 0 to 100% scale, so 58.0 and 85.4 look as different as they
 * are. Only the latest year is judged and drawn in its status colour; earlier years are neutral
 * grey. Finland is drawn per year: a short white tick at that year's own Finland value on that
 * year's bar, labelled once, under the year on the axis (never between the bars). A year without a
 * published Finland value has no tick, and the line under the chart says so.
 */
function TrendChart({
  trend,
  nationalTrend,
  latestIndex,
  latestYear,
  status,
}: {
  trend: TrendPoint[];
  nationalTrend: TrendPoint[];
  latestIndex: number;
  latestYear: number;
  status: GapStatus;
}) {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const finlandOf = (year: number) => nationalTrend.find((point) => point.year === year)?.value ?? null;
  // Value labels sit 6px above their bar. One that would cover the Finland tick of its own
  // column moves just above the tick instead.
  const PLOT = 176;
  const LABEL = 20;
  const labelBottom = (value: number, finland: number | null, gapAbove: boolean) => {
    const bottom = (clamp(value) / 100) * PLOT + 6;
    if (finland === null) return bottom;
    const tickPx = (clamp(finland) / 100) * PLOT;
    // A red gap drawn from the value up to the tick: the label clears the tick, not the value.
    if (gapAbove) return tickPx + 5;
    return bottom < tickPx + 3 && bottom + LABEL > tickPx - 3 ? tickPx + 5 : bottom;
  };
  const judged = trend[latestIndex]?.year === latestYear;
  const shown = trend.filter((point) => point.value !== null);
  const ticks = shown.filter((point) => finlandOf(point.year) !== null);
  // The ticks are labelled on the chart, so the line under it only says when one is missing.
  const tickText =
    ticks.length === 0
      ? "No Finland value is published for these years."
      : ticks.length === shown.length
        ? ""
        : `Finland's value is published for ${ticks.map((point) => point.year).join(", ")} only.`;

  return (
    <figure className="flex w-full min-w-0 flex-col gap-3">
      <div aria-hidden className="flex flex-col gap-2 pt-5">
        <div className="relative h-44 border-b border-foreground/40">
          <div className="absolute inset-0 flex gap-4 px-1 sm:gap-10 sm:px-4">
            {trend.map((point, i) => {
              const finland = finlandOf(point.year);
              const worse =
                judged && i === latestIndex && status === "red" && finland !== null && point.value !== null;
              return (
                <div key={point.year} className="relative flex h-full flex-1 items-end justify-center">
                  {point.value === null ? (
                    <span className="pb-1 type-caption text-faint">No data</span>
                  ) : (
                    <>
                      <div className="relative h-full w-full max-w-28">
                        {worse ? (
                          <WorseColumn value={clamp(point.value)} finland={clamp(finland)} />
                        ) : (
                          <span
                            className={cn(
                              "absolute inset-x-0 bottom-0 rounded-t-[3px]",
                              judged && i === latestIndex ? TREND_FILL[status] : TREND_PAST_FILL,
                            )}
                            style={{ height: `${clamp(point.value)}%` }}
                          />
                        )}
                        {finland !== null && (
                          <span
                            className="absolute -inset-x-1.5 h-0.5 bg-foreground"
                            style={{ bottom: `calc(${clamp(finland)}% - 1px)` }}
                          />
                        )}
                      </div>
                      <span
                        className={cn(
                          "absolute z-10 bg-card px-1 figure text-[0.8125rem] leading-5",
                          i === latestIndex ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                        style={{ bottom: `${labelBottom(point.value, finland, worse && point.value < finland)}px` }}
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
        <div className="flex gap-4 px-1 sm:gap-10 sm:px-4">
          {trend.map((point) => {
            const finland = finlandOf(point.year);
            return (
              <span key={point.year} className="flex flex-1 flex-col items-center text-center">
                <span className="figure text-[0.8125rem] text-muted-foreground">{point.year}</span>
                {finland !== null && point.value !== null && (
                  <span className="type-note text-muted-foreground">
                    Finland <span className="figure text-foreground">{formatPct(finland)}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
      {tickText && <figcaption className="type-caption text-muted-foreground">{tickText}</figcaption>}
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
