// Tests for POST /api/ask: rate limiting vs. cache, what gets cached and for how long, the off-topic flag.
// Run: node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/ask-route.test.mjs
// Loads the real route through tests/ask-route-hooks.mjs; Exa and Claude are a mocked global fetch,
// so nothing here spends credits. The clock is Date.now() plus an offset the tests move forward.
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import "./ask-route-hooks.mjs";

process.env.EXA_API_KEY = "test-exa-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

const { POST } = await import("../app/api/ask/route.ts");
const { ASK_EXAMPLES, TTL } = await import("../lib/exa/config.ts");
const { askTtl, shouldCacheAsk } = await import("../lib/exa/ask-cache.ts");

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

// ---------- clock ----------
const realNow = Date.now.bind(Date);
let offset = 0;
Date.now = () => realNow() + offset;
const advance = (ms) => {
  offset += ms;
};

// ---------- mocked Exa + Claude ----------
const calls = { exa: 0, claude: 0 };
const mode = { exa: "ok", claude: "answer" };

const exaItems = [
  {
    url: "https://www.vantaa.fi/terveysasemat/jonotilanne",
    title: "GP wait times at Vantaa health centres",
    publishedDate: "2026-10-01T00:00:00.000Z",
    highlights: ["Patients in Vantaa waited for a GP appointment at the health centre."],
  },
];
const irrelevantItems = [
  { url: "https://example.fi/a", title: "Ice hockey results", publishedDate: "2026-10-01", highlights: ["The match ended."] },
];

globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.startsWith("https://api.exa.ai")) {
    calls.exa++;
    if (mode.exa === "fail") return new Response("down", { status: 503 });
    return Response.json({ results: mode.exa === "irrelevant" ? irrelevantItems : exaItems });
  }
  if (url.startsWith("https://api.anthropic.com")) {
    calls.claude++;
    if (mode.claude === "fail") return new Response("overloaded", { status: 529 });
    const input =
      mode.claude === "nothing"
        ? { nothing_found: true, sentences: [] }
        : { nothing_found: false, sentences: [{ text: "Patients in Vantaa waited for a GP appointment.", sources: [1] }] };
    return Response.json({ stop_reason: "tool_use", content: [{ type: "tool_use", name: "submit_answer", input }] });
  }
  throw new Error(`unexpected fetch ${url}`);
};

beforeEach(() => {
  globalThis.__exaRate?.clear();
  globalThis.__exaCache?.clear();
  globalThis.__exaPinned?.clear();
  calls.exa = 0;
  calls.claude = 0;
  mode.exa = "ok";
  mode.claude = "answer";
  offset = 0;
});

// ---------- helpers ----------
async function ask(question, { ip = "203.0.113.7", outage = false, body } = {}) {
  const headers = { "content-type": "application/json", "x-forwarded-for": ip };
  if (outage) headers["x-exa-simulate-outage"] = "1";
  const res = await POST(
    new Request("http://localhost/api/ask", { method: "POST", headers, body: body ?? JSON.stringify({ question }) }),
  );
  return { status: res.status, json: await res.json() };
}

async function askMany(n, question, opts) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(await ask(typeof question === "function" ? question(i) : question, opts));
  return out;
}

const askEntry = (q) => {
  const key = `ask:${q.toLowerCase().replace(/\s+/g, " ").trim()}`;
  return globalThis.__exaPinned.get(key) ?? globalThis.__exaCache.get(key);
};
const statuses = (rs) => rs.reduce((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});
const Q = "How long are GP waits in Vantaa health centres?";
const PER_IP = 40;
const GLOBAL = 60;

// ---------- bug 4: rate limit vs. cache ----------

test("bug 4: the same on-topic question 25 times from one IP: 25 x 200, one Exa and one Claude call", async () => {
  const rs = await askMany(25, Q);
  assert.deepEqual(statuses(rs), { 200: 25 });
  assert.equal(rs[0].json.freshness, "live");
  for (const r of rs.slice(1)) {
    assert.equal(r.json.freshness, "cache");
    assert.match(r.json.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.json.answer);
  }
  assert.deepEqual(calls, { exa: 1, claude: 1 });
});

