import type { Item } from "./types";

export function Unavailable({ children }: { children?: React.ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
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
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ResultList({ items, numbered = false, idPrefix = "exa-src" }: { items: Item[]; numbered?: boolean; idPrefix?: string }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`} id={numbered ? `${idPrefix}-${i + 1}` : undefined} className="space-y-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            {numbered && <span className="mr-1.5 text-muted-foreground">[{i + 1}]</span>}
            {item.title}
          </a>
          <p className="text-xs text-muted-foreground">
            {item.domain}
            {" · "}
            {item.publishedDate ? <time dateTime={item.publishedDate}>{item.publishedDate}</time> : "date unknown"}
            {item.maybePaywalled && " · may be paywalled"}
          </p>
          {item.snippet && <p className="text-sm text-muted-foreground">{item.snippet}</p>}
        </li>
      ))}
    </ol>
  );
}
