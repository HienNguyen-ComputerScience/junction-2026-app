import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { TREND_FILL, TREND_PAST_FILL, WorseColumn } from "@/components/pathway/trend-strip";
import { SourceChip } from "@/components/source-chip";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status-badge";
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
 * since the first year of the trend. Per row the change since then as the key figure, the
 * latest value with its status chip, and a small column chart of the years with each value
 * printed above its bar. One source chip for the panel; each row links to the area's pathway.
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
      <FramePanel padding="none" className="pb-1">
        <FramePanelLabel>
          <h3 className="font-sans type-caption font-medium tracking-normal text-muted-foreground">
            Largest rises, in percentage points, in non-urgent GP visits waiting over 7 days, {FIRST_YEAR}–{LAST_YEAR}
            {finland !== null && (
              <>
                {" "}
                · White line: Finland <span className="figure text-foreground">{formatPct(finland)}</span>
              </>
            )}
          </h3>
          <SourceChip sourceId={sourceId} />
        </FramePanelLabel>
        <ol>
          {list.map((row, index) => {
            const status = stageStatus(row.id, "gp_access");
            return (
              <li key={row.id}>
                <Link
                  href={`/county/${row.id}`}
                  className={`group relative grid min-h-16 grid-cols-1 items-center gap-x-5 gap-y-1.5 py-3 pr-10 pl-4 transition-colors outline-none hover:bg-accent focus-visible:z-[1] focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:pl-5 lg:grid-cols-[11rem_14rem_minmax(0,1fr)_13.75rem] ${index > 0 ? "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-foreground/[0.06] sm:before:inset-x-5" : ""}`}
                >
                  <span className="text-[0.9375rem] font-semibold text-foreground">{row.name}</span>
                  <span className="text-[0.9375rem] leading-snug font-medium whitespace-nowrap text-foreground">
                    <span className="figure">{formatAmount(row.change)}</span> points worse since {FIRST_YEAR}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="type-caption text-muted-foreground">
                      <span className="figure text-foreground">{formatPct(row.latest)}</span> in {LAST_YEAR}
                    </span>
                    <StatusBadge status={status} size="xs">
                      {STATUS_LABEL[status]}
                    </StatusBadge>
                  </span>
                  <MiniTrend
                    trend={trends.get(row.id) ?? []}
                    finland={finland}
                    status={status}
                    className="lg:justify-self-end"
                  />
                  <ChevronRight
                    aria-hidden
                    strokeWidth={1.75}
                    className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint transition-colors group-hover:text-foreground group-focus-visible:text-foreground sm:right-4"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </FramePanel>
  );
}

/** Height of the zero-based plot (0 to 100%), in px. Labels sit in the headroom above it. */
const PLOT = 40;

/**
 * The years as three zero-based columns (0 to 100%), each value printed above its bar. Only
 * the latest year has a status, so it alone is drawn by the bar rule (tinted red to Finland's
 * line, solid red beyond, or slate); earlier years are neutral grey. Finland's latest value is
 * the thin line across the latest column, named once in the section's description.
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
    <span className={cn("flex w-[13.75rem] max-w-full flex-col gap-1", className)}>
      <span aria-hidden className="flex h-[3.5rem] items-end gap-3 border-b border-foreground/30 px-2">
        {trend.map((point, i) => {
          // The label clears the bar, and Finland's line on the latest column.
          const top = Math.max(point.value ?? 0, i === last && finland !== null ? finland : 0);
          return (
            <span key={point.year} className="relative h-full flex-1">
              {point.value !== null && (
                <>
                  <span className="absolute inset-x-0 bottom-0 block" style={{ height: PLOT }}>
                    {i === last && status === "red" && finland !== null ? (
                      <WorseColumn value={clamp(point.value)} finland={clamp(finland)} />
                    ) : (
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-0 rounded-t-[2px]",
                          i === last ? TREND_FILL[status] : TREND_PAST_FILL,
                        )}
                        style={{ height: `${clamp(point.value)}%` }}
                      />
                    )}
                    {i === last && finland !== null && (
                      <span
                        className="absolute -inset-x-1 h-0.5 bg-foreground"
                        style={{ bottom: `calc(${clamp(finland)}% - 1px)` }}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-0 text-center figure type-note whitespace-nowrap",
                      i === last ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                    style={{ bottom: (clamp(top) / 100) * PLOT + 4 }}
                  >
                    {formatPct(point.value)}
                  </span>
                </>
              )}
            </span>
          );
        })}
      </span>
      <span aria-hidden className="flex gap-3 px-2 type-note text-faint">
        {trend.map((point) => (
          <span key={point.year} className="flex flex-1 justify-center figure whitespace-nowrap">
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
