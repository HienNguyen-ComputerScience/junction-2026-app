import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";
import { BarFill, FinlandTick, SHARED_BAR, withFigures } from "@/components/ui/measure-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { HUS_FULL } from "@/components/pathway/wording";
import { LATEST_YEAR, type County, type GapStatus } from "@/lib/data";
import {
  CITY_UNITS_ONLY_REFERRAL,
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
// The bar cell spans the row's full height, so the Finland line runs unbroken from row to row
// of a group. It is drawn through bar rows only: a group heading has no bar and no line.
// Below lg: area (rank inline before the name) | value, then the change and gap line, the bar, and the referral line.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 lg:grid-cols-[2rem_minmax(0,12rem)_minmax(0,1fr)_11.5rem_17.5rem] lg:gap-x-5";

// The referral column is a second indicator, not a detail of the GP wait: a hairline with 24px
// on each side separates the two, in the header, the group headings and every row alike.
const REFERRAL_COL = "lg:col-start-5 lg:ml-1 lg:border-l lg:border-border lg:pl-6";

// Every row is the same link: a lighter surface on hover and on keyboard focus, with an inset
// focus ring so the panel's rounded corners never clip it. The hover is bg-accent, two steps
// above the panel: on the near-black ramp a single step (bg-muted) is too faint to notice.
const ROW_LINK =
  "group relative rounded-lg pr-9 pl-2.5 transition-colors outline-none hover:bg-accent focus-visible:z-[1] focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset lg:rounded-none lg:px-5";

// A 1px hairline (the text colour at about 6%) between the rows of a group. A pseudo-element, so
// it stays straight on the rounded phone rows and the Finland line runs over it unbroken.
const ROW_DIVIDER =
  "before:absolute before:inset-x-2.5 before:top-0 before:h-px before:bg-foreground/[0.06] lg:before:inset-x-0";

// Referral column: one short tag per state, so every cell has the same shape.
const REFERRAL_TAG: Record<GapStatus, string> = {
  red: "Worse",
  amber: "Better",
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
  const finlandLabel = `Finland ${formatPct(nationalGpWait)}`;
  const total = rows.length + unranked.length;

  return (
    <div className="flex flex-col">
      {/* Column header, desktop. Not sticky: a sticky header slices the row passing under it.
          No source chips here: each group heading carries one per column, so a chip is in view
          wherever the list is scrolled. The bar column's second line is its axis. */}
      <div className={`${ROW_GRID} hidden border-b border-border px-5 lg:grid`}>
        <HeadCell line1="#" />
        <HeadCell line1="Area" />
        <div className="flex flex-col pt-3">
          <span className="flex h-6 items-center truncate type-caption font-medium text-foreground">
            Non-urgent GP visits waiting over 7 days
          </span>
          <BarAxis finlandX={finlandX} finlandLabel={finlandLabel} />
        </div>
        <HeadCell line1="GP wait" line2="Gap in percentage points" className="items-end text-right" />
        <HeadCell
          line1="Referrals processed within 3 days"
          line2={
            <>
              Finland&nbsp;<span className="figure">{formatPct(nationalReferral)}</span>, higher
              is better
            </>
          }
          className={REFERRAL_COL}
        >
          {/* The full phrase of each row's short label, said once for the whole column. */}
          <span className="mt-0.5 flex flex-col">
            <StatusBadge status="red" variant="quiet">
              Worse than Finland&apos;s level
            </StatusBadge>
            <StatusBadge status="amber" variant="quiet">
              At or better than Finland&apos;s level
            </StatusBadge>
          </span>
          {/* The two units-only labels, explained once, out of the way until asked for. */}
          <Disclosure
            summary="HUS-wide, City units only"
            summaryClassName="min-h-7 text-[0.75rem] font-normal text-muted-foreground"
          >
            <p className="max-w-[17rem] pb-2 pl-[1.375rem] type-note text-pretty text-muted-foreground">
              &ldquo;HUS-wide&rdquo; is one shared figure from {HUS_FULL} for four Uusimaa areas. &ldquo;City
              units only&rdquo; means Helsinki&apos;s own units; most of its referrals go to HUS.
            </p>
          </Disclosure>
        </HeadCell>
      </div>

      {/* Below lg: one line that says what the bar and the line are, before the data. The key
          is under the list. */}
      <p className="border-b border-border px-4 py-3 type-caption text-pretty text-muted-foreground sm:px-5 lg:hidden">
        Bars: non-urgent GP visits waiting over 7 days. White line, and the gap in each row:{" "}
        {withFigures(finlandLabel)}.
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
                  total={total}
                  first={i === 0}
                  gpWaitSourceId={gpWaitSourceId}
                  referralSourceId={referralSourceId}
                />
              )}
              <RankingRowLink
                row={row}
                index={i}
                divider={!startsGroup}
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
              total={total}
              first={false}
            />
          </li>
        )}
        {unranked.map((county) => (
          <li key={county.id}>
            <Link
              href={`/county/${county.id}`}
              className={`${ROW_GRID} ${ROW_LINK} ${ROW_DIVIDER} text-sm`}
            >
              <span className="hidden items-center text-faint lg:col-start-1 lg:flex">
                <span aria-hidden>–</span>
                <span className="sr-only">Not ranked</span>
              </span>
              <span className="flex items-center py-4 text-[0.9375rem] font-semibold transition-colors group-hover:text-brand-ink group-focus-visible:text-brand-ink lg:col-start-2 lg:py-4">
                <span className="sr-only">Not ranked: </span>
                {county.name}
              </span>
              <span className="flex items-center justify-end gap-2 py-4 lg:col-start-4">
                <StatusBadge status="no_data" variant="quiet">
                  No public data
                </StatusBadge>
                <RowChevron className="absolute top-1/2 right-2.5 -translate-y-1/2 lg:hidden" />
              </span>
              <span className={`hidden items-center justify-end lg:flex ${REFERRAL_COL}`}>
                <RowChevron />
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
  children,
}: {
  line1: string;
  line2?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`flex flex-col pt-3 pb-2 ${className}`}>
      <span className="flex h-6 items-center type-caption font-medium text-foreground">{line1}</span>
      {line2 && (
        <span className="flex h-5 items-center type-caption text-muted-foreground">{line2}</span>
      )}
      {children}
    </span>
  );
}

