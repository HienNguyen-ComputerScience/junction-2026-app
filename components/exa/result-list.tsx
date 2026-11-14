import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { statusText, type Freshness, type Item } from "./types";

/**
 * Where live content comes from, in one pattern everywhere: the "Found live — unverified" tag,
 * then "via Exa · live" or "via Exa · cached · saved 2026-11-14" once a response says which.
 */
export function LiveMark({
  result,
  className,
}: {
  /** The response, once there is one. */
  result?: { freshness: Freshness; retrievedAt?: string; offTopic?: boolean } | null;
  className?: string;
}) {
  const freshness = result ? statusText(result) : null;
  return (
    <span className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className ?? ""}`}>
      <Badge variant="unverified">Found live — unverified</Badge>
      <span className="type-caption font-normal text-muted-foreground">
        via Exa{freshness ? ` · ${freshness.toLowerCase()}` : ""}
      </span>
    </span>
  );
}

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
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <p className="type-caption text-muted-foreground">{label}…</p>
      <div aria-hidden className="flex flex-col divide-y divide-border/80">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 py-3.5 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-2">
              <div className="h-3.5 w-3/5 rounded-sm bg-accent" />
              <div className="h-3 w-full max-w-xl rounded-sm bg-muted" />
              <div className="h-3 w-2/5 max-w-xs rounded-sm bg-muted" />
            </div>
            <div className="size-3.5 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** The last " | tail" of a title. */
const PIPE_TAIL = /\s\|\s([^|]+)$/;
/** The last " - tail" (or en/em dash) of a title; the tail itself may hold hyphenated words. */
const DASH_TAIL = /\s[-–—]\s(?!.*\s[-–—]\s)(.+)$/;
/** Tails that name a publisher: "Lääkärilehti", "Vantaan Sanomat", "Helsingin kaupunki". */
const SITE_WORD = /(hyvinvointialue|ministeri\w*|lehti|sanomat|kaupunki|uutiset)$/i;

function isShortTail(tail: string, maxWords: number) {
  const t = tail.trim();
  return t.length <= 40 && t.split(/\s+/).length <= maxWords && !/[.!?:,;]/.test(t);
}

/**
 * The title without a trailing site name ("… | Vantaan ja Keravan hyvinvointialue",
 * "… - Lääkärilehti"). Display only: the full title stays in the link's tooltip. A pipe tail is
 * dropped when it is short (repeatedly, for "| Section | Site"); a dash tail only when it is
 * also clearly a publisher (matches the domain, an acronym, or a publisher word), because a
 * dash is often a real subtitle.
 */
export function displayTitle(title: string, domain: string): string {
  let out = title.trim();
  let stripped = false;
  for (;;) {
    const m = PIPE_TAIL.exec(out);
    if (!m || !isShortTail(m[1], 5) || m.index < 12) break;
    out = out.slice(0, m.index);
    stripped = true;
  }
  if (stripped) return out;
  const m = DASH_TAIL.exec(out);
  if (!m || m.index < 12) return out;
  const tail = m[1].trim();
  if (!isShortTail(tail, 3) || /\d/.test(tail) || !/^\p{Lu}/u.test(tail)) return out;
  const t = fold(tail);
  const stem = fold(domain.replace(/^www\./, "").split(".").slice(0, -1).join(""));
  const publisher =
    (t.length >= 3 && stem.length >= 3 && (stem.includes(t) || t.includes(stem))) ||
    /^\p{Lu}{2,6}$/u.test(tail) ||
    SITE_WORD.test(tail);
  return publisher ? out.slice(0, m.index) : out;
}

/**
 * Scraped navigation menus are not snippets ("fysioterapiapalvelut - Ravitsemusterapiapalvelut
 * - …"): mostly short " - " separated items, or no sentence punctuation in a run of capitalised
 * words. Those rows show title, date and host only.
 */
export function isMenuSnippet(snippet: string): boolean {
  const parts = snippet.split(/\s[-–]\s/);
  if (parts.length >= 4 && parts.reduce((sum, p) => sum + p.length, 0) / parts.length < 40) return true;
  if (/[.!?,;:]/.test(snippet.replace(/\.{2,}|…/g, " "))) return false;
  const words = snippet.split(/\s+/).filter(Boolean);
  return words.filter((w) => /^\p{Lu}/u.test(w)).length / Math.max(1, words.length) >= 0.4;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-12" (or a full ISO timestamp) as "12 Nov 2026". Anything else is shown as it came. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : iso;
}

/**
 * Live search results as rows of two columns: the title (a two-line link), the snippet (two
 * lines) and one caption "host · date" on the left; the external arrow, top-aligned, on the
 * right. A row without a snippet is just the title and the caption. Dates come from a cache,
 * so they are absolute, never "3 days ago".
 */
export function ResultList({ items, numbered = false, idPrefix = "exa-src" }: { items: Item[]; numbered?: boolean; idPrefix?: string }) {
  return (
    <ol className="divide-y divide-border/80">
      {items.map((item, i) => {
        const title = displayTitle(item.title, item.domain);
        const snippet = item.snippet && !isMenuSnippet(item.snippet) ? item.snippet : null;
        const host = item.domain.replace(/^www\./, "");
        return (
          <li
            key={`${item.url}-${i}`}
            id={numbered ? `${idPrefix}-${i + 1}` : undefined}
            className="grid scroll-mt-20 grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={title === item.title ? undefined : item.title}
              className="group/link col-start-1 row-start-1 line-clamp-2 min-w-0 rounded-sm text-sm leading-snug font-semibold text-pretty text-foreground outline-none transition-colors hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {numbered && <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">[{i + 1}]</span>}
              {title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.75}
              className="col-start-2 row-start-1 mt-0.5 size-3.5 shrink-0 whitespace-nowrap text-muted-foreground"
            />
            {snippet && (
              <p className="col-start-1 line-clamp-2 type-caption break-words text-muted-foreground">{snippet}</p>
            )}
            <p className="col-start-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 type-caption text-muted-foreground">
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
          </li>
        );
      })}
    </ol>
  );
}
