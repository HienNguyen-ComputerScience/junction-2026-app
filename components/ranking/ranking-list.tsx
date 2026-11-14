import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { BarFill, FinlandTick, withFigures } from "@/components/ui/measure-bar";
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

// Desktop (lg): rank | area | bar | GP wait | referral (with the row's chevron at its end).
// The bar cell spans the row's full height, so the Finland line runs unbroken from row to row.
// Below lg: rank | area | value, then the change and gap line, the bar, and the referral line.
const ROW_GRID =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 lg:grid-cols-[2rem_minmax(0,10.5rem)_minmax(0,1fr)_8.5rem_15.5rem] lg:gap-x-5";

// The referral column is a second indicator, not a detail of the GP wait: a hairline with 24px
// on each side separates the two, in the header, the group headings and every row alike.
const REFERRAL_COL = "lg:col-start-5 lg:ml-1 lg:border-l lg:border-border lg:pl-6";

// Every row is the same link: a lighter surface on hover and on keyboard focus, with an inset
// focus ring so the panel's rounded corners never clip it. The hover is bg-accent, two steps
// above the panel: on the near-black ramp a single step (bg-muted) is too faint to notice.
const ROW_LINK =
  "group relative rounded-lg px-2.5 transition-colors outline-none hover:bg-accent focus-visible:z-[1] focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset lg:rounded-none lg:px-5";

// Referral column: one short tag per state, so every cell has the same shape.
const REFERRAL_TAG: Record<GapStatus, string> = {
  red: "Slower than Finland",
  amber: "At least as fast",
  no_data: "No public data",
};

/**
 * The gap to Finland in percentage points, for display: the difference of the two one-decimal
 * figures shown on screen, with a real minus sign. "+" means a larger share than Finland.
 */
export function gapToFinland(value: number, finland: number): string {
  const diff = Number(value.toFixed(1)) - Number(finland.toFixed(1));
  const abs = Math.abs(diff).toFixed(1);
  if (abs === "0.0") return "0.0 pts";
  return `${diff > 0 ? "+" : "−"}${abs} pts`;
}

