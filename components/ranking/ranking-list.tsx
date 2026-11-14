import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SourceChip } from "@/components/source-chip";
import { STATUS_FILL, STATUS_INK, StatusBadge } from "@/components/ui/status-badge";
import { LATEST_YEAR, type County, type GapStatus } from "@/lib/data";
import {
  FIRST_YEAR,
  formatPct,
  STATUS_LABEL,
  type RankingRow,
} from "@/lib/ranking";

type Props = {
  rows: RankingRow[];
  /** Areas with no GP wait value: listed at the end as "no data", not dropped. */
  unranked: County[];
  nationalGpWait: number;
  nationalReferral: number;
  gpWaitSourceId: string;
  referralSourceId: string;
};

// Desktop (lg): rank | area | bar | GP wait | referral. Cells carry the vertical padding so
// the Finland line in the bar column runs unbroken from row to row.
// Below lg: rank | area | value, with the bar and the referral line on their own rows.
const ROW_GRID =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 lg:grid-cols-[2rem_minmax(0,12.5rem)_minmax(0,1fr)_8.5rem_11rem] lg:gap-x-5";

// Short in-row status text; the full label is in the legend and in screen-reader text.
const ROW_STATUS: Record<GapStatus, string> = {
  red: "Worse than Finland",
  amber: "At or better",
  no_data: "No public data",
};

