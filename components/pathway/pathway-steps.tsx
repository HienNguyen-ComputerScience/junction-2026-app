import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { explainHus, gapInWords } from "@/components/ui/gap-words";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import { STAGE_LABELS } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { formatPct, getStageGap, STATUS_LABEL, stageStatus } from "@/lib/ranking";

/**
 * The three steps of the pathway, the one component for them on every page.
 *
 * Every step has the same parts in the same order: mark and title; status badge and source chip
 * on one row (the year is in the section title, so the chip leaves it out and the row never
 * wraps); the value slot; the comparison line; a one-line caption; the bar with the Finland
 * line. A step without a value fills the same parts: a muted "No public data" in the value
 * slot, on the baseline of the figures beside it, never a hole.
 *
 * Two densities:
 *  - "full" (county page): three divided columns on shared rows, with every part.
 *  - "compact" (act page): one short strip, per step its name and value, what the value counts,
 *    a thin bar, the status badge and the source chip. The full detail is on the county page.
 */

export type PathwayStep = {
  step: number;
  stage: Stage;
  title: string;
  status: GapStatus;
  /** Present when the step has a public indicator. */
  measure?: {
    value: number | null;
    finland: number;
    sourceId: string;
    year: number;
    /** The indicator in the words the ranking uses for it. */
    counts: string;
    /** Which way is better: "lower is better", "higher is faster". */
    direction: string;
    /** The data's own sentence, shown when the area has no value. */
    note: string;
    /**
     * A wider value (the hospital group's) shown when the area has none of its own. Never the
     * area's figure: the step keeps its "no public data" status and the grey, hatched bar.
     */
    shared?: { name: string; value: number };
  };
};

/** What each indicator counts, named as in the ranking's column headers. */
const COUNTS: Record<Stage, string> = {
  gp_access: "Non-urgent GP visits waiting over 7 days",
  gp_recognition: "",
  referral: "Referrals processed within 3 days",
};

const DIRECTION: Record<Stage, string> = {
  gp_access: "lower is better",
  gp_recognition: "",
  referral: "higher is faster",
};

const PATHWAY: Stage[] = ["gp_access", "gp_recognition", "referral"];

/** The steps of one area, in pathway order, read from the snapshot as it is (nothing recomputed). */
export function buildPathwaySteps(countyId: string): PathwayStep[] {
  return PATHWAY.map((stage, index) => {
    const gap = stage === "gp_recognition" ? undefined : getStageGap(countyId, stage);
    return {
      step: index + 1,
      stage,
      // Step 1 keeps the label the test checklist quotes; the others come from lib/act.
      title: stage === "gp_access" ? "Getting to a GP" : STAGE_LABELS[stage],
      status: stage === "gp_recognition" ? "no_data" : stageStatus(countyId, stage),
      measure: gap && {
        value: gap.value,
        finland: gap.national_value,
        sourceId: gap.source_id,
        year: gap.year,
        counts: COUNTS[stage],
        direction: DIRECTION[stage],
        note: gap.note,
        shared: gap.shared && {
          name: gap.shared.name,
          value: gap.shared.value,
        },
      },
    };
  });
}

const MARK: Record<GapStatus, string> = {
  // Dark ink on the saturated fills: 5.0:1 on red, 9.7:1 on slate.
  red: "bg-status-red text-background",
  amber: "bg-status-amber text-background",
  no_data: "border border-dashed border-status-grey-ink/60 text-status-grey-ink",
};

/** The mark of a step: a numbered dot in the status colour. Decorative; the title carries the number. */
export function StepMark({ step, status, className }: { step: number; status: GapStatus; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold tabular-nums",
        MARK[status],
        className,
      )}
    >
      {step}
    </span>
  );
}

function StepTitle({ step, compact = false }: { step: PathwayStep; compact?: boolean }) {
  return (
    // Top-aligned: the steps share subgrid rows, so a one-line and a two-line title take the same row height.
    <div className="flex min-w-0 items-start gap-2.5">
      <StepMark step={step.step} status={step.status} className={compact ? undefined : "size-7 text-[0.8125rem]"} />
      <h3
        className={cn(
          "min-w-0 font-heading font-semibold tracking-normal text-pretty",
          compact ? "text-[0.9375rem] leading-6" : "text-base leading-7",
        )}
      >
        <span className="sr-only">Step {step.step}: </span>
        {step.title}
      </h3>
    </div>
  );
}

/** Status and source on one row. The section title gives the year, so the chip leaves it out. */
function StepStatus({ step }: { step: PathwayStep }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      <StatusBadge status={step.status} size="xs">
        {step.measure?.shared && step.measure.value === null ? "No county figure" : STATUS_LABEL[step.status]}
      </StatusBadge>
      {step.measure && <SourceChip sourceId={step.measure.sourceId} />}
    </div>
  );
}

