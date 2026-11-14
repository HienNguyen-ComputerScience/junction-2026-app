// Pure cache rules for POST /api/ask (no imports, so `node --test` can load this file directly).
import type { Freshness } from "./client";

export type AskTtl = {
  /** A written answer: the full TTL. */
  answer: number;
  /** Any "nothing found" (no results, no relevant results, no recent results, Claude found nothing). */
  nothingFound: number;
};

type Cached = { answer: unknown; nothingFound: boolean };

/**
 * How long a cached ask response stays fresh, chosen at read time from what it holds, so a pinned
 * example question with a nothing-found expires as well. A wrong nothing-found should not stick all
 * day; an answer should.
 */
export function askTtl(value: Cached, ttl: AskTtl): number {
  return value.nothingFound ? ttl.nothingFound : ttl.answer;
}

/**
 * Cache a reply only when it is definite (an answer or a nothing-found) and built from current search
 * items: "live", or "cache" (same normalised question → same cached items → same answer). Never for
 * "unavailable" (Exa or Claude down) or "stale-cache" (old items served during an outage, which would
 * otherwise be re-stamped as fresh).
 */
export function shouldCacheAsk(searchFreshness: Freshness, reply: Cached): boolean {
  return (searchFreshness === "live" || searchFreshness === "cache") && (reply.answer !== null || reply.nothingFound);
}
