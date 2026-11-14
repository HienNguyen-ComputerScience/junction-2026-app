import { ArrowUpRight } from "lucide-react";

import type { Item } from "./types";

export function Unavailable({ children }: { children?: React.ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-input bg-muted px-4 py-3 text-sm text-foreground">
      Live search is unavailable right now.{" "}
      <span className="text-muted-foreground">{children ?? "The rest of the page still works."}</span>
    </p>
  );
}

/** Placeholder rows in the shape of the result register. Static: no looping motion. */
export function LoadingRows({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="@container flex flex-col gap-4">
      <p className="type-caption text-muted-foreground">{label}…</p>
      <div aria-hidden className="flex flex-col divide-y divide-border/80">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0 @2xl:grid-cols-[7rem_minmax(0,1fr)]">
            <div className="flex gap-2 @2xl:flex-col">
              <div className="h-3 w-20 rounded-sm bg-muted" />
              <div className="h-3 w-16 rounded-sm bg-muted" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3.5 w-3/5 rounded-sm bg-accent" />
              <div className="h-3 w-full max-w-xl rounded-sm bg-muted" />
              <div className="h-3 w-4/5 max-w-md rounded-sm bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Live search results as a register: date and site in a narrow left column (when there is
 * room), title and a two-line snippet on the right. Snippets are clamped with an ellipsis,
 * never cut mid-word.
 */
export function ResultList({ items, numbered = false, idPrefix = "exa-src" }: { items: Item[]; numbered?: boolean; idPrefix?: string }) {
  return (
    <div className="@container">
      <ol className="divide-y divide-border/80">
        {items.map((item, i) => (
          <li
            key={`${item.url}-${i}`}
            id={numbered ? `${idPrefix}-${i + 1}` : undefined}
            className="grid scroll-mt-20 gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0 @2xl:grid-cols-[7rem_minmax(0,1fr)]"
          >
            <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 type-note text-muted-foreground @2xl:flex-col @2xl:gap-y-0.5 @2xl:pt-0.5">
              <span className="text-foreground/80">
                {item.publishedDate ? <time dateTime={item.publishedDate}>{item.publishedDate}</time> : "date unknown"}
              </span>
              <span className="@2xl:hidden" aria-hidden>
                ·
              </span>
              <span className="break-all">{item.domain}</span>
              {item.maybePaywalled && (
                <>
                  <span className="@2xl:hidden" aria-hidden>
                    ·
                  </span>
                  <span className="text-faint">may be paywalled</span>
                </>
              )}
            </p>
            <div className="flex min-w-0 max-w-[46rem] flex-col gap-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link w-fit rounded-sm text-sm leading-snug font-semibold text-pretty text-foreground outline-none transition-colors hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {numbered && <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">[{i + 1}]</span>}
                {item.title}
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="ml-1 inline-block size-4 align-[-3px] text-muted-foreground transition-colors group-hover/link:text-brand-ink"
                />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              {item.snippet && (
                <p className="line-clamp-2 type-caption break-words text-muted-foreground">{item.snippet}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
