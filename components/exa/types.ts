import type { Answer } from "@/lib/exa/answer";
import type { Freshness, Item } from "@/lib/exa/client";

// Type-only imports: nothing from lib/exa ships to the browser.
export type { Answer, Freshness, Item };

export type ItemsResponse = {
  label?: string;
  freshness: Freshness;
  message?: string;
  /** YYYY-MM-DD, sent on cached and stale-cache responses. */
  retrievedAt?: string;
  items: Item[];
};

export type AskResponse = {
  question: string;
  items: Item[];
  answer: Answer | null;
  nothingFound: boolean;
  message?: string;
  freshness: Freshness;
  /** YYYY-MM-DD, sent on cached and stale-cache responses. */
  retrievedAt?: string;
  /** True when the question gate refused it: no search ran, so no status badge. */
  offTopic?: boolean;
  /** Sentences the checker removed because their numbers weren't in the cited source. Absent on older cached replies. */
  dropped?: number;
};

/** Shown when a route answers HTTP 429. */
export const TOO_MANY = "Too many requests. Wait a minute and try again.";

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const FRESHNESS: readonly string[] = ["live", "cache", "stale-cache", "unavailable"];

export function isItemsResponse(v: unknown): v is ItemsResponse {
  return isObject(v) && typeof v.freshness === "string" && FRESHNESS.includes(v.freshness) && Array.isArray(v.items);
}

export function isAskResponse(v: unknown): v is AskResponse {
  return (
    isObject(v) &&
    typeof v.freshness === "string" &&
    FRESHNESS.includes(v.freshness) &&
    Array.isArray(v.items) &&
    typeof v.nothingFound === "boolean"
  );
}

export const STATUS_LABEL: Record<Freshness, string> = {
  live: "Live",
  cache: "Cached",
  "stale-cache": "Cached (older)",
  unavailable: "Unavailable",
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function isDateOnly(v: unknown): v is string {
  return typeof v === "string" && DATE_ONLY.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
}

/**
 * Text for the status badge: "Live", "Cached · saved 2026-11-14", "Cached (older) · saved ...".
 * The saved date appears only on cached results and only if it is a real date.
 * Returns null (show no badge) when the off-topic gate answered, because no search ran.
 */
export function statusText(r: { freshness: Freshness; retrievedAt?: string; offTopic?: boolean }): string | null {
  if (r.offTopic === true) return null;
  const label = STATUS_LABEL[r.freshness];
  const cached = r.freshness === "cache" || r.freshness === "stale-cache";
  return cached && isDateOnly(r.retrievedAt) ? `${label} · saved ${r.retrievedAt}` : label;
}
