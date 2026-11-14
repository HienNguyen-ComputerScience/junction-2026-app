import type { Item } from "./types";

export function Unavailable({ children }: { children?: React.ReactNode }) {
  return (
    <p role="status" className="rounded-xl border border-dashed border-input bg-muted/40 p-4 text-sm text-muted-foreground">
      Live search is unavailable right now. {children ?? "The rest of the page still works."}
    </p>
  );
}

export function LoadingRows({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="space-y-1.5">
          <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-full animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ResultList({ items, numbered = false, idPrefix = "exa-src" }: { items: Item[]; numbered?: boolean; idPrefix?: string }) {
  return (
    <ol className="divide-y divide-border/80">
      {items.map((item, i) => (
        <li
          key={`${item.url}-${i}`}
          id={numbered ? `${idPrefix}-${i + 1}` : undefined}
          className="scroll-mt-20 space-y-1 py-3 first:pt-0 last:pb-0"
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-sm font-semibold text-foreground underline-offset-4 outline-none hover:text-brand-ink hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {numbered && <span className="mr-1.5 font-medium text-brand-ink tabular-nums">[{i + 1}]</span>}
            {item.title}
          </a>
          <p className="text-xs text-muted-foreground">
            {item.domain}
            {" · "}
            {item.publishedDate ? <time dateTime={item.publishedDate}>{item.publishedDate}</time> : "date unknown"}
            {item.maybePaywalled && " · may be paywalled"}
          </p>
          {item.snippet && <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{item.snippet}</p>}
        </li>
      ))}
    </ol>
  );
}
