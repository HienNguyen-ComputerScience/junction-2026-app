// Deterministic brief built from the fact sheet with fixed templates. Used when
// there is no API key, the Claude call fails or times out, the output is
// malformed, or fewer than 2 AI claims survive validation. It passes the same
// validator (checked by `npm run brief:check`).
//
// PURE module (only `import type`), so plain `node` can import it.

import type { BriefContext, BriefFact, ModelBrief, ModelClaim } from "./types";

const abs = (n: number) => Math.abs(n);
const show = (fact: BriefFact) => abs(fact.value).toFixed(fact.decimals);

/** Numbers printed in free text we quote verbatim (action wording). The validator re-parses anyway. */
const numbersIn = (text: string) =>
  (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map((raw) => Number(raw.replace(",", ".")));

export function buildFallbackBrief(context: BriefContext): ModelBrief {
  const c = context.county.id;
  const y = context.year;
  const name = context.county.name;
  const fact = (id: string) => context.facts.find((f) => f.fact_id === id);

  const gp = fact(`${c}-6411-${y}`);
  const gpFi = fact(`finland-6411-${y}`);
  const gpDiff = fact(`${c}-6411-${y}-vs-finland`);
  const gpRank = fact(`${c}-6411-${y}-rank`);
  const gpAreas = fact(`6411-${y}-areas`);
  const gpChange = context.facts.find((f) => f.fact_id.startsWith(`${c}-6411-change-`));
  const gpFirst = gpChange ? fact(`${c}-6411-${gpChange.fact_id.split("-change-")[1].split("-")[0]}`) : undefined;
  const ref = fact(`${c}-13-${y}`);
  const refFi = fact(`finland-13-${y}`);
  const refRank = fact(`${c}-13-${y}-rank`);
  const refAreas = fact(`13-${y}-areas`);

  const status = (stage: string) => context.stages.find((s) => s.stage === stage)?.status ?? "no_data";
  const gpStatus = status("gp_access");
  const refStatus = status("referral");

  const claims: ModelClaim[] = [];

  // Headline: where the pathway breaks.
  let headline: ModelClaim;
  if (gp && gpFi && gpStatus === "red") {
    headline = {
      text: `In ${name}, the pathway breaks first at getting a GP appointment: ${show(gp)}% of non-urgent GP visits waited more than 7 days in ${y}, against ${show(gpFi)}% for Finland.`,
      numbers: [gp.value, 7, y, gpFi.value],
      source_ids: [gp.source_id],
    };
  } else if (ref && refFi && refStatus === "red") {
    headline = {
      text: `In ${name}, the weakest public step is GP to specialist: ${show(ref)}% of referrals were processed within 3 days in ${y}, against ${show(refFi)}% for Finland.`,
      numbers: [ref.value, 3, y, refFi.value],
      source_ids: [ref.source_id],
    };
  } else if (gp) {
    headline = {
      text: `${name} is at or better than Finland's level where public data exists, but that is still a delay, not a pass: ${show(gp)}% of non-urgent GP visits waited more than 7 days in ${y}.`,
      numbers: [gp.value, 7, y],
      source_ids: [gp.source_id],
    };
  } else {
    headline = {
      text: `${name} has no public ${y} data on waits for a non-urgent GP visit.`,
      numbers: [y],
      source_ids: ["sotkanet-6411"],
    };
  }

  // 1. Getting a GP appointment, against Finland and the other areas.
  if (gp && gpFi && gpDiff && gpRank && gpAreas) {
    const side = gpDiff.value > 0 ? "above" : gpDiff.value < 0 ? "below" : "level with";
    const label = gpStatus === "red" ? "worse than Finland" : "at Finland's level or better, but still a delay";
    claims.push({
      text: `Getting a GP appointment (${label}): ${show(gp)}% of non-urgent GP visits waited more than 7 days in ${y}, ${show(gpDiff)} percentage points ${side} Finland's ${show(gpFi)}%. That is rank ${show(gpRank)} of ${show(gpAreas)} areas, counting from the longest wait.`,
      numbers: [gp.value, 7, y, abs(gpDiff.value), gpFi.value, gpRank.value, gpAreas.value],
      source_ids: [gp.source_id],
    });
  }

  // 2. Trend since the first year in the snapshot.
  if (gp && gpChange && gpFirst && gpFirst.year !== null) {
    const verb = gpChange.value > 0 ? "rose" : gpChange.value < 0 ? "fell" : "held";
    claims.push({
      text: `The trend: that share ${verb} from ${show(gpFirst)}% in ${gpFirst.year} to ${show(gp)}% in ${y}, a change of ${show(gpChange)} percentage points.`,
      numbers: [gpFirst.value, gpFirst.year, gp.value, y, abs(gpChange.value)],
      source_ids: [gp.source_id],
    });
  }

  // 3. GP to specialist, plus the stage nobody measures.
  const recognition = " Whether GPs recognise possible cancer has no public indicator in any county, so that stage has no public data.";
  if (ref && refFi && refRank && refAreas) {
    const label = refStatus === "red" ? "worse than Finland" : "at Finland's level or better, but still not a pass";
    claims.push({
      text: `GP to specialist (${label}): ${show(ref)}% of referrals to specialist care were processed within 3 days in ${y}, against ${show(refFi)}% for Finland, rank ${show(refRank)} of ${show(refAreas)} areas with data, counting from the slowest.${recognition}`,
      numbers: [ref.value, 3, y, refFi.value, refRank.value, refAreas.value],
      source_ids: [ref.source_id],
    });
  } else {
    claims.push({
      text: `GP to specialist: Sotkanet publishes no ${y} value for how fast referrals to specialist care are processed in ${name}, so this step has no public data here.${recognition}`,
      numbers: [y],
      source_ids: ["sotkanet-13"],
    });
  }

  // 4-5. What to do first, for the worst stage(s).
  for (const action of context.actions.slice(0, 2)) {
    const text = `Recommended action: ${action.action}. Who: ${action.who_implements}. First step: ${action.first_step}`;
    claims.push({ text, numbers: numbersIn(text), source_ids: [action.source_id] });
  }

  return { headline, claims: claims.slice(0, 5) };
}
