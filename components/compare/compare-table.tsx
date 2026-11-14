"use client";

import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { cn } from "cn";

import { Reveal } from "@/components/motion/reveal";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CompareRow } from "@/lib/compare";
import { changeText, vsFinlandText } from "@/lib/compare-text";

type SortKey = "gp" | "change" | "referral" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "gp", label: "Longest GP wait first" },
  { key: "change", label: "Most worsened since 2023 first" },
  { key: "referral", label: "Slowest referrals first" },
  { key: "name", label: "Area name, A to Z" },
];

const STATUS_WORDS = {
  red: "Worse than Finland's level",
  amber: "At or better than Finland's level",
  no_data: "No public data",
} as const;

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

function Heading({
keyName,
sort,
onSort,
children,
className,
}: {
keyName?: SortKey;
sort: SortKey;
onSort: (key: SortKey) => void;
children: ReactNode;
className?: string;
}) {
  const active = keyName === sort;
  const ascending = keyName === "referral" || keyName === "name";
  return (
    <th
      scope="col"
      aria-sort={active ? (ascending ? "ascending" : "descending") : undefined}
      className={cn("px-3 pb-3 text-left align-bottom text-sm font-semibold text-muted-foreground first:pl-0 last:pr-0", className)}
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
    </th>
  );
}

function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Every area in one table that sorts: by a labelled "Sort the table by" list, or by pressing a
 * column heading. Rows fade in and their bars grow as they scroll into view (quiet motion); the
 * figures do not count. The full table is always there: in the HTML, in print and on a phone
 * (as labelled rows).
 */
export function CompareTable({ rows, finland, finlandReferral }: { rows: CompareRow[]; finland: number; finlandReferral: number }) {
  const [sort, setSort] = useState<SortKey>("gp");
  const selectId = useId();
  const sorted = useMemo(() => [...rows].sort((a, b) => compare(sort, a, b)), [rows, sort]);
  const current = SORTS.find((option) => option.key === sort)?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div data-print="hide" className="flex flex-col gap-1.5 sm:w-96">
        <label htmlFor={selectId} className="text-sm font-semibold text-foreground">
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

      <table className="stack-table w-full border-collapse print:hidden">
        <caption className="sr-only">All areas. Order: {current}. Press a column heading to sort by it.</caption>
        <thead>
          <tr className="border-b border-border">
            <Heading sort={sort} onSort={setSort} className="w-12">Rank</Heading>
            <Heading sort={sort} onSort={setSort} keyName="name">Area</Heading>
            <Heading sort={sort} onSort={setSort} keyName="gp" className="min-w-[16rem]">
              GP visits waiting over 7 days, 2025
            </Heading>
            <Heading sort={sort} onSort={setSort}>Compared with Finland ({pct(finland)})</Heading>
            <Heading sort={sort} onSort={setSort} keyName="change">Change since 2023</Heading>
            <Heading sort={sort} onSort={setSort} keyName="referral">Referrals handled within 3 days, 2025</Heading>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <Reveal as="tr" key={row.id} index={Math.min(i, 8)} className="border-b border-border last:border-b-0">
              <td data-label="Rank" className="px-3 py-3.5 align-top first:pl-0">
                <div className="figure text-muted-foreground">{row.rank}</div>
              </td>
              <td data-label="Area" className="px-3 py-3.5 align-top">
                <div>
                  <Link
                    href={`/county/${row.id}`}
                    className="rounded-sm text-base font-semibold text-forest-ink underline decoration-forest-ink/30 underline-offset-4 outline-none hover:decoration-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {row.name}
                  </Link>
                </div>
              </td>
              <td data-label="GP visits waiting over 7 days, 2025" className="px-3 py-3.5 align-top">
                <div className="flex flex-col gap-2">
                  <span className="flex flex-col items-start gap-1">
                    <span className={cn("figure text-xl", row.gpStatus === "red" ? "text-status-red-ink" : "text-foreground")}>{pct(row.gp)}</span>
                    <StatusBadge status={row.gpStatus} variant="quiet" className="h-auto shrink items-baseline whitespace-normal leading-snug">
                      {STATUS_WORDS[row.gpStatus]}
                    </StatusBadge>
                  </span>
                  <span aria-hidden className="relative block h-2.5 w-full rounded-[2px] bg-track">
                    <BarFill value={row.gp} finland={finland} status={row.gpStatus} index={Math.min(i, 8)} />
                    <FinlandTick finland={finland} />
                  </span>
                </div>
              </td>
              <td data-label={`Compared with Finland (${pct(finland)})`} className="px-3 py-3.5 align-top">
                <div className="text-base">{vsFinlandText(row.gpVsFinland)}</div>
              </td>
              <td data-label="Change since 2023" className="px-3 py-3.5 align-top">
                <div className="flex flex-col gap-1">
                  <span className="text-base">
                    {changeText(row.gpChange) ?? "No 2023 figure"}
                    {row.gpFirst !== null ? <span className="text-muted-foreground"> (from {pct(row.gpFirst)})</span> : null}
                  </span>
                  {row.recording ? <span className="text-sm text-muted-foreground">Read with care: {row.recording.toLowerCase()}</span> : null}
                </div>
              </td>
              <td data-label="Referrals handled within 3 days, 2025" className="px-3 py-3.5 align-top last:pr-0">
                <div className="flex flex-col gap-1">
                  {row.referral !== null ? (
                    <>
                      <span className="flex flex-col items-start gap-1">
                        <span className="figure text-base">{pct(row.referral)}</span>
                        <StatusBadge status={row.referralCityOnly ? "no_data" : row.referralStatus} variant="quiet" className="h-auto shrink items-baseline whitespace-normal leading-snug">
                          {row.referralCityOnly ? "City units only" : STATUS_WORDS[row.referralStatus]}
                        </StatusBadge>
                      </span>
                      {row.referralCityOnly ? (
                        <span className="text-sm text-muted-foreground">Most Helsinki referrals go to HUS.</span>
                      ) : null}
                    </>
                  ) : row.referralShared ? (
                    <>
                      <span className="text-base">No figure for this area</span>
                      <span className="text-sm text-muted-foreground">
                        HUS-wide, shared by four areas: {pct(row.referralShared.value)} (Finland {pct(finlandReferral)})
                      </span>
                    </>
                  ) : (
                    <span className="text-base">No public data</span>
                  )}
                </div>
              </td>
            </Reveal>
          ))}
        </tbody>
      </table>
      <PrintTable rows={sorted} finland={finland} finlandReferral={finlandReferral} order={current} />
    </div>
  );
}

const SHORT_STATUS = { red: "Worse", amber: "At or better", no_data: "No data" } as const;

/**
 * The table as it goes on paper: one landscape A4 page, one line per area, figures right-aligned,
 * no bars or panels. Same rows, same order as on screen; status still in words.
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
        All {rows.length} areas. Order: {order}. Status compares each area with Finland, not with a clinical standard.
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
            Status vs Finland
            <br />({pct(finland)})
          </th>
          <th className={cn(th, "text-right")}>
            Points
            <br />
            vs Finland
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
            (Finland {pct(finlandReferral)})
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
            <td className={cn(td, num)}>
              {row.gpVsFinland > 0 ? "+" : row.gpVsFinland < 0 ? "−" : ""}
              {Math.abs(row.gpVsFinland).toFixed(1)}
            </td>
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
