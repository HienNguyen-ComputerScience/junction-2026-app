// What-if arithmetic and the early-warning list (lib/what-if.ts), on made-up numbers and on the
// committed snapshot. Run: node --test tests/what-if.test.mjs   (Node 24 strips the TypeScript types.)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const { bestArea, formatAmount, whatIf, worseningFastest } = await import("../lib/what-if.ts");

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"));

describe("whatIf", () => {
  const best = { id: "b", name: "Best", value: 32.7 };

  test("a wait share above Finland: fewer per 100 at Finland's and at the best level", () => {
    assert.deepEqual(whatIf({ areaId: "a", value: 85.4, finland: 54.7, better: "lower", best }), {
      kind: "gap",
      toFinland: 30.7,
      toBest: { ...best, amount: 52.7 },
    });
  });

  test("a referral share below Finland: more per 100", () => {
    const top = { id: "t", name: "Top", value: 88.7 };
    assert.deepEqual(whatIf({ areaId: "a", value: 71.5, finland: 76.8, better: "higher", best: top }), {
      kind: "gap",
      toFinland: 5.3,
      toBest: { ...top, amount: 17.2 },
    });
  });

  test("already better than Finland: no Finland line, only the best comparison", () => {
    const result = whatIf({ areaId: "a", value: 40, finland: 54.7, better: "lower", best });
    assert.equal(result.toFinland, null);
    assert.equal(result.toBest.amount, 7.3);
  });

  test("exactly at Finland's level counts as at or better", () => {
    const result = whatIf({ areaId: "a", value: 76.8, finland: 76.8, better: "higher", best: { id: "t", name: "Top", value: 88.7 } });
    assert.equal(result.toFinland, null);
    assert.equal(result.toBest.amount, 11.9);
  });

  test("the best area itself gets no best comparison", () => {
    const result = whatIf({ areaId: "b", value: 32.7, finland: 54.7, better: "lower", best });
    assert.deepEqual(result, { kind: "gap", toFinland: null, toBest: null });
  });

  test("level with the best area (another id) gets no best comparison", () => {
    const result = whatIf({ areaId: "a", value: 32.7, finland: 54.7, better: "lower", best });
    assert.equal(result.toBest, null);
  });

  test("no published value: no what-if", () => {
    assert.deepEqual(whatIf({ areaId: "a", value: null, finland: 76.8, better: "higher", best }), { kind: "no_data" });
  });

  test("no float noise: differences are exact to one decimal", () => {
    const result = whatIf({ areaId: "a", value: 56.6, finland: 54.7, better: "lower", best: null });
    assert.equal(result.toFinland, 1.9);
    assert.equal(result.toBest, null);
  });
});

describe("bestArea", () => {
  const areas = [
    { id: "x", name: "Xa", value: 50 },
    { id: "y", name: "Ya", value: 30 },
    { id: "z", name: "Za", value: 70 },
  ];
  test("lowest for a wait share, highest for a referral share", () => {
    assert.equal(bestArea(areas, "lower").id, "y");
    assert.equal(bestArea(areas, "higher").id, "z");
  });
  test("ties go to the first name", () => {
    assert.equal(bestArea([{ id: "q", name: "Q", value: 1 }, { id: "p", name: "P", value: 1 }], "lower").id, "p");
  });
  test("no areas: null", () => {
    assert.equal(bestArea([], "lower"), null);
  });
});

describe("formatAmount", () => {
  test("one decimal, true minus sign, no negative zero", () => {
    assert.equal(formatAmount(30.7), "30.7");
    assert.equal(formatAmount(-2.25), "−2.3");
    assert.equal(formatAmount(-0.01), "0.0");
    assert.equal(formatAmount(5), "5.0");
  });
});

describe("worseningFastest", () => {
  test("only areas that got worse, worst change first, at most five", () => {
    const rows = [
      { id: "a", name: "A", first: 10, latest: 20 },
      { id: "b", name: "B", first: 20, latest: 10 },
      { id: "c", name: "C", first: 10, latest: 10 },
      { id: "d", name: "D", first: null, latest: 50 },
      { id: "e", name: "E", first: 10, latest: 40 },
    ];
    assert.deepEqual(
      worseningFastest(rows, "lower").map((row) => [row.id, row.change]),
      [["e", 30], ["a", 10]],
    );
  });

  test("for a share where higher is better, a fall is worse", () => {
    const rows = [{ id: "a", name: "A", first: 80, latest: 70 }];
    assert.equal(worseningFastest(rows, "higher")[0].change, 10);
  });

  test("ties go to the area that is worse now", () => {
    const rows = [
      { id: "low", name: "A", first: 23.7, latest: 46.7 },
      { id: "high", name: "B", first: 33.6, latest: 56.6 },
    ];
    assert.deepEqual(worseningFastest(rows, "lower").map((row) => row.id), ["high", "low"]);
  });
});

describe("on the snapshot", () => {
  const gaps = load("gaps");
  const counties = load("counties").filter((county) => county.kind !== "country");
  const values = load("values");
  const gapOf = (id, stage) => gaps.find((gap) => gap.county_id === id && gap.stage === stage);
  const bestFor = (stage, better) =>
    bestArea(
      counties.flatMap((county) => {
        const gap = gapOf(county.id, stage);
        return gap && gap.value !== null ? [{ id: county.id, name: county.name, value: gap.value }] : [];
      }),
      better,
    );

  test("Vantaa and Kerava, GP wait: 30.7 fewer at Finland's level, 52.7 at Päijät-Häme's", () => {
    const gap = gapOf("vantaa-kerava", "gp_access");
    const result = whatIf({ areaId: "vantaa-kerava", value: gap.value, finland: gap.national_value, better: "lower", best: bestFor("gp_access", "lower") });
    assert.equal(result.toFinland, 30.7);
    assert.equal(result.toBest.id, "paijat-hame");
    assert.equal(result.toBest.amount, 52.7);
  });

  test("Päijät-Häme, referral: already better than Finland, 3.4 more at Kanta-Häme's level", () => {
    const gap = gapOf("paijat-hame", "referral");
    const result = whatIf({ areaId: "paijat-hame", value: gap.value, finland: gap.national_value, better: "higher", best: bestFor("referral", "higher") });
    assert.equal(result.toFinland, null);
    assert.equal(result.toBest.id, "kanta-hame");
    assert.equal(result.toBest.amount, 3.4);
  });

  test("GP wait getting worse fastest, 2023 to 2025", () => {
    const value = (id, year) => values.find((row) => row.county_id === id && row.indicator_id === "6411" && row.year === year)?.value ?? null;
    const list = worseningFastest(
      counties.map((county) => ({ id: county.id, name: county.name, first: value(county.id, 2023), latest: value(county.id, 2025) })),
      "lower",
    );
    assert.deepEqual(
      list.map((row) => [row.id, row.change]),
      [
        ["south-ostrobothnia", 41.7],
        ["north-karelia", 37.2],
        ["vantaa-kerava", 27.4],
        ["satakunta", 23],
        ["central-uusimaa", 23],
      ],
    );
  });
});
