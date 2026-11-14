import "server-only";

import { buildBriefContext } from "./context";
import { buildFallbackBrief } from "./fallback";
import type { BriefContext, BriefResponse, ModelBrief, ModelClaim } from "./types";
import { validateBrief } from "./validate";

// Writes the county brief with Claude, then keeps only claims the validator can
// trace to the snapshot. Same conventions as lib/exa/answer.ts (ANTHROPIC_API_KEY,
// built-in fetch, AbortController timeout). Differences: a Sonnet-class model,
// and structured output via output_config.format, because forced tool_choice
// returns a 400 on claude-sonnet-5-5.

export const BRIEF_MODEL = "claude-sonnet-5-5";
const TIMEOUT_MS = 12_000;
const MIN_KEPT = 2;
const MAX_CLAIMS = 6;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const REASON = {
  forced: "Fallback requested (mode=fallback).",
  noKey: "No Anthropic API key is configured on the server.",
  timeout: "Claude did not answer within 12 seconds.",
  upstream: "The Claude request failed.",
  refusal: "Claude declined to write this brief.",
  malformed: "Claude returned output in the wrong shape.",
  tooFew: "Fewer than 2 of Claude's claims passed the snapshot check.",
} as const;

const SYSTEM = `You write a short brief for the director of a Finnish wellbeing services county: where the county's early cancer care pathway breaks, and what that means. The reader is not a clinician.

You get a fact sheet in JSON. Rules:
- Use ONLY the facts, stages and actions in the fact sheet. No outside knowledge, no other numbers.
- Write every number as digits, exactly as the fact sheet gives it (you may round a percentage to a whole number). Never spell numbers out ("nine in ten", "half", "doubled") and never compute new numbers: differences, changes and ranks are already in the fact sheet.
- Do not write indicator codes such as 6411 or 13 in the text.
- For each claim, list in "numbers" every number that appears in its text (years and ranks included), and in "source_ids" the exact "source_id" value of every fact or action the claim uses (fact_id values are not sources). A claim with no source_id is discarded. Do not cite a statistic source unless the claim uses one of its numbers.
- Indicator 6411 counts non-urgent GP visits (appointments), not people. Say "non-urgent GP visits", never "people" or "patients", for those shares.
- Amber means "at Finland's level or better", which is still a delay, not good. Never call an amber stage good, fine or solved.
- A fact that says it is a HUS-wide value is shared by several areas. If you use it, say it is the HUS-wide value and that there is no figure for the county alone.
- Where a stage has status no_data, say there is no public data for the county. Do not guess. A stage with source_id null has no source to cite, so mention it inside a claim that also states a sourced fact (for example together with the other stages' status), never alone.
- No diagnosis, no medical advice, no statements about individual patients.
- Headline: one sentence, where the pathway breaks. Then 3 to 5 claims, one or two sentences each: the worst stage with its numbers, the trend, the stages with no public data, and what to do first (name the action, who does it and the first step from the fact sheet).
- Plain English, short sentences.`;

const CLAIM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["text", "numbers", "source_ids"],
  properties: {
    text: { type: "string" },
    numbers: { type: "array", items: { type: "number" } },
    source_ids: { type: "array", items: { type: "string" } },
  },
} as const;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "claims"],
  properties: {
    headline: CLAIM_SCHEMA,
    claims: { type: "array", items: CLAIM_SCHEMA },
  },
} as const;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function parseClaim(v: unknown): ModelClaim | null {
  if (!isObject(v) || typeof v.text !== "string") return null;
  const numbers = Array.isArray(v.numbers) ? v.numbers.filter((n): n is number => typeof n === "number") : [];
  const sourceIds = Array.isArray(v.source_ids)
    ? v.source_ids.filter((s): s is string => typeof s === "string")
    : [];
  return { text: v.text, numbers, source_ids: sourceIds };
}

/** The model's JSON, or null if it isn't the agreed shape. */
function parseOutput(json: unknown): ModelBrief | null {
  if (!isObject(json) || !Array.isArray(json.content)) return null;
  const block = json.content.find((b): b is Record<string, unknown> => isObject(b) && b.type === "text");
  if (!block || typeof block.text !== "string") return null;
  let data: unknown;
  try {
    data = JSON.parse(block.text);
  } catch {
    return null;
  }
  if (!isObject(data) || !Array.isArray(data.claims)) return null;
  const headline = parseClaim(data.headline);
  const claims = data.claims.map(parseClaim);
  if (!headline || claims.some((c) => c === null)) return null;
  return { headline, claims: claims.filter((c): c is ModelClaim => c !== null) };
}

