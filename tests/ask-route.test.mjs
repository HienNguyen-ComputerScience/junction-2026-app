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
// delay: ms each mocked upstream call takes, so concurrent asks really overlap.
const mode = { exa: "ok", claude: "answer", delay: 0 };
const pause = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : undefined);

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

// Finnish-language results, as Exa returns them for a South Ostrobothnia question (trimmed from the
// live reply of 14 Nov 2026 that came back with an empty written answer).
const finnishItems = [
  {
    url: "https://www.hyvaep.fi/thl-etela-pohjanmaalla-myonteista-kehitysta",
    title: "THL: Etelä-Pohjanmaalla myönteistä kehitystä, toiminnan uudistamista ja talouden tasapainottamista tulee jatkaa",
    publishedDate: "2026-11-04T00:00:00.000Z",
    highlights: ["Erikoissairaanhoidossa on lisätty kevyempiä hoitomuotoja, mikä on nopeuttanut hoitoon pääsyä. Hoitoa odottavien määrä väheni aiemmasta."],
  },
  {
    url: "https://www.iltalehti.fi/terveys/a/uudet-luvut",
    title: "Uudet luvut suomalaisten hoidosta – Kaksi huolestuttavaa käännettä",
    publishedDate: "2026-09-17T00:00:00.000Z",
    highlights: ["Yli kuuden kuukauden hoitotakuuajan odottaneiden määrä on vähentynyt yli 60 prosenttia alkuvuonna. 92 prosenttia pääsee erikoissairaanhoitoon alle kolmessa kuukaudessa."],
  },
  {
    url: "https://yle.fi/a/etela-pohjanmaa-sote-karsinta",
    title: "Etelä-Pohjanmaan sote-palveluista pitää etsiä lisää karsittavaa, toteaa arviointiryhmä",
    publishedDate: "2026-10-08T00:00:00.000Z",
    highlights: ["Arviointiryhmä esittää, että Etelä-Pohjanmaa etsii karsittavaa sote-keskuksista. Alueen pitää parantaa lääkäripalveluja."],
  },
];
let lastClaudeBody = null;

globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (url.startsWith("https://api.exa.ai")) {
    calls.exa++;
    await pause(mode.delay);
    if (mode.exa === "fail") return new Response("down", { status: 503 });
    const results = mode.exa === "irrelevant" ? irrelevantItems : mode.exa === "finnish" ? finnishItems : exaItems;
    return Response.json({ results });
  }
  if (url.startsWith("https://api.anthropic.com")) {
    calls.claude++;
    lastClaudeBody = JSON.parse(init.body);
    await pause(mode.delay);
    if (mode.claude === "fail") return new Response("overloaded", { status: 529 });
    if (mode.claude === "finnish") {
      // English sentences over Finnish sources: the numbers 60 and 92 are in source 2, so they are kept;
      // "six months" as 6 is not written that way in any source, so that sentence is dropped.
      const input = {
        sentences: [
          { text: "The sources do not explain the dashboard figure for South Ostrobothnia.", sources: [1, 3] },
          { text: "An evaluation group says the area must improve its doctor services.", sources: [3] },
          { text: "Nationally, those waiting over the care guarantee fell by more than 60 percent, and 92 percent reach specialist care within three months.", sources: [2] },
          { text: "Patients waited over 6 months.", sources: [2] },
        ],
        nothing_found: false,
      };
      return Response.json({ stop_reason: "tool_use", content: [{ type: "tool_use", name: "submit_answer", input }] });
    }
    // "unbacked": every sentence has a number that is in no source, so the checker removes all three.
    const input =
      mode.claude === "nothing"
        ? { nothing_found: true, sentences: [] }
        : mode.claude === "unbacked"
          ? {
              nothing_found: false,
              sentences: [
                { text: "Waits rose 987% in 2025 [1].", sources: [1] },
                { text: "Patients waited 431 days on average [1].", sources: [1] },
                { text: "The wait was 77 days in Vantaa [1].", sources: [1] },
              ],
            }
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
  mode.delay = 0;
  offset = 0;
  lastClaudeBody = null;
});

