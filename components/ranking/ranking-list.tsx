import Link from "next/link";

import { SourceChip } from "@/components/source-chip";
import { LATEST_YEAR, type County, type GapStatus } from "@/lib/data";
import {
  FIRST_YEAR,
  formatPct,
  GP_WAIT_ID,
  REFERRAL_ID,
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

// Grid: rank | name | bar | GP wait value | referral. On phones the bar drops
// to its own line under the name (order utilities), so nothing scrolls sideways.
const ROW_GRID =
  "grid grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[1.75rem_10.5rem_1fr_4.5rem_8.5rem]";

// Bar colour comes from the gp_access status in gaps.json, never recomputed here.
const BAR_STYLE: Record<GapStatus, string> = {
  red: "bg-red-500",
  amber: "bg-amber-400",
  no_data: "bg-zinc-300 dark:bg-zinc-600",
};

// Screen-reader text so colour is not the only signal.
const STATUS_TEXT: Record<GapStatus, string> = {
  red: "worse than Finland",
  amber: "at or better than Finland's level",
  no_data: "no public data",
};

export function RankingList({
  rows,
  unranked,
  nationalGpWait,
  nationalReferral,
  gpWaitSourceId,
  referralSourceId,
}: Props) {
  return (
    <div className="flex flex-col">
      {/* Column header, desktop: one line per column with its source chip. */}
      <div
        className={`${ROW_GRID} hidden border-b pb-2 text-xs font-medium text-muted-foreground sm:grid`}
      >
        <span>#</span>
        <span>Area</span>
        <div className="flex flex-wrap items-center gap-2">
          <span>Non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</span>
          <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
        </div>
        <span className="text-right">GP wait</span>
        <div className="flex flex-wrap items-center gap-2">
          <span>Referrals processed within 3 days</span>
          <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
        </div>
      </div>

      {/* Column header, phones: stacked, so the row is not crowded at 375 px. */}
      <dl className="flex flex-col gap-1.5 border-b pb-2 text-xs text-muted-foreground sm:hidden">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="font-medium text-foreground">Bar and %:</dt>
          <dd>non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</dd>
          <dd>
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt className="font-medium text-foreground">Referrals:</dt>
          <dd>processed within 3 days</dd>
          <dd>
            <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
          </dd>
        </div>
      </dl>

      {/* Finland reference label, aligned with the marker line in the bars. */}
      <div aria-hidden className={`${ROW_GRID} pt-2 text-xs`}>
        <div className="order-4 col-span-3 sm:order-3 sm:col-start-3 sm:col-span-1">
          <div className="relative h-4">
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap font-medium"
              style={{ left: `${nationalGpWait}%` }}
            >
              Finland {formatPct(nationalGpWait)}
            </span>
          </div>
        </div>
      </div>

      <ol className="flex flex-col">
        {rows.map((row) => (
          <li key={row.county.id}>
            <RankingRowLink
              row={row}
              nationalGpWait={nationalGpWait}
              nationalReferral={nationalReferral}
            />
          </li>
        ))}
        {unranked.map((county) => (
          <li key={county.id}>
            <Link
              href={`/county/${county.id}`}
              className={`${ROW_GRID} rounded-md py-2 text-sm transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none`}
            >
              <span className="order-1 text-muted-foreground">
                <span aria-hidden>–</span>
                <span className="sr-only">Not ranked</span>
              </span>
              <span className="order-2 truncate font-medium">{county.name}</span>
              <span className="order-3 col-span-1 italic text-muted-foreground sm:col-span-3">
                no data
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-muted-foreground">
        All values: Sotkanet, {LATEST_YEAR}, see chips above. Bars: share of
        non-urgent GP (physician) visits in primary care that came more than 7
        days after the need for care was assessed (Sotkanet {GP_WAIT_ID}). Red:
        worse than Finland. Amber: at or better than Finland&apos;s level, which
        is still a delay. Arrows: change in percentage points since{" "}
        {FIRST_YEAR}. Referral column: Sotkanet {REFERRAL_ID}, higher is faster;
        Finland {formatPct(nationalReferral)}.
      </p>
    </div>
  );
}

function RankingRowLink({
  row,
  nationalGpWait,
  nationalReferral,
}: {
  row: RankingRow;
  nationalGpWait: number;
  nationalReferral: number;
}) {
  const worse = row.gpStatus === "red";
  const referralWorse = row.referral !== null && row.referralStatus === "red";

  return (
    <Link
      href={`/county/${row.county.id}`}
      className={`${ROW_GRID} rounded-md px-0 py-2 transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none`}
    >
      <span className="order-1 text-sm tabular-nums text-muted-foreground">
        <span className="sr-only">Rank </span>
        {row.rank}
      </span>

      <span className="order-2 flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium underline-offset-2 hover:underline">
          {row.county.name}
        </span>
        <ChangeSince change={row.gpWaitChange} />
      </span>

      <div aria-hidden className="order-4 col-span-3 sm:order-3 sm:col-span-1">
        <div className="relative h-3 rounded-sm bg-muted">
          <div
            className={`h-full rounded-sm ${BAR_STYLE[row.gpStatus]}`}
            style={{ width: `${row.gpWait.value}%` }}
          />
          <div
            className="absolute -top-1 -bottom-1 w-0.5 bg-foreground"
            style={{ left: `${nationalGpWait}%` }}
          />
        </div>
      </div>

      <span
        className={`order-3 text-right text-sm font-semibold tabular-nums sm:order-4 ${worse ? "text-red-700 dark:text-red-400" : ""}`}
      >
        <span className="sr-only">Non-urgent GP visits waiting over 7 days: </span>
        {formatPct(row.gpWait.value)}
        <span className="sr-only">
          , {STATUS_TEXT[row.gpStatus]} (Finland {formatPct(nationalGpWait)}).
        </span>
      </span>

      <span className="order-5 col-span-3 text-xs sm:col-span-1 sm:text-sm">
        <span className="text-muted-foreground sm:sr-only">Referrals in 3 days: </span>
        {row.referral === null ? (
          <span className="italic text-muted-foreground">no public data</span>
        ) : (
          <span
            className={`tabular-nums ${referralWorse ? "font-medium text-red-700 dark:text-red-400" : ""}`}
          >
            {formatPct(row.referral.value)}
            {referralWorse ? (
              " (slower than Finland)"
            ) : (
              <span className="sr-only">
                , {STATUS_TEXT[row.referralStatus]} (Finland {formatPct(nationalReferral)})
              </span>
            )}
          </span>
        )}
      </span>
    </Link>
  );
}

function ChangeSince({ change }: { change: number | null }) {
  if (change === null) return null;
  if (change === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        no change since {FIRST_YEAR}
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={`text-xs tabular-nums ${up ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}
    >
      <span aria-hidden>{up ? "▲" : "▼"} </span>
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {Math.abs(change).toFixed(1)} pts since {FIRST_YEAR}
    </span>
  );
}
