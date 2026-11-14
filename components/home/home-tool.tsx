import type { ReactNode } from "react";

import { AreaPicker, type PickerArea } from "@/components/home/area-picker";
import { LeadFigure } from "@/components/home/lead-figure";
import { TopAction } from "@/components/home/top-action";
import { WhatIfPanel } from "@/components/home/what-if-panel";
import type { FinlandMapArea } from "@/components/map/finland-map";
import { reasonForDisplay } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { bottleneckStatus, getBottleneck, pickActions } from "@/lib/act";
import { LATEST_YEAR, type County } from "@/lib/data";
import { bestForStage, betterFor, getMainReason } from "@/lib/main-reason";
import { GP_WAIT_ID, REFERRAL_ID, STATUS_LABEL, type RankingRow } from "@/lib/ranking";
import { whatIf } from "@/lib/what-if";

/**
 * Server half of the home tool: computes, for all 22 areas, the verdict, the lead figure, the
 * top action and the what-if, and hands them to the client picker as plain data and
 * pre-rendered parts. No API route, no fetch.
 */
export function HomeTool({
  rows,
  unranked,
  initialAreaId,
}: {
  rows: RankingRow[];
  unranked: County[];
  /** The area named by ?area= on this request, if any. Unknown ids fall back to the default. */
  initialAreaId?: string;
}) {
  const all: County[] = [...rows.map((row) => row.county), ...unranked];
  const defaultId = all.some((county) => county.id === initialAreaId)
    ? (initialAreaId as string)
    : (rows[0]?.county.id ?? all[0].id);

  const areas: PickerArea[] = [];
  const whatIfs: Record<string, ReactNode> = {};
  const actions: Record<string, ReactNode> = {};
  const leads: Record<string, ReactNode> = {};

  for (const county of all) {
    const bottleneck = getBottleneck(county.id);
    const top = pickActions(bottleneck)[0] ?? null;
    // One node per action and per label: an area with a break reads "Recommended action 1", one
    // without reads as keeping its level.
    const actionKey = `${top?.id}:${bottleneck.anyRed}`;
    if (top && !actions[actionKey]) actions[actionKey] = <TopAction action={top} keepLevel={!bottleneck.anyRed} />;

    // The figure and the sentence under it are about the same step (getMainReason).
    const reason = getMainReason(county.id);
    if (reason.gap) leads[county.id] = <LeadFigure gap={reason.gap} />;

    const gap = bottleneck.focus[0];
    if (gap) {
      const better = betterFor(gap.indicator_id);
      whatIfs[county.id] = (
        <WhatIfPanel
          areaName={county.name}
          stage={gap.stage}
          better={better}
          value={gap.value}
          status={gap.status}
          finland={gap.national_value}
          sourceId={gap.source_id}
          year={gap.year}
          result={whatIf({
            areaId: county.id,
            value: gap.value,
            finland: gap.national_value,
            better,
            best: bestForStage(gap.stage),
          })}
        />
      );
    }

    areas.push({
      id: county.id,
      name: county.name,
      verdict: reasonForDisplay(reason.text, { gap: false }),
      status: bottleneckStatus(bottleneck),
      actionId: top ? actionKey : null,
    });
  }

  // The map is coloured by the same status as the card's verdict (getBottleneck: the worst
  // measured step), never by one step alone. No figure on the map: the card has the figures.
  const mapAreas: FinlandMapArea[] = all.map((county) => {
    const status = bottleneckStatus(getBottleneck(county.id));
    return {
      id: county.id,
      name: county.name,
      href: `/county/${county.id}`,
      status,
      statusLabel: STATUS_LABEL[status],
      valueLabel: null,
    };
  });

  // The map's key names only the states that appear on it.
  const present = new Set(mapAreas.map((area) => area.status));
  const mapKey = (["red", "amber", "no_data"] as const).filter((status) => present.has(status));

  return (
    <AreaPicker
      areas={areas.sort((a, b) => a.name.localeCompare(b.name, "en"))}
      mapAreas={mapAreas}
      defaultId={defaultId}
      year={LATEST_YEAR}
      totalAreas={all.length}
      leads={leads}
      whatIfs={whatIfs}
      actions={actions}
      mapKey={mapKey}
      mapNote={<>Coloured by the worse of the two measured steps. Map: Statistics Finland, CC BY 4.0</>}
      mapChip={
        <span className="flex items-center gap-1.5">
          <SourceChip sourceId={rows[0]?.gpWait.source_id ?? `sotkanet-${GP_WAIT_ID}`} year={LATEST_YEAR} />
          <SourceChip sourceId={`sotkanet-${REFERRAL_ID}`} year={LATEST_YEAR} />
        </span>
      }
    />
  );
}
