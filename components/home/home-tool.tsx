import type { ReactNode } from "react";

import { plainTitle } from "@/components/act/action-card";
import { AreaPicker, type PickerArea } from "@/components/home/area-picker";
import { LeadFigure } from "@/components/home/lead-figure";
import type { FinlandMapArea } from "@/components/map/finland-map";
import { shortReason } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { bottleneckStatus, getBottleneck, pickActions } from "@/lib/act";
import { LATEST_YEAR, type County } from "@/lib/data";
import { getMainReason } from "@/lib/main-reason";
import { GP_WAIT_ID, REFERRAL_ID, STATUS_LABEL, type RankingRow } from "@/lib/ranking";

/**
 * Server half of the home tool: computes, for all 22 areas, the one-line reason, the lead figure
 * and the top action's title, and hands them to the client picker as plain data and
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
  const leads: Record<string, ReactNode> = {};

  for (const county of all) {
    const bottleneck = getBottleneck(county.id);
    const top = pickActions(bottleneck)[0] ?? null;

    // The figure and the sentence under it are about the same step (getMainReason).
    const reason = getMainReason(county.id);
    if (reason.gap) leads[county.id] = <LeadFigure gap={reason.gap} />;

    areas.push({
      id: county.id,
      name: county.name,
      verdict: shortReason(reason),
      status: bottleneckStatus(bottleneck),
      topAction: top ? { title: plainTitle(top.action), keepLevel: !bottleneck.anyRed } : null,
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

  // The map's key names the states that appear on it, and the hatch always: Åland is drawn with it.
  const present = new Set(mapAreas.map((area) => area.status));
  const mapKey: ("red" | "amber" | "no_data")[] = [
    ...(["red", "amber"] as const).filter((status) => present.has(status)),
    "no_data",
  ];

  return (
    <AreaPicker
      areas={areas.sort((a, b) => a.name.localeCompare(b.name, "en"))}
      mapAreas={mapAreas}
      defaultId={defaultId}
      year={LATEST_YEAR}
      totalAreas={all.length}
      leads={leads}
      mapKey={mapKey}
      mapNote="Each area is coloured by the worse of its two measured steps against Finland's level. Map: Statistics Finland, CC BY 4.0."
      mapChip={
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <SourceChip sourceId={rows[0]?.gpWait.source_id ?? `sotkanet-${GP_WAIT_ID}`} year={LATEST_YEAR} />
          <SourceChip sourceId={`sotkanet-${REFERRAL_ID}`} year={LATEST_YEAR} />
        </span>
      }
    />
  );
}
