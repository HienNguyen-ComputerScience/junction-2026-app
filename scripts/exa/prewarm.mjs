#!/usr/bin/env node
// Pre-warm the Exa live-search cache before a demo, and optionally refresh the committed demo cache.
//
// Why: the cache lives in the memory of the Next server process (lib/exa/client.ts,
// TTLs in lib/exa/config.ts). A fresh or restarted server (or a Vercel cold start) starts cold,
// so the first demo clicks would hit Exa live. Run this against the dev server or the Vercel URL
// shortly before the demo, and again on Sunday morning (news TTL is 24 h). Demo keys are pinned in
// memory, so a burst of judge questions can't evict them.
//
// --write-cache also saves the results to data/exa-cache/*.json (title, url, domain, publishedDate,
// snippet; max 5 items per key). The server serves those files, labelled `stale-cache` with their
// retrieval date, only when Exa is down AND the in-memory cache is cold. Commit the files after a run.
// Only `live` or `cache` responses are written, so a fallback never overwrites good data.
//
// Usage: npm run exa:prewarm -- [baseUrl] [--write-cache]   (default http://localhost:3000)
// Needs Node 20+, no dependencies, no API key (it only calls our own server).
// Exit code 1 if any request failed (non-2xx or network error), else 0.

import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const writeCache = args.includes("--write-cache");
const baseUrl = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/+$/, "");
const TIMEOUT_MS = 30_000;
const CACHE_DIR = new URL("../../data/exa-cache/", import.meta.url);
const MAX_ITEMS = 5;
const SNIPPET_CHARS = 240;

// Demo counties (lib/exa/config.ts COUNTIES ids).
const counties = ["vantaa-kerava", "paijat-hame", "south-ostrobothnia", "helsinki"];
// Every evidence row in data/evidence.json: a superset of the recommended actions of any county.
const evidenceIds = JSON.parse(readFileSync(new URL("../../data/evidence.json", import.meta.url), "utf8")).map((r) => r.id);
// Mirrors EXAMPLES in components/exa/ask-box.tsx (and ASK_EXAMPLES in lib/exa/config.ts).
const questions = [
  "How long do people wait to see a GP in Vantaa?",
  "Did Denmark's cancer fast-track pathways shorten diagnosis times?",
  "Onko Kainuussa lääkäripula?",
];
// Same normalisation as app/api/ask/route.ts.
const normalise = (q) => q.toLowerCase().replace(/\s+/g, " ").trim();

const requests = [
  ...counties.map((c) => ({
    label: `GET /api/county-news?county=${c}`,
    path: `/api/county-news?county=${encodeURIComponent(c)}`,
    cache: ["county-news", c],
  })),
  { label: "GET /api/national-news", path: "/api/national-news", cache: ["national-news", "30"] },
  ...evidenceIds.map((id) => ({
    label: `GET /api/evidence?action=${id}`,
    path: `/api/evidence?action=${encodeURIComponent(id)}`,
    cache: ["evidence", `row:${id}`],
  })),
  ...questions.map((q) => ({
    label: `POST /api/ask "${q.length > 40 ? q.slice(0, 37) + "..." : q}"`,
    path: "/api/ask",
    init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }) },
    cache: ["ask", normalise(q)],
  })),
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(req) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(baseUrl + req.path, { ...req.init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status !== 429 || attempt >= 2) return res;
    const wait = Math.min(65, Number(res.headers.get("retry-after")) || 30);
    console.log(`  429 rate limited, waiting ${wait} s`);
    await sleep(wait * 1000);
  }
}

const results = [];
for (const req of requests) {
  const started = Date.now();
  const row = { label: req.label, status: 0, freshness: "-", count: "-", ms: 0, ok: false, items: [], cache: req.cache };
  try {
    const res = await call(req);
    row.status = res.status;
    row.ok = res.ok;
    const data = await res.json().catch(() => null);
    if (data && typeof data === "object") {
      if (typeof data.freshness === "string") row.freshness = data.freshness;
      if (Array.isArray(data.items)) {
        row.items = data.items;
        row.count = String(data.items.length);
      }
    }
  } catch (err) {
    row.freshness = `error: ${err instanceof Error ? (err.name === "TimeoutError" ? "timeout" : err.message) : String(err)}`;
  }
  row.ms = Date.now() - started;
  results.push(row);
  console.log(
    `${row.label.padEnd(66)} ${String(row.status).padStart(3)}  ${row.freshness.padEnd(12)} items=${String(row.count).padStart(2)}  ${String(row.ms).padStart(6)} ms`,
  );
}

// Demo hook: Lääkärilehti, 23 Apr 2026, lung cancer detection differs between wellbeing counties.
let hook = null;
for (const row of results) {
  const item = row.items.find(
    (i) => i && typeof i.domain === "string" && i.domain.endsWith("laakarilehti.fi") && i.publishedDate === "2026-04-23",
  );
  if (item) {
    hook = { item, via: row.label };
    break;
  }
}
console.log(hook ? `Demo hook OK: ${hook.item.title} ${hook.item.url} (found via ${hook.via})` : "Note: demo hook not in these results");

if (writeCache) {
  const today = new Date().toISOString().slice(0, 10);
  const files = new Map();
  const load = (kind) => {
    if (!files.has(kind)) {
      let data = { entries: {} };
      try {
        data = JSON.parse(readFileSync(new URL(`${kind}.json`, CACHE_DIR), "utf8"));
      } catch {}
      if (!data || typeof data.entries !== "object") data = { entries: {} };
      files.set(kind, data);
    }
    return files.get(kind);
  };
  let written = 0;
  for (const row of results) {
    if (!row.ok || !["live", "cache"].includes(row.freshness) || row.items.length === 0) continue;
    const [kind, key] = row.cache;
    load(kind).entries[key] = {
      retrievedAt: today,
      // Evidence has 14 keys: keep 3 papers each so the file stays small.
      items: row.items.slice(0, kind === "evidence" ? 3 : MAX_ITEMS).map((i) => ({
        title: String(i.title ?? ""),
        url: String(i.url ?? ""),
        domain: String(i.domain ?? ""),
        publishedDate: typeof i.publishedDate === "string" ? i.publishedDate : null,
        snippet: String(i.snippet ?? "").slice(0, SNIPPET_CHARS),
      })),
    };
    written++;
  }
  for (const [kind, data] of files) writeFileSync(new URL(`${kind}.json`, CACHE_DIR), JSON.stringify(data, null, 2) + "\n");
  console.log(`Demo cache: wrote ${written} entries to data/exa-cache/ (${[...files.keys()].join(", ") || "none"})`);
}

const failed = results.filter((r) => !r.ok).length;
if (failed > 0) console.log(`${failed} of ${results.length} requests failed`);
process.exit(failed > 0 ? 1 : 0);
