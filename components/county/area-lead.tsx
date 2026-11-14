import type { ReactNode } from "react";

import { AnimatedNumber, Chunk, ChunkFigure } from "@/components/motion";
import { HUS_FULL, shortReason } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { getBottleneck } from "@/lib/act";
import { getCounty, LATEST_YEAR, type Stage } from "@/lib/data";
import { getMainReason } from "@/lib/main-reason";
import { getAreaSteps } from "@/lib/plan-model";
import { formatPct, getIndicator } from "@/lib/ranking";

/** The headline figure's unit, in words, after the numeral. */
const LEAD_UNIT: Partial<Record<Stage, string>> = {
  gp_access: "of non-urgent GP visits waited more than 7 days",
  referral: "of referrals were processed within 3 days",
};

/** The headline figure's one main caveat: a few words always visible, the indicator's own text behind "Why?". */
const LEAD_CAVEAT: Partial<Record<Stage, string>> = {
  gp_access: "counts visits, not people, and all non-urgent visits, not only possible cancer",
  referral: "measures when assessment starts, not when a specialist is seen",
};

/** The first "HUS" of a text, spelled out. */
export const spellHus = (text: string) =>
  text.includes("the HUS-wide value")
    ? text.replace("the HUS-wide value", `one value for ${HUS_FULL}`)
    : text.replace(/\bHUS\b(?! \()/, HUS_FULL);

/**
 * An area's opening chunk, shared by the county page and the action plan so the two always lead
 * with the same figure: the step behind the main reason (or the first step with a figure),
 * counting up, what it means against Finland and 2023, its source and its one main caveat.
 */
export function AreaLead({ countyId, eyebrow, children }: { countyId: string; eyebrow?: string; children?: ReactNode }) {
  const county = getCounty(countyId);
  if (!county) return null;
  const bottleneck = getBottleneck(county.id);
  const reason = getMainReason(county.id);
  const reasonStage = bottleneck.anyRed ? (reason.gap?.stage ?? null) : null;
  const steps = getAreaSteps(county.id);
  const lead = steps.find((step) => step.stage === reasonStage && step.value !== null) ?? steps.find((step) => step.value !== null) ?? null;
  const indicator = lead?.indicatorId ? getIndicator(lead.indicatorId) : undefined;

  const meaning = lead
    ? `${lead.statusLabel}${lead.finland !== null ? ` (${formatPct(lead.finland)})` : ""}${lead.changeText ? `, and ${lead.changeText}` : ""}.`
    : shortReason(reason);
  const caveat = lead?.caveat
    ? { short: "part of the rise may be how visits are recorded", why: lead.caveat }
    : lead && LEAD_CAVEAT[lead.stage]
      ? { short: LEAD_CAVEAT[lead.stage], why: indicator ? spellHus(indicator.limitation) : undefined }
      : undefined;

  return (
    <Chunk
      lead
      as="h1"
      eyebrow={eyebrow ?? `${county.name_fi} · ${lead ? lead.label : "The first three steps"}, ${LATEST_YEAR}`}
      statement={county.name}
      figure={
        lead && lead.value !== null ? (
          <ChunkFigure tone={lead.status === "red" ? "alarm" : "plain"} unit={LEAD_UNIT[lead.stage]}>
            <AnimatedNumber value={lead.value} final={formatPct(lead.value)} level="loud" />
          </ChunkFigure>
        ) : undefined
      }
      meaning={meaning}
      source={lead?.sourceId ? <SourceChip sourceId={lead.sourceId} year={lead.year} /> : undefined}
      caveat={caveat}
    >
      {children}
    </Chunk>
  );
}
