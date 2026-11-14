// The "main reason" sentence (home card, county header, Ask the evidence): one function, all 22
// areas, only published numbers, no causes.
// Run: node --test tests/main-reason.test.mjs   (Node 24 strips the TypeScript types.)

import "./exa-relevance-hooks.mjs";

import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { describe, test } from "node:test";

const root = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/") && !/\.\w+$/.test(specifier)) {
      return next(new URL(specifier.slice(2) + ".ts", root).href, context);
    }
    return next(specifier, context);
  },
});

const { getAreaStatus } = await import("../lib/act.ts");
const { counties, gaps, getGaps, getSource, values } = await import("../lib/data.ts");
const { bestForStage, getMainReason, reasonLinks } = await import("../lib/main-reason.ts");
const { COUNTIES } = await import("../lib/exa/config.ts");

const text = (id) => getMainReason(id).text;
const numbersIn = (s) => [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const round1 = (n) => Math.round(n * 10) / 10;

describe("main reason sentence", () => {
  test("the exact sentences for the example areas", () => {
    assert.equal(
      text("vantaa-kerava"),
      "Main reason: 85.4% of non-urgent GP visits here come more than a week after people ask, 30.7 points above Finland and worse than in 2023 (58.0%).",
    );
    assert.equal(
      text("paijat-hame"),
      "No measured step is worse than Finland: 32.7% of non-urgent GP visits here come more than a week after people ask, 22.0 points below Finland and better than in 2023 (51.2%).",
    );
    assert.equal(
      text("kainuu"),
      "Main reason: 75.2% of referrals here are processed within 3 days, 1.6 points below Finland and worse than in 2023 (77.5%).",
    );
    assert.equal(
      text("helsinki"),
      "Main reason: 75.9% of non-urgent GP visits here come more than a week after people ask, 21.2 points above Finland and worse than in 2023 (66.6%).",
    );
  });

  test("trend wording follows the direction and the size of the change", () => {
    // Red but improved; red and unchanged; a rise under one point is not called worse.
    assert.match(text("north-savo"), /5\.8 points above Finland, though better than in 2023 \(64\.6%\)\. The referral step is also worse than Finland\.$/);
    assert.match(text("central-ostrobothnia"), /5\.1 points below Finland, about the same as in 2023 \(71\.7%\)\.$/);
    assert.match(text("north-ostrobothnia"), /about the same as in 2023 \(63\.0%\)\.$/);
    // Not red, but the wait has grown.
    assert.match(text("central-uusimaa"), /^No measured step is worse than Finland: 46\.7% .*8\.0 points below Finland, though worse than in 2023 \(23\.7%\)\.$/);
  });

  test("every area: the sentence states the status the map colours it by", () => {
    assert.equal(counties.length, 22);
    const notRed = [];
    for (const { id } of counties) {
      const reason = getMainReason(id);
      const status = getAreaStatus(id);
      assert.equal(reason.kind, status === "red" ? "red" : status === "amber" ? "none" : "no_data", id);
      assert.equal(reason.text.startsWith("Main reason: "), status === "red", id);
      if (status === "amber") {
        notRed.push(id);
        assert.ok(reason.text.startsWith("No measured step is worse than Finland: "), id);
      }
      // A red area's sentence is about a step that is red, with the area's own value.
      if (status === "red") assert.equal(reason.gap.status, "red", id);
    }
    assert.ok(notRed.includes("paijat-hame") && notRed.includes("east-uusimaa"));
  });

  test("every area: each number is a published value of that area, or a gap between two of them", () => {
    for (const { id } of counties) {
      const { text: sentence, gap, chips } = getMainReason(id);
      const own = values.filter((v) => v.county_id === id && v.indicator_id === gap.indicator_id).map((v) => v.value);
      const allowed = new Set([
        ...own,
        round1(Math.abs(round1(gap.value) - round1(gap.national_value))),
        2023,
        3, // "within 3 days"
      ]);
      for (const n of numbersIn(sentence)) assert.ok(allowed.has(n), `${id}: ${n} in "${sentence}"`);
      assert.ok(sentence.includes(`${gap.value.toFixed(1)}%`), id);
      // One chip, for the indicator the numbers come from, and it resolves to a source.
      assert.deepEqual(chips, [{ sourceId: gap.source_id, year: gap.year }], id);
      assert.ok(getSource(gap.source_id), id);
      assert.equal(reasonLinks(getMainReason(id)).length, 1, id);
    }
  });

  test("no causes, no people-counting, and a hospital-group-wide value is never the area's figure", () => {
    const shared = gaps.find((gap) => gap.shared)?.shared;
    assert.ok(shared);
    for (const { id } of counties) {
      const sentence = text(id);
      assert.doesNotMatch(sentence, /% of (people|patients|residents)/i, id);
      assert.doesNotMatch(sentence, /because|due to|doctors|shortage|staff|caused/i, id);
      if (getGaps(id).some((gap) => gap.shared)) {
        assert.ok(!sentence.includes(`${shared.value.toFixed(1)}%`), id);
        assert.notEqual(getMainReason(id).gap.stage, "referral", id);
      }
    }
  });

  test("the benchmark: the best area per step comes from the snapshot", () => {
    assert.deepEqual(bestForStage("gp_access"), { id: "paijat-hame", name: "Päijät-Häme", value: 32.7 });
    const referral = bestForStage("referral");
    assert.equal(referral.id, "kanta-hame");
    assert.equal(referral.value, 88.7);
  });

  test("every area the question box can detect has a sentence", () => {
    for (const id of COUNTIES.keys()) assert.notEqual(getMainReason(id).kind, "no_data", id);
  });
});
