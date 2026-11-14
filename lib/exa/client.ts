import "server-only";

import { MAYBE_PAYWALLED } from "./config";

// Typed, server-only Exa client: search + contents, a short timeout, and an
// in-memory cache that also serves stale entries when Exa is down.
// Never import this from a client component (the "server-only" import enforces it).

const API = "https://api.exa.ai";

export type SearchType = "instant" | "fast" | "auto" | "deep-lite" | "deep";

export type SearchRequest = {
  query: string;
  type: SearchType;
  numResults: number;
  userLocation?: string;
  includeDomains?: string[];
  startPublishedDate?: string;
  category?: "news" | "publication" | "company" | "people" | "personal site" | "financial report";
  contents?: {
    highlights?: { maxCharacters: number; query?: string };
    text?: { maxCharacters: number };
  };
};

export type ContentsRequest = {
  urls: string[];
  text?: { maxCharacters: number };
  highlights?: { maxCharacters: number; query?: string };
};

/** The item shape every /api/* route returns. */
export type Item = {
  title: string;
  url: string;
  domain: string;
  publishedDate: string | null; // YYYY-MM-DD, null = "date unknown"
  snippet: string;
  maybePaywalled: boolean;
};

export type Freshness = "live" | "cache" | "stale-cache" | "unavailable";

/** `retrievedAt` (YYYY-MM-DD) is set when the items come from a cache rather than a live call. */
export type ItemsResult = { items: Item[]; freshness: Freshness; error?: string; retrievedAt?: string };

type RawResult = {
  title: string;
  url: string;
  publishedDate: string | null;
  highlights: string[];
  text: string | null;
};

export class ExaError extends Error {}

type CallOptions = { timeoutMs: number; simulateOutage: boolean };

// ---------- runtime parsing (no `any`) ----------

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

function parseResults(json: unknown): RawResult[] {
  if (!isObject(json) || !Array.isArray(json.results)) throw new ExaError("Unexpected Exa response shape");
  const out: RawResult[] = [];
  for (const r of json.results) {
    if (!isObject(r)) continue;
    const url = str(r.url);
    if (!url) continue;
    out.push({
      url,
      title: str(r.title) ?? url,
      publishedDate: str(r.publishedDate),
      highlights: Array.isArray(r.highlights) ? r.highlights.filter((h): h is string => typeof h === "string") : [],
      text: str(r.text),
    });
  }
  return out;
}

// ---------- HTTP ----------