// ---------- helpers ----------
async function ask(question, { ip = "203.0.113.7", outage = false, body } = {}) {
  const headers = { "content-type": "application/json", "x-forwarded-for": ip };
  if (outage) headers["x-exa-simulate-outage"] = "1";
  const res = await POST(
    new Request("http://localhost/api/ask", { method: "POST", headers, body: body ?? JSON.stringify({ question }) }),
  );
  return { status: res.status, json: await res.json(), shared: res.headers.get("x-ask-shared") === "1" };
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

test("the checker removing every sentence says so, with the count, instead of a plain 'Nothing found'", async () => {
  mode.claude = "unbacked";
  const a = await ask(Q);
  assert.equal(a.json.nothingFound, true);
  assert.equal(a.json.answer, null);
  assert.equal(a.json.dropped, 3);
  assert.match(a.json.message, /^The checker removed 3 sentences from the written answer: their numbers were not in the sources they cited/);
  assert.equal(a.json.items.length, 1, "the sources are still returned");
  const b = await ask(Q);
  assert.equal(b.json.freshness, "cache");
  assert.equal(b.json.dropped, 3, "the count survives the cache");
  advance(6 * MINUTE);
  mode.claude = "answer";
  assert.ok((await ask(Q)).json.answer, "still only cached for a few minutes");
});

test("Claude saying nothing found keeps the plain message and no dropped count", async () => {
  mode.claude = "nothing";
  const a = await ask(Q);
  assert.equal(a.json.nothingFound, true);
  assert.equal(a.json.message, "Nothing found in the sources.");
  assert.ok(a.json.dropped === undefined || a.json.dropped === 0);
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

// ---------- #73 follow-up: merged in-flight asks, and counting only what spends ----------

const IP = "203.0.113.7";
/** How many asks the limiter has counted for this IP in the current window. */
const counted = (ip = IP) => globalThis.__exaRate?.get("ask")?.perIp.get(ip) ?? 0;
const together = (n, question, opts) => Promise.all(Array.from({ length: n }, () => ask(question, opts)));
/** Same as `together`, but a rejected POST (a thrown error) becomes { threw: message }. */
const togetherSettled = (n, question) =>
  Promise.all(Array.from({ length: n }, () => ask(question).catch((err) => ({ threw: err.message }))));
const useUp = (n) => askMany(n, (i) => `GP waits in Vantaa health centres, case ${i}`, { outage: true });

test("in-flight: 25 concurrent identical uncached asks: 1 Exa, 1 Claude, 25 x 200 with one answer, counted once", async () => {
  mode.delay = 20;
  const rs = await together(25, Q);
  assert.deepEqual(statuses(rs), { 200: 25 });
  assert.deepEqual(calls, { exa: 1, claude: 1 });
  assert.ok(rs[0].json.answer);
  for (const r of rs) assert.deepEqual(r.json.answer, rs[0].json.answer);
  assert.equal(rs.filter((r) => r.shared).length, 24, "24 followers shared the leader's result");
  assert.equal(counted(), 1);
});

test("in-flight: one request left in the IP's quota: 10 concurrent identical asks all get the answer", async () => {
  await useUp(PER_IP - 1);
  mode.delay = 20;
  const rs = await together(10, Q);
  assert.deepEqual(statuses(rs), { 200: 10 });
  for (const r of rs) assert.ok(r.json.answer);
  assert.equal(counted(), PER_IP);
});

test("in-flight: quota used up: concurrent asks all get the same 429 and are not counted", async () => {
  await useUp(PER_IP);
  mode.delay = 20;
  const rs = await together(10, Q);
  assert.deepEqual(statuses(rs), { 429: 10 });
  for (const r of rs) assert.deepEqual(r.json, rs[0].json);
  assert.deepEqual(calls, { exa: 0, claude: 0 });
  assert.equal(counted(), PER_IP);
  assert.equal(globalThis.__exaRate.get("ask").global, PER_IP);
});

test("in-flight: quota used up with an expired cached answer: concurrent asks all get the stale answer", async () => {
  await ask(Q);
  advance(25 * HOUR);
  await useUp(PER_IP);
  mode.delay = 20;
  const rs = await together(10, Q);
  assert.deepEqual(statuses(rs), { 200: 10 });
  for (const r of rs) {
    assert.equal(r.json.freshness, "stale-cache");
    assert.ok(r.json.answer);
  }
  assert.deepEqual(calls, { exa: 1, claude: 1 });
});

test("in-flight: Exa down: concurrent asks share one failed search, and the next ask retries", async () => {
  mode.exa = "fail";
  mode.delay = 20;
  const rs = await together(10, Q);
  assert.deepEqual(statuses(rs), { 200: 10 });
  for (const r of rs) assert.equal(r.json.freshness, "unavailable");
  assert.equal(calls.exa, 1);
  mode.exa = "ok";
  const next = await ask(Q);
  assert.equal(next.json.freshness, "live");
  assert.ok(next.json.answer);
  assert.equal(calls.exa, 2);
});

test("in-flight: the leader's computation throws: every waiter gets the error, nothing is wedged", async () => {
  const warn = console.warn;
  console.warn = () => {
    throw new Error("boom");
  };
  try {
    mode.exa = "fail"; // search() logs the failure, and the throwing console.warn breaks the computation
    mode.delay = 20;
    const rs = await togetherSettled(10, Q);
    assert.deepEqual(rs.map((r) => r.threw), Array(10).fill("boom"));
    assert.equal(calls.exa, 1, "one computation, shared by all ten");
  } finally {
    console.warn = warn;
  }
  mode.exa = "ok";
  const next = await ask(Q);
  assert.equal(next.status, 200);
  assert.ok(next.json.answer);
  assert.equal(calls.exa, 2, "the next ask runs a new computation");
});

test("in-flight: simulated-outage asks never share with normal asks", async () => {
  mode.delay = 20;
  const [normal, outage] = await Promise.all([ask(Q), ask(Q, { outage: true })]);
  assert.equal(normal.json.freshness, "live");
  assert.ok(normal.json.answer);
  assert.equal(outage.json.freshness, "unavailable");
  assert.equal(outage.shared, false);
});

test("counting: search from cache and nothing answerable: no Exa, no Claude, not counted", async () => {
  mode.exa = "irrelevant";
  await ask(Q); // live search: counted once
  assert.equal(counted(), 1);
  // The answer cache misses (entry dropped) while the search cache still holds the items.
  for (let i = 0; i < PER_IP + 5; i++) {
    globalThis.__exaCache.delete(`ask:${Q.toLowerCase()}`);
    const r = await ask(Q);
    assert.equal(r.status, 200, `request ${i + 2}`);
    assert.equal(r.json.nothingFound, true);
  }
  assert.deepEqual(calls, { exa: 1, claude: 0 });
  assert.equal(counted(), 1);
});

test("counting: search miss + Claude is counted once; search hit + Claude is counted once", async () => {
  mode.claude = "fail";
  await ask(Q); // Exa live + Claude down: one count, not two
  assert.deepEqual(calls, { exa: 1, claude: 1 });
  assert.equal(counted(), 1);
  mode.claude = "answer";
  const r = await ask(Q); // search from cache, Claude called: one more count
  assert.ok(r.json.answer);
  assert.deepEqual(calls, { exa: 1, claude: 2 });
  assert.equal(counted(), 2);
});

test("counting: search hit but the quota is used up at the Claude step: 429, Claude not called", async () => {
  mode.claude = "fail";
  await ask(Q); // search cached, no answer cached
  await useUp(PER_IP - 1);
  mode.claude = "answer";
  const r = await ask(Q);
  assert.equal(r.status, 429);
  assert.equal(calls.claude, 1);
});

test("counting: quota used up at the Claude step with an expired cached answer: the old answer, Claude not called", async () => {
  await ask(Q); // answer cached
  advance(25 * HOUR);
  mode.claude = "fail";
  await ask(Q); // search refreshed (live, counted), Claude down: the old answer entry stays
  await useUp(PER_IP - 1);
  mode.claude = "answer";
  const r = await ask(Q); // answer expired, search from cache, limited at the Claude step
  assert.equal(r.status, 200);
  assert.equal(r.json.freshness, "stale-cache");
  assert.ok(r.json.answer);
  assert.deepEqual(calls, { exa: 2, claude: 2 });
});

// ---------- main reason: the area's data sentence leads every reply that names an area ----------

const VANTAA_REASON =
  "Main reason: 85.4% of non-urgent GP visits here come more than a week after people ask, 30.7 points above Finland and worse than in 2023 (58.0%).";

test("main reason: a question that names an area carries its data sentence, live and from the cache", async () => {
  const live = await ask(Q);
  assert.equal(live.json.freshness, "live");
  assert.equal(live.json.county.id, "vantaa-kerava");
  assert.equal(live.json.mainReason.text, VANTAA_REASON);
  assert.deepEqual(live.json.mainReason.sources.map((s) => s.label), ["Sotkanet 6411 · 2025"]);
  assert.match(live.json.mainReason.sources[0].url, /^https:\/\//);
  // The sentence is not part of the written answer, so the checker never sees it.
  assert.ok(live.json.answer.sentences.every((s) => !s.text.includes("Main reason")));
  const cached = await ask(Q);
  assert.equal(cached.json.freshness, "cache");
  assert.equal(cached.json.mainReason.text, VANTAA_REASON);
});

test("main reason: still there when Exa is down and when nothing is found", async () => {
  const down = await ask("GP waits in Vantaa health centres during an outage", { outage: true });
  assert.equal(down.json.freshness, "unavailable");
  assert.equal(down.json.mainReason.text, VANTAA_REASON);
  mode.claude = "nothing";
  const none = await ask("How long are GP waits in Vantaa this autumn?");
  assert.equal(none.json.nothingFound, true);
  assert.equal(none.json.mainReason.text, VANTAA_REASON);
});

test("main reason: absent when the question names no area", async () => {
  const r = await ask("Did Denmark's cancer fast-track pathways shorten diagnosis times in health care?");
  assert.equal(r.status, 200);
  assert.equal(r.json.mainReason, undefined);
});

// ---------- empty answer with relevant Finnish sources (board, 14 Nov) ----------

const SO_Q = "Why is South Ostrobothnia had a huge spike in the benchmark";

test("Finnish sources: an English 'why' question gets an answer; backed numbers kept, unbacked dropped", async () => {
  mode.exa = "finnish";
  mode.claude = "finnish";
  const r = await ask(SO_Q);
  assert.equal(r.status, 200);
  assert.equal(r.json.county.id, "south-ostrobothnia");
  assert.equal(r.json.items.length, 3, "all three Finnish results pass the relevance bar");
  assert.equal(r.json.nothingFound, false);
  assert.equal(r.json.answer.sentences.length, 3);
  assert.equal(r.json.answer.dropped, 1, "the sentence with a number in no source is still dropped");
  assert.ok(r.json.answer.sentences.every((s) => s.sources.length > 0), "every kept sentence cites a source");
  // The Finnish snippets reach Claude unchanged, and the prompt tells it how to treat them and dashboard words.
  const prompt = lastClaudeBody.messages[0].content;
  assert.match(prompt, /Hoitoa odottavien määrä väheni/);
  assert.match(lastClaudeBody.system, /Finnish or Swedish/);
  assert.match(lastClaudeBody.system, /benchmark/);
  assert.match(lastClaudeBody.system, /Never state a cause/);
});

test("Finnish sources: Claude saying nothing found still gives the plain nothing-found, never an invented answer", async () => {
  mode.exa = "finnish";
  mode.claude = "nothing";
  const r = await ask(SO_Q);
  assert.equal(r.json.answer, null);
  assert.equal(r.json.nothingFound, true);
  assert.equal(r.json.items.length, 3);
});

test("an expired empty answer is never served again when Exa is down: the saved sources are re-answered", async () => {
  mode.exa = "finnish";
  mode.claude = "nothing";
  await ask(SO_Q);
  advance(25 * HOUR);
  mode.exa = "fail";
  mode.claude = "finnish";
  const r = await ask(SO_Q);
  assert.equal(r.status, 200);
  assert.equal(r.json.freshness, "stale-cache", "old search items, labelled as such");
  assert.equal(r.json.nothingFound, false, "not the cached empty answer");
  assert.equal(r.json.answer.sentences.length, 3);
  assert.equal(calls.claude, 2, "Claude asked again instead of replaying the empty answer");
});

test("an expired empty answer is not served to a rate-limited request either", async () => {
  mode.exa = "finnish";
  mode.claude = "nothing";
  await ask(SO_Q);
  advance(25 * HOUR);
  await askMany(PER_IP, (i) => `GP waits in Vantaa health centres, case ${i}`, { outage: true });
  const r = await ask(SO_Q);
  assert.equal(r.status, 429);
});
