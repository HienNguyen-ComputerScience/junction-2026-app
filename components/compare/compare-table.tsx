"use client";

import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { cn } from "cn";

import { StatusBadge } from "@/components/ui/status-badge";
import type { CompareRow } from "@/lib/compare";
import { statusLabel } from "@/lib/status-label";
import { changeText } from "@/lib/compare-text";

type SortKey = "gp" | "change" | "referral" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "gp", label: "Longest GP wait first" },
  { key: "change", label: "Most worsened since 2023 first" },
  { key: "referral", label: "Slowest referrals first" },
  { key: "name", label: "Area name, A to Z" },
];

/** The marker beside a change that needs reading with care; the note under the table explains it (same character there). */
const RECORDING_MARK = "*";

// Missing values always sort last, whatever the column.
function compare(key: SortKey, a: CompareRow, b: CompareRow): number {
  const last = (x: number | null, y: number | null, dir: 1 | -1) =>
    x === null && y === null ? 0 : x === null ? 1 : y === null ? -1 : (x - y) * dir;
  switch (key) {
    case "gp":
      return b.gp - a.gp;
    case "change":
      return last(a.gpChange, b.gpChange, -1);
    case "referral":
      return last(a.referral, b.referral, 1);
    case "name":
      return a.name.localeCompare(b.name, "en");
  }
}

function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** "+30.7", "−22.0", "0.0": points against Finland overall. */
function signed(points: number): string {
  return `${points > 0 ? "+" : points < 0 ? "−" : ""}${Math.abs(points).toFixed(1)}`;
}

function Heading({
  keyName,
  sort,
  onSort,
  children,
  sub,
  className,
}: {
  keyName?: SortKey;
  sort: SortKey;
  onSort: (key: SortKey) => void;
  children: ReactNode;
  /** A second line under the heading, e.g. Finland overall's value. */
  sub?: ReactNode;
  className?: string;
}) {
  const active = keyName === sort;
  const ascending = keyName === "referral" || keyName === "name";
  return (
    <th
      scope="col"
      aria-sort={active ? (ascending ? "ascending" : "descending") : undefined}
      className={cn("px-3 pb-3 text-left align-bottom text-base font-semibold text-foreground first:pl-0 last:pr-0", className)}
    >
      {keyName ? (
        <button
          type="button"
          onClick={() => onSort(keyName)}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-sm text-left underline decoration-forest-ink/30 underline-offset-4 outline-none hover:text-forest-ink hover:decoration-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50",
            active && "text-forest-ink",
          )}
        >
          <span>{children}</span>
          {active ? (
            ascending ? (
              <ArrowUp aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
            ) : (
              <ArrowDown aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
            )
          ) : null}
        </button>
      ) : (
        children
      )}
      {sub ? <span className="block font-normal text-muted-foreground">{sub}</span> : null}
    </th>
  );
}

const LINK =
  "rounded-sm text-base font-semibold text-forest-ink underline decoration-forest-ink/30 underline-offset-4 outline-none hover:decoration-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50";
const BADGE = "h-auto shrink items-baseline whitespace-normal leading-snug";

/** The GP share, its points against Finland overall in brackets. */
function GpFigure({ row }: { row: CompareRow }) {
  return (
    <span className="text-base whitespace-nowrap">
      <span className={cn("figure text-lg font-semibold", row.gpStatus === "red" ? "text-status-red-ink" : "text-foreground")}>{pct(row.gp)}</span>{" "}
      <span className="figure text-muted-foreground">
        ({signed(row.gpVsFinland)}
        <span className="sr-only"> points against Finland overall</span>)
      </span>
    </span>
  );
}

function GpStatus({ row, wide = false }: { row: CompareRow; wide?: boolean }) {
  return (
    <StatusBadge status={row.gpStatus} variant="quiet" className={cn(BADGE, wide && "xl:whitespace-nowrap")}>
      {statusLabel(row.gpStatus, "gp_access")}
    </StatusBadge>
  );
}

/** "27.4 points worse (from 58.0%)", marked where it needs reading with care. */
function Change({ row }: { row: CompareRow }) {
  return (
    <>
      {changeText(row.gpChange) ?? "No 2023 figure"}
      {row.gpFirst !== null ? <span className="text-muted-foreground"> (from {pct(row.gpFirst)})</span> : null}
      {row.recording ? (
        <>
          <span aria-hidden className="ml-1 font-semibold text-forest-ink">
            {RECORDING_MARK}
          </span>
          <span className="sr-only">. Read with care: {row.recording.toLowerCase()}.</span>
        </>
      ) : null}
    </>
  );
}

