import assert from "node:assert/strict";
import { test } from "node:test";

import { statusText } from "../components/exa/types.ts";

test("cached result shows the saved date", () => {
  assert.equal(statusText({ freshness: "cache", retrievedAt: "2026-11-14" }), "Cached · saved 2026-11-14");
});

test("stale cache shows the saved date", () => {
  assert.equal(statusText({ freshness: "stale-cache", retrievedAt: "2026-11-12" }), "Cached (older) · saved 2026-11-12");
});

test("live result shows no saved date even if one is present", () => {
  assert.equal(statusText({ freshness: "live", retrievedAt: "2026-11-14" }), "Live");
});

test("cached without a date, or with a malformed one, shows only the label", () => {
  assert.equal(statusText({ freshness: "cache" }), "Cached");
  assert.equal(statusText({ freshness: "cache", retrievedAt: "yesterday" }), "Cached");
  assert.equal(statusText({ freshness: "cache", retrievedAt: "2026-13-45" }), "Cached");
  assert.equal(statusText({ freshness: "cache", retrievedAt: "<b>2026-11-14</b>" }), "Cached");
});

test("off-topic gate response shows no badge at all", () => {
  assert.equal(statusText({ freshness: "live", offTopic: true }), null);
});

test("a real live search that found nothing keeps its badge", () => {
  assert.equal(statusText({ freshness: "live", offTopic: false }), "Live");
  assert.equal(statusText({ freshness: "live" }), "Live");
});
