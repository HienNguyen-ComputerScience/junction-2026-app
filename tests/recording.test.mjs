// Recording-sensitive 6411 trends: the rule, its threshold and the caveat wording.
// Run: node --test tests/recording.test.mjs   (Node 24 strips the TypeScript types.)

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

const { counties, getValue } = await import("../lib/data.ts");
const {
  RECORDING_CHANGE_ABOVE,
  describeVisitChange,
  getRecordedVisitChange,
  getRecordingCaveat,
  impliedVisits,
  isRecordingSensitive,
  isRecordingSensitiveChange,
  visitChange,
} = await import("../lib/recording.ts");
const { getMainReason } = await import("../lib/main-reason.ts");

const STABLE = ["south-savo", "vantaa-kerava", "south-karelia", "central-finland"];

describe("recording-sensitive rule", () => {
  test("implied visits are the waiting count divided by the share", () => {
    assert.equal(impliedVisits(26.1, 6514), 24958);
    assert.equal(impliedVisits(67.8, 10605), 15642);
    assert.equal(impliedVisits(0, 5), null);
    assert.equal(impliedVisits(40, null), null);
  });

  test("South Ostrobothnia: 24,958 recorded visits in 2023, 15,642 in 2025 (-37%)", () => {
    const change = getRecordedVisitChange("south-ostrobothnia");
    assert.ok(change !== null && Math.abs(change - (15642 / 24958 - 1)) < 1e-9);
    assert.equal(isRecordingSensitive("south-ostrobothnia"), true);
  });

  test("threshold: more than 20% either way, exactly 20% is not flagged", () => {
    assert.equal(RECORDING_CHANGE_ABOVE, 0.2);
    assert.equal(isRecordingSensitiveChange(-0.21), true);
    assert.equal(isRecordingSensitiveChange(0.21), true);
    assert.equal(isRecordingSensitiveChange(-0.2), false);
    assert.equal(isRecordingSensitiveChange(0.2), false);
    assert.equal(isRecordingSensitiveChange(null), false);
    assert.equal(visitChange(0, 5), null);
    assert.equal(visitChange(100, null), null);
  });

  test("flags 18 of the 22 areas; the four stable ones are not flagged", () => {
    const flagged = counties.filter((county) => isRecordingSensitive(county.id)).map((county) => county.id);
    assert.equal(counties.length, 22);
    assert.equal(flagged.length, 18);
    for (const id of STABLE) assert.equal(flagged.includes(id), false, id);
  });

  test("the cut sits in the widest gap between areas' changes below 50%", () => {
    const changes = counties
      .map((county) => Math.abs(getRecordedVisitChange(county.id) ?? 0))
      .filter((change) => change < 0.5)
      .sort((a, b) => a - b);
    const gaps = changes.slice(1).map((value, i) => ({ from: changes[i], to: value }));
    const widest = gaps.reduce((best, gap) => (gap.to - gap.from > best.to - best.from ? gap : best));
    assert.ok(widest.from < RECORDING_CHANGE_ABOVE && RECORDING_CHANGE_ABOVE < widest.to);
  });

  test("Finland is flagged too (+43%), but is not an area", () => {
    assert.equal(isRecordingSensitive("finland"), true);
    assert.equal(counties.some((county) => county.id === "finland"), false);
  });
});

describe("caveat wording", () => {
  test("fell, rose and more than doubled follow the direction", () => {
    assert.equal(describeVisitChange(-0.373), "fell 37%");
    assert.equal(describeVisitChange(0.43), "rose 43%");
    assert.equal(describeVisitChange(1.1), "more than doubled");
    assert.equal(describeVisitChange(5.28), "more than doubled");
  });

  test("South Ostrobothnia's caveat", () => {
    assert.deepEqual(getRecordingCaveat("south-ostrobothnia"), {
      tag: "Recorded visits fell 37% since 2023",
      text: "Recorded visits fell 37% from 2023 to 2025; part of this change may be how visits are recorded.",
    });
  });

  test("a rise on a rising base says rose / more than doubled", () => {
    assert.equal(getRecordingCaveat("helsinki")?.tag, "Recorded visits more than doubled since 2023");
    assert.equal(getRecordingCaveat("lapland")?.tag, "Recorded visits rose 34% since 2023");
  });

  test("no caveat where the share did not rise, or the base is stable", () => {
    for (const id of ["paijat-hame", "west-uusimaa", "north-savo", "pirkanmaa"]) {
      const first = getValue(id, "6411", 2023);
      const last = getValue(id, "6411", 2025);
      assert.ok(last.value <= first.value, id);
      assert.equal(getRecordingCaveat(id), null, id);
    }
    for (const id of STABLE) assert.equal(getRecordingCaveat(id), null, id);
    assert.equal(getRecordingCaveat("no-such-area"), null);
  });

  test("wording counts visits, never people", () => {
    for (const county of counties) {
      const caveat = getRecordingCaveat(county.id);
      if (caveat) assert.doesNotMatch(`${caveat.tag} ${caveat.text}`, /people|patients|persons/i);
    }
  });

  test("the main reason carries the caveat only when it says the GP wait is worse than in 2023", () => {
    const so = getMainReason("south-ostrobothnia");
    assert.match(so.text, /worse than in 2023/);
    assert.equal(so.caveat?.text, getRecordingCaveat("south-ostrobothnia")?.text);
    assert.doesNotMatch(so.text, /Recorded visits/);
    assert.equal(getMainReason("vantaa-kerava").caveat, null);
    for (const county of counties) {
      const reason = getMainReason(county.id);
      if (reason.caveat) assert.match(reason.text, /worse than in 2023/, county.id);
    }
  });
});
