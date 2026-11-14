// The optional effect_size.population line (who was studied, where, compared with what).
// It may only sit on a row that has an effect_size, and must stay one short line.
// Run: node --test tests/evidence-population.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const evidence = JSON.parse(readFileSync(new URL("../data/evidence.json", import.meta.url), "utf8"));

const wordCount = (text) => text.trim().split(/\s+/).length;

describe("effect_size.population", () => {
  test("is optional: a row can carry it or leave it out", () => {
    const sized = evidence.filter((row) => row.effect_size !== null);
    assert.ok(sized.some((row) => row.effect_size.population !== undefined), "no row carries a population line");
  });

  for (const row of evidence) {
    test(`${row.id}: population, when present, is one short line on a row with an effect_size`, () => {
      if (row.effect_size === null) return;
      const { value, unit, metric, population } = row.effect_size;
      assert.equal(typeof value, "number");
      assert.equal(typeof unit, "string");
      assert.equal(typeof metric, "string");
      if (population === undefined) return;
      assert.equal(typeof population, "string");
      assert.ok(population.trim().length > 0, "population is empty");
      assert.ok(wordCount(population) <= 12, `population has ${wordCount(population)} words (max 12)`);
      assert.ok(!/\.\s*$/.test(population), "population is a fragment, no trailing full stop");
    });
  }
});
