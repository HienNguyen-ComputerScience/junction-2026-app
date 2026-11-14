#!/usr/bin/env node
// Live question-set check for POST /api/ask. Run after every deploy:
//   npm run live:check -- https://firstline-finland.vercel.app          (full set, 43 questions)
//   npm run live:check -- https://firstline-finland.vercel.app --quick  (9 questions)
//   npm run live:check                                                   (http://localhost:3000)
// `npm run exa:live-check` is the same script (the name PR #115 used).
// Options: --quick, --pause <ms> (default 2000), --only <text> (questions containing <text>).
//
// Questions: scripts/exa/live-check-questions.json (a "why" question for each of the 22 areas, Finnish
// questions, the question-box demo chips, reported failures, off-topic ones).
// Pass rules, per question:
//   - HTTP 200;
//   - kind "ask": if items come back, the written answer is not empty (no empty box above sources);
//   - an area is detected (or expected): it is the expected one, and the data main-reason line is there;
//   - kind "offTopic": offTopic is set and no items come back;
//   - no reply contains "undefined" or "NaN".
// One line per question (PASS/FAIL, sources, answer length in characters, ms), then a summary; exits 1
// on any failure.
//
// Rate limits (lib/exa/rate-limit.ts): ask is 40 per IP and 60 in total per 60 s window, counted only
// for requests that spend (a live Exa search or a Claude call); cache hits and off-topic replies are
// free. This runs one question at a time with a pause, so a run stays near 10 spending requests a minute,
// and leaves room for real users. A 429 is retried once after its Retry-After, then counts as a FAIL.
// Time: about 3-6 minutes for the full set on a cold cache (each live ask takes 3-10 s), under a minute
// warm; --quick about 1 minute.
// Cost, cold cache: up to one Exa search (type auto, 6 results with highlights) and one Claude Haiku
// call per on-topic question (a second Claude call only when the first says nothing found although
// sources came back): about 40 Exa + 40-45 Claude calls for the full set, 8 + 8 for --quick. Answers are then
// cached by the server (24 h, 5 min for nothing-found or not-direct answers), so a re-run within that
// window costs little. Off-topic questions cost nothing.
// No dependencies: Node 22+ fetch.

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const optionValues = new Set([option("--pause"), option("--only")].filter(Boolean));
const base = (args.find((a) => !a.startsWith("--") && !optionValues.has(a)) ?? "http://localhost:3000").replace(/\/+$/, "");
const pauseMs = Number(option("--pause") ?? 2000);
const only = option("--only");

const set = JSON.parse(readFileSync(new URL("./live-check-questions.json", import.meta.url), "utf8"));
const counties = JSON.parse(readFileSync(new URL("../../data/counties.json", import.meta.url), "utf8")).filter((c) => c.id !== "finland");

// The set itself: every area has a "why" question (English "Why" or Finnish "Miksi").
const why = new Set(set.questions.filter((x) => /^(why|miksi)\b/i.test(x.q) && x.area).map((x) => x.area));
const missing = counties.filter((c) => !why.has(c.id)).map((c) => c.id);
if (missing.length) {
  console.error(`Question set: no "why" question for ${missing.join(", ")}`);
  process.exit(1);
}

let questions = set.questions;
if (flag("--quick")) questions = questions.filter((x) => x.quick);
if (only) questions = questions.filter((x) => x.q.toLowerCase().includes(only.toLowerCase()));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(question) {
  const res = await fetch(`${base}/api/ask`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ question }),
  });
  return { status: res.status, retryAfter: Number(res.headers.get("retry-after") ?? 0), text: await res.text() };
}

function check(x, status, text) {
  const fails = [];
  if (status !== 200) return { fails: [`HTTP ${status}`], items: 0, answerChars: 0 };
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return { fails: ["reply is not JSON"], items: 0, answerChars: 0 };
  }
  if (/\bundefined\b|\bNaN\b/.test(text)) fails.push('reply contains "undefined" or "NaN"');
  const items = Array.isArray(body.items) ? body.items.length : 0;
  const sentences = Array.isArray(body.answer?.sentences) ? body.answer.sentences : [];
  const answerChars = sentences.reduce((n, s) => n + (typeof s.text === "string" ? s.text.length : 0), 0);
  if (x.kind === "offTopic") {
    if (body.offTopic !== true) fails.push("not refused as off-topic");
    if (items > 0) fails.push(`${items} sources on an off-topic question`);
  } else {
    if (body.offTopic === true) fails.push("refused as off-topic");
    if (items > 0 && answerChars === 0) fails.push(`empty answer above ${items} sources (${body.message ?? "no message"})`);
    if (body.freshness === "unavailable") fails.push(`unavailable (${body.message ?? "no message"})`);
  }
  if (x.area && body.county?.id !== x.area) fails.push(`area ${body.county?.id ?? "none"}, expected ${x.area}`);
  if (body.county && !(body.mainReason && typeof body.mainReason.text === "string" && body.mainReason.text.length > 0)) {
    fails.push("area detected but no main-reason line");
  }
  return { fails, items, answerChars, direct: body.answer?.direct, freshness: body.freshness };
}

console.log(`Live check: ${base}/api/ask, ${questions.length} questions${flag("--quick") ? " (--quick)" : ""}, pause ${pauseMs} ms\n`);
const failed = [];
const started = Date.now();
for (const [n, x] of questions.entries()) {
  if (n > 0) await sleep(pauseMs);
  const t0 = Date.now();
  let r;
  try {
    r = await post(x.q);
    if (r.status === 429) {
      const wait = Math.max(1, r.retryAfter) * 1000 + 500;
      console.log(`  429, retrying once in ${Math.round(wait / 1000)} s`);
      await sleep(wait);
      r = await post(x.q);
    }
  } catch (err) {
    r = { status: 0, text: "", error: err instanceof Error ? err.message : String(err) };
  }
  const ms = Date.now() - t0;
  const result = r.status === 0 ? { fails: [`request failed: ${r.error}`], items: 0, answerChars: 0 } : check(x, r.status, r.text);
  const ok = result.fails.length === 0;
  if (!ok) failed.push({ q: x.q, fails: result.fails });
  const note = [result.freshness, result.direct === false ? "not direct" : ""].filter(Boolean).join(", ");
  console.log(
    `${ok ? "PASS" : "FAIL"}  sources ${String(result.items).padStart(2)}  answer ${String(result.answerChars).padStart(4)} ch  ${String(ms).padStart(6)} ms  ${x.q}${note ? `  [${note}]` : ""}`,
  );
  for (const f of result.fails) console.log(`      - ${f}`);
}

const total = questions.length;
console.log(`\nSummary: ${total - failed.length}/${total} passed, ${failed.length} failed, ${Math.round((Date.now() - started) / 1000)} s`);
for (const f of failed) console.log(`  FAIL ${f.q}: ${f.fails.join("; ")}`);
process.exit(failed.length ? 1 : 0);
