// Builds the brief's fact sheet from snapshot rows. PURE: no `@/` runtime
// imports and no Next imports, so scripts/brief/check-validator.mjs can run it
// with plain `node` on the JSON files. lib/brief/context.ts feeds it lib/data.ts.

import type { County, Evidence, Gap, Indicator, IndicatorValue, Source, Stage } from "@/lib/data";
import type { BriefAction, BriefContext, BriefFact, BriefStage } from "./types";

export type Snapshot = {
  areas: County[];
  indicators: Indicator[];
  values: IndicatorValue[];
  gaps: Gap[];
  evidence: Evidence[];
  sources: Source[];
};

const YEARS = [2023, 2024, 2025];
const LATEST = 2025;
const NATIONAL_ID = "finland";
const MAX_ACTIONS = 3;

// The two indicators the brief talks about. 5033 is context only (0-3% everywhere).
const BRIEF_INDICATORS: Record<string, { stage: Stage; decimals: number; days: number; what: string }> = {
  "6411": {
    stage: "gp_access",
    decimals: 1,
    days: 7,
    what: "of non-urgent GP appointments waited more than 7 days",
  },
  "13": {
    stage: "referral",
    decimals: 1,
    days: 3,
    what: "of referrals to specialist care were processed within 3 days",
  },
};

const STAGE_LABEL: Record<Stage, string> = {
  gp_access: "Getting a GP appointment",
  gp_recognition: "GP recognises possible cancer",
  referral: "GP to specialist (referral processing)",
};

const round = (n: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};
const fmt = (n: number, decimals: number) => round(n, decimals).toFixed(decimals);

