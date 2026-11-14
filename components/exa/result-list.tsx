import type { Item } from "./types";

export function Unavailable({ children }: { children?: React.ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-dashed border-input bg-muted/40 p-4 text-sm text-muted-foreground">
      Live search is unavailable right now. {children ?? "The rest of the page still works."}
    </p>
  );
}

export function LoadingRows({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="flex flex-col gap-2">
          <div className="h-4 w-3/5 animate-pulse rounded-sm bg-foreground/10" />
          <div className="h-3 w-full max-w-xl animate-pulse rounded-sm bg-foreground/10" />
        </div>
      ))}
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
            className="grid scroll-mt-20 gap-x-6 gap-y-1 py-3 first:pt-0 last:pb-0 @2xl:grid-cols-[9.5rem_minmax(0,1fr)]"
          >
            <p className="flex flex-wrap gap-x-1.5 type-mark text-muted-foreground @2xl:flex-col @2xl:pt-0.5">
              <span>
                {item.publishedDate ? <time dateTime={item.publishedDate}>{item.publishedDate}</time> : "date unknown"}
              </span>
              <span className="@2xl:hidden" aria-hidden>
                ·
              </span>
              <span className="break-all">{item.domain}</span>
              {item.maybePaywalled && <span>may be paywalled</span>}
            </p>
            <div className="flex min-w-0 max-w-[46rem] flex-col gap-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit rounded-sm text-sm leading-snug font-semibold text-foreground underline decoration-foreground/25 underline-offset-4 outline-none transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {numbered && <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">[{i + 1}]</span>}
                {item.title}
              </a>
              {item.snippet && (
                <p className="line-clamp-2 type-caption text-muted-foreground">{item.snippet}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
