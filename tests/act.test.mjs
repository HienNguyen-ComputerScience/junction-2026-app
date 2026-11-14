// The Act page's action picks (lib/act.ts), and that the county brief recommends the same ones.
// Run: node --test tests/act.test.mjs   (Node 24 strips the TypeScript types.)

import "./exa-relevance-hooks.mjs";

import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { describe, test } from "node:test";

// lib/act.ts imports "@/lib/data" without an extension. The shared hooks above resolve "@/" but
// plain node needs ".ts", so map extensionless "@/" imports to the .ts file first (runs before them).
const root = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/") && !/\.\w+$/.test(specifier)) {
      return next(new URL(specifier.slice(2) + ".ts", root).href, context);
    }
    return next(specifier, context);
  },
});

const { getBottleneck, pickActions, relativeGap } = await import("../lib/act.ts");
const { counties } = await import("../lib/data.ts");

const pickedIds = (countyId) => pickActions(getBottleneck(countyId)).map((row) => row.id);

describe(`Act page picks, all ${counties.length} areas`, () => {
  for (const { id } of counties) {
    test(id, () => {
      const bottleneck = getBottleneck(id);
      const picks = pickActions(bottleneck);
      assert.ok(picks.length >= 1 && picks.length <= 3, `got ${picks.length} picks`);
      const ids = picks.map((row) => row.id);
      assert.equal(new Set(ids).size, ids.length, "duplicate action ids");
      const focusStages = bottleneck.focus.map((gap) => gap.stage);
      for (const row of picks) {
        assert.ok(focusStages.includes(row.stage), `${row.id} is for ${row.stage}, not a focus stage`);
      }
    });
  }

  test("vantaa-kerava: first pick is ev-gp-continuity", () => {
    assert.equal(pickedIds("vantaa-kerava")[0], "ev-gp-continuity");
  });

  test("kainuu: three referral actions in this order", () => {
    assert.deepEqual(pickedIds("kainuu"), ["ev-ref-denmark-cpp", "ev-ref-econsult", "ev-ref-templates"]);
  });
});

describe("relativeGap", () => {
  test("higher is worse (6411): 60 against 50 is 0.2 worse", () => {
    const gap = { indicator_id: "6411", value: 60, national_value: 50 };
    assert.ok(Math.abs(relativeGap(gap) - 0.2) < 1e-9);
  });

  test("lower is worse (13): 40 against 50 is 0.2 worse", () => {
    const gap = { indicator_id: "13", value: 40, national_value: 50 };
    assert.ok(Math.abs(relativeGap(gap) - 0.2) < 1e-9);
  });

  test("no county value gives null", () => {
    assert.equal(relativeGap({ indicator_id: "13", value: null, national_value: 50 }), null);
  });
});
