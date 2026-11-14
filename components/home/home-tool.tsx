import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AreaPicker, type PickerArea } from "@/components/home/area-picker";
import { LeadFigure } from "@/components/home/lead-figure";
import { TopAction } from "@/components/home/top-action";
import type { FinlandMapArea } from "@/components/map/finland-map";
import { buildPathwaySteps } from "@/components/pathway/pathway-steps";
import { shortReason } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { bottleneckStatus, getBottleneck, pickActions } from "@/lib/act";
import { LATEST_YEAR, type County } from "@/lib/data";
import { getMainReason } from "@/lib/main-reason";
import { GP_WAIT_ID, REFERRAL_ID, STATUS_LABEL, type RankingRow } from "@/lib/ranking";

/**
 * Server half of the home tool: computes, for all 22 areas, the one-line reason, the lead figure,
 * the top action and the three-step status row, and hands them to the client picker as plain
 * data and pre-rendered parts. No API route, no fetch.
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
  const actions: Record<string, ReactNode> = {};
  const steps: Record<string, ReactNode> = {};

  for (const county of all) {
    const bottleneck = getBottleneck(county.id);
    const top = pickActions(bottleneck)[0] ?? null;
    // One node per area (it links to that area's act page): an area with a break reads
    // "Recommended action 1", one without reads as keeping its level.
    const actionId = top ? county.id : null;
    if (top && actionId && !actions[actionId]) {
      actions[actionId] = <TopAction action={top} keepLevel={!bottleneck.anyRed} href={`/county/${county.id}/act#action-1`} />;
    }
    steps[county.id] = <ThreeSteps countyId={county.id} />;

    // The figure and the sentence under it are about the same step (getMainReason).
    const reason = getMainReason(county.id);
    if (reason.gap) leads[county.id] = <LeadFigure gap={reason.gap} />;

    areas.push({
      id: county.id,
      name: county.name,
      verdict: shortReason(reason),
      status: bottleneckStatus(bottleneck),
      actionId,
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
      actions={actions}
      steps={steps}
      mapKey={mapKey}
      mapNote="Each area is coloured by the worse of its two measured steps against Finland's level. Map: Statistics Finland, CC BY 4.0."
      mapChips={[
        <SourceChip
          key="gp"
          sourceId={rows[0]?.gpWait.source_id ?? `sotkanet-${GP_WAIT_ID}`}
          year={LATEST_YEAR}
        />,
        <SourceChip key="referral" sourceId={`sotkanet-${REFERRAL_ID}`} year={LATEST_YEAR} />,
      ]}
    />
  );
}

/**
 * "The three steps" under the hero buttons: each step's short name and its status as a text
 * label (no numbers). Each is a link (a border and a chevron, a lighter surface on hover) to
 * that step's tab on the area's pathway page (?step=1, 2 or 3).
 */
function ThreeSteps({ countyId }: { countyId: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-caption font-medium text-muted-foreground">The three steps</p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {buildPathwaySteps(countyId).map((step) => (
          <li key={step.stage} className="min-w-0">
            <Link
              href={`/county/${countyId}?step=${step.step}`}
              className="group flex h-full items-start justify-between gap-2 rounded-lg border border-border bg-muted px-3.5 py-3 transition-colors outline-none hover:border-foreground/40 hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="text-sm leading-snug font-medium text-foreground">
                  <span className="sr-only">Step {step.step}: </span>
                  {step.title}
                </span>
                <StatusBadge status={step.status} size="xs">
                  {step.measure?.shared && step.measure.value === null ? "No county figure" : STATUS_LABEL[step.status]}
                </StatusBadge>
              </span>
              <ChevronRight
                aria-hidden
                strokeWidth={1.75}
                className="mt-0.5 size-4 shrink-0 text-faint transition-colors group-hover:text-foreground group-focus-visible:text-foreground"
              />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