/** The bar column's axis: 0% and 100% at the ends, Finland's label centred on the line. */
function BarAxis({ finlandX, finlandLabel }: { finlandX: CSSProperties; finlandLabel: string }) {
  return (
    <div aria-hidden className="relative h-7 type-caption">
      <span className="absolute top-0.5 left-0 figure text-faint">0%</span>
      <span className="absolute top-0.5 right-0 figure text-faint">100%</span>
      <span
        className="absolute top-0.5 -translate-x-1/2 font-medium whitespace-nowrap text-foreground"
        style={finlandX}
      >
        {withFigures(finlandLabel)}
      </span>
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
 * Group heading. Every group has the same structure: the status badge and its count of all the
 * areas, then one source chip over each figure column. No bar, so no Finland line.
 */
function GroupDivider({
  status,
  count,
  total,
  first,
  gpWaitSourceId,
  referralSourceId,
}: {
  status: GapStatus;
  count: number;
  /** All areas in the list: the count reads "14 of 22 areas", beside the group's source chips. */
  total: number;
  first: boolean;
  /** Given for the groups that show figures: one chip per column, per group heading. */
  gpWaitSourceId?: string;
  referralSourceId?: string;
}) {
  return (
    <div
      className={`${ROW_GRID} px-2.5 lg:px-5 ${first ? "" : "mt-1.5 border-t border-border lg:mt-0"}`}
    >
      <div className="col-span-2 flex min-w-0 items-center gap-2 pt-3 pb-2 whitespace-nowrap lg:col-span-3 lg:pt-4 lg:pb-2">
        <StatusBadge status={status} size="sm">
          {STATUS_LABEL[status]}
        </StatusBadge>
        <span className="shrink-0 type-caption text-muted-foreground">
          <span className="figure">{count}</span> of <span className="figure">{total}</span> areas
        </span>
      </div>
      {/* Source chips, siblings of the row links (never inside one). Desktop: one over each
          figure column, the GP wait chip ending on the figures' right edge. Below lg: both on
          one wrapping row under the label, GP wait first. */}
      {gpWaitSourceId && referralSourceId ? (
        <div className="col-span-2 flex flex-wrap items-center gap-2 pb-2 lg:contents">
          <span className="flex shrink-0 lg:col-start-4 lg:justify-end lg:pt-4 lg:pb-2">
            <SourceChip sourceId={gpWaitSourceId} year={LATEST_YEAR} />
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
 * The referral share as a 96px bar with its own Finland tick: the same higher-is-better bar as
 * everywhere else, small. No value draws the hatched track alone, never a zero-length bar.
 */
function ReferralMiniBar({
  value,
  shared,
  finland,
  status,
  index,
}: {
  value: number | null;
  /** A hospital group's one shared figure: an empty dashed-outline bar, never the hatch of no data. */
  shared: number | null;
  finland: number;
  status: GapStatus;
  index: number;
}) {
  const drawn = value ?? shared;
  return (
    <span
      aria-hidden
      className={`relative hidden h-2 w-24 shrink-0 rounded-[2px] sm:block ${
        value === null && shared !== null
          ? SHARED_BAR
          : drawn === null
            ? "bg-hatch ring-1 ring-status-grey-border ring-inset"
            : "bg-track"
      }`}
    >
      {value !== null && (
        <BarFill value={value} finland={finland} status={status} index={index} higherIsBetter />
      )}
      {drawn !== null && <FinlandTick finland={finland} className="-inset-y-1" />}
    </span>
  );
}

function RankingRowLink({
  row,
  index,
  divider,
  nationalGpWait,
  nationalReferral,
  finlandX,
}: {
  row: RankingRow;
  index: number;
  /** A hairline above the row: every row of a group except the first. */
  divider: boolean;
  nationalGpWait: number;
  nationalReferral: number;
  finlandX: CSSProperties;
}) {
  // No referral value means no public data, whatever the stage status says.
  const referralStatus: GapStatus = row.referral === null ? "no_data" : row.referralStatus;
  const cityUnitsOnly = CITY_UNITS_ONLY_REFERRAL.has(row.county.id);

  return (
    <Link
      href={`/county/${row.county.id}`}
      className={`${ROW_GRID} ${ROW_LINK} ${divider ? ROW_DIVIDER : ""}`}
    >
      {/* Desktop: its own column. */}
      <span className="hidden figure text-[0.8125rem] leading-6 text-faint lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:items-center">
        <span className="sr-only">Rank </span>
        {row.rank}
      </span>

      <span className="col-start-1 row-start-1 flex min-w-0 items-baseline gap-2 pt-3 text-[0.9375rem] leading-6 font-semibold transition-colors group-hover:text-brand-ink group-focus-visible:text-brand-ink lg:col-start-2 lg:pt-1.5">
        {/* Phone: the rank is inline before the name, so the bar can use the full card width. */}
        <span className="shrink-0 figure text-[0.8125rem] font-normal text-faint lg:hidden">
          <span className="sr-only">Rank </span>
          {row.rank}
        </span>
        <span className="truncate">{row.county.name}</span>
      </span>

      <span className="col-start-2 row-start-1 flex items-center justify-end pt-3 lg:col-start-4 lg:pt-1.5">
        <span className="numeral text-[1.25rem] leading-6 text-foreground lg:text-[1.375rem]">
          <span className="sr-only">Non-urgent GP visits waiting over 7 days: </span>
          {formatPct(row.gpWait.value)}
        </span>
      </span>

      {/* Second line: the gap to Finland, in words (the column header gives the unit). The
          change over time is the "Getting worse fastest" tab. */}
      <span className="col-span-2 col-start-1 row-start-2 flex items-center justify-end gap-x-3 pt-0.5 lg:contents">
        <span className="flex h-5 items-center justify-end lg:col-start-4 lg:row-start-2 lg:h-[1.625rem] lg:items-start">
          <StatusBadge status={row.gpStatus} variant="quiet">
            <span>
              <span className="sr-only">{STATUS_LABEL[row.gpStatus]}: </span>
              <GapShort value={row.gpWait.value} finland={nationalGpWait} />
            </span>
          </StatusBadge>
        </span>
      </span>

      {/* Bar (decorative: the value and the gap are in text next to it). */}
      <div
        aria-hidden
        className="relative col-span-2 col-start-1 row-start-3 flex items-center pt-3 pb-1.5 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:py-0"
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

      {/* Referral, a second indicator behind its own divider: the value with a 96px bar of
          its own (Finland tick included), then one quiet text tag for every state. One line
          below lg, two lines on desktop, like the GP wait column next to it. */}
      <span
        className={`col-span-2 col-start-1 row-start-4 flex items-center gap-x-2 pt-1 pb-3 lg:col-span-1 lg:row-span-2 lg:row-start-1 lg:py-0 ${REFERRAL_COL}`}
      >
        <span className="type-caption text-muted-foreground lg:sr-only">
          Referrals<span className="sr-only"> processed within 3 days:</span>
        </span>
        <span className="flex min-w-0 items-center gap-x-2 lg:flex-col lg:items-start lg:gap-y-1">
          <span className="flex h-5 items-center gap-x-2.5">
            {/* No value: nothing here, the "No public data" tag says it. The cell keeps its
                width so the bars line up down the column. */}
            <span
              className={`w-11 shrink-0 figure text-[0.8125rem] font-medium empty:hidden sm:empty:block lg:w-12 lg:text-sm ${row.referral === null ? "text-muted-foreground" : "text-foreground"}`}
            >
              {row.referral !== null
                ? formatPct(row.referral.value)
                : row.sharedReferral
                  ? formatPct(row.sharedReferral.value)
                  : null}
            </span>
            <ReferralMiniBar
              value={row.referral === null ? null : row.referral.value}
              shared={row.sharedReferral ? row.sharedReferral.value : null}
              finland={nationalReferral}
              status={referralStatus}
              index={index}
            />
          </span>
          <StatusBadge status={referralStatus} variant="quiet">
            <span>
              {row.referral === null && row.sharedReferral ? (
                <>
                  {row.sharedReferral.name}-wide
                  <span className="sr-only">, no figure for this area alone</span>
                </>
              ) : cityUnitsOnly ? (
                "City units only"
              ) : (
                REFERRAL_TAG[referralStatus]
              )}
              {referralStatus !== "no_data" && (
                <span className="sr-only">
                  {referralStatus === "red" && !row.sharedReferral ? " than Finland's level" : referralStatus === "amber" && !cityUnitsOnly && !row.sharedReferral ? " (at or better than Finland's level)" : ""} (Finland{" "}
                  {formatPct(nationalReferral)})
                </span>
              )}
            </span>
          </StatusBadge>
        </span>
        {/* Desktop: at the end of the referral cell. Phone: centred on the whole row. */}
        <RowChevron className="ml-auto max-lg:hidden" />
      </span>
      <RowChevron className="absolute top-1/2 right-2.5 -translate-y-1/2 lg:hidden" />
    </Link>
  );
}

/**
 * The gap to Finland in a row, in words and without a sign: "30.7 above Finland". The column
 * header says the unit (percentage points); the screen-reader text says it in full.
 */
function GapShort({ value, finland }: { value: number; finland: number }) {
  const diff = Math.round((Number(value.toFixed(1)) - Number(finland.toFixed(1))) * 10) / 10;
  if (diff === 0) return <>Level with Finland</>;
  return (
    <>
      <span className="figure">{Math.abs(diff).toFixed(1)}</span>
      <span className="sr-only"> percentage points</span> {diff > 0 ? "above" : "below"} Finland
    </>
  );
}
