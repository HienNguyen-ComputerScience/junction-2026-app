import "server-only";

import askJson from "@/data/exa-cache/ask.json";
import countyNewsJson from "@/data/exa-cache/county-news.json";
import evidenceJson from "@/data/exa-cache/evidence.json";
import nationalNewsJson from "@/data/exa-cache/national-news.json";

import { isPaywalled, type Item } from "./client";

// Committed, last-resort demo cache (data/exa-cache/*.json), written by `npm run exa:prewarm -- <url> --write-cache`.
// The in-memory cache dies with the server process (restart, Vercel cold start), so when Exa is
// down and memory is cold, routes fall back to these dated results instead of "unavailable".
// Static imports, so the files are bundled with the serverless functions.
// Each file: { "entries": { "<key>": { "retrievedAt": "YYYY-MM-DD", "items": [{ title, url, domain, publishedDate, snippet }] } } }

export type DemoKind = "county-news" | "national-news" | "evidence" | "ask";

const FILES: Record<DemoKind, unknown> = {
  "county-news": countyNewsJson,
  "national-news": nationalNewsJson,
  evidence: evidenceJson,
  ask: askJson,
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function parseItem(v: unknown): Item | null {
  if (!isObject(v) || typeof v.title !== "string" || typeof v.url !== "string" || typeof v.domain !== "string") return null;
  return {
    title: v.title,
    url: v.url,
    domain: v.domain,
    publishedDate: typeof v.publishedDate === "string" ? v.publishedDate : null,
    snippet: typeof v.snippet === "string" ? v.snippet : "",
    maybePaywalled: isPaywalled(v.domain),
  };
}

/** Saved items for a key (county id, evidence key, national window, normalised question), or null. */
export function demoCacheGet(kind: DemoKind, key: string): { items: Item[]; retrievedAt: string } | null {
  const file = FILES[kind];
  if (!isObject(file) || !isObject(file.entries) || !Object.hasOwn(file.entries, key)) return null;
  const entry = file.entries[key];
  if (!isObject(entry) || typeof entry.retrievedAt !== "string" || !Array.isArray(entry.items)) return null;
  const items = entry.items.map(parseItem).filter((i): i is Item => i !== null);
  return items.length ? { items, retrievedAt: entry.retrievedAt } : null;
}
