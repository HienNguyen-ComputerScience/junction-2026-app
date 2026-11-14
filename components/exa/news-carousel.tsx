import { ArrowUpRight } from "lucide-react";

import { CardCarousel } from "@/components/ui/card-carousel";

import { displayTitle, formatDate } from "./result-list";
import type { Item } from "./types";

/**
 * Live news as a row of compact title cards, about three at a time: the title (a link to the
 * page, three lines at most), its source and date, and the "In Finnish" label. No snippet: a
 * title, its source and its date are enough to judge a result. Dates are absolute because they
 * come from a cache.
 */
function NewsCard({ item }: { item: Item }) {
  const title = displayTitle(item.title, item.domain);
  const host = item.domain.replace(/^www\./, "");
  return (
    <article className="group relative flex w-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-muted px-4 py-3.5 transition-colors hover:border-foreground/25 hover:bg-accent">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        title={title === item.title ? undefined : item.title}
        className="line-clamp-3 rounded-sm text-sm leading-snug font-semibold text-pretty text-foreground outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset group-hover:text-brand-ink"
      >
        {title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <div className="mt-auto flex flex-col gap-2">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 type-caption text-muted-foreground">
          <span className="min-w-0 break-words">{host}</span>
          <span aria-hidden>·</span>
          {item.publishedDate ? (
            <time dateTime={item.publishedDate} title={item.publishedDate} className="whitespace-nowrap">
              {formatDate(item.publishedDate)}
            </time>
          ) : (
            <span className="whitespace-nowrap">date unknown</span>
          )}
          {item.maybePaywalled && (
            <>
              <span aria-hidden>·</span>
              <span className="whitespace-nowrap">may be paywalled</span>
            </>
          )}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex h-6 items-center rounded-sm border border-input px-1.5 text-[0.75rem] font-medium text-foreground/85">
            In Finnish
          </span>
          <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </article>
  );
}

export function NewsCarousel({ items, label }: { items: Item[]; label: string }) {
  return (
    <CardCarousel
      label={label}
      noun="article"
      layout="multi"
      items={items.map((item, i) => ({
        id: `${item.url}-${i}`,
        label: displayTitle(item.title, item.domain),
        node: <NewsCard item={item} />,
      }))}
    />
  );
}
