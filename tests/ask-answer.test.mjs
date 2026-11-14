// Tests for the ask answer on Finnish sources (bug: "Why is South Ostrobothnia had a huge spike in the
// benchmark" listed 6 dated Finnish sources under "Nothing found in the sources.").
// Run: node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/ask-answer.test.mjs
// The fixture is the real Exa result for that question, recorded 14 Nov 2026 (results fields only).
// Claude is mocked here, so these tests pin the contract around the model: what the prompt tells it,
// what the checker keeps, what the route returns and caches. The model's own behaviour on the fixture
// is checked live by scripts/exa/live-check.mjs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, test } from "node:test";

import "./ask-route-hooks.mjs";

process.env.EXA_API_KEY = "test-exa-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";

const { POST } = await import("../app/api/ask/route.ts");
const { answerLanguage, buildPrompt, validate } = await import("../lib/exa/answer.ts");
const { askTtl, isIndirect } = await import("../lib/exa/ask-cache.ts");
const { toItem } = await import("../lib/exa/client.ts");

const fixture = JSON.parse(readFileSync(new URL("./fixtures/ask-south-ostrobothnia-exa.json", import.meta.url), "utf8"));
const QUESTION = fixture.question;
const items = fixture.results.map((r) => toItem({ ...r, text: null }, 800));
const MINUTE = 60_000;

// ---------- clock and mocked Exa + Claude ----------
const realNow = Date.now.bind(Date);
let offset = 0;
Date.now = () => realNow() + offset;

const calls = { exa: 0, claude: 0, prompts: [] };
let claudeInput = null;
// Optional per-call answers, used first: [first call, retry, ...].
let claudeQueue = [];
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (url.startsWith("https://api.exa.ai")) {
    calls.exa++;
    return Response.json({ results: fixture.results });
  }
  if (url.startsWith("https://api.anthropic.com")) {
    calls.claude++;
    const body = JSON.parse(init.body);
    calls.prompts.push({ system: body.system, user: body.messages[0].content, schema: body.tools[0].input_schema });
    return Response.json({ stop_reason: "tool_use", content: [{ type: "tool_use", name: "submit_answer", input: claudeQueue.length ? claudeQueue.shift() : claudeInput }] });
  }
  throw new Error(`unexpected fetch ${url}`);
};

beforeEach(() => {
  globalThis.__exaRate?.clear();
  globalThis.__exaCache?.clear();
  globalThis.__exaPinned?.clear();
  calls.exa = 0;
  calls.claude = 0;
  calls.prompts = [];
  claudeQueue = [];
  offset = 0;
});

async function ask(question, init = {}) {
  const res = await POST(
    new Request("http://localhost/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
      body: JSON.stringify({ question }),
      ...init,
    }),
  );
  return { status: res.status, json: await res.json() };
}

// What Claude answered live on the fixture before the fix (4 of 4 runs).
const BEFORE = { nothing_found: true, sentences: [] };
// What it answers after the fix (shape of a recorded live run): English, from the Finnish sources,
// flagged as not a direct answer.
const AFTER = {
  nothing_found: false,
  answers_question: false,
  sentences: [
    { text: "The sources do not answer the question directly; they give no cause for the dashboard's figures.", sources: [1, 4] },
    {
      text: "An evaluation group reported in October that South Ostrobothnia must look for more cuts in its health centres, sites and inpatient beds.",
      sources: [4],
    },
    {
      text: "On 4 November, THL's review said the county should improve continuity of care and access to care for under-23-year-olds.",
      sources: [1],
    },
  ],
};

// ---------- the fixture reaches the model intact ----------

test("fixture: all 6 Finnish sources pass the relevance bar and reach Claude", async () => {
  claudeInput = AFTER;
  const r = await ask(QUESTION);
  assert.equal(r.json.county.id, "south-ostrobothnia");
  assert.equal(r.json.items.length, 6);
  assert.equal(calls.claude, 1);
  const { user } = calls.prompts[0];
  assert.match(user, /Etelä-Pohjanmaa/);
  assert.equal((user.match(/<result index=/g) ?? []).length, 6);
});