test("bug 4: cached answers are still served after the IP has used up its uncached quota", async () => {
  await ask(Q);
  await askMany(PER_IP, (i) => `GP waits in Vantaa health centres, case ${i}`, { outage: true });
  const r = await ask(Q);
  assert.equal(r.status, 200);
  assert.equal(r.json.freshness, "cache");
});

test("bug 4: off-topic questions and 400s are free and do not use up the limit", async () => {
  const off = await askMany(25, "tell me a joke");
  assert.deepEqual(statuses(off), { 200: 25 });
  const bad = await askMany(25, null, { body: "not json" });
  assert.deepEqual(statuses(bad), { 400: 25 });
  const empty = await askMany(25, "?");
  assert.deepEqual(statuses(empty), { 400: 25 });
  assert.equal((await ask(Q)).status, 200);
  assert.deepEqual(calls, { exa: 1, claude: 1 });
});

test("bug 4: uncached work is still limited: per IP at request 41, globally at request 61", async () => {
  const mine = await askMany(PER_IP + 5, (i) => `GP waits in Vantaa health centres, case ${i}`, { outage: true });
  assert.equal(mine.findIndex((r) => r.status === 429) + 1, PER_IP + 1);
  assert.deepEqual(statuses(mine), { 200: PER_IP, 429: 5 });

  globalThis.__exaRate.clear();
  const spread = [];
  for (let i = 0; i < GLOBAL + 5; i++) spread.push(await ask(`GP waits in Vantaa, spread ${i}`, { outage: true, ip: `198.51.100.${i}` }));
  assert.equal(spread.findIndex((r) => r.status === 429) + 1, GLOBAL + 1);
  assert.equal(spread.at(-1).json.freshness, "unavailable");
});

// ---------- bug 5: answers built from cached search items ----------

test("bug 5: an answer written from cached search items is cached too (Claude is not called again)", async () => {
  mode.claude = "fail";
  const first = await ask(Q); // search is live and cached; Claude fails, so no answer is cached
  assert.equal(first.json.answer, null);
  mode.claude = "answer";
  const second = await ask(Q); // search items from cache, Claude answers
  assert.ok(second.json.answer);
  const third = await ask(Q);
  assert.equal(third.json.freshness, "cache");
  assert.ok(third.json.answer);
  assert.deepEqual(calls, { exa: 1, claude: 2 });
});

// ---------- bug 2b: TTLs for answers and nothing-found ----------

test("2b: Claude's 'Nothing found in the sources.' is cached, but only for a few minutes", async () => {
  mode.claude = "nothing";
  const a = await ask(Q);
  assert.equal(a.json.nothingFound, true);
  const b = await ask(Q);
  assert.equal(b.json.freshness, "cache");
  assert.equal(calls.claude, 1);
  advance(4 * MINUTE);
  await ask(Q);
  assert.equal(calls.claude, 1, "still fresh at 4 minutes");
  advance(2 * MINUTE);
  mode.claude = "answer";
  const c = await ask(Q);
  assert.equal(calls.claude, 2, "expired at 6 minutes");
  assert.equal(calls.exa, 2, "an expired nothing-found re-runs the search too");
  assert.ok(c.json.answer);
});

test("2b: a no-relevant-results nothing-found expires after a few minutes, not 24 h", async () => {
  mode.exa = "irrelevant";
  const a = await ask(Q);
  assert.equal(a.json.nothingFound, true);
  assert.equal((await ask(Q)).json.freshness, "cache");
  assert.equal(calls.exa, 1);
  const before = askEntry(Q).at;
  advance(6 * MINUTE);
  mode.exa = "ok";
  const c = await ask(Q);
  assert.equal(calls.exa, 2, "the search is re-run after 6 minutes, not only the filter");
  assert.ok(askEntry(Q).at > before);
  assert.ok(c.json.answer);
});