export function RankingList({
  rows,
  unranked,
  nationalGpWait,
  nationalReferral,
  gpWaitSourceId,
  referralSourceId,
}: Props) {
  const finlandX: CSSProperties = { left: `${nationalGpWait}%` };

  return (
    <div className="flex flex-col">
      {/* Column header, desktop: sticky so chips and the Finland label stay in view while scrolling. */}
      <div
        className={`${ROW_GRID} sticky top-0 z-10 hidden rounded-t-panel border-b border-border/80 bg-card/95 px-5 pt-4 pb-0 type-micro font-medium text-muted-foreground backdrop-blur lg:grid`}
      >
        <span className="pb-3">#</span>
        <span className="pb-3">
          Area
          <span className="block font-normal">change since {FIRST_YEAR}</span>
        </span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span>Non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</span>
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
          </div>
          <div aria-hidden className="relative h-6">
            <span
              className="absolute bottom-1 -translate-x-1/2 rounded-full bg-foreground px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap text-background tabular-nums"
              style={finlandX}
            >
              Finland {formatPct(nationalGpWait)}
            </span>
            <span className="absolute bottom-0 h-1 w-0.5 -translate-x-1/2 bg-foreground" style={finlandX} />
          </div>
        </div>
        <span className="pb-3 text-right">
          GP wait
          <span className="block font-normal">vs Finland</span>
        </span>
        <div className="flex flex-col items-start gap-1.5 pb-3">
          <span>Referrals processed within 3 days</span>
          <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
        </div>
      </div>

      {/* Column header, below lg: stacked key, so the row is not crowded on a phone. */}
      <dl className="flex flex-col gap-2 border-b border-border/80 px-4 py-3.5 type-micro text-muted-foreground sm:px-5 lg:hidden">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <dt className="font-semibold text-foreground">Bar and %</dt>
          <dd>non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</dd>
          <dd>
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <dt className="font-semibold text-foreground">Referrals</dt>
          <dd>processed within 3 days</dd>
          <dd>
            <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt aria-hidden className="h-3.5 w-0.5 rounded-full bg-foreground" />
          <dd>
            Line on each bar: Finland {formatPct(nationalGpWait)}
          </dd>
        </div>
      </dl>

      <ol className="flex flex-col px-1.5 py-1.5 lg:px-0 lg:py-0">
        {rows.map((row, i) => {
          const prev = rows[i - 1];
          const startsGroup = !prev || prev.gpStatus !== row.gpStatus;
          const groupSize = startsGroup ? countRun(rows, i) : 0;
          return (
            <li key={row.county.id}>
              {startsGroup && (
                <GroupDivider
                  status={row.gpStatus}
                  count={groupSize}
                  first={i === 0}
                  finlandX={finlandX}
                />
              )}
              <RankingRowLink
                row={row}
                index={i}
                nationalGpWait={nationalGpWait}
                nationalReferral={nationalReferral}
                finlandX={finlandX}
              />
            </li>
          );
        })}
        {unranked.length > 0 && (
          <li>
            <GroupDivider status="no_data" count={unranked.length} first={false} finlandX={finlandX} />
          </li>
        )}
        {unranked.map((county) => (
          <li key={county.id}>
            <Link
              href={`/county/${county.id}`}
              className={`${ROW_GRID} group rounded-xl px-2.5 text-sm transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring lg:rounded-none lg:px-5`}
            >
              <span className="flex items-center py-3 text-muted-foreground">
                <span aria-hidden>–</span>
                <span className="sr-only">Not ranked</span>
              </span>
              <span className="flex items-center py-3 font-medium">{county.name}</span>
              <span className="col-start-3 flex items-center justify-end py-3 lg:col-start-4">
                <StatusBadge status="no_data" size="xs">
                  No public data
                </StatusBadge>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function countRun(rows: RankingRow[], start: number): number {
  let n = 0;
  while (rows[start + n] && rows[start + n].gpStatus === rows[start].gpStatus) n++;
  return n;
}

function GroupDivider({
  status,
  count,
  first,
  finlandX,
}: {
  status: GapStatus;
  count: number;
  first: boolean;
  finlandX: CSSProperties;
}) {
  return (
    <div
      className={`${ROW_GRID} px-2.5 lg:px-5 ${first ? "" : "mt-1.5 border-t border-border/70 lg:mt-0"}`}
    >
      <div className="col-span-3 flex items-center gap-2 pt-3 pb-1.5 lg:col-span-2 lg:pt-4 lg:pb-2">
        <StatusBadge status={status} size="sm">
          {STATUS_LABEL[status]}
        </StatusBadge>
        <span className="type-micro text-muted-foreground tabular-nums">
          {count} {count === 1 ? "area" : "areas"}
        </span>
      </div>
      <div aria-hidden className="relative hidden lg:block">
        <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground/80" style={finlandX} />
      </div>
    </div>
  );
}

function RankingRowLink({
  row,
  index,
  nationalGpWait,
  nationalReferral,
  finlandX,
}: {
  row: RankingRow;
  index: number;
  nationalGpWait: number;
  nationalReferral: number;
  finlandX: CSSProperties;
}) {
  const referralWorse = row.referral !== null && row.referralStatus === "red";

  return (
    <Link
      href={`/county/${row.county.id}`}
      className={`${ROW_GRID} group relative rounded-xl px-2.5 transition-colors outline-none hover:bg-muted/70 focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ring lg:rounded-none lg:px-5`}
    >
      <span className="row-span-3 pt-3 type-heading text-[0.9375rem] text-muted-foreground tabular-nums lg:row-span-1 lg:flex lg:items-center lg:py-3.5">
        <span className="sr-only">Rank </span>
        {row.rank}
      </span>

      <span className="flex min-w-0 flex-col justify-center pt-3 lg:py-3.5">
        <span className="truncate text-[0.9375rem] font-semibold tracking-[-0.005em] transition-colors group-hover:text-brand-ink">
          {row.county.name}
        </span>
        <ChangeSince change={row.gpWaitChange} />
      </span>

      {/* Bar (decorative: the value and status are in text next to it). */}
      <div
        aria-hidden
        className="relative col-span-2 col-start-2 row-start-2 flex items-center pt-2.5 pb-1 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:py-0"
      >
        <div className="relative h-2.5 w-full rounded-full bg-muted lg:h-3">
          <div
            className={`animate-bar-grow h-full rounded-full ${STATUS_FILL[row.gpStatus]}`}
            style={{ width: `${row.gpWait.value}%`, "--i": index } as CSSProperties}
          />
          {/* Phone: Finland tick per bar. Desktop: one continuous line per row. */}
          <span
            className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground lg:hidden"
            style={finlandX}
          />
        </div>
        <span
          className="absolute inset-y-0 hidden w-0.5 -translate-x-1/2 bg-foreground/80 lg:block"
          style={finlandX}
        />
      </div>

      <span className="col-start-3 row-start-1 flex flex-col items-end justify-center gap-1 pt-3 lg:col-start-4 lg:py-3.5">
        <span
          className={`numeral text-[1.25rem] leading-none lg:text-[1.375rem] ${STATUS_INK[row.gpStatus]}`}
        >
          <span className="sr-only">Non-urgent GP visits waiting over 7 days: </span>
          {formatPct(row.gpWait.value)}
        </span>
        <StatusBadge status={row.gpStatus} size="xs">
          {ROW_STATUS[row.gpStatus]}
          <span className="sr-only">
            {row.gpStatus === "amber" ? " than Finland's level" : ""} (Finland {formatPct(nationalGpWait)})
          </span>
        </StatusBadge>
      </span>

      <span className="col-span-2 col-start-2 row-start-3 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 pb-3 text-[0.8125rem] lg:col-span-1 lg:col-start-5 lg:row-start-1 lg:py-3.5 lg:text-sm">
        <span className="text-muted-foreground lg:sr-only">Referrals in 3 days</span>
        {row.referral === null ? (
          <StatusBadge status="no_data" size="xs">
            No public data
          </StatusBadge>
        ) : (
          <>
            <span
              className={`font-semibold tabular-nums ${referralWorse ? "text-status-red-ink" : "text-foreground"}`}
            >
              {formatPct(row.referral.value)}
            </span>
            {referralWorse ? (
              <StatusBadge status="red" size="xs">
                Slower than Finland
              </StatusBadge>
            ) : (
              <span className="sr-only">
                , {STATUS_LABEL[row.referralStatus]} (Finland {formatPct(nationalReferral)})
              </span>
            )}
          </>
        )}
        <ChevronRight
          aria-hidden
          className="ml-auto hidden size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
        />
      </span>
    </Link>
  );
}

function ChangeSince({ change }: { change: number | null }) {
  if (change === null) return null;
  if (change === 0) {
    return (
      <span className="type-micro text-muted-foreground">no change since {FIRST_YEAR}</span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={`mt-0.5 inline-flex items-center gap-1 type-micro font-medium tabular-nums ${up ? "text-status-red-ink" : "text-trend-down"}`}
    >
      <span aria-hidden className="text-[0.625rem]">
        {up ? "▲" : "▼"}
      </span>
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {Math.abs(change).toFixed(1)} pts
      <span className="font-normal text-muted-foreground">since {FIRST_YEAR}</span>
    </span>
  );
}

