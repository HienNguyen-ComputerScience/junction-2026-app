import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SourceChip } from "@/components/source-chip";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { StatusBadge } from "@/components/ui/status-badge";
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
  "grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 lg:grid-cols-[2rem_minmax(0,10.5rem)_minmax(0,1fr)_8rem_12.5rem] lg:gap-x-5";

// Short in-row status text; the full label is in the group heading and in screen-reader text.
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
      {/* Column header, desktop. Not sticky: a sticky header slices the row passing under it.
          The Finland label is repeated on the line at each lower group heading instead.
          Two fixed lines, so no cell can push the Finland label off its line. */}
      <div
        className={`${ROW_GRID} hidden border-b border-border px-5 pt-3 type-micro text-muted-foreground lg:grid`}
      >
        <HeadCell line1="#" />
        <HeadCell line1="Area" line2={`change since ${FIRST_YEAR}`} />
        <div className="flex flex-col">
          <div className="flex h-6 items-center justify-between gap-2">
            <span className="truncate font-medium text-foreground">
              Non-urgent GP visits waiting over 7 days
            </span>
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
          </div>
          <div aria-hidden className="relative min-h-6 flex-1">
            <span
              className="absolute bottom-2 -translate-x-1/2 type-mark font-medium whitespace-nowrap text-foreground"
              style={finlandX}
            >
              Finland {formatPct(nationalGpWait)}
            </span>
            <span className="absolute bottom-0 h-1.5 w-0.5 -translate-x-1/2 bg-foreground" style={finlandX} />
          </div>
        </div>
        <HeadCell line1="GP wait" line2="vs Finland" className="items-end text-right" />
        <div className="flex flex-col items-start pb-3">
          <span className="flex h-6 items-center font-medium text-foreground">
            Referrals processed within 3 days
          </span>
          <span className="flex h-6 items-center">
            <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
          </span>
        </div>
      </div>

      {/* Column header, below lg: stacked key, so the row is not crowded on a phone. */}
      <dl className="flex flex-col gap-2.5 border-b border-border px-4 py-4 type-micro text-muted-foreground sm:px-5 lg:hidden">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <dt className="font-semibold text-foreground">Bar and %</dt>
          <dd>non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</dd>
          <dd className="flex min-w-0">
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <dt className="font-semibold text-foreground">Referrals</dt>
          <dd>processed within 3 days</dd>
          <dd className="flex min-w-0">
            <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt aria-hidden className="h-3.5 w-0.5 bg-foreground" />
          <dd>
            Line on each bar: Finland {formatPct(nationalGpWait)}. Solid red: the share beyond it.
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
                  nationalGpWait={nationalGpWait}
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
            <GroupDivider
              status="no_data"
              count={unranked.length}
              first={false}
              finlandX={finlandX}
              nationalGpWait={nationalGpWait}
            />
          </li>
        )}
        {unranked.map((county) => (
          <li key={county.id}>
            <Link
              href={`/county/${county.id}`}
              className={`${ROW_GRID} group rounded-lg px-2.5 text-sm transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring lg:rounded-none lg:px-5`}
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

function HeadCell({
  line1,
  line2,
  className = "",
}: {
  line1: string;
  line2?: string;
  className?: string;
}) {
  return (
    <span className={`flex flex-col pb-3 ${className}`}>
      <span className="flex h-6 items-center font-medium text-foreground">{line1}</span>
      {line2 && <span className="flex h-4 items-center">{line2}</span>}
    </span>
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
  nationalGpWait,
}: {
  status: GapStatus;
  count: number;
  first: boolean;
  finlandX: CSSProperties;
  nationalGpWait: number;
}) {
  return (
    <div
      className={`${ROW_GRID} px-2.5 lg:px-5 ${first ? "" : "mt-1.5 border-t border-border lg:mt-0"}`}
    >
      <div className="col-span-3 flex min-w-0 items-center gap-2 pt-3 pb-1.5 whitespace-nowrap lg:col-span-2 lg:pt-4 lg:pb-2">
        <StatusBadge status={status} size="sm">
          {STATUS_LABEL[status]}
        </StatusBadge>
        <span className="shrink-0 type-micro text-muted-foreground tabular-nums">
          {count} {count === 1 ? "area" : "areas"}
        </span>
      </div>
      <div aria-hidden className="relative hidden lg:block">
        {/* The key for the two-tone red bars, written on the chart next to the line it refers to. */}
        {status === "red" && (
          <span
            className="absolute inset-y-0 flex items-center pt-2 pr-2.5 type-mark whitespace-nowrap text-muted-foreground"
            style={{ right: `${100 - nationalGpWait}%` }}
          >
            Solid red: beyond Finland&apos;s line
          </span>
        )}
        {/* Lower groups: the column header has scrolled away, so the line is named again. */}
        {status !== "red" && (
          <span
            className="absolute inset-y-0 flex items-center pt-2 pl-2.5 type-mark font-medium whitespace-nowrap text-foreground"
            style={finlandX}
          >
            Finland {formatPct(nationalGpWait)}
          </span>
        )}
        <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground" style={finlandX} />
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
      className={`${ROW_GRID} group relative rounded-lg px-2.5 transition-colors outline-none hover:bg-muted/70 focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ring lg:rounded-none lg:px-5`}
    >
      <span className="row-span-3 pt-3 text-[0.8125rem] leading-6 text-muted-foreground tabular-nums lg:row-span-1 lg:flex lg:items-center lg:py-2">
        <span className="sr-only">Rank </span>
        {row.rank}
      </span>

      <span className="flex min-w-0 flex-col justify-center gap-0.5 pt-3 lg:py-2">
        <span className="truncate text-[0.9375rem] leading-6 font-semibold transition-colors group-hover:text-brand-ink">
          {row.county.name}
        </span>
        <ChangeSince change={row.gpWaitChange} />
      </span>

      {/* Bar (decorative: the value and status are in text next to it). */}
      <div
        aria-hidden
        className="relative col-span-2 col-start-2 row-start-2 flex items-center pt-3 pb-1.5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:py-0"
      >
        <div className="relative h-2.5 w-full rounded-[2px] bg-muted lg:h-3">
          <BarFill value={row.gpWait.value} finland={nationalGpWait} status={row.gpStatus} index={index} />
          {/* Phone: Finland tick per bar. Desktop: one continuous line down the column. */}
          <FinlandTick finland={nationalGpWait} className="lg:hidden" />
        </div>
        <span
          className="absolute inset-y-0 hidden w-0.5 -translate-x-1/2 bg-foreground lg:block"
          style={finlandX}
        />
      </div>

      <span className="col-start-3 row-start-1 flex flex-col items-end justify-center gap-1 pt-3 lg:col-start-4 lg:py-2">
        <span className="numeral text-[1.25rem] leading-none text-foreground lg:text-[1.375rem]">
          <span className="sr-only">Non-urgent GP visits waiting over 7 days: </span>
          {formatPct(row.gpWait.value)}
        </span>
        <StatusBadge status={row.gpStatus} size="xs" variant="quiet" className="h-4">
          {ROW_STATUS[row.gpStatus]}
          <span className="sr-only">
            {row.gpStatus === "amber" ? " than Finland's level" : ""} (Finland {formatPct(nationalGpWait)})
          </span>
        </StatusBadge>
      </span>

      <span className="col-span-2 col-start-2 row-start-3 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 pb-3 text-[0.8125rem] lg:col-span-1 lg:col-start-5 lg:row-start-1 lg:py-2 lg:text-sm">
        <span className="text-muted-foreground lg:sr-only">Referrals in 3 days</span>
        {row.referral === null ? (
          <StatusBadge status="no_data" size="xs" variant="quiet">
            No public data
          </StatusBadge>
        ) : (
          <>
            <span className="font-medium text-foreground tabular-nums">
              {formatPct(row.referral.value)}
            </span>
            {referralWorse ? (
              <StatusBadge status="red" size="xs" variant="plain">
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
          strokeWidth={1.75}
          className="ml-auto hidden size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
        />
      </span>
    </Link>
  );
}

/** Change in percentage points since FIRST_YEAR, as a signed figure. The sign carries the direction. */
function ChangeSince({ change }: { change: number | null }) {
  if (change === null) return null;
  if (change === 0) {
    return (
      <span className="type-micro text-muted-foreground">no change since {FIRST_YEAR}</span>
    );
  }
  const up = change > 0;
  return (
    <span className="type-micro text-muted-foreground tabular-nums">
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      <span className="font-medium text-foreground/80">
        <span aria-hidden>{up ? "+" : "−"}</span>
        {Math.abs(change).toFixed(1)} pts
      </span>{" "}
      since {FIRST_YEAR}
    </span>
  );
}