export function RankingList({
  rows,
  unranked,
  nationalGpWait,
  nationalReferral,
  gpWaitSourceId,
  referralSourceId,
}: Props) {
  const finlandX: CSSProperties = { left: `${nationalGpWait}%` };
  const finlandLabel = `Finland ${formatPct(nationalGpWait)}`;

  return (
    <div className="flex flex-col">
      {/* Column header, desktop. Not sticky: a sticky header slices the row passing under it.
          No source chips here: each group heading carries one per column, so a chip is in view
          wherever the list is scrolled. The bar column's second line is its axis. */}
      <div className={`${ROW_GRID} hidden border-b border-border px-5 lg:grid`}>
        <HeadCell line1="#" />
        <HeadCell line1="Area" line2={`change since ${FIRST_YEAR}`} />
        <div className="flex flex-col pt-3">
          <span className="flex h-6 items-center truncate type-caption font-medium text-foreground">
            Non-urgent GP visits waiting over 7 days
          </span>
          <BarAxis finlandX={finlandX} finlandLabel={finlandLabel} tick="bottom" />
        </div>
        <HeadCell line1="GP wait" line2="gap to Finland" className="items-end text-right" />
        <HeadCell
          line1="Referrals processed within 3 days"
          line2={
            <>
              Finland&nbsp;<span className="figure">{formatPct(nationalReferral)}</span>, higher
              is faster
            </>
          }
          className={REFERRAL_COL}
        />
      </div>

      {/* Below lg: one line that says what the bar and the line are. The rest is in the key
          under the list, so the first rows start high on a phone. */}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-3 type-micro text-muted-foreground sm:px-5 lg:hidden">
        {/* Both swatches sit in the same 24px slot as the key under the list (BarKey), so the
            two labels share one left edge. */}
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-6 shrink-0 rounded-[2px] bg-foreground/45" />
          Bar: non-urgent GP visits waiting over 7 days
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="relative h-2.5 w-6 shrink-0 rounded-[2px] bg-track">
            <span className="absolute -inset-y-0.5 left-1/2 w-0.5 -translate-x-1/2 bg-foreground" />
          </span>
          <span>Line: {withFigures(finlandLabel)}</span>
        </span>
      </p>

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
                  gpWaitSourceId={gpWaitSourceId}
                  referralSourceId={referralSourceId}
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
            />
          </li>
        )}
        {unranked.map((county) => (
          <li key={county.id}>
            <Link href={`/county/${county.id}`} className={`${ROW_GRID} ${ROW_LINK} text-sm`}>
              <span className="flex items-center py-3 text-faint">
                <span aria-hidden>–</span>
                <span className="sr-only">Not ranked</span>
              </span>
              <span className="flex items-center py-3 text-[0.9375rem] font-semibold">
                {county.name}
              </span>
              <span className="col-start-3 flex items-center justify-end gap-2 py-3 lg:col-start-4">
                <StatusBadge status="no_data" size="xs" variant="quiet">
                  No public data
                </StatusBadge>
                <RowChevron className="lg:hidden" />
              </span>
              <span className={`hidden items-center justify-end lg:flex ${REFERRAL_COL}`}>
                <RowChevron />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* The chart's base, desktop: the line ends on the axis it started from. */}
      <div aria-hidden className={`${ROW_GRID} hidden px-5 lg:grid`}>
        <div className="col-start-3 pb-3">
          <BarAxis finlandX={finlandX} finlandLabel={finlandLabel} tick="top" />
        </div>
        <span className={REFERRAL_COL} />
      </div>
    </div>
  );
}

function HeadCell({
  line1,
  line2,
  className = "",
}: {
  line1: string;
  line2?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`flex flex-col pt-3 pb-2 ${className}`}>
      <span className="flex h-6 items-center type-caption font-medium text-foreground">{line1}</span>
      {line2 && (
        <span className="flex h-5 items-center type-micro text-muted-foreground">{line2}</span>
      )}
    </span>
  );
}

/**
 * The bar column's axis: 0% and 100% at the ends, Finland's label centred on the line, and a
 * short tick that joins the line running through the rows (below the labels in the header,
 * above them under the last row).
 */
function BarAxis({
  finlandX,
  finlandLabel,
  tick,
}: {
  finlandX: CSSProperties;
  finlandLabel: string;
  tick: "top" | "bottom";
}) {
  const labelY = tick === "bottom" ? "top-0.5" : "bottom-0";
  return (
    <div aria-hidden className="relative h-7">
      <span className={`absolute left-0 figure type-note text-faint ${labelY}`}>0%</span>
      <span className={`absolute right-0 figure type-note text-faint ${labelY}`}>100%</span>
      <span
        className={`absolute -translate-x-1/2 type-note font-medium whitespace-nowrap text-foreground ${labelY}`}
        style={finlandX}
      >
        {withFigures(finlandLabel)}
      </span>
      <span
        className={`absolute h-2 w-px bg-foreground ${tick === "bottom" ? "-bottom-px" : "top-0"}`}
        style={finlandX}
      />
    </div>
  );
}

function RowChevron({ className = "" }: { className?: string }) {
  return (
    <ChevronRight
      aria-hidden
      strokeWidth={1.75}
      className={`size-4 shrink-0 text-faint transition-colors group-hover:text-foreground group-focus-visible:text-foreground ${className}`}
    />
  );
}

function countRun(rows: RankingRow[], start: number): number {
  let n = 0;
  while (rows[start + n] && rows[start + n].gpStatus === rows[start].gpStatus) n++;
  return n;
}

/**
 * Group heading. Every group has the same structure: the status badge and its count, then one
 * source chip over each figure column. The Finland line passes through it unbroken.
 */
