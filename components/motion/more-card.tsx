import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * The end of a page: every secondary thing (more options, live search, related links) in one
 * framed "More for <area>" card. Each row is a short label and its one button, separated by
 * hairlines. A row may hold a little more under its label (a live result list that opens in
 * place), but never a paragraph. It prints with every row open, except rows marked
 * `print: false` (live, unverified results).
 */
export function MoreCard({
  title,
  rows,
  id = "more",
  className,
}: {
  /** "More for Kainuu", "More on Finland". */
  title: string;
  rows: { key: string; label: ReactNode; action?: ReactNode; children?: ReactNode; /** False for a screen-only row (live, unverified results). */ print?: boolean }[];
  id?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      data-slot="more-card"
      className={cn("rounded-panel border border-border bg-card px-5 py-2 sm:px-7", className)}
    >
      <h2 id={`${id}-title`} className="type-title pt-4 pb-2">
        {title}
      </h2>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.key} className={cn("flex flex-col gap-3 py-4", row.print === false && "print:hidden")}>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <p className="text-base font-semibold text-pretty text-forest-ink">{row.label}</p>
              {row.action ? <div className="shrink-0">{row.action}</div> : null}
            </div>
            {row.children}
          </li>
        ))}
      </ul>
    </section>
  );
}
