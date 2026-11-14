import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { TREND_FILL, TREND_PAST_FILL, WorseColumn } from "@/components/pathway/trend-strip";
import { SourceChip } from "@/components/source-chip";
import { Frame, FrameDescription, FrameHeader, FrameMeta, FramePanel, FrameTitle } from "@/components/ui/frame";
import type { County, GapStatus } from "@/lib/data";
import {
  FIRST_YEAR,
  formatPct,
  getNationalValue,
  getTrend,
  GP_WAIT_ID,
  STATUS_LABEL,
  stageStatus,
  YEARS,
} from "@/lib/ranking";
import { formatAmount, worseningFastest } from "@/lib/what-if";

const LAST_YEAR = YEARS[YEARS.length - 1];

type Point = { year: number; value: number | null };

/**
 * Early warning: the areas whose share of non-urgent GP visits waiting over 7 days rose most
 * since the first year of the trend. Per row a small column chart of the years, the change in
 * words (no arrow, no colour) and the latest value. One source chip for the panel; each row
 * links to the area's pathway.
 */
export function EarlyWarning({ areas, sourceId }: { areas: County[]; sourceId: string }) {
  const trends = new Map<string, Point[]>(
    areas.map((county) => [
      county.id,
      getTrend(county.id, GP_WAIT_ID).map(({ year, value }) => ({ year, value: value?.value ?? null })),
    ]),
  );
  const list = worseningFastest(
    areas.map((county) => {
      const trend = trends.get(county.id) ?? [];
      return {
        id: county.id,
        name: county.name,
        first: trend[0]?.value ?? null,
        latest: trend[trend.length - 1]?.value ?? null,
      };
    }),
    "lower",
  );
  if (list.length === 0) return null;
  const finland = getNationalValue(GP_WAIT_ID)?.value ?? null;

  return (
    <Frame aria-labelledby="warning-heading">
      <FrameHeader>
        <FrameTitle id="warning-heading">
          Getting worse fastest, {FIRST_YEAR}–{LAST_YEAR}
        </FrameTitle>
        <FrameMeta>
          <SourceChip sourceId={sourceId} />
        </FrameMeta>
        <FrameDescription>
          Non-urgent GP visits waiting over 7 days: the {list.length === 1 ? "largest rise" : `${list.length} largest rises`}{" "}
          since {FIRST_YEAR}.
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="none" className="py-1">
        <ol>
          {list.map((row, index) => (
            <li key={row.id}>
              <Link
                href={`/county/${row.id}`}
                className={`group relative grid min-h-12 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 py-2 pr-10 pl-4 transition-colors outline-none hover:bg-accent focus-visible:z-[1] focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[minmax(0,13rem)_minmax(0,12rem)_minmax(0,1fr)_auto] sm:pl-5 ${index > 0 ? "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-foreground/[0.06] sm:before:inset-x-5" : ""}`}
              >
                <span className="text-[0.9375rem] font-medium text-foreground">{row.name}</span>
                <span className="col-start-1 type-caption text-muted-foreground sm:col-start-2 sm:row-start-1 sm:text-sm">
                  <span className="figure">{formatAmount(row.change)} pts</span> worse since {FIRST_YEAR}
                </span>
                <MiniTrend
                  trend={trends.get(row.id) ?? []}
                  finland={finland}
                  status={stageStatus(row.id, "gp_access")}
                  className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1 sm:justify-self-center"
                />
                <span className="col-start-3 row-span-2 row-start-1 text-right type-caption text-muted-foreground sm:col-start-4 sm:row-span-1 sm:text-sm">
                  <span className="figure text-foreground">{formatPct(row.latest)}</span> in {LAST_YEAR}
                </span>
                <ChevronRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint transition-colors group-hover:text-foreground group-focus-visible:text-foreground sm:right-4"
                />
              </Link>
            </li>
          ))}
        </ol>
      </FramePanel>
    </Frame>
  );
}

/**
 * The years as three small zero-based columns (0 to 100%). Only the latest year has a status,
 * so it alone is drawn by the bar rule (tinted red to Finland's line, solid red beyond, or
 * slate); earlier years are neutral grey. Finland's latest value is the thin line across the
 * latest column. The page's one key (under the map) names the marks.
 */
function MiniTrend({
  trend,
  finland,
  status,
  className,
}: {
  trend: Point[];
  finland: number | null;
  status: GapStatus;
  className?: string;
}) {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const last = trend.length - 1;
  return (
    <span className={cn("flex flex-col gap-1", className)}>
      <span aria-hidden className="flex h-8 items-end gap-2 border-b border-foreground/30 px-1 sm:gap-3">
        {trend.map((point, i) => (
          <span key={point.year} className="relative h-full w-4 sm:w-6">
            {point.value !== null &&
              (i === last && status === "red" && finland !== null ? (
                <WorseColumn value={clamp(point.value)} finland={clamp(finland)} />
              ) : (
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 rounded-t-[2px]",
                    i === last ? TREND_FILL[status] : TREND_PAST_FILL,
                  )}
                  style={{ height: `${clamp(point.value)}%` }}
                />
              ))}
            {i === last && finland !== null && (
              <span
                className="absolute -inset-x-1 h-0.5 bg-foreground"
                style={{ bottom: `calc(${clamp(finland)}% - 1px)` }}
              />
            )}
          </span>
        ))}
      </span>
      <span aria-hidden className="flex gap-2 px-1 type-note text-faint max-sm:hidden sm:gap-3">
        {trend.map((point) => (
          <span key={point.year} className="flex w-4 justify-center figure whitespace-nowrap sm:w-6">
            {point.year}
          </span>
        ))}
      </span>
      <span className="sr-only">
        {trend.map((point) => `${point.year}: ${point.value === null ? "no data" : formatPct(point.value)}`).join(", ")}
        {finland !== null && `; Finland ${formatPct(finland)} in ${trend[last]?.year}`}; {STATUS_LABEL[status]}.
      </span>
    </span>
  );
}