export function PathwaySteps({
  steps,
  density,
  renderExtra,
  className,
}: {
  steps: PathwayStep[];
  density: "full" | "compact";
  /** A link for a step, on its own line under the status row (the red-flag helper for step 2). */
  renderExtra?: (step: PathwayStep) => ReactNode;
  className?: string;
}) {
  const compact = density === "compact";
  return (
    <ol
      className={cn(
        "grid divide-y divide-border",
        compact
          ? "md:grid-cols-3 md:grid-rows-[repeat(6,auto)] md:divide-x md:divide-y-0"
          : "lg:grid-cols-3 lg:grid-rows-[repeat(7,auto)] lg:divide-x lg:divide-y-0",
        className,
      )}
    >
      {steps.map((step) => (
        <Step key={step.stage} step={step} compact={compact} extra={renderExtra?.(step)} />
      ))}
    </ol>
  );
}

/** What a step without any measure says (step 2: no public statistic exists). */
const NO_STATISTIC = "No public statistic shows how often GPs spot possible cancer at the first visit.";

/** What the step would count, in one short line for the compact strip. */
const NO_STATISTIC_SHORT = "Whether GPs spot possible cancer at the first visit";

/** The comparison line of a step that no statistic measures, in any area. */
const NOT_MEASURED = "Not measured anywhere in Finland";

/** The label that always stands with a wider value shown in place of an area's own. */
const sharedLabel = (name: string) => `${name}-wide value, not a county figure`;

/**
 * One step card, the same parts in the same order at both densities (the steps share subgrid
 * rows, so every part lines up across the three): title; the value alone on its row, so the
 * three figures share one baseline; the comparison in words ("13.1 points slower than
 * Finland", the hospital group's label, or "Not measured anywhere in Finland"); one
 * description line; the bar with "Finland xx.x%" under its tick; the status and source chips;
 * and, for a step with one, a link (compact: on the chips' row).
 */
function Step({ step, compact, extra }: { step: PathwayStep; compact: boolean; extra?: ReactNode }) {
  const { measure, status } = step;
  const value = measure?.value ?? null;
  const shared = value === null ? measure?.shared : undefined;
  const shown = value ?? shared?.value ?? null;
  const description =
    shown !== null && measure
      ? shared
        ? `${measure.counts} across ${explainHus(shared.name)}`
        : measure.counts
      : measure
        ? measure.note
        : compact
          ? NO_STATISTIC_SHORT
          : NO_STATISTIC;
  const comparison =
    value !== null && measure ? (
      <span className={cn("figure font-medium", STATUS_FIGURE[status])}>
        {gapInWords(value, measure.finland, {
          higherIsFaster: step.stage === "referral",
          unit: compact ? "points" : "percentage points",
        })}
      </span>
    ) : shared ? (
      sharedLabel(shared.name)
    ) : !measure ? (
      NOT_MEASURED
    ) : null;
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col px-4",
        compact ? "" : "sm:px-6",
        compact
          ? "pt-3 pb-3 md:row-span-6 md:grid md:grid-rows-subgrid"
          : "pt-4 pb-5 lg:row-span-7 lg:grid lg:grid-rows-subgrid",
      )}
    >
      <StepTitle step={step} compact={compact} />

      {/* The value alone on its row, bottom-aligned in a fixed box: one baseline across the steps. */}
      <div className={cn("flex items-end", compact ? "h-9" : "h-[3.25rem]")}>
        {shown !== null ? (
          <span
            className={cn(
              "numeral leading-none",
              compact ? "text-[1.75rem]" : "text-[2.25rem]",
              value !== null ? STATUS_FIGURE[status] : "text-foreground",
            )}
          >
            {formatPct(shown)}
          </span>
        ) : (
          <span aria-hidden className="numeral text-[1.5rem] leading-none text-muted-foreground">
            –
          </span>
        )}
      </div>

      <p className={cn("type-caption text-pretty text-muted-foreground", compact ? "pt-1" : "pt-1.5")}>
        {comparison}
      </p>

      <p className="type-caption text-pretty text-muted-foreground">{description}</p>

      <MeasureBar
        className={compact ? "pt-2" : "pt-3"}
        size={compact ? "sm" : "md"}
        value={value}
        finland={measure ? measure.finland : null}
        finlandLabel={measure ? `Finland ${formatPct(measure.finland)}` : undefined}
        status={status}
      />

      {compact ? (
        // One row: the status chip, the source chip and the step's link (step 2).
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
          <StepStatus step={step} />
          {extra}
        </div>
      ) : (
        <>
          <div className="pt-3">
            <StepStatus step={step} />
          </div>
          {extra ? <div className="pt-2">{extra}</div> : <div aria-hidden />}
        </>
      )}
    </li>
  );
}
