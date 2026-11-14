// Tests that the brief, county-news, national-news and evidence routes count a request against the
// rate limit only when it would spend (a Claude or live Exa call), and that the paid inputs the UI
// never sends are closed. Run: node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/api-rate-limit.test.mjs
// Loads the real routes through tests/ask-route-hooks.mjs; Exa is a mocked global fetch.
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import "./ask-route-hooks.mjs";

process.env.EXA_API_KEY = "test-exa-key";
delete process.env.ANTHROPIC_API_KEY;

const brief = await import("../app/api/brief/route.ts");
const countyNews = await import("../app/api/county-news/route.ts");
const nationalNews = await import("../app/api/national-news/route.ts");
const evidence = await import("../app/api/evidence/route.ts");
const { EVIDENCE_ROW_IDS } = await import("../lib/exa/config.ts");

let exaCalls = 0;
globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.startsWith("https://api.exa.ai")) {
    exaCalls++;
    return Response.json({
      results: [{ url: "https://example.fi/a", title: "Syöpä", publishedDate: "2026-10-01", highlights: ["Syöpä."] }],
    });
  }
  throw new Error(`unexpected fetch ${url}`);
};

beforeEach(() => {
  globalThis.__exaRate?.clear();
  globalThis.__exaCache?.clear();
  globalThis.__exaPinned?.clear();
  exaCalls = 0;
});

// The routes read request.nextUrl, which a plain Request does not have.
const get = (handler, path, ip = "203.0.113.7") => {
  const url = `http://localhost${path}`;
  const request = Object.assign(new Request(url, { headers: { "x-forwarded-for": ip } }), { nextUrl: new URL(url) });
  return handler.GET(request);
};

test("brief: 25 requests for one county with no API key are all served (none is limited)", async () => {
  for (let i = 0; i < 25; i++) {
    const res = await get(brief, "/api/brief?county=vantaa-kerava");
    assert.equal(res.status, 200);
    assert.equal((await res.json()).mode, "fallback");
  }
});

test("brief: an unknown county is a free 404", async () => {
  for (let i = 0; i < 25; i++) assert.equal((await get(brief, "/api/brief?county=nowhere")).status, 404);
});

test("county-news: 70 requests for one county from one IP: one Exa call, no 429", async () => {
  for (let i = 0; i < 70; i++) assert.equal((await get(countyNews, "/api/county-news?county=vantaa-kerava")).status, 200);
  assert.equal(exaCalls, 1);
});

test("national-news: days outside 7/30/90/365 are served as 30, with one shared Exa call", async () => {
  const res = await get(nationalNews, "/api/national-news?days=12");
  assert.equal((await res.json()).days, 30);
  assert.equal((await (await get(nationalNews, "/api/national-news")).json()).days, 30);
  assert.equal((await (await get(nationalNews, "/api/national-news?days=90")).json()).days, 90);
  assert.equal(exaCalls, 2);
});

test("evidence: free text is a 400 and spends nothing; an evidence row id still works", async () => {
  const bad = await get(evidence, "/api/evidence?action=tell%20me%20about%20anything%20at%20all");
  assert.equal(bad.status, 400);
  assert.equal(exaCalls, 0);
  const ok = await get(evidence, `/api/evidence?action=${encodeURIComponent(EVIDENCE_ROW_IDS[0])}`);
  assert.equal(ok.status, 200);
  assert.equal(exaCalls, 1);
});
