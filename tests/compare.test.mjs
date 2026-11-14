// The compare page's figures (lib/compare.ts): one row per area, and the four lead figures are
// plain counts and differences of the published shares.
// Run: node --test tests/compare.test.mjs   (Node 24 strips the TypeScript types.)

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

const { getCompareLead, getCompareRows, changeText, vsFinlandText } = await import("../lib/compare.ts");

const rows = getCompareRows();
const lead = getCompareLead(rows);
const round1 = (x) => Math.round(x * 10) / 10;

describe("compare rows", () => {
  test("one row per area, ranked 1..n by the GP-wait share", () => {
    assert.equal(rows.length, 22);
    assert.deepEqual(rows.map((r) => r.rank), rows.map((_, i) => i + 1));
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].gp >= rows[i].gp);
  });

  test("differences are one-decimal arithmetic on the published values", () => {
    for (const row of rows) {
      assert.equal(row.gpVsFinland, round1(row.gp - lead.finlandGp));
      if (row.gpFirst !== null) assert.equal(row.gpChange, round1(row.gp - row.gpFirst));
      else assert.equal(row.gpChange, null);
    }
  });

  test("HUS areas carry the shared value, not an own figure; Helsinki is city units only", () => {
    const vk = rows.find((r) => r.id === "vantaa-kerava");
    assert.equal(vk.referral, null);
    assert.ok(vk.referralShared && vk.referralShared.value > 0);
    const helsinki = rows.find((r) => r.id === "helsinki");
    assert.equal(helsinki.referralCityOnly, true);
    assert.equal(helsinki.referralShared, null);
  });
});

describe("compare lead figures", () => {
  test("counts match the rows", () => {
    assert.equal(lead.total, rows.length);
    assert.equal(lead.worse, rows.filter((r) => r.gpStatus === "red").length);
    assert.equal(lead.withTrend, rows.filter((r) => r.gpChange !== null).length);
    assert.ok(lead.rising <= lead.withTrend);
    assert.ok(lead.risingWithRecordingChange <= lead.rising);
  });

  test("the spread runs from the longest to the shortest wait", () => {
    assert.equal(lead.longest.id, rows[0].id);
    assert.equal(lead.shortest.id, rows[rows.length - 1].id);
    assert.equal(lead.spread, round1(lead.longest.gp - lead.shortest.gp));
  });

  test("the fastest riser has the largest change", () => {
    const max = Math.max(...rows.map((r) => r.gpChange ?? -Infinity));
    assert.equal(lead.fastest?.gpChange, max);
  });
});

describe("compare wording", () => {
  test("plain words for differences", () => {
    assert.equal(vsFinlandText(3.2), "3.2 points above Finland");
    assert.equal(vsFinlandText(-22), "22.0 points below Finland");
    assert.match(changeText(27.4) ?? "", /27\.4 points worse/);
    assert.equal(changeText(null), null);
  });
});
