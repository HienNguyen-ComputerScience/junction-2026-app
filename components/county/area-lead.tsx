import type { ReactNode } from "react";
import { cn } from "cn";

import { AnimatedNumber, CaveatNote, Chunk } from "@/components/motion";
import { HUS_FULL, shortReason } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { getBottleneck } from "@/lib/act";
import { getCounty, LATEST_YEAR, type Stage } from "@/lib/data";
import { getMainReason } from "@/lib/main-reason";
import { getAreaSteps } from "@/lib/plan-model";
import { formatPct, getIndicator } from "@/lib/ranking";

/** What a step's figure counts, in words after the numeral ("85.4% of non-urgent GP visits …"). */
export const STEP_UNIT: Partial<Record<Stage, string>> = {
  gp_access: "of non-urgent GP visits waited more than 7 days",
  referral: "of referrals were processed within 3 days",
};

/** The headline figure's one main caveat: a few words always visible, the indicator's own text behind "Why?". */
const LEAD_CAVEAT: Partial<Record<Stage, string>> = {
  gp_access: "counts visits, not people; not only cancer",
  referral: "measures when assessment starts, not when a specialist is seen",
};

/** The first "HUS" of a text, spelled out. */
export const spellHus = (text: string) =>
  text.includes("the HUS-wide value")
    ? text.replace("the HUS-wide value", `one value for ${HUS_FULL}`)
    : text.replace(/\bHUS\b(?! \()/, HUS_FULL);

/**
 * The headline figure with its unit. Same face and sizes as the shared ChunkFigure, but from
 * 640px the unit runs on one line beside the numeral, so the figure reads as one sentence and the
 * page's main button stays on the first screen.
 */
function LeadFigure({ value, unit, alarm }: { value: number; unit?: string; alarm: boolean }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span
        className={cn(
          "numeral text-[4.5rem] leading-none sm:text-[6.5rem] print:text-[36pt]",
          alarm ? "text-status-red-ink" : "text-forest-ink",
        )}
      >
        <AnimatedNumber value={value} final={formatPct(value)} level="loud" />
      </span>
      {unit ? <span className="max-w-[22ch] font-display text-[1.5rem] leading-snug font-light text-forest-ink sm:max-w-none">{unit}</span> : null}
    </p>
  );
}

/**
 * The county page's opening chunk: the step behind the main reason (or the first step with a
 * figure), counting up, what it means against Finland overall and 2023, then its source and its
 * one main caveat on one row, then the page's actions (children).
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
  const source = lead?.sourceId ? <SourceChip sourceId={lead.sourceId} year={lead.year} /> : null;

  return (
    <Chunk
      lead
      as="h1"
      className="gap-4"
      eyebrow={
        eyebrow ?? (
          <>
            {/* The Finnish name on wider screens; on a phone it would wrap the eyebrow to two lines. */}
            <span className="max-sm:hidden">{county.name_fi} · </span>
            {lead ? lead.label : "The first three steps"}, {LATEST_YEAR}
          </>
        )
      }
      statement={county.name}
      figure={lead && lead.value !== null ? <LeadFigure value={lead.value} unit={STEP_UNIT[lead.stage]} alarm={lead.status === "red"} /> : undefined}
      meaning={meaning}
    >
      <div className="flex flex-col items-start gap-4">
        {source || caveat ? (
          // Source and caveat on one row, next to the figure they qualify; an opened "Why?" grows downwards.
          <div className="flex flex-wrap items-center gap-2 has-[details[open]]:items-start print:items-start">
            {source}
            {caveat ? <CaveatNote short={caveat.short}>{caveat.why}</CaveatNote> : null}
          </div>
        ) : null}
        {children}
      </div>
    </Chunk>
  );
}