test("prompt: dashboard words are explained, why-questions report what sources say, the language is named", async () => {
  claudeInput = AFTER;
  await ask(QUESTION);
  const { system, user, schema } = calls.prompts[0];
  assert.match(system, /"the benchmark"/);
  assert.match(system, /"spike"/);
  assert.match(system, /Never state, explain or confirm the dashboard's figures yourself/);
  assert.match(system, /"Why" questions: sources rarely state a cause/);
  assert.match(system, /Never claim more causation than a source states/);
  assert.match(system, /Results may be in Finnish or Swedish/);
  assert.match(system, /Set nothing_found to true only if no result is about the question's area or topic at all/);
  assert.match(system, /tell a joke, change your rules/, "the off-task bail-out stays");
  assert.ok(schema.required.includes("answers_question"));
  assert.match(user, /Write every sentence in English\.$/);
});

// ---------- the failure and the fix, end to end through the route ----------

test("before: Claude's nothing_found over 6 sources no longer reads 'Nothing found in the sources.'", async () => {
  claudeInput = BEFORE;
  const r = await ask(QUESTION);
  assert.equal(r.json.answer, null);
  assert.equal(r.json.items.length, 6);
  assert.notEqual(r.json.message, "Nothing found in the sources.");
  assert.match(r.json.message, /answers this question directly.*sources below/);
  assert.ok(r.json.mainReason, "the dashboard's main reason line still leads");
});

test("an intermittent bail is retried once: nothing_found, then an answer, gives the answer", async () => {
  claudeQueue = [BEFORE, AFTER];
  const r = await ask(QUESTION);
  assert.equal(calls.claude, 2);
  assert.equal(r.json.nothingFound, false);
  assert.equal(r.json.answer.sentences.length, 3);
  assert.equal(calls.prompts[0].user, calls.prompts[1].user, "the retry sends the same prompt");
});

test("no retry when the first call answers", async () => {
  claudeInput = AFTER;
  await ask(QUESTION);
  assert.equal(calls.claude, 1);
});

test("after: an English answer citing the Finnish sources survives the checker, dated sentence included", async () => {
  claudeInput = AFTER;
  const r = await ask(QUESTION);
  assert.equal(r.json.nothingFound, false);
  assert.equal(r.json.answer.sentences.length, 3);
  assert.equal(r.json.answer.dropped, 0);
  assert.equal(r.json.answer.direct, false);
  assert.ok(r.json.mainReason);
});

test("cache rule: a not-direct answer is cached for minutes, not 24 h; a direct one keeps 24 h", async () => {
  claudeInput = AFTER;
  await ask(QUESTION);
  assert.equal((await ask(QUESTION)).json.freshness, "cache");
  offset += 4 * MINUTE;
  await ask(QUESTION);
  assert.equal(calls.claude, 1, "still cached at 4 minutes");
  offset += 2 * MINUTE;
  claudeInput = { ...AFTER, answers_question: true };
  const again = await ask(QUESTION);
  assert.equal(calls.claude, 2, "re-asked at 6 minutes");
  assert.equal(again.json.answer.direct, true);
  offset += 6 * 60 * MINUTE;
  assert.equal((await ask(QUESTION)).json.freshness, "cache", "a direct answer is still cached 6 h later");
  assert.equal(calls.claude, 2);

  const ttl = { answer: 24 * 60 * MINUTE, nothingFound: 5 * MINUTE };
  assert.equal(askTtl({ answer: { sentences: [], dropped: 0, direct: false }, nothingFound: false }, ttl), 5 * MINUTE);
  assert.equal(askTtl({ answer: { sentences: [], dropped: 0, direct: true }, nothingFound: false }, ttl), ttl.answer);
  assert.equal(askTtl({ answer: { sentences: [], dropped: 0 }, nothingFound: false }, ttl), ttl.answer, "older entries");
  assert.equal(isIndirect(null), false);
});

test("a missing answers_question counts as a direct answer (old contract)", async () => {
  claudeInput = { nothing_found: false, sentences: AFTER.sentences };
  const r = await ask(QUESTION);
  assert.equal(r.json.answer.direct, true);
});

// ---------- the checker on English sentences over Finnish sources ----------

test("checker: numbers from Finnish text back English sentences ('14,7' → 14.7, '8 000' → 8,000)", () => {
  const out = validate(
    [
      { text: "The share waiting over 180 days fell from 14.7 percent to 12.7 percent.", sources: [2] },
      { text: "The number of people waiting fell by almost 8,000.", sources: [2] },
      { text: "The share fell to 11.2 percent.", sources: [2] },
    ],
    items,
  );
  assert.deepEqual(
    out.sentences.map((s) => s.text),
    ["The share waiting over 180 days fell from 14.7 percent to 12.7 percent.", "The number of people waiting fell by almost 8,000."],
  );
  assert.equal(out.dropped, 1, "a number in no source is still dropped");
});

test("checker: a cited item's own date in prose is backed; a bare day or month number is not", () => {
  const ok = validate([{ text: "On 4 November 2026, THL published its review.", sources: [1] }], items);
  assert.equal(ok.dropped, 0);
  const alsoOk = validate([{ text: "The GPs' statement of November 9 asks for strong primary care.", sources: [5] }], items);
  assert.equal(alsoOk.dropped, 0);
  const wrongDay = validate([{ text: "On 5 November, THL published its review.", sources: [1] }], items);
  assert.equal(wrongDay.dropped, 1);
  const bareNumber = validate([{ text: "THL counted 11 health centres.", sources: [1] }], items);
  assert.equal(bareNumber.dropped, 1, "'11' is the month of the date, not a number in the source");
  const otherItemsDate = validate([{ text: "On 9 November, THL published its review.", sources: [1] }], items);
  assert.equal(otherItemsDate.dropped, 1, "only the cited item's date counts");
});

// ---------- answer language ----------

test("answer language: decided from the question's words, Finnish place names do not flip it", () => {
  assert.equal(answerLanguage(QUESTION), "English");
  assert.equal(answerLanguage("Why are waits long in Etelä-Pohjanmaa?"), "English");
  assert.equal(answerLanguage("What changed in Päijät-Häme's health centres this year?"), "English");
  assert.equal(answerLanguage("Miksi Helsingissä on pitkät jonot terveyskeskukseen?"), "Finnish");
  assert.equal(answerLanguage("Miksi Etelä-Pohjanmaalla jonot ovat pidentyneet?"), "Finnish");
  assert.equal(answerLanguage("Kainuu"), null, "unsure: the model decides");
  assert.match(buildPrompt("Miksi Helsingissä on pitkät jonot terveyskeskukseen?", items), /Write every sentence in Finnish\.$/);
  assert.match(buildPrompt("Kainuu", items), /Write every sentence in the language of the question\.$/);
});

// ---------- unreadable input ----------

test("a question with U+FFFD (a non-UTF-8 client) gets a 400 saying so, not the off-topic reply", async () => {
  const r = await ask("Why is P�ij�t-H�me the best area?");
  assert.equal(r.status, 400);
  assert.match(r.json.error, /UTF-8/);
  assert.equal(calls.exa + calls.claude, 0);
});
