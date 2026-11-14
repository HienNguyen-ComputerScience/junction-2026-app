import assert from "node:assert/strict";
import { test } from "node:test";

// Importing must not start a run (no fetch, no process.exit).
const { chooseRetrievedAt, shouldWriteEntry } = await import("../scripts/exa/prewarm.mjs");

const TODAY = "2026-11-14";

test("live responses are stamped with today", () => {
  assert.equal(chooseRetrievedAt({ freshness: "live", items: [] }, TODAY), TODAY);
});

test("cached responses keep their own older date", () => {
  assert.equal(chooseRetrievedAt({ freshness: "cache", retrievedAt: "2026-11-10" }, TODAY), "2026-11-10");
  assert.equal(chooseRetrievedAt({ freshness: "stale-cache", retrievedAt: "2026-11-09" }, TODAY), "2026-11-09");
});

test("a live response ignores a stray retrievedAt and uses today", () => {
  assert.equal(chooseRetrievedAt({ freshness: "live", retrievedAt: "2026-01-01" }, TODAY), TODAY);
});

test("cached without a usable date is not stamped (null), never today", () => {
  assert.equal(chooseRetrievedAt({ freshness: "cache" }, TODAY), null);
  assert.equal(chooseRetrievedAt({ freshness: "cache", retrievedAt: "soon" }, TODAY), null);
});

test("an older or missing date never overwrites a newer saved entry", () => {
  assert.equal(shouldWriteEntry({ retrievedAt: "2026-11-13" }, "2026-11-10"), false);
  assert.equal(shouldWriteEntry({ retrievedAt: "2026-11-13" }, null), false);
  assert.equal(shouldWriteEntry({ retrievedAt: "2026-11-10" }, "2026-11-10"), true);
  assert.equal(shouldWriteEntry({ retrievedAt: "2026-11-10" }, "2026-11-14"), true);
  assert.equal(shouldWriteEntry(undefined, "2026-11-14"), true);
  assert.equal(shouldWriteEntry({}, "2026-11-14"), true);
});
