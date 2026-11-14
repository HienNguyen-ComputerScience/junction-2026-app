import { ArrowUpRight } from "lucide-react";

import { displayTitle, formatDate } from "./result-list";
import type { Item } from "./types";

/**
 * Live news as a plain list of compact title cards, every one visible, read top to bottom: the
 * title (a link to the page, three lines at most), then its source, date and language on one
 * line. No snippet: a title, its source and its date are enough to judge a result. Dates are
 * absolute because they come from a cache. Live news is a screen aid, so it stays off paper.
 */
function NewsCard({ item }: { item: Item }) {
  const title = displayTitle(item.title, item.domain);
  const host = item.domain.replace(/^www\./, "");
  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col gap-2 rounded-lg border border-border bg-cream-paper px-4 py-3.5 transition-colors hover:border-forest-ink">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        title={title === item.title ? undefined : item.title}
        className="line-clamp-3 rounded-sm text-base leading-snug font-semibold text-pretty text-forest-ink outline-none after:absolute after:inset-0 after:rounded-lg group-hover:underline group-hover:underline-offset-2 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
      >
        {title}
        <ArrowUpRight aria-hidden strokeWidth={1.75} className="ml-1 inline size-4 align-[-0.125em] text-muted-foreground" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p className="mt-auto flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-base text-muted-foreground">
        <span className="min-w-0 break-words">{host}</span>
        <span aria-hidden>·</span>
        {item.publishedDate ? (
          <time dateTime={item.publishedDate} title={item.publishedDate} className="whitespace-nowrap">
            {formatDate(item.publishedDate)}
          </time>
        ) : (
          <span className="whitespace-nowrap">date unknown</span>
        )}
        <span aria-hidden>·</span>
        <span className="whitespace-nowrap">in Finnish</span>
        {item.maybePaywalled && (
          <>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">may be paywalled</span>
          </>
        )}
      </p>
    </article>
  );
}

export function NewsList({ items, label }: { items: Item[]; label: string }) {
  return (
    <ul aria-label={label} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`} className="flex">
          <NewsCard item={item} />
        </li>
      ))}
    </ul>
  );
}
