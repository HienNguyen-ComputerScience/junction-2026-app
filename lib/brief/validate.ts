// Validator for the county brief (SPEC.md: "a server-side validator drops any
// claim whose number or source_id is not in the context").
//
// PURE module: no `@/` runtime imports, no Next imports, only `import type`,
// so `node scripts/brief/check-validator.mjs` can import it directly.
//
// A claim is kept only if ALL of these hold:
//   1. it has text and at least one source_id, and every source_id is in the context;
//   2. every number it declares in `numbers`, AND every number we find in its text
//      ourselves (whatever it declared), is covered by a context fact whose
//      source_id the claim cites. Covered means: same value at the precision the
//      text uses (85.4 or 85 both match 85.4; 85.41 does not), a year of such a
//      fact, or a number printed in a cited action's own text. A "%" in the text
//      only matches a percentage fact, never a percentage-point difference;
//   3. every cited statistic source backs at least one of its numbers (evidence
//      sources may be cited for the action they describe);
//   4. no spelled-out numbers ("two in three", "nine in ten", "doubled"): those can't be checked;
//   5. a claim citing the GP-visits indicator (6411) never calls them people.

import type { BriefContext, DroppedClaim, ModelBrief, ModelClaim, ValidationResult } from "./types";

export type NumberToken = { raw: string; value: number; decimals: number; percent: boolean };

/** Every numeric token in a text: "85.4%", "85,4 %", "29,877", "2023–2025" (two years), "7-day". */
export function numberTokens(text: string): NumberToken[] {
  const normalised = text
    .replace(/(\d)[,   ](?=\d{3}(?!\d))/g, "$1") // thousands: 29,877 / 29 877
    .replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"); // decimal comma: 85,4
  const tokens: NumberToken[] = [];
  for (const match of normalised.matchAll(/\d+(?:\.\d+)?/g)) {
    const raw = match[0];
    const after = normalised.slice((match.index ?? 0) + raw.length);
    tokens.push({
      raw,
      value: Number(raw),
      decimals: raw.includes(".") ? raw.split(".")[1].length : 0,
      percent: /^\s?(%|percent\b|per cent\b)/i.test(after),
    });
  }
  return tokens;
}

// Bare "one" is deliberately not listed ("no one", "the one closest"); only its numeric uses are.
const SPELLED =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|halved|twice|double|doubled|triple|tripled|quarters?|thirds?|fifths?|one (?:in|out of) \w+|one[- ](?:third|quarter|fifth))\b/i;

const PEOPLE = /\b(people|persons|residents|inhabitants|citizens|patients)\b/i;

function declaredToken(n: number): NumberToken {
  const raw = String(Math.abs(n));
  return { raw, value: Math.abs(n), decimals: raw.includes(".") ? raw.split(".")[1].length : 0, percent: false };
}

const sameAtPrecision = (a: number, b: number, decimals: number) =>
  Math.round(Math.abs(a) * 10 ** decimals) === Math.round(Math.abs(b) * 10 ** decimals);

/**
 * Which cited sources back this number. `covered` is false when no cited fact
 * matches. A bare year only covers the number; it doesn't count as the source
 * "backing" the claim (every statistic has a 2025 row).
 */
function backingSources(
  token: NumberToken,
  cited: Set<string>,
  context: BriefContext,
): { covered: boolean; backers: Set<string> } {
  const backers = new Set<string>();
  let yearOnly = false;
  for (const fact of context.facts) {
    if (!cited.has(fact.source_id)) continue;
    const valueMatch =
      (!token.percent || fact.unit === "%") && sameAtPrecision(token.value, fact.value, token.decimals);
    if (valueMatch) backers.add(fact.source_id);
    else if (!token.percent && token.decimals === 0 && fact.year === token.value) yearOnly = true;
  }
  for (const action of context.actions) {
    if (!cited.has(action.source_id)) continue;
    const own = numberTokens(`${action.action} ${action.who_implements} ${action.first_step}`);
    if (own.some((t) => t.value === token.value && (!token.percent || t.percent))) backers.add(action.source_id);
  }
  return { covered: backers.size > 0 || yearOnly, backers };
}

/** null = keep; otherwise the reason the claim is dropped. */
export function checkClaim(claim: ModelClaim, context: BriefContext): string | null {
  const text = typeof claim.text === "string" ? claim.text.trim() : "";
  if (!text) return "empty text";
  const sourceIds = Array.isArray(claim.source_ids) ? [...new Set(claim.source_ids)] : [];
  if (sourceIds.length === 0) return "no source_ids";
  const known = new Map(context.sources.map((s) => [s.source_id, s.kind]));
  const unknown = sourceIds.filter((id) => !known.has(id));
  if (unknown.length > 0) return `unknown source_id: ${unknown.join(", ")}`;
  const spelled = SPELLED.exec(text);
  if (spelled) return `spelled-out number "${spelled[0]}" cannot be checked`;

  const cited = new Set(sourceIds);
  const declared = Array.isArray(claim.numbers) ? claim.numbers.filter((n) => Number.isFinite(n)) : [];
  const tokens: { token: NumberToken; origin: string }[] = [
    ...numberTokens(text).map((token) => ({ token, origin: "in text" })),
    ...declared.map((n) => ({ token: declaredToken(n), origin: "declared" })),
  ];

  const backing = new Set<string>();
  for (const { token, origin } of tokens) {
    const { covered, backers } = backingSources(token, cited, context);
    if (!covered) {
      return `number ${token.raw}${token.percent ? "%" : ""} (${origin}) is not in the snapshot facts for the cited sources`;
    }
    for (const id of backers) backing.add(id);
  }

  // A claim whose only numbers are years ("no 2025 value") may cite any context source.
  if (backing.size > 0) {
    const idle = sourceIds.filter((id) => known.get(id) === "statistic" && !backing.has(id));
    if (idle.length > 0) return `source ${idle.join(", ")} is cited but backs none of the claim's numbers`;
  }

  // 6411 counts GP visits, so any claim citing it must not talk about people, with or without a %.
  if (cited.has("sotkanet-6411") && PEOPLE.test(text)) return "6411 counts non-urgent GP visits, not people";

  return null;
}

export function validateBrief(output: ModelBrief, context: BriefContext): ValidationResult {
  const dropped: DroppedClaim[] = [];
  const kept: ModelClaim[] = [];
  const clean = (c: ModelClaim): ModelClaim => ({
    text: c.text.trim(),
    numbers: c.numbers,
    source_ids: [...new Set(c.source_ids)],
  });

  let headline: ModelClaim | null = null;
  const headlineReason = checkClaim(output.headline, context);
  if (headlineReason) dropped.push({ claim: output.headline, reason: `headline: ${headlineReason}` });
  else headline = clean(output.headline);

  for (const claim of output.claims) {
    const reason = checkClaim(claim, context);
    if (reason) dropped.push({ claim, reason });
    else kept.push(clean(claim));
  }
  return { headline, kept, dropped };
}
