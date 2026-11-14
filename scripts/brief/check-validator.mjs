// Self-test for the brief validator: `npm run brief:check`.
// Runs with plain `node` (Node 22.18+/24 strips types from the imported .ts files).
// Exits non-zero if any check fails.

import { readFileSync } from "node:fs";

import { buildContextFromSnapshot } from "../../lib/brief/facts.ts";
import { buildFallbackBrief } from "../../lib/brief/fallback.ts";
import { checkClaim, numberTokens, validateBrief } from "../../lib/brief/validate.ts";

const load = (name) => JSON.parse(readFileSync(new URL(`../../data/${name}.json`, import.meta.url), "utf8"));
const snapshot = {
  areas: load("counties"),
  indicators: load("indicators"),
  values: load("values"),
  gaps: load("gaps"),
  evidence: load("evidence"),
  sources: load("sources"),
};

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"}  ${name}${!ok && detail ? `\n      ${detail}` : ""}`);
  if (!ok) failures++;
}

const ctx = buildContextFromSnapshot(snapshot, "vantaa-kerava");
check("context builds for vantaa-kerava", ctx !== null);
if (!ctx) process.exit(1);

const claim = (text, numbers, source_ids) => ({ text, numbers, source_ids });
const kept = (c) => checkClaim(c, ctx) === null;

// Tokenizer.
const toks = numberTokens("85,4 % in 2023–2025, 29,877 visits, a 7-day target, 30.7 percentage points");
check(
  "tokenizer: decimal comma, year range, thousands, percent vs percentage points",
  JSON.stringify(toks.map((t) => [t.value, t.percent])) ===
    JSON.stringify([[85.4, true], [2023, false], [2025, false], [29877, false], [7, false], [30.7, false]]),
  JSON.stringify(toks),
);

// 1. A correct claim is kept.
const good = claim(
  "In 2025, 85.4% of non-urgent GP visits in Vantaa and Kerava waited more than 7 days, against 54.7% for Finland.",
  [2025, 85.4, 7, 54.7],
  ["sotkanet-6411"],
);
check("keeps a correct claim", kept(good), checkClaim(good, ctx));
check("keeps a correctly rounded number (85%)", kept(claim("85% of non-urgent GP visits waited more than 7 days in 2025.", [85, 7, 2025], ["sotkanet-6411"])));
check("keeps the same number with a decimal comma (85,4 %)", kept(claim("85,4 % of non-urgent GP visits waited more than 7 days in 2025.", [85.4, 7, 2025], ["sotkanet-6411"])));

// 2. A fabricated number is dropped.
const fabricated = claim("In 2025, 91.2% of non-urgent GP visits waited more than 7 days.", [2025, 91.2, 7], ["sotkanet-6411"]);
check("drops a fabricated number", !kept(fabricated), "was kept");
check("drops a wrongly rounded number (85.5)", !kept(claim("85.5% of non-urgent GP visits waited.", [85.5], ["sotkanet-6411"])));
check("drops a percentage-point gap written as a percent (30.7%)", !kept(claim("Vantaa and Kerava is 30.7% above Finland.", [30.7], ["sotkanet-6411"])));

// 3. An unknown source_id is dropped, and so is a claim with no source.
check("drops an unknown source_id", !kept(claim("85.4% of non-urgent GP visits waited more than 7 days in 2025.", [85.4, 7, 2025], ["sotkanet-9999"])));
check("drops a claim with zero source_ids", !kept(claim("GP access is the bottleneck.", [], [])));
check(
  "drops a number cited to the wrong source",
  !kept(claim("85.4% of non-urgent GP visits waited more than 7 days in 2025.", [85.4, 7, 2025], ["sotkanet-13"])),
);
check(
  "drops a statistic source that backs none of the numbers",
  !kept(claim("85.4% of non-urgent GP visits waited more than 7 days in 2025.", [85.4, 7, 2025], ["sotkanet-6411", "sotkanet-13"])),
);

// 4. A number in the text that the model did not declare (and that is not in the context) is dropped.
const undeclared = claim(
  "85.4% of non-urgent GP visits waited more than 7 days in 2025, and 12000 visits were affected.",
  [85.4, 7, 2025],
  ["sotkanet-6411"],
);
check("drops a claim whose text contains an undeclared number", !kept(undeclared), "was kept");
check("drops spelled-out numbers", !kept(claim("Nearly ninety percent of non-urgent GP visits waited.", [], ["sotkanet-6411"])));
check("drops 'people' for a 6411 share", !kept(claim("85.4% of people waited more than 7 days in 2025.", [85.4, 7, 2025], ["sotkanet-6411"])));

// Small spelled-out numbers and fractions can't be checked either.
const spelledReason = (text) => checkClaim(claim(text, [], ["sotkanet-6411"]), ctx) ?? "";
for (const text of [
  "Two in three GP visits here come after more than a week.",
  "About two thirds of GP visits wait more than a week.",
  "One in three visits waits more than a week.",
]) {
  check(`drops small spelled-out number: "${text}"`, /spelled-out/.test(spelledReason(text)), spelledReason(text) || "was kept");
}
// The "visits, not people" rule applies even when the text has no percent.
check(
  "drops 'patients' for a 6411 claim with no percent",
  /not people/.test(spelledReason("Most patients here wait more than a week for a GP.")),
  spelledReason("Most patients here wait more than a week for a GP.") || "was kept",
);
// "one" in ordinary phrases must not be treated as a number.
check(
  "keeps 'no one' / 'the one closest' (not a number)",
  kept(claim("No one step explains the whole delay, and the one closest to Finland is referral.", [], ["sotkanet-13"])),
  checkClaim(claim("No one step explains the whole delay, and the one closest to Finland is referral.", [], ["sotkanet-13"]), ctx),
);

// The headline is validated too.
const result = validateBrief({ headline: fabricated, claims: [good, undeclared] }, ctx);
check(
  "validateBrief: drops a bad headline, keeps 1, drops 1",
  result.headline === null && result.kept.length === 1 && result.dropped.length === 2,
  JSON.stringify(result.dropped.map((d) => d.reason)),
);

// 5. The fallback brief passes its own validator, for every area.
const fb = buildFallbackBrief(ctx);
const fbResult = validateBrief(fb, ctx);
check(
  "fallback for vantaa-kerava passes its own validator (3-5 claims)",
  fbResult.headline !== null && fbResult.dropped.length === 0 && fb.claims.length >= 3 && fb.claims.length <= 5,
  JSON.stringify(fbResult.dropped.map((d) => d.reason)),
);
const allAreas = snapshot.areas.filter((a) => a.kind !== "country");
const badAreas = [];
for (const area of allAreas) {
  const c = buildContextFromSnapshot(snapshot, area.id);
  const r = validateBrief(buildFallbackBrief(c), c);
  if (r.headline === null || r.dropped.length > 0 || r.kept.length < 3) {
    badAreas.push(`${area.id}: ${JSON.stringify(r.dropped.map((d) => d.reason))}`);
  }
}
check(`fallback passes its own validator for all ${allAreas.length} areas`, badAreas.length === 0, badAreas.join("\n      "));

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll brief validator checks passed.");
