import { ArrowUpRight } from "lucide-react";
import { Fragment } from "react";

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

/**
 * Live search results as a register: date and site in a narrow left column (when there is
 * room), title and a two-line snippet on the right. Snippets are clamped with an ellipsis,
 * never cut mid-word.
 */
export function ResultList({ items, numbered = false, idPrefix = "exa-src" }: { items: Item[]; numbered?: boolean; idPrefix?: string }) {
  return (
    <div className="@container">
      <ol className="divide-y divide-border/80">
        {items.map((item, i) => {
          const title = displayTitle(item.title, item.domain);
          const snippet = item.snippet && !isMenuSnippet(item.snippet) ? item.snippet : null;
          return (
            <li
              key={`${item.url}-${i}`}
              id={numbered ? `${idPrefix}-${i + 1}` : undefined}
              className="grid scroll-mt-20 gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0 @2xl:grid-cols-[7rem_minmax(0,1fr)]"
            >
              <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 type-caption text-muted-foreground @2xl:flex-col @2xl:pt-px">
                <span className="text-foreground/80">
                  {item.publishedDate ? <time dateTime={item.publishedDate}>{item.publishedDate}</time> : "date unknown"}
                </span>
                <span className="@2xl:hidden" aria-hidden>
                  ·
                </span>
                {/* Long hosts wrap after a dot, never mid-name. */}
                <span className="min-w-0 break-words">
                  {item.domain.split(".").map((part, j) => (
                    <Fragment key={j}>
                      {j > 0 && (
                        <>
                          .<wbr />
                        </>
                      )}
                      {part}
                    </Fragment>
                  ))}
                </span>
                {item.maybePaywalled && (
                  <>
                    <span className="@2xl:hidden" aria-hidden>
                      ·
                    </span>
                    <span className="text-faint">may be paywalled</span>
                  </>
                )}
              </p>
              {/* Auto height: a result without a snippet is its title row alone. */}
              <div className="flex min-w-0 max-w-[46rem] flex-col gap-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title === item.title ? undefined : item.title}
                  className="group/link w-fit rounded-sm text-sm leading-snug font-semibold text-pretty text-foreground outline-none transition-colors hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {numbered && <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">[{i + 1}]</span>}
                  {title}
                  <ArrowUpRight
                    aria-hidden
                    strokeWidth={1.75}
                    className="ml-1 inline-block size-3.5 align-[-2px] text-muted-foreground transition-colors group-hover/link:text-brand-ink"
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                {snippet && <p className="line-clamp-2 max-w-[72ch] type-caption break-words text-muted-foreground">{snippet}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