export function buildContextFromSnapshot(snapshot: Snapshot, countyId: string): BriefContext | null {
  const county = snapshot.areas.find((a) => a.id === countyId && a.kind !== "country");
  if (!county) return null;
  const rankedAreas = snapshot.areas.filter((a) => a.kind !== "country").map((a) => a.id);

  const value = (areaId: string, indicatorId: string, year: number) =>
    snapshot.values.find((v) => v.county_id === areaId && v.indicator_id === indicatorId && v.year === year);

  const facts: BriefFact[] = [];
  const stages: BriefStage[] = [];

  for (const [indicatorId, meta] of Object.entries(BRIEF_INDICATORS)) {
    const indicator = snapshot.indicators.find((i) => i.indicator_id === indicatorId);
    if (!indicator) continue;
    const src = indicator.source_id;
    const higherIsWorse = indicator.direction === "higher_is_worse";

    facts.push({
      fact_id: `def-${indicatorId}-days`,
      text: `Indicator ${indicator.short_name}: the threshold is ${meta.days} days.`,
      value: meta.days,
      unit: "days",
      decimals: 0,
      year: null,
      indicator_id: indicatorId,
      source_id: src,
    });

    for (const year of YEARS) {
      const own = value(county.id, indicatorId, year);
      if (own) {
        facts.push({
          fact_id: `${county.id}-${indicatorId}-${year}`,
          text: `In ${year}, ${fmt(own.value, meta.decimals)}% ${meta.what} in ${county.name}.`,
          value: round(own.value, meta.decimals),
          unit: "%",
          decimals: meta.decimals,
          year,
          indicator_id: indicatorId,
          source_id: own.source_id,
        });
      }
      const national = value(NATIONAL_ID, indicatorId, year);
      if (national) {
        facts.push({
          fact_id: `finland-${indicatorId}-${year}`,
          text: `In ${year}, ${fmt(national.value, meta.decimals)}% ${meta.what} in Finland as a whole.`,
          value: round(national.value, meta.decimals),
          unit: "%",
          decimals: meta.decimals,
          year,
          indicator_id: indicatorId,
          source_id: national.source_id,
        });
      }
    }

    // Derived facts, computed here so the model never has to do arithmetic.
    const latest = value(county.id, indicatorId, LATEST);
    const nationalLatest = value(NATIONAL_ID, indicatorId, LATEST);
    if (latest && nationalLatest) {
      const diff = round(latest.value - nationalLatest.value, meta.decimals);
      const side = diff > 0 ? "above" : diff < 0 ? "below" : "equal to";
      facts.push({
        fact_id: `${county.id}-${indicatorId}-${LATEST}-vs-finland`,
        text: `In ${LATEST}, ${county.name} was ${fmt(Math.abs(diff), meta.decimals)} percentage points ${side} Finland on this indicator (${indicator.short_name}).`,
        value: diff,
        unit: "percentage points",
        decimals: meta.decimals,
        year: LATEST,
        indicator_id: indicatorId,
        source_id: src,
      });
    }
    const first = YEARS.map((y) => value(county.id, indicatorId, y)).find((v) => v !== undefined);
    if (latest && first && first.year < LATEST) {
      const change = round(latest.value - first.value, meta.decimals);
      const dir = change > 0 ? "rose" : change < 0 ? "fell" : "did not change";
      facts.push({
        fact_id: `${county.id}-${indicatorId}-change-${first.year}-${LATEST}`,
        text: `From ${first.year} to ${LATEST}, the share in ${county.name} ${dir} by ${fmt(Math.abs(change), meta.decimals)} percentage points (${indicator.short_name}).`,
        value: change,
        unit: "percentage points",
        decimals: meta.decimals,
        year: LATEST,
        indicator_id: indicatorId,
        source_id: src,
      });
    }
    if (latest) {
      const peers = rankedAreas
        .map((id) => value(id, indicatorId, LATEST))
        .filter((v): v is IndicatorValue => v !== undefined);
      const worse = peers.filter((p) => (higherIsWorse ? p.value > latest.value : p.value < latest.value)).length;
      const rank = worse + 1;
      const worstWord = higherIsWorse ? "highest share (longest GP waits)" : "lowest share (slowest referral processing)";
      facts.push({
        fact_id: `${county.id}-${indicatorId}-${LATEST}-rank`,
        text: `In ${LATEST}, ${county.name} ranked ${rank} of ${peers.length} areas with data, where rank 1 is the ${worstWord}.`,
        value: rank,
        unit: "rank",
        decimals: 0,
        year: LATEST,
        indicator_id: indicatorId,
        source_id: src,
      });
      facts.push({
        fact_id: `${indicatorId}-${LATEST}-rank-scale`,
        text: `Rank 1 is the ${worstWord} among areas with data on ${indicator.short_name}.`,
        value: 1,
        unit: "rank",
        decimals: 0,
        year: LATEST,
        indicator_id: indicatorId,
        source_id: src,
      });
      facts.push({
        fact_id: `${indicatorId}-${LATEST}-areas`,
        text: `${peers.length} areas (wellbeing services counties plus the City of Helsinki) have a ${LATEST} value for ${indicator.short_name}.`,
        value: peers.length,
        unit: "areas",
        decimals: 0,
        year: LATEST,
        indicator_id: indicatorId,
        source_id: src,
      });
    }
  }

  const countyGaps = snapshot.gaps.filter((g) => g.county_id === county.id);
  for (const stage of ["gp_access", "gp_recognition", "referral"] as Stage[]) {
    const gap = countyGaps.find((g) => g.stage === stage);
    if (!gap) {
      stages.push({
        stage,
        label: STAGE_LABEL[stage],
        status: "no_data",
        text: "No public indicator measures this stage, so there is no public data for any county.",
        indicator_id: null,
        source_id: null,
      });
      continue;
    }
    const statusText =
      gap.status === "red"
        ? "red: worse than Finland"
        : gap.status === "amber"
          ? "amber: at Finland's level or better, but still a delay, not a pass"
          : "no public data for this county";
    if (gap.shared) {
      // A wider value (HUS) for an area with none of its own. Labelled in the
      // fact text so the brief can never pass it off as the county's figure.
      const name = gap.shared.name;
      facts.push({
        fact_id: `${name.toLowerCase()}-${gap.indicator_id}-${LATEST}`,
        text: `In ${LATEST}, ${fmt(gap.shared.value, 1)}% of referrals to specialist care were processed within 3 days at ${name}, the hospital group that handles referrals from ${county.name} and other areas. This is a ${name}-wide value, not a figure for ${county.name} alone.`,
        value: round(gap.shared.value, 1),
        unit: "%",
        decimals: 1,
        year: LATEST,
        indicator_id: gap.indicator_id,
        source_id: gap.source_id,
      });
    }
    stages.push({
      stage,
      label: STAGE_LABEL[stage],
      status: gap.status,
      text: `${statusText}. ${gap.note}`,
      indicator_id: gap.indicator_id,
      source_id: gap.source_id,
    });
  }

  const worst = pickWorstStages(countyGaps);
  const actions: BriefAction[] = [];
  const perStage = Math.max(1, Math.floor(MAX_ACTIONS / Math.max(1, worst.length)));
  for (const stage of worst) {
    for (const row of snapshot.evidence.filter((e) => e.stage === stage && e.verified).slice(0, perStage)) {
      if (actions.length >= MAX_ACTIONS) break;
      actions.push({
        id: row.id,
        stage: row.stage,
        action: row.action,
        who_implements: row.who_implements,
        first_step: row.first_step,
        source_id: row.source_id,
      });
    }
  }

  const used = new Set<string>([
    ...facts.map((f) => f.source_id),
    ...stages.flatMap((s) => (s.source_id ? [s.source_id] : [])),
    ...actions.map((a) => a.source_id),
  ]);
  const sources = snapshot.sources
    .filter((s) => used.has(s.source_id))
    .map((s) => ({ source_id: s.source_id, kind: s.kind, name: s.name }));

  return {
    county: { id: county.id, name: county.name },
    year: LATEST,
    facts,
    stages,
    worst_stages: worst,
    actions,
    sources,
  };
}

/** Red stages; if none, the stage with data closest to (or worst against) Finland. */
function pickWorstStages(countyGaps: Gap[]): Stage[] {
  const withData = countyGaps.filter((g) => g.status !== "no_data" && g.value !== null);
  const red = withData.filter((g) => g.status === "red");
  if (red.length > 0) return red.map((g) => g.stage);
  if (withData.length === 0) return ["gp_access"];
  // Margin relative to Finland; smaller margin = less room = the weaker stage.
  const margin = (g: Gap) => Math.abs((g.value ?? 0) - g.national_value) / g.national_value;
  return [withData.reduce((a, b) => (margin(b) < margin(a) ? b : a)).stage];
}
