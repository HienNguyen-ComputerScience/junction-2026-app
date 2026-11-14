// The action plan (lib/plan.ts, lib/plan-model.ts, lib/plan-export.ts): target arithmetic, the
// five area shapes, the chosen-actions link, and that Word and Excel carry the same plan.
// Run: node --test tests/plan.test.mjs   (Node 24 strips the TypeScript types.)

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

const { targetPath, parseTargetYear, parseTargetLevel, cleanField } = await import("../lib/plan.ts");
const { buildPlan } = await import("../lib/plan-model.ts");
const { planToDocx, planToSheets, targetGoal } = await import("../lib/plan-export.ts");

const TODAY = new Date("2026-11-14T12:00:00Z");
const plan = (id, query = "") => buildPlan(id, new URLSearchParams(query), TODAY);
const step = (p, stage) => p.steps.find((s) => s.stage === stage);

describe("targetPath", () => {
  test("closes the gap at an even pace and lands exactly on the target", () => {
    const path = targetPath({ value: 85.4, target: 54.7, better: "lower", fromYear: 2025, toYear: 2028 });
    assert.equal(path.kind, "close");
    assert.equal(path.points, 30.7);
    assert.equal(path.perYear, 10.2);
    assert.deepEqual(path.milestones.map((m) => m.year), [2026, 2027, 2028]);
    assert.equal(path.milestones.at(-1).value, 54.7);
  });

  test("higher-is-better shares close upwards", () => {
    const path = targetPath({ value: 68.9, target: 76.8, better: "higher", fromYear: 2025, toYear: 2027 });
    assert.equal(path.kind, "close");
    assert.equal(path.points, 7.9);
    assert.equal(path.milestones.at(-1).value, 76.8);
  });

  test("already at or better than the target: hold", () => {
    assert.deepEqual(targetPath({ value: 32.7, target: 54.7, better: "lower", fromYear: 2025, toYear: 2028 }), { kind: "hold" });
  });

  test("form values are cleaned and defaulted", () => {
    assert.equal(parseTargetYear("2035"), 2028);
    assert.equal(parseTargetYear("2030"), 2030);
    assert.equal(parseTargetLevel("nonsense", "finland"), "finland");
    assert.equal(cleanField("  Anna \n Virtanen  "), "Anna Virtanen");
    assert.equal(cleanField("x".repeat(200)).length, 80);
  });
});

describe("buildPlan, five area shapes", () => {
  test("unknown area: null", () => {
    assert.equal(plan("nowhere"), null);
  });

  test("Vantaa and Kerava: GP wait red with a target; referral is HUS-wide, so no target", () => {
    const p = plan("vantaa-kerava");
    assert.equal(step(p, "gp_access").status, "red");
    assert.equal(step(p, "gp_access").target.path.kind, "close");
    assert.equal(step(p, "referral").value, null);
    assert.equal(step(p, "referral").target, null);
    assert.match(step(p, "referral").note, /HUS/);
    assert.equal(p.input.target, "finland");
  });

  test("Kainuu: only the referral step is red", () => {
    const p = plan("kainuu");
    assert.equal(step(p, "gp_access").status, "amber");
    assert.equal(step(p, "referral").status, "red");
    assert.equal(step(p, "referral").target.path.kind, "close");
  });

  test("South Ostrobothnia: both measured steps red", () => {
    const p = plan("south-ostrobothnia");
    assert.equal(step(p, "gp_access").status, "red");
    assert.equal(step(p, "referral").status, "red");
  });

  test("Päijät-Häme: nothing red, defaults to the best area's level, holds where it is the best", () => {
    const p = plan("paijat-hame");
    assert.equal(p.anyRed, false);
    assert.equal(p.input.target, "best");
    assert.equal(step(p, "gp_access").target.path.kind, "hold");
  });

  test("Helsinki: referral covers city units only, so no target there", () => {
    const p = plan("helsinki");
    assert.equal(step(p, "referral").target, null);
    assert.match(step(p, "referral").note, /city's own specialist units/);
  });

  test("the step nobody measures never gets a target", () => {
    for (const id of ["vantaa-kerava", "kainuu", "helsinki"]) {
      assert.equal(step(plan(id), "gp_recognition").target, null);
      assert.match(targetGoal(step(plan(id), "gp_recognition"), 2028), /^No target/);
    }
  });
});

describe("plan links and fields", () => {
  test("chosen actions come first in the order given; unknown ids and repeats are dropped", () => {
    const p = plan("vantaa-kerava", "actions=ev-gp-continuity,bogus,ev-gp-capacity-roadmap,ev-gp-continuity");
    assert.deepEqual(p.actions.map((a) => a.id), ["ev-gp-continuity", "ev-gp-capacity-roadmap"]);
    assert.match(p.query, /actions=ev-gp-continuity%2Cev-gp-capacity-roadmap/);
  });

  test("no actions parameter: the recommended ones, at most three", () => {
    const p = plan("south-ostrobothnia");
    assert.ok(p.actions.length > 0 && p.actions.length <= 3);
  });

  test("typed fields reach the plan and its query", () => {
    const p = plan("kainuu", "target=best&year=2030&person1=Anna%20Virtanen&cost1=40000&approved=Board");
    assert.equal(p.input.year, 2030);
    assert.equal(p.actions[0].person, "Anna Virtanen");
    assert.equal(p.actions[0].cost, "40000");
    assert.equal(p.input.approvedBy, "Board");
    assert.match(p.query, /person1=Anna\+Virtanen/);
  });

  test("every source the plan cites resolves, and the strategy is among them", () => {
    const p = plan("vantaa-kerava");
    assert.ok(p.sources.some((s) => s.source_id === "stm-cancer-strategy-2026-2035"));
    for (const a of p.actions) assert.ok(p.sources.some((s) => s.source_id === a.sourceId), a.sourceId);
  });
});

describe("Word and Excel carry the same plan", () => {
  const p = plan("vantaa-kerava", "person1=Anna%20Virtanen");

  test("Word: every part, the typed name, a blank for empty fields", () => {
    const blocks = planToDocx(p);
    const h1 = blocks.filter((b) => b.type === "h1").map((b) => b.text);
    assert.deepEqual(h1, ["1. Where the area stands", "2. Target", "3. Actions", "4. What to start recording", "5. Limits of this plan", "6. Sources", "Decision"]);
    const text = JSON.stringify(blocks);
    assert.match(text, /Anna Virtanen/);
    assert.match(text, /____/);
    assert.doesNotMatch(text, /pp\. pp\./);
  });

  test("Excel: the step values are numbers, the sheets are named", () => {
    const sheets = planToSheets(p);
    assert.deepEqual(sheets.map((s) => s.name), ["Plan", "Where the area stands", "Target", "Actions", "What to start recording", "Sources"]);
    const stands = sheets[1].rows;
    assert.equal(typeof stands[1][3], "number");
    assert.equal(stands[1][3], step(p, "gp_access").value);
    assert.equal(sheets[3].rows[1][5], "Anna Virtanen");
  });
});