async function post(path: "/search" | "/contents", body: SearchRequest | ContentsRequest, opts: CallOptions) {
  if (opts.simulateOutage) throw new ExaError("Simulated Exa outage (EXA_SIMULATE_OUTAGE)");
  const key = process.env.EXA_API_KEY;
  if (!key) throw new ExaError("EXA_API_KEY is not set");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new ExaError(`Exa ${path} returned HTTP ${res.status}`);
    return parseResults(await res.json());
  } catch (err) {
    if (err instanceof ExaError) throw err;
    if (err instanceof Error && err.name === "AbortError") throw new ExaError(`Exa ${path} timed out after ${opts.timeoutMs} ms`);
    throw new ExaError(`Exa ${path} failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- cache ----------
// In-memory, per server instance. Kept on globalThis so dev hot reloads don't wipe it.
// Fresh entries are served without calling Exa; stale entries are served only when Exa fails.
// Two stores: `pinned` holds the closed set of demo keys (22 county ids, the evidence rows and
// presets, the example questions), so it is bounded by construction and never evicted. Free-text
// keys (typed questions, free-text evidence) go to `open`, which evicts oldest-first, so a loop of
// unique questions can never push the pre-warmed demo entries out.

type Entry = { at: number; value: unknown };
const globalCache = globalThis as typeof globalThis & {
  __exaCache?: Map<string, Entry>;
  __exaPinned?: Map<string, Entry>;
};
const open = (globalCache.__exaCache ??= new Map<string, Entry>());
const pinned = (globalCache.__exaPinned ??= new Map<string, Entry>());
const MAX_OPEN_ENTRIES = 500;

/** `ageMs` lets a caller pick the TTL at read time from the cached value (see lib/exa/ask-cache.ts). */
export function cacheGet<T>(
  key: string,
  ttlMs: number,
): { value: T; fresh: boolean; retrievedAt: string; ageMs: number } | null {
  const e = pinned.get(key) ?? open.get(key);
  if (!e) return null;
  const ageMs = Date.now() - e.at;
  return {
    value: e.value as T,
    fresh: ageMs < ttlMs,
    retrievedAt: new Date(e.at).toISOString().slice(0, 10),
    ageMs,
  };
}

export function cacheSet(key: string, value: unknown, pin = false) {
  if (pin) {
    pinned.set(key, { at: Date.now(), value });
    return;
  }
  open.delete(key); // re-insert at the end, so eviction is by last write
  if (open.size >= MAX_OPEN_ENTRIES) {
    const oldest = open.keys().next().value;
    if (oldest !== undefined) open.delete(oldest);
  }
  open.set(key, { at: Date.now(), value });
}

// ---------- public API ----------

const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/^#+\s*/, "").trim();

export const isPaywalled = (domain: string) =>
  MAYBE_PAYWALLED.some((d) => domain === d || domain.endsWith(`.${d}`));

export function toItem(r: RawResult, snippetChars = 400): Item {
  const domain = domainOf(r.url);
  const snippetSource = r.highlights.length ? r.highlights.join(" … ") : (r.text ?? "");
  return {
    title: clean(r.title),
    url: r.url,
    domain,
    publishedDate: r.publishedDate ? r.publishedDate.slice(0, 10) : null,
    snippet: clean(snippetSource).slice(0, snippetChars),
    maybePaywalled: isPaywalled(domain),
  };
}

export type SearchOptions = {
  ttlMs: number;
  /**
   * Logical cache key, e.g. `news:vantaa-kerava`. Use one without dates, so an entry survives the
   * daily roll of `startPublishedDate`. Default: the full request JSON.
   */
  cacheKey?: string;
  /** Keep this entry in the never-evicted store (closed set of demo keys only). */
  pin?: boolean;
  timeoutMs?: number;
  simulateOutage?: boolean;
  snippetChars?: number;
};

const searchKey = (body: SearchRequest, opts: SearchOptions) =>
  `search:${opts.cacheKey ?? JSON.stringify(body)}:${opts.snippetChars ?? 400}`;

/**
 * True when `search(body, opts)` called now would be served from the fresh cache without calling Exa.
 * Lets a route count a request against the rate limit only when it is about to spend. Synchronous, so
 * nothing can change the cache between this check and a `search()` call made right after it.
 */
export function searchCached(body: SearchRequest, opts: SearchOptions): boolean {
  return cacheGet(searchKey(body, opts), opts.ttlMs)?.fresh ?? false;
}

/** Search Exa and return normalised items. Never throws: on failure it serves stale cache or an empty list. */
export async function search(body: SearchRequest, opts: SearchOptions): Promise<ItemsResult> {
  const key = searchKey(body, opts);
  const hit = cacheGet<Item[]>(key, opts.ttlMs);
  if (hit?.fresh) return { items: hit.value, freshness: "cache", retrievedAt: hit.retrievedAt };

  try {
    const raw = await post("/search", body, {
      timeoutMs: opts.timeoutMs ?? (body.type === "fast" || body.type === "instant" ? 8_000 : 12_000),
      simulateOutage: opts.simulateOutage ?? false,
    });
    const items = raw.map((r) => toItem(r, opts.snippetChars));
    cacheSet(key, items, opts.pin ?? false);
    return { items, freshness: "live" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn(`[exa] ${error}`);
    if (hit) return { items: hit.value, freshness: "stale-cache", error, retrievedAt: hit.retrievedAt };
    return { items: [], freshness: "unavailable", error };
  }
}

/** Fetch page text for known URLs (e.g. to write a cited evidence card). Same cache and fallback rules. */
export async function contents(
  body: ContentsRequest,
  opts: SearchOptions,
): Promise<{ pages: { url: string; text: string }[]; freshness: Freshness; error?: string }> {
  const key = `contents:${JSON.stringify(body)}`;
  const hit = cacheGet<{ url: string; text: string }[]>(key, opts.ttlMs);
  if (hit?.fresh) return { pages: hit.value, freshness: "cache" };
  try {
    const raw = await post("/contents", body, { timeoutMs: opts.timeoutMs ?? 10_000, simulateOutage: opts.simulateOutage ?? false });
    const pages = raw.map((r) => ({ url: r.url, text: r.text ?? r.highlights.join(" … ") }));
    cacheSet(key, pages);
    return { pages, freshness: "live" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn(`[exa] ${error}`);
    if (hit) return { pages: hit.value, freshness: "stale-cache", error };
    return { pages: [], freshness: "unavailable", error };
  }
}

/**
 * Dev-only outage switch for testing the "Exa is down" path without touching keys:
 * env `EXA_SIMULATE_OUTAGE=1`, or request header `x-exa-simulate-outage: 1`.
 * Both are ignored when NODE_ENV === "production".
 */
export function simulateOutage(request: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.EXA_SIMULATE_OUTAGE === "1" || request.headers.get("x-exa-simulate-outage") === "1";
}

export const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
