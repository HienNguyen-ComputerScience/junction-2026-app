#!/usr/bin/env node
// Pre-warm the Exa live-search cache before a demo.
//
// Why: the cache lives in the memory of the Next server process (lib/exa/client.ts,
// TTLs in lib/exa/config.ts). A fresh or restarted server starts cold, so the first
// demo clicks would hit Exa live. Run this against the dev server or the Vercel URL
// shortly before the demo, and again on Sunday morning (news TTL is 24 h).
//
// Usage: node scripts/exa/prewarm.mjs [baseUrl]   (default http://localhost:3000)
// Needs Node 20+, no dependencies, no API key (it only calls our own server).
// Exit code 1 if any request failed (non-2xx or network error), else 0.

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const TIMEOUT_MS = 30_000;

const counties = ["vantaa-kerava", "helsinki", "paijat-hame", "kainuu"];
// Mirrors ACTION_QUERIES in lib/exa/config.ts.
const actions = ["fast-track", "rapid-diagnostic-centres", "nurse-triage", "gp-recognition", "lung-cancer-regional"];
const questions = [
  "How long do people wait to see a GP in Vantaa?",
  "Latest news on cancer care in Finland this week",
  "Does lung cancer detection differ between Finnish wellbeing services counties?",
];

const requests = [
  ...counties.map((c) => ({ label: `GET /api/county-news?county=${c}`, path: `/api/county-news?county=${encodeURIComponent(c)}` })),
  { label: "GET /api/national-news", path: "/api/national-news" },
  ...actions.map((a) => ({ label: `GET /api/evidence?action=${a}`, path: `/api/evidence?action=${encodeURIComponent(a)}` })),
  ...questions.map((q) => ({
    label: `POST /api/ask "${q.length > 40 ? q.slice(0, 37) + "..." : q}"`,
    path: "/api/ask",
    init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }) },
  })),
];

const results = [];
for (const req of requests) {
  const started = Date.now();
  const row = { label: req.label, status: 0, freshness: "-", count: "-", ms: 0, ok: false, items: [] };
  try {
    const res = await fetch(baseUrl + req.path, { ...req.init, signal: AbortSignal.timeout(TIMEOUT_MS) });
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
    row.freshness = `error: ${err instanceof Error ? err.name === "TimeoutError" ? "timeout" : err.message : String(err)}`;
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
    (i) =>
      i && typeof i.domain === "string" && i.domain.endsWith("laakarilehti.fi") && i.publishedDate === "2026-04-23",
  );
  if (item) {
    hook = { item, via: row.label };
    break;
  }
}
console.log(
  hook
    ? `Demo hook OK: ${hook.item.title} ${hook.item.url} (found via ${hook.via})`
    : "WARN demo hook not found in cache",
);

const failed = results.filter((r) => !r.ok).length;
if (failed > 0) console.log(`${failed} of ${results.length} requests failed`);
process.exit(failed > 0 ? 1 : 0);
