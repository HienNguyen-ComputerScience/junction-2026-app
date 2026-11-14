// Ask-box relevance rules (lib/exa/relevance.ts) against the real county aliases (lib/exa/config.ts).
// Run: node --test tests/exa-relevance.test.mjs   (Node 24 strips the TypeScript types.)

import "./exa-relevance-hooks.mjs";

import assert from "node:assert/strict";
import { describe, test } from "node:test";

const { detectCounty, filterRelevant, isOnTopic, unknownNames } = await import("../lib/exa/relevance.ts");
const { COUNTIES } = await import("../lib/exa/config.ts");

const AREAS = [...COUNTIES.values()];
const county = (q) => detectCounty(q, AREAS);
const item = (title, snippet = "", url = "https://example.fi/a") => ({
  title, url, domain: new URL(url).hostname, publishedDate: null, snippet, maybePaywalled: false,
});

// Results a real search might return for a question about GP waits or cancer waits.
const HEALTH_ITEMS = [
  item("Terveysasemalle pääsy kestää viikkoja", "Odotusajat lääkärille ovat pidentyneet.", "https://yle.fi/a/1"),
  item("GP waiting times in Finland rise", "Patients wait longer for primary care appointments.", "https://thl.fi/b"),
];

describe("unknownNames: two-sentence questions", () => {
  for (const q of [
    "GP waits are long. Why is that?",
    "I live in Finland. Should I worry about cancer waits? It was bad in January.",
    "Cancer waits got worse. What happened on Monday?",
    "Onko jonoja? Miksi lääkäriin ei pääse?",
    "My GP said I'll wait until March. Is that normal?",
    "Lääkäriaika vasta joulukuussa. Onko tämä normaalia?",
    "Waiting lists grew over Christmas and Easter, didn't they?",
  ]) {
    test(q, () => {
      assert.deepEqual(unknownNames(q), []);
      assert.equal(filterRelevant(q, HEALTH_ITEMS, county(q)).length, HEALTH_ITEMS.length);
    });
  }
});

describe("unknownNames: unknown places are still rejected", () => {
  for (const [q, name] of [
    ["How long are GP waits in Narnia?", "narnia"],
    ["Is cancer care better in Gondor than in Finland?", "gondor"],
    ["What are the GP waits in Springfield?", "springfield"],
    ["GP waits are long. How long are they in Narnia?", "narnia"],
  ]) {
    test(q, () => {
      assert.deepEqual(unknownNames(q), [name]);
      assert.equal(county(q), null);
      assert.deepEqual(filterRelevant(q, HEALTH_ITEMS, null), [], "rejected when the name is absent");
      const withName = [...HEALTH_ITEMS, item(`GP waits in ${name[0].toUpperCase()}${name.slice(1)}`, "Doctors report long queues.")];
      assert.equal(filterRelevant(q, withName, null).length, withName.length, "kept when a result names it");
    });
  }

  test("known names need no confirmation", () => {
    assert.deepEqual(unknownNames("How do waits in Finland compare with Denmark and the NHS?"), []);
  });
});

describe("unknownNames: Title Case and ALL CAPS skip the name rule", () => {
  for (const q of ["How Long Are GP Waits In Narnia?", "HOW LONG ARE GP WAITS IN NARNIA?"]) {
    test(q, () => assert.deepEqual(unknownNames(q), []));
  }
});

describe("detectCounty: inflected forms still resolve", () => {
  for (const [q, id] of [
    ["Onko Kainuussa lääkäripula?", "kainuu"],
    ["Pääseekö Helsingissä lääkäriin?", "helsinki"],
    ["How long do people wait to see a GP in Helsinki?", "helsinki"],
    ["Jonot Vantaalla", "vantaa-kerava"],
    ["Lääkärijonot Tampereella", "pirkanmaa"],
    ["GP waits in Tampere", "pirkanmaa"],
    ["Tampereen terveysasemat", "pirkanmaa"],
    ["Onko Oulussa jonoja?", "north-ostrobothnia"],
    ["GP waits in Oulu", "north-ostrobothnia"],
    ["Oulun terveysasemat", "north-ostrobothnia"],
    ["Pääseekö Kokkolassa lääkäriin?", "central-ostrobothnia"],
    ["Soiten jonot", "central-ostrobothnia"],
    ["Onko Soitessa lääkäripula?", "central-ostrobothnia"],
    ["How long are waits at Soite?", "central-ostrobothnia"],
    ["Lahdessa on pitkät jonot", "paijat-hame"],
    ["Etelä-Pohjanmaalla jonot", "south-ostrobothnia"],
    ["Mikkelissä jonot", "south-savo"],
    ["Kanta-Hämeessä jonot", "kanta-hame"],
    ["Hospital waits in Helsingfors", "helsinki"],
    ["Tampereelle lähete", "pirkanmaa"],
    ["Oululainen potilas", "north-ostrobothnia"],
    ["Soite.fi jonotilanne", "central-ostrobothnia"],
  ]) {
    test(`${q} -> ${id}`, () => assert.equal(county(q), id));
  }
});

describe("detectCounty: lookalike words are not counties", () => {
  for (const q of [
    "Soitetaanko minulle takaisin terveysasemalta?",
    "Miksi takaisinsoittoa ei soiteta?",
    "Terveysasemalta ei ole soitettu takaisin",
    "Has the waiting list data been tampered with?",
    "Is anyone tampering with hospital queue numbers?",
    "Oulunkylän terveysasema jonot",
    "Hospital waits in Helsingborg",
    "Cancer pathway at Helsingør hospital in Denmark",
    "What did Mikkelsen find about Danish cancer pathways?",
    "Miksi Kanta hammashoidon merkinnät puuttuvat?",
  ]) {
    test(q, () => assert.equal(county(q), null));
  }
});

describe("isOnTopic: the gate", () => {
  for (const q of [
    "Soitetaanko minulle takaisin terveysasemalta?",
    "Miksi takaisinsoittoa ei soiteta?",
    "Why does nobody call back from the health centre?",
    "How long until I get a callback?",
  ]) {
    test(`passes: ${q}`, () => assert.equal(isOnTopic(q, county(q)), true));
  }
  for (const q of ["tell me a joke", "asdfgh", "Who won the hockey game?"]) {
    test(`rejects: ${q}`, () => assert.equal(isOnTopic(q, county(q)), false));
  }
});