function GroupDivider({
  status,
  count,
  first,
  finlandX,
  gpWaitSourceId,
  referralSourceId,
}: {
  status: GapStatus;
  count: number;
  first: boolean;
  finlandX: CSSProperties;
  /** Given for the groups that show figures: one chip per column, per group heading. */
  gpWaitSourceId?: string;
  referralSourceId?: string;
}) {
  return (
    <div
      className={`${ROW_GRID} px-2.5 lg:px-5 ${first ? "" : "mt-1.5 border-t border-border lg:mt-0"}`}
    >
      <div className="col-span-3 flex min-w-0 items-center gap-2 pt-3 pb-2 whitespace-nowrap lg:col-span-2 lg:pt-4 lg:pb-2">
        <StatusBadge status={status} size="sm">
          {STATUS_LABEL[status]}
        </StatusBadge>
        <span className="shrink-0 type-micro text-muted-foreground">
          <span className="figure">{count}</span> {count === 1 ? "area" : "areas"}
        </span>
      </div>
      <div aria-hidden className="relative hidden lg:block">
        <span className="absolute -top-px bottom-0 w-px bg-foreground" style={finlandX} />
      </div>
      {/* Source chips, siblings of the row links (never inside one). Desktop: one over each
          figure column, the GP wait chip ending on the figures' right edge. Below lg: both on
          one row under the label. */}
      {gpWaitSourceId && referralSourceId ? (
        <div className="col-span-3 flex flex-wrap items-center gap-2 pb-2 lg:contents">
          <span className="flex shrink-0 lg:col-start-4 lg:justify-end lg:pt-4 lg:pb-2">
            <span className="flex shrink-0">
              <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
            </span>
          </span>
          <span className={`flex shrink-0 lg:pt-4 lg:pb-2 ${REFERRAL_COL}`}>
            <SourceChip sourceId={referralSourceId} year={LATEST_YEAR} />
          </span>
        </div>
      ) : (
        <span aria-hidden className={`hidden lg:block ${REFERRAL_COL}`} />
      )}
    </div>
  );
}

/**
 * The referral share as a 48px bar with its own Finland tick: the same higher-is-better bar as
 * everywhere else, small. No value draws the hatched track alone, never a zero-length bar.
 */