/** The precomputed brief. `droppedCount` carries the AI drops when we fell back after validation. */
export function fallbackResponse(context: BriefContext, reason?: string, droppedCount = 0): BriefResponse {
  const brief = buildFallbackBrief(context);
  const checked = validateBrief(brief, context);
  return {
    mode: "fallback",
    ...(reason && { reason }),
    headline: (checked.headline ?? brief.headline).text,
    claims: checked.kept.map(({ text, source_ids }) => ({ text, source_ids })),
    dropped_count: droppedCount + checked.dropped.length,
  };
}

type Outcome = { ok: true; response: BriefResponse } | { ok: false; reason: string; dropped?: number };

async function callClaude(context: BriefContext, key: string): Promise<Outcome> {
  const factSheet = {
    county: context.county,
    year: context.year,
    facts: context.facts.map(({ fact_id, text, value, unit, year, source_id }) => ({
      fact_id,
      text,
      value,
      unit,
      year,
      source_id,
    })),
    stages: context.stages,
    worst_stages: context.worst_stages,
    // No action ids here: the model cited them as source_ids, which the validator drops.
    actions: context.actions.map(({ stage, action, who_implements, first_step, source_id }) => ({
      stage,
      action,
      who_implements,
      first_step,
      source_id,
    })),
    sources: context.sources,
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: BRIEF_MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
        messages: [
          {
            role: "user",
            content: `<fact_sheet>\n${JSON.stringify(factSheet, null, 1)}\n</fact_sheet>\n\nWrite the brief for ${context.county.name}.`,
          },
        ],
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, reason: `${REASON.upstream} (HTTP ${res.status})` };
    const json: unknown = await res.json();
    if (isObject(json) && json.stop_reason === "refusal") return { ok: false, reason: REASON.refusal };
    if (isObject(json) && json.stop_reason === "max_tokens") return { ok: false, reason: REASON.malformed };
    const output = parseOutput(json);
    if (!output) return { ok: false, reason: REASON.malformed };

    const checked = validateBrief(output, context);
    // Server log only (no secrets): why claims were dropped, for tuning the prompt.
    for (const d of checked.dropped) console.info(`[brief] ${context.county.id} dropped: ${d.reason} | ${d.claim.text}`);
    if (checked.kept.length < MIN_KEPT) return { ok: false, reason: REASON.tooFew, dropped: checked.dropped.length };

    const model = isObject(json) && typeof json.model === "string" ? json.model : BRIEF_MODEL;
    // A dropped headline is replaced by the precomputed one, which passes the same check.
    const headline = checked.headline?.text ?? buildFallbackBrief(context).headline.text;
    return {
      ok: true,
      response: {
        mode: "ai",
        headline,
        ...(checked.headline === null && { headline_precomputed: true }),
        claims: checked.kept.slice(0, MAX_CLAIMS).map(({ text, source_ids }) => ({ text, source_ids })),
        dropped_count: checked.dropped.length,
        model,
      },
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return { ok: false, reason: timedOut ? REASON.timeout : REASON.upstream };
  } finally {
    clearTimeout(timer);
  }
}

// Small in-memory cache per county. Only AI results are cached, so one timeout
// doesn't pin the fallback for the rest of the demo.
const cache = new Map<string, { response: BriefResponse; expires: number }>();
const inFlight = new Map<string, Promise<BriefResponse>>();

/** The brief for one county, or null for an unknown county id. */
export async function generateBrief(
  countyId: string,
  options: { forceFallback?: boolean } = {},
): Promise<BriefResponse | null> {
  const context = buildBriefContext(countyId);
  if (!context) return null;
  if (options.forceFallback) return fallbackResponse(context, REASON.forced);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallbackResponse(context, REASON.noKey);

  const hit = cache.get(countyId);
  if (hit && hit.expires > Date.now()) return hit.response;

  const pending = inFlight.get(countyId);
  if (pending) return pending;

  const run = callClaude(context, key).then((outcome) => {
    if (!outcome.ok) return fallbackResponse(context, outcome.reason, outcome.dropped ?? 0);
    cache.set(countyId, { response: outcome.response, expires: Date.now() + CACHE_TTL_MS });
    return outcome.response;
  });
  inFlight.set(countyId, run);
  try {
    return await run;
  } finally {
    inFlight.delete(countyId);
  }
}
