// Verdict and ranking rules (lib/ranking.ts) against the real snapshot.
// Run: node --test tests/ranking.test.mjs   (Node 24 strips the TypeScript types.)

import "./exa-relevance-hooks.mjs";

import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { describe, test } from "node:test";

// lib/ranking.ts imports "@/lib/data" without an extension; plain node needs ".ts". Registered after
// exa-relevance-hooks, so it runs first and then hands the fixed specifier to that "@/" resolver.
registerHooks({
  resolve(specifier, context, next) {
    if (/^@\/lib\/[^.]+$/.test(specifier)) return next(`${specifier}.ts`, context);
    return next(specifier, context);
  },
});

const { getRanking, getUnrankedCounties, getVerdict } = await import("../lib/ranking.ts");
const { counties } = await import("../lib/data.ts");

describe("getVerdict", () => {
  test("Helsinki says its referral value covers only the city's own units, and gives the HUS-wide value", () => {
    const verdict = getVerdict("helsinki");
    assert.ok(verdict.includes("city's own units"), verdict);
    assert.ok(verdict.includes("74.1%"), verdict);
  });

  test("Vantaa and Kerava puts the delay at getting to a GP", () => {
    assert.ok(getVerdict("vantaa-kerava").includes("getting to a GP"));
  });

  test("every area has a verdict that never says people or patients", () => {
    for (const { id } of counties) {
      const verdict = getVerdict(id);
      assert.equal(typeof verdict, "string");
      assert.ok(verdict.length > 0, id);
      assert.doesNotMatch(verdict, /\b(people|patients)\b/i, id);
    }
  });
});

describe("getRanking", () => {
  test("is sorted worst-first by the GP wait", () => {
    const values = getRanking().map((row) => row.gpWait.value);
    for (let i = 1; i < values.length; i++) assert.ok(values[i - 1] >= values[i], `row ${i}`);
  });

  test("ranked and unranked areas together are exactly all areas", () => {
    const ids = [...getRanking().map((row) => row.county.id), ...getUnrankedCounties().map((c) => c.id)];
    assert.equal(new Set(ids).size, ids.length, "no area appears twice");
    assert.deepEqual([...ids].sort(), counties.map((c) => c.id).sort());
  });
});
