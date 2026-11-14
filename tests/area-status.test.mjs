// One status per area: the home map's colour and the area card's verdict come from the same
// function (lib/act.ts), and the county page's verdict agrees with it.
// Run: node --test tests/area-status.test.mjs   (Node 24 strips the TypeScript types.)

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

const { bottleneckLede, bottleneckStatus, getAreaStatus, getBottleneck } = await import("../lib/act.ts");
const { counties, getGaps } = await import("../lib/data.ts");
const { getVerdict } = await import("../lib/ranking.ts");

// What the card's sentence (home card and act page) says, read back as a status.
function statusFromCardText(text) {
  if (text.startsWith("No measured step is worse than Finland")) return "amber";
  if (text.startsWith("No ") && text.includes("pathway data is published")) return "no_data";
  return "red";
}

describe("area status: map colour = card verdict", () => {
  test("every area: the map's status is the status the card's sentence states", () => {
    assert.equal(counties.length, 22);
    for (const { id } of counties) {
      const bottleneck = getBottleneck(id);
      // The map colours by getAreaStatus; the card prints bottleneckLede and carries the same status.
      assert.equal(getAreaStatus(id), bottleneckStatus(bottleneck), id);
      assert.equal(getAreaStatus(id), statusFromCardText(bottleneckLede(bottleneck)), id);
    }
  });

  test("every area: the county page's verdict says the same", () => {
    for (const { id } of counties) {
      const verdict = getVerdict(id);
      assert.equal(getAreaStatus(id) === "red", !verdict.startsWith("No measured step is worse than Finland"), `${id}: ${verdict}`);
    }
  });

  test("red exactly when a step with its own figure is worse than Finland; a HUS-wide value never counts", () => {
    for (const { id } of counties) {
      const gaps = getGaps(id);
      const anyRed = gaps.some((gap) => gap.status === "red");
      const measured = gaps.some((gap) => gap.status !== "no_data");
      assert.equal(getAreaStatus(id), anyRed ? "red" : measured ? "amber" : "no_data", id);
      for (const gap of gaps) {
        if (gap.shared) assert.equal(gap.status, "no_data", `${id}: a shared value has no status of its own`);
      }
    }
  });

  test("Kainuu, Central Ostrobothnia and Pirkanmaa: red, though their GP wait is not (the report)", () => {
    for (const id of ["kainuu", "central-ostrobothnia", "pirkanmaa"]) {
      assert.equal(getAreaStatus(id), "red", id);
      assert.notEqual(getGaps(id).find((gap) => gap.stage === "gp_access")?.status, "red", id);
    }
  });

  test("Päijät-Häme and East Uusimaa: no break, so the card says so", () => {
    for (const id of ["paijat-hame", "east-uusimaa"]) {
      assert.equal(getBottleneck(id).anyRed, false, id);
      assert.equal(getAreaStatus(id), "amber", id);
    }
  });
});
