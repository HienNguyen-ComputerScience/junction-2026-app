import type { ReactNode } from "react";

import { AreaPicker, type PickerArea } from "@/components/home/area-picker";
import { BriefingPreview } from "@/components/home/briefing-preview";
import { buildBriefing } from "@/lib/briefing/model";
import type { County } from "@/lib/data";
import type { RankingRow } from "@/lib/ranking";

/**
 * Server half of the home page: for every area, the briefing's step 1 (from the briefing's own
 * model, so it matches what "Start the briefing" opens on), handed to the client picker as
 * pre-rendered cards. No API route, no fetch.
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

  const previews: Record<string, ReactNode> = {};
  for (const county of all) {
    const briefing = buildBriefing(county.id);
    if (briefing) previews[county.id] = <BriefingPreview stand={briefing.stand} />;
  }
  const areas: PickerArea[] = all
    .map((county) => ({ id: county.id, name: county.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return <AreaPicker areas={areas} defaultId={defaultId} totalAreas={all.length} previews={previews} />;
}