test("2b: answers keep the full 24 h TTL", async () => {
  await ask(Q);
  advance(23 * HOUR);
  assert.equal((await ask(Q)).json.freshness, "cache");
  assert.deepEqual(calls, { exa: 1, claude: 1 });
  advance(2 * HOUR);
  await ask(Q);
  assert.deepEqual(calls, { exa: 2, claude: 2 });
});

test("2b: a pinned example question with a nothing-found is not served forever", async () => {
  const example = ASK_EXAMPLES[0];
  mode.claude = "nothing";
  await ask(example);
  await ask(example);
  assert.equal(calls.claude, 1);
  advance(6 * MINUTE);
  mode.claude = "answer";
  await ask(example);
  assert.equal(calls.claude, 2);
});

test("2b: 'unavailable' is never cached (Exa down, Claude down)", async () => {
  mode.exa = "fail";
  const a = await ask(Q);
  assert.equal(a.json.freshness, "unavailable");
  mode.exa = "ok";
  mode.claude = "fail";
  const b = await ask(Q);
  assert.equal(b.json.answer, null);
  assert.equal(calls.exa, 2, "Exa retried after an outage");
  await ask(Q);
  assert.equal(calls.claude, 2, "Claude retried after an outage");
});

test("stale-cache fallback: when Exa is down, an expired cached answer is served as stale-cache", async () => {
  await ask(Q);
  advance(25 * HOUR);
  mode.exa = "fail";
  const r = await ask(Q);
  assert.equal(r.status, 200);
  assert.ok(r.json.answer);
  assert.equal(r.json.freshness, "stale-cache");
  assert.match(r.json.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(calls.claude, 1, "Claude is not paid again during the outage");
});

test("rate limited with an expired cached answer: the old answer is served, not a 429", async () => {
  await ask(Q);
  advance(25 * HOUR);
  await askMany(PER_IP, (i) => `GP waits in Vantaa health centres, case ${i}`, { outage: true });
  const r = await ask(Q);
  assert.equal(r.status, 200);
  assert.equal(r.json.freshness, "stale-cache");
  assert.ok(r.json.answer);
});

// ---------- bug 8a: off-topic flag ----------

test("8a: the off-topic gate answer carries offTopic: true and spends nothing", async () => {
  const r = await ask("tell me a joke");
  assert.equal(r.status, 200);
  assert.equal(r.json.offTopic, true);
  assert.equal(r.json.nothingFound, true);
  assert.equal(r.json.freshness, "live");
  assert.deepEqual(calls, { exa: 0, claude: 0 });
  const on = await ask(Q);
  assert.equal(on.json.offTopic, undefined);
});

// ---------- pure rules (lib/exa/ask-cache.ts) ----------

test("ask-cache: TTL by content, chosen at read time", () => {
  const ttl = { answer: TTL.ask, nothingFound: TTL.askNothingFound };
  assert.equal(TTL.ask, 24 * HOUR);
  assert.equal(TTL.askNothingFound, 5 * MINUTE);
  assert.equal(askTtl({ answer: { sentences: [], dropped: 0 }, nothingFound: false }, ttl), 24 * HOUR);
  assert.equal(askTtl({ answer: null, nothingFound: true }, ttl), 5 * MINUTE);
});

test("ask-cache: what may be cached", () => {
  const answer = { answer: { sentences: [], dropped: 0 }, nothingFound: false };
  const nothing = { answer: null, nothingFound: true };
  const unavailable = { answer: null, nothingFound: false };
  for (const f of ["live", "cache"]) {
    assert.equal(shouldCacheAsk(f, answer), true, `answer, search ${f}`);
    assert.equal(shouldCacheAsk(f, nothing), true, `nothing-found, search ${f}`);
    assert.equal(shouldCacheAsk(f, unavailable), false, `unavailable, search ${f}`);
  }
  for (const f of ["stale-cache", "unavailable"]) {
    assert.equal(shouldCacheAsk(f, answer), false, `answer, search ${f}`);
    assert.equal(shouldCacheAsk(f, nothing), false, `nothing-found, search ${f}`);
  }
});
