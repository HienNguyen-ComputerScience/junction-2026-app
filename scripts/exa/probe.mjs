// Exa API probe for FirstLine (Phase 1 spike).
// Plain Node 20+, built-in fetch, no dependencies.
// Run: node --env-file=.env.local scripts/exa/probe.mjs [--json out.json]
// Never prints the API key.

const KEY = process.env.EXA_API_KEY;
if (!KEY) {
  console.error("EXA_API_KEY is not set. Add it to .env.local (ask the team lead), then rerun:");
  console.error("  node --env-file=.env.local scripts/exa/probe.mjs");
  process.exit(1);
}

const API = "https://api.exa.ai";
const TIMEOUT_MS = 30_000;

const oneYearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);

const FI_NEWS_DOMAINS = [
  "yle.fi", "hs.fi", "thl.fi", "stm.fi", "mediuutiset.fi", "laakarilehti.fi",
  "vakehyva.fi", "phhyky.fi", "hus.fi", "kela.fi",
];

// Each probe: a label, a group, and the /search body. Some queries run in two modes
// so we can compare latency against relevance.
const PROBES = [
  // --- County news (last 12 months) ---
  {
    group: "county-news", mode: "auto",
    body: {
      query: "Vantaa–Kerava terveyskeskus lääkärille pääsy jonot",
      type: "auto", numResults: 8, startPublishedDate: oneYearAgo,
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
  {
    group: "county-news", mode: "fast",
    body: {
      query: "Vantaa–Kerava terveyskeskus lääkärille pääsy jonot",
      type: "fast", numResults: 8, startPublishedDate: oneYearAgo,
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
  {
    group: "county-news", mode: "auto + includeDomains",
    body: {
      query: "Päijät-Häme syöpä nopea hoitopolku diagnostiikka",
      type: "auto", numResults: 8, startPublishedDate: oneYearAgo,
      includeDomains: FI_NEWS_DOMAINS,
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
  {
    group: "county-news", mode: "auto + category=news",
    body: {
      query: "Päijät-Häme cancer fast track pathway",
      type: "auto", numResults: 8, startPublishedDate: oneYearAgo, category: "news",
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
  // --- Evidence (research papers, Nordic/UK reports) ---
  {
    group: "evidence", mode: "auto + category=publication",
    body: {
      query: "Danish cancer patient pathways evaluation time to diagnosis",
      type: "auto", numResults: 8, category: "publication",
      contents: { highlights: { maxCharacters: 500 }, summary: { query: "Main finding on time to diagnosis or outcomes" } },
    },
  },
  {
    group: "evidence", mode: "auto",
    body: {
      query: "UK Rapid Diagnostic Centres outcomes evaluation",
      type: "auto", numResults: 8,
      contents: { highlights: { maxCharacters: 500 } },
    },
  },
  {
    group: "evidence", mode: "deep-lite",
    body: {
      query: "nurse-led triage for suspected cancer referrals in primary care: effect on waiting times",
      type: "deep-lite", numResults: 8,
      contents: { highlights: { maxCharacters: 500 } },
    },
  },
  // --- Judge-style questions ---
  {
    group: "judge", mode: "auto",
    body: {
      query: "Which Finnish wellbeing services counties give GPs direct access to diagnostic imaging for suspected cancer?",
      type: "auto", numResults: 8,
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
  {
    group: "judge", mode: "deep",
    body: {
      query: "Which Finnish wellbeing services counties give GPs direct access to diagnostic imaging for suspected cancer?",
      type: "deep", numResults: 8,
      contents: { highlights: { maxCharacters: 400 } },
    },
  },
];

async function exa(path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const t0 = performance.now();
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "x-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const ms = Math.round(performance.now() - t0);
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, ms, json };
  } catch (err) {
    return { ok: false, status: 0, ms: Math.round(performance.now() - t0), json: null, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

const out = [];
let totalCost = 0;

for (const p of PROBES) {
  const r = await exa("/search", p.body);
  const results = r.json?.results ?? [];
  const cost = r.json?.costDollars?.total;
  if (typeof cost === "number") totalCost += cost;

  console.log(`\n=== [${p.group}] ${p.mode}: "${p.body.query}"`);
  console.log(`status ${r.status} · ${r.ms} ms wall · searchTime ${r.json?.searchTime ?? "?"} ms · cost $${cost ?? "?"} · ${results.length} results`);
  if (!r.ok) console.log(`error: ${r.error ?? JSON.stringify(r.json)?.slice(0, 300)}`);
  for (const x of results) {
    const date = x.publishedDate ? x.publishedDate.slice(0, 10) : "no date";
    console.log(`  - ${date} | ${x.title ?? "(no title)"}\n    ${x.url}`);
    const hl = x.highlights?.[0];
    if (hl) console.log(`    > ${hl.replace(/\s+/g, " ").slice(0, 160)}`);
    if (x.summary) console.log(`    summary: ${x.summary.replace(/\s+/g, " ").slice(0, 160)}`);
  }
  out.push({ ...p, status: r.status, ms: r.ms, searchTime: r.json?.searchTime, cost, results: results.map(({ title, url, publishedDate, highlights, summary }) => ({ title, url, publishedDate, highlights, summary })) });
}

// One /contents call on the first evidence hit, to check text extraction for cited cards.
const firstEvidence = out.find((o) => o.group === "evidence" && o.results.length)?.results[0];
if (firstEvidence) {
  const r = await exa("/contents", { urls: [firstEvidence.url], text: { maxCharacters: 2000 }, highlights: { maxCharacters: 400 } });
  const c = r.json?.results?.[0];
  const cost = r.json?.costDollars?.total;
  if (typeof cost === "number") totalCost += cost;
  console.log(`\n=== [contents] ${firstEvidence.url}`);
  console.log(`status ${r.status} · ${r.ms} ms · cost $${cost ?? "?"} · text chars ${c?.text?.length ?? 0}`);
  if (c?.text) console.log(`  > ${c.text.replace(/\s+/g, " ").slice(0, 200)}`);
}

console.log(`\nTotal reported cost: $${totalCost.toFixed(4)}`);

const jsonFlag = process.argv.indexOf("--json");
if (jsonFlag !== -1 && process.argv[jsonFlag + 1]) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(process.argv[jsonFlag + 1], JSON.stringify(out, null, 2));
  console.log(`Raw results written to ${process.argv[jsonFlag + 1]}`);
}
