import type { ReactNode } from "react";

import { AreaPicker, type PickerArea } from "@/components/home/area-picker";
import { LeadFigure } from "@/components/home/lead-figure";
import { TopAction } from "@/components/home/top-action";
import { WhatIfPanel } from "@/components/home/what-if-panel";
import type { FinlandMapArea } from "@/components/map/finland-map";
import { buildPathwaySteps, PathwaySteps } from "@/components/pathway/pathway-steps";
import { SourceChip } from "@/components/source-chip";
import { getBottleneck, pickActions, type Bottleneck } from "@/lib/act";
import { indicators, LATEST_YEAR, type County, type Stage } from "@/lib/data";
import { formatPct, getStageGap, GP_WAIT_ID, STATUS_LABEL, type RankingRow } from "@/lib/ranking";
import { bestArea, whatIf, type Better } from "@/lib/what-if";

/** Stages as they read inside a sentence (the act page's wording). */
const STAGE_IN_SENTENCE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

/** Where the pathway breaks, in one line: the act page's answer, from lib/act's bottleneck. */
function verdictLine({ focus, anyRed }: Bottleneck): string {
  if (focus.length === 0) return `No ${LATEST_YEAR} pathway data is published for this area.`;
  const worst = STAGE_IN_SENTENCE[focus[0].stage];
  if (!anyRed) return `No measured step is worse than Finland. Closest to Finland's level: ${worst}.`;
  if (focus.length === 1) return `The delay sits at ${worst}, which is worse than Finland.`;
  return `${focus.length === 2 ? "Both" : "All"} measured steps are worse than Finland. Worst is ${worst}.`;
}

/** Which way the stage's share is better, read from the indicator's direction. */
function betterFor(indicatorId: string): Better {
  const direction = indicators.find((indicator) => indicator.indicator_id === indicatorId)?.direction;
  return direction === "lower_is_worse" ? "higher" : "lower";
}

/**
 * Server half of the home tool: computes, for all 22 areas, the verdict, the compact steps, the
 * top action and the what-if, and hands them to the client picker as plain data and
 * pre-rendered parts. No API route, no fetch.
 */
export function HomeTool({ rows, unranked }: { rows: RankingRow[]; unranked: County[] }) {
  const all: County[] = [...rows.map((row) => row.county), ...unranked];
  const defaultId = rows[0]?.county.id ?? all[0].id;

  // The best published share per stage, among the areas with a value of their own.
  const best = (stage: Stage, better: Better) =>
    bestArea(
      all.flatMap((county) => {
        const value = getStageGap(county.id, stage)?.value;
        return value == null ? [] : [{ id: county.id, name: county.name, value }];
      }),
      better,
    );

  const areas: PickerArea[] = [];
  const steps: Record<string, ReactNode> = {};
  const whatIfs: Record<string, ReactNode> = {};
  const actions: Record<string, ReactNode> = {};
  const leads: Record<string, ReactNode> = {};

  for (const county of all) {
    const bottleneck = getBottleneck(county.id);
    const top = pickActions(bottleneck)[0] ?? null;
    if (top && !actions[top.id]) actions[top.id] = <TopAction action={top} />;

    steps[county.id] = <PathwaySteps steps={buildPathwaySteps(county.id)} density="compact" />;

    const gap = bottleneck.focus[0];
    if (gap) {
      leads[county.id] = <LeadFigure gap={gap} />;
      const better = betterFor(gap.indicator_id);
      whatIfs[county.id] = (
        <WhatIfPanel
          areaName={county.name}
          stage={gap.stage}
          better={better}
          finland={gap.national_value}
          sourceId={gap.source_id}
          year={gap.year}
          result={whatIf({
            areaId: county.id,
            value: gap.value,
            finland: gap.national_value,
            better,
            best: best(gap.stage, better),
          })}
        />
      );
    }

    areas.push({ id: county.id, name: county.name, verdict: verdictLine(bottleneck), actionId: top?.id ?? null });
  }

  const mapAreas: FinlandMapArea[] = [
    ...rows.map((row) => ({
      id: row.county.id,
      name: row.county.name,
      href: `/county/${row.county.id}`,
      status: row.gpStatus,
      statusLabel: STATUS_LABEL[row.gpStatus],
      valueLabel: formatPct(row.gpWait.value),
    })),
    ...unranked.map((county) => ({
      id: county.id,
      name: county.name,
      href: `/county/${county.id}`,
      status: "no_data" as const,
      statusLabel: STATUS_LABEL.no_data,
      valueLabel: null,
    })),
  ];

  return (
    <AreaPicker
      areas={areas.sort((a, b) => a.name.localeCompare(b.name, "en"))}
      mapAreas={mapAreas}
      defaultId={defaultId}
      year={LATEST_YEAR}
      totalAreas={all.length}
      steps={steps}
      leads={leads}
      whatIfs={whatIfs}
      actions={actions}
      mapChip={<SourceChip sourceId={rows[0]?.gpWait.source_id ?? `sotkanet-${GP_WAIT_ID}`} year={LATEST_YEAR} />}
    />
  );
}