function Referral({ row, inline = false }: { row: CompareRow; inline?: boolean }) {
  if (row.referral !== null)
    return (
      <span className={inline ? "inline" : "flex flex-col items-start gap-1"}>
        <span className="figure text-base">{pct(row.referral)}</span>
        <StatusBadge status={row.referralCityOnly ? "no_data" : row.referralStatus} variant="quiet" className={cn(BADGE, inline ? "ml-2" : "xl:whitespace-nowrap")}>
          {row.referralCityOnly ? "City units only" : statusLabel(row.referralStatus, "referral")}
        </StatusBadge>
      </span>
    );
  if (row.referralShared)
    return (
      <span className="text-base">
        No figure of its own.{" "}
        <span className="text-muted-foreground">
          HUS-wide: <span className="figure">{pct(row.referralShared.value)}</span>
        </span>
      </span>
    );
  return <span className="text-base">No public data</span>;
}

/**
 * Every area in one table that sorts: by a labelled "Sort the table by" list, or by pressing a
 * column heading. Five columns: rank, area, the GP wait with its status in words and its points
 * against Finland overall, the change since 2023 (marked where it needs reading with care), and
 * referrals. No motion. Under 640px the same rows, in the same order, are a compact list (one short
 * block per area); on paper a twin table with every column.
 */
export function CompareTable({ rows, finland, finlandReferral }: { rows: CompareRow[]; finland: number; finlandReferral: number }) {
  const [sort, setSort] = useState<SortKey>("gp");
  const selectId = useId();
  const sorted = useMemo(() => [...rows].sort((a, b) => compare(sort, a, b)), [rows, sort]);
  const current = SORTS.find((option) => option.key === sort)?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div data-print="hide" className="flex flex-col gap-1.5 sm:w-96">
        <label htmlFor={selectId} className="text-base font-semibold text-foreground">
          Sort the table by
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-11 w-full appearance-none rounded-lg border border-input bg-cream-paper pr-10 pl-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-forest-ink" />
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        Sorted: {current}
      </p>

      <div className="overflow-x-auto max-sm:hidden print:hidden">
      <table className="w-full border-collapse">
        <caption className="sr-only">All areas. Order: {current}. Press a column heading to sort by it.</caption>
        <thead>
          <tr className="border-b border-border">
            <Heading sort={sort} onSort={setSort} className="w-14">Rank</Heading>
            <Heading sort={sort} onSort={setSort} keyName="name">Area</Heading>
            <Heading sort={sort} onSort={setSort} keyName="gp" sub={<>Finland overall: <span className="figure">{pct(finland)}</span></>}>
              GP visits waiting over 7 days, 2025
            </Heading>
            <Heading sort={sort} onSort={setSort} keyName="change">Change since 2023</Heading>
            <Heading sort={sort} onSort={setSort} keyName="referral" sub={<>Finland overall: <span className="figure">{pct(finlandReferral)}</span></>}>
              Referrals handled within 3 days, 2025
            </Heading>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              <td className="py-3 pr-3 align-top">
                <span className="figure text-muted-foreground">{row.rank}</span>
              </td>
              <td className="px-3 py-3 align-top">
                <Link href={`/county/${row.id}`} className={LINK}>
                  {row.name}
                </Link>
              </td>
              <td className="px-3 py-3 align-top">
                <span className="flex flex-col items-start gap-1">
                  <GpFigure row={row} />
                  <GpStatus row={row} wide />
                </span>
              </td>
              <td className="px-3 py-3 align-top text-base xl:whitespace-nowrap">
                <Change row={row} />
              </td>
              <td className="py-3 pl-3 align-top">
                <Referral row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* The phone version: the same rows and order, one short block per area, under a key for its figures. */}
      <div className="flex flex-col gap-1 border-b border-border pb-3 text-base text-pretty sm:hidden print:hidden">
        <p>
          <span className="font-semibold">Figure:</span> GP visits waiting over 7 days, 2025. Finland overall:{" "}
          <span className="figure">{pct(finland)}</span>. In brackets: points above (+) or below (−) Finland overall.
        </p>
        <p>
          <span className="font-semibold">Referrals:</span> handled within 3 days, 2025. Finland overall:{" "}
          <span className="figure">{pct(finlandReferral)}</span>.
        </p>
      </div>
      <ol aria-label={`All areas. Order: ${current}.`} className="flex flex-col sm:hidden print:hidden">
        {sorted.map((row) => (
          <li key={row.id} className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
            <p className="flex items-baseline justify-between gap-3">
              <span>
                <span className="figure text-muted-foreground">{row.rank}. </span>
                <Link href={`/county/${row.id}`} className={LINK}>
                  {row.name}
                </Link>
              </span>
              <GpFigure row={row} />
            </p>
            <p>
              <span className="sr-only">GP visits waiting over 7 days, 2025: </span>
              <GpStatus row={row} />
            </p>
            <p className="text-base">
              <span className="font-semibold text-muted-foreground">Since 2023: </span>
              <Change row={row} />
            </p>
            <p className="text-base">
              <span className="font-semibold text-muted-foreground">Referrals: </span>
              <Referral row={row} inline />
            </p>
          </li>
        ))}
      </ol>
      <PrintTable rows={sorted} finland={finland} finlandReferral={finlandReferral} order={current} />
    </div>
  );
}

