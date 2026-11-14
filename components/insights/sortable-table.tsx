"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "cn";

export type SortableColumn = {
  /** Visible column heading. */
  header: string;
  align?: "start" | "end";
  /** False for a column that does not sort (notes). */
  sortable?: boolean;
};

export type SortableRow = {
  key: string;
  /** One cell per column, already formatted (they may hold source chips and grade labels). */
  cells: ReactNode[];
  /** One sort key per column: a number, a string, or null (always sorted last). */
  sort: (number | string | null)[];
  /** Highlight the row (for example the areas a finding is about). */
  emphasis?: boolean;
};

/**
 * A plain table with a "Sort by …" button in every sortable heading. The first click sorts
 * from high to low for numbers and A to Z for text; the second click reverses. The rows are
 * in the HTML before any script runs, so the table prints and copies into Excel as it stands.
 */
export function SortableTable({
  caption,
  columns,
  rows,
  initialSort,
}: {
  /** Read by screen readers and shown above the table. */
  caption: string;
  columns: SortableColumn[];
  rows: SortableRow[];
  initialSort?: { column: number; direction: "asc" | "desc" };
}) {
  const [sort, setSort] = useState(initialSort ?? null);
  const sorted = sort
    ? [...rows].sort((a, b) => {
        const x = a.sort[sort.column];
        const y = b.sort[sort.column];
        if (x === null && y === null) return 0;
        if (x === null) return 1;
        if (y === null) return -1;
        const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.direction === "asc" ? order : -order;
      })
    : rows;

  const toggle = (column: number) => {
    const numeric = rows.some((row) => typeof row.sort[column] === "number");
    setSort((current) =>
      current?.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: numeric ? "desc" : "asc" },
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-[14px] bg-cream-paper">
      <table className="w-full min-w-[40rem] border-collapse text-left text-base">
        <caption className="px-4 pt-4 pb-2 text-left text-base font-semibold text-forest-ink">{caption}</caption>
        <thead>
          <tr className="border-b border-forest-ink/30">
            {columns.map((column, i) => {
              const active = sort?.column === i;
              const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : "none";
              return (
                <th
                  key={column.header}
                  scope="col"
                  aria-sort={column.sortable === false ? undefined : ariaSort}
                  className={cn("px-4 py-2 align-bottom font-semibold", column.align === "end" && "text-right")}
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 rounded-lg text-left font-semibold text-forest-ink underline decoration-forest-ink/30 underline-offset-4 outline-none hover:decoration-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50 print:no-underline",
                        column.align === "end" && "flex-row-reverse text-right",
                      )}
                    >
                      <span>
                        <span className="sr-only">Sort by </span>
                        {column.header}
                      </span>
                      {active ? (
                        sort.direction === "asc" ? (
                          <ArrowUp aria-hidden strokeWidth={1.75} className="size-4 shrink-0 print:hidden" />
                        ) : (
                          <ArrowDown aria-hidden strokeWidth={1.75} className="size-4 shrink-0 print:hidden" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden strokeWidth={1.75} className="size-4 shrink-0 opacity-60 print:hidden" />
                      )}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key} className={cn("border-b border-border-mist align-top", row.emphasis && "bg-keylime-wash")}>
              {row.cells.map((cell, i) => {
                const Cell = i === 0 ? "th" : "td";
                return (
                  <Cell
                    key={columns[i]?.header ?? i}
                    scope={i === 0 ? "row" : undefined}
                    className={cn(
                      "px-4 py-3",
                      i === 0 && "font-semibold",
                      columns[i]?.align === "end" && "text-right tabular-nums",
                    )}
                  >
                    {cell}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 pt-2 pb-4 text-base text-muted-foreground print:hidden">
        Press a column heading to sort by it; press it again to reverse the order.
      </p>
    </div>
  );
}
