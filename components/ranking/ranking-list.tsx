import Link from "next/link";

import { SourceChip } from "@/components/source-chip";
import { LATEST_YEAR } from "@/lib/data";
import {
  FIRST_YEAR,
  formatPct,
  GP_WAIT_ID,
  REFERRAL_ID,
  type RankingRow,
} from "@/lib/ranking";

type Props = {
  rows: RankingRow[];
  nationalGpWait: number;
  nationalReferral: number;
  gpWaitSourceId: string;
  referralSourceId: string;
};

// Grid: rank | name | bar | GP wait value | referral. On phones the bar drops
// to its own line under the name (order utilities), so nothing scrolls sideways.
const ROW_GRID =
  "grid grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[1.75rem_10.5rem_1fr_4.5rem_8.5rem]";

export function RankingList({
  rows,
  nationalGpWait,
  nationalReferral,
  gpWaitSourceId,
  referralSourceId,
}: Props) {
  return (
    <div className="flex flex-col">
      <div
        className={`${ROW_GRID} border-b pb-2 text-xs font-medium text-muted-foreground`}
      >
        <span className="order-1">#</span>
        <span className="order-2">Area</span>
        <div className="order-4 col-span-3 flex flex-wrap items-center gap-2 sm:order-3 sm:col-span-1">
          <span>Non-urgent GP visits waiting over 7 days, {LATEST_YEAR}</span>
          <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
        </div>
        <span className="order-3 text-right sm:order-4">GP wait</span>
        <div className="order-5 col-span-3 flex flex-wrap items-center gap-2 sm:col-span-1">
          <span>Referrals processed within 3 days</span>
          <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
        </div>
      </div>

      {/* Finland reference label, aligned with the marker line in the bars. */}
      <div className={`${ROW_GRID} pt-2 text-xs`}>
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
      </ol>

      <p className="mt-3 text-xs text-muted-foreground">
        Bars: share of non-urgent GP (physician) visits in primary care that
        came more than 7 days after the need for care was assessed (Sotkanet{" "}
        {GP_WAIT_ID}). Red: worse than Finland. Arrows: change in percentage
        points since {FIRST_YEAR}. Referral column: Sotkanet {REFERRAL_ID},
        higher is faster; Finland {formatPct(nationalReferral)}.
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
  const worse = row.gpWait.value > nationalGpWait;
  const referralWorse =
    row.referral !== null && row.referral.value < nationalReferral;

  return (
    <Link
      href={`/county/${row.county.id}`}
      className={`${ROW_GRID} rounded-md px-0 py-2 transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none`}
    >
      <span className="order-1 text-sm tabular-nums text-muted-foreground">
        {row.rank}
      </span>

      <span className="order-2 flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium underline-offset-2 hover:underline">
          {row.county.name}
        </span>
        <ChangeSince change={row.gpWaitChange} />
      </span>

      <div className="order-4 col-span-3 sm:order-3 sm:col-span-1">
        <div className="relative h-3 rounded-sm bg-muted">
          <div
            className={`h-full rounded-sm ${worse ? "bg-red-500" : "bg-amber-400"}`}
            style={{ width: `${row.gpWait.value}%` }}
          />
          <div
            aria-hidden
            className="absolute -top-1 -bottom-1 w-0.5 bg-foreground"
            style={{ left: `${nationalGpWait}%` }}
          />
        </div>
      </div>

      <span
        className={`order-3 text-right text-sm font-semibold tabular-nums sm:order-4 ${worse ? "text-red-700 dark:text-red-400" : ""}`}
      >
        {formatPct(row.gpWait.value)}
      </span>

      <span className="order-5 col-span-3 text-xs sm:col-span-1 sm:text-sm">
        <span className="text-muted-foreground sm:hidden">Referrals in 3 days: </span>
        {row.referral === null ? (
          <span className="italic text-muted-foreground">no public data</span>
        ) : (
          <span
            className={`tabular-nums ${referralWorse ? "font-medium text-red-700 dark:text-red-400" : ""}`}
          >
            {formatPct(row.referral.value)}
            {referralWorse ? " (slower than Finland)" : ""}
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
      title={`${up ? "Up" : "Down"} ${Math.abs(change).toFixed(1)} percentage points since ${FIRST_YEAR}`}
    >
      {up ? "▲" : "▼"} {Math.abs(change).toFixed(1)} pts since {FIRST_YEAR}
    </span>
  );
}