const SHORT_STATUS = { red: "Worse", amber: "At or better", no_data: "No data" } as const;

/**
 * The table as it goes on paper: one landscape A4 page, one line per area, figures right-aligned,
 * no panels. Same rows, same order as on screen, plus the columns the screen keeps in the chart and
 * the note (points against Finland overall, the 2023 value, the read-with-care text). Status in words.
 */
function PrintTable({
  rows,
  finland,
  finlandReferral,
  order,
}: {
  rows: CompareRow[];
  finland: number;
  finlandReferral: number;
  order: string;
}) {
  const th = "border-b-2 border-forest-ink px-1.5 pb-1 text-left align-bottom font-semibold whitespace-nowrap";
  const td = "border-b border-border-mist px-1.5 py-[2.5pt] align-top";
  const num = "text-right tabular-nums whitespace-nowrap";
  return (
    <table className="hidden w-full border-collapse text-[8.5pt] leading-snug text-charcoal print:table">
      <caption className="pb-1.5 text-left text-[8.5pt] text-muted-foreground">
        All {rows.length} areas. Order: {order}. Status compares each area with Finland overall, not with a clinical standard.
      </caption>
      <thead>
        <tr>
          <th className={th}>Rank</th>
          <th className={th}>Area</th>
          <th className={cn(th, "text-right")}>
            GP visits waiting
            <br />
            over 7 days, 2025
          </th>
          <th className={th}>
            Status vs Finland overall
            <br />({pct(finland)})
          </th>
          <th className={cn(th, "text-right")}>
            Points
            <br />
            vs Finland overall
          </th>
          <th className={cn(th, "text-right")}>2023</th>
          <th className={th}>
            Change
            <br />
            since 2023
          </th>
          <th className={th}>Read with care</th>
          <th className={cn(th, "text-right")}>
            Referrals within
            <br />3 days, 2025
          </th>
          <th className={th}>
            Referral status
            <br />
            (Finland overall: {pct(finlandReferral)})
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className={cn(td, num)}>{row.rank}</td>
            <td className={cn(td, "font-semibold whitespace-nowrap")}>{row.name}</td>
            <td className={cn(td, num, row.gpStatus === "red" && "font-semibold text-status-red-ink")}>{pct(row.gp)}</td>
            <td className={cn(td, "whitespace-nowrap")}>
              <StatusBadge status={row.gpStatus} variant="quiet" className="h-auto text-[8.5pt] leading-snug text-charcoal">
                {SHORT_STATUS[row.gpStatus]}
              </StatusBadge>
            </td>
            <td className={cn(td, num)}>{signed(row.gpVsFinland)}</td>
            <td className={cn(td, num)}>{row.gpFirst !== null ? pct(row.gpFirst) : "–"}</td>
            <td className={cn(td, "whitespace-nowrap")}>{changeText(row.gpChange) ?? "No 2023 figure"}</td>
            <td className={cn(td, "whitespace-nowrap")}>{row.recording ?? ""}</td>
            <td className={cn(td, num)}>
              {row.referral !== null ? pct(row.referral) : row.referralShared ? `(${pct(row.referralShared.value)})` : "–"}
            </td>
            <td className={cn(td, "whitespace-nowrap")}>
              {row.referralCityOnly
                ? "City units only"
                : row.referralShared
                  ? "HUS-wide value only"
                  : row.referral !== null
                    ? SHORT_STATUS[row.referralStatus]
                    : "No public data"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