function ReferralMiniBar({
  value,
  finland,
  status,
  index,
}: {
  value: number | null;
  finland: number;
  status: GapStatus;
  index: number;
}) {
  return (
    <span
      aria-hidden
      className={`relative hidden h-2 w-12 shrink-0 rounded-[2px] sm:block ${
        value === null ? "bg-hatch ring-1 ring-status-grey-border ring-inset" : "bg-track"
      }`}
    >
      {value !== null && (
        <BarFill value={value} finland={finland} status={status} index={index} higherIsBetter />
      )}
      {value !== null && <FinlandTick finland={finland} className="-inset-y-1 w-px" />}
    </span>
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
  // No referral value means no public data, whatever the stage status says.
  const referralStatus: GapStatus = row.referral === null ? "no_data" : row.referralStatus;

  return (
    <Link href={`/county/${row.county.id}`} className={`${ROW_GRID} ${ROW_LINK}`}>
      <span className="row-span-4 pt-3 figure text-[0.8125rem] leading-6 text-faint lg:row-span-2 lg:flex lg:items-center lg:pt-0">
        <span className="sr-only">Rank </span>
        {row.rank}
      </span>

      <span className="col-start-2 row-start-1 min-w-0 truncate pt-3 text-[0.9375rem] leading-6 font-semibold lg:pt-2">
        {row.county.name}
      </span>

      <span className="col-start-3 row-start-1 flex items-center justify-end pt-3 lg:col-start-4 lg:pt-2">
        <span className="numeral text-[1.25rem] leading-6 text-foreground lg:text-[1.375rem]">
          <span className="sr-only">Non-urgent GP visits waiting over 7 days: </span>
          {formatPct(row.gpWait.value)}
        </span>
      </span>

      {/* Second line: the change since FIRST_YEAR and the gap to Finland. One flex line below lg,
          two cells of the grid on desktop. */}
      <span className="col-span-2 col-start-2 row-start-2 flex items-center justify-between gap-x-3 pt-0.5 lg:contents">
        <span className="lg:col-start-2 lg:row-start-2 lg:pt-0.5 lg:pb-2">
          <ChangeSince change={row.gpWaitChange} />
        </span>
        <span className="flex justify-end lg:col-start-4 lg:row-start-2 lg:pt-0.5 lg:pb-2">
          <StatusBadge status={row.gpStatus} size="xs" variant="quiet" className="h-4">
            <span>
              <span className="sr-only">{STATUS_LABEL[row.gpStatus]}: </span>
              <span className="figure font-medium text-foreground/80">
                {gapToFinland(row.gpWait.value, nationalGpWait)}
              </span>{" "}
              vs Finland
            </span>
          </StatusBadge>
        </span>
      </span>

      {/* Bar (decorative: the value and the gap are in text next to it). */}
      <div
        aria-hidden
        className="relative col-span-2 col-start-2 row-start-3 flex items-center pt-3 pb-1.5 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:py-0"
      >
        <div className="relative h-2.5 w-full rounded-[2px] bg-track lg:h-3">
          <BarFill value={row.gpWait.value} finland={nationalGpWait} status={row.gpStatus} index={index} />
          {/* Phone: Finland tick per bar. Desktop: one continuous line down the column. */}
          <FinlandTick finland={nationalGpWait} className="lg:hidden" />
        </div>
        <span
          className="absolute inset-y-0 hidden w-px bg-foreground lg:block"
          style={finlandX}
        />
      </div>

      {/* Referral, a second indicator behind its own divider: the value with a small bar of
          its own (Finland tick included), then one quiet text tag for every state. One line
          below lg, two lines on desktop, like the GP wait column next to it. */}
      <span
        className={`col-span-2 col-start-2 row-start-4 flex items-center gap-x-2 pt-1 pb-3 lg:col-span-1 lg:row-span-2 lg:row-start-1 lg:py-0 ${REFERRAL_COL}`}
      >
        <span className="type-caption text-muted-foreground lg:sr-only">
          Referrals<span className="sr-only"> processed within 3 days:</span>
        </span>
        <span className="flex min-w-0 items-center gap-x-2 lg:flex-col lg:items-start lg:gap-y-1.5">
          <span className="flex h-5 items-center gap-x-2.5">
            <span className="w-11 shrink-0 figure text-[0.8125rem] font-medium text-foreground lg:w-12 lg:text-sm">
              {row.referral === null ? (
                <span aria-hidden className="text-faint">
                  –
                </span>
              ) : (
                formatPct(row.referral.value)
              )}
            </span>
            <ReferralMiniBar
              value={row.referral === null ? null : row.referral.value}
              finland={nationalReferral}
              status={referralStatus}
              index={index}
            />
          </span>
          <StatusBadge status={referralStatus} size="xs" variant="quiet" className="lg:h-4">
            <span>
              {REFERRAL_TAG[referralStatus]}
              {referralStatus !== "no_data" && (
                <span className="sr-only">
                  {referralStatus === "amber" ? " as Finland" : ""} (Finland{" "}
                  {formatPct(nationalReferral)})
                </span>
              )}
            </span>
          </StatusBadge>
        </span>
        <RowChevron className="ml-auto" />
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
    <span className="type-micro text-muted-foreground">
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      <span className="figure font-medium text-foreground/80">
        <span aria-hidden>{up ? "+" : "−"}</span>
        {Math.abs(change).toFixed(1)} pts
      </span>{" "}
      since {FIRST_YEAR}
    </span>
  );
}
