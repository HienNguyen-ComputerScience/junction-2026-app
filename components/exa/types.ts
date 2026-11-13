import type { Answer } from "@/lib/exa/answer";
import type { Freshness, Item } from "@/lib/exa/client";

// Type-only imports: nothing from lib/exa ships to the browser.
export type { Answer, Freshness, Item };

export type ItemsResponse = {
  label?: string;
  freshness: Freshness;
  message?: string;
  items: Item[];
};

export type AskResponse = {
  question: string;
  items: Item[];
  answer: Answer | null;
  nothingFound: boolean;
  message?: string;
  freshness: Freshness;
};

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
