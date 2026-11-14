import type { ReactNode } from "react";
import { cn } from "cn";

import { gapToFinland } from "@/components/ranking/ranking-list";
import { SourceChip } from "@/components/source-chip";
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
export function StepMark({
  step,
  status,
  className,
}: {
  step: number;
  status: GapStatus;
  className?: string;
}) {
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
    <div className="flex min-w-0 items-center gap-2.5">
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
function StepStatus({ step, children }: { step: PathwayStep; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      <StatusBadge status={step.status} size="xs">
        {STATUS_LABEL[step.status]}
      </StatusBadge>
      {step.measure && <SourceChip sourceId={step.measure.sourceId} />}
      {children}
    </div>
  );
}

export function PathwaySteps({
  steps,
  density,
  ledStage,
  renderExtra,
  className,
}: {
  steps: PathwayStep[];
  density: "full" | "compact";
  /**
   * The step whose figure already leads the page (the county page's key figure). Its value slot
   * shows the gap to Finland instead, so one number is on screen once.
   */
  ledStage?: Stage;
  /** Compact only: a link for a step, beside its status (the red-flag helper for step 2). */
  renderExtra?: (step: PathwayStep) => ReactNode;
  className?: string;
}) {
  if (density === "compact") {
    return (
      <ol className={cn("grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0", className)}>
        {steps.map((step) => (
          <CompactStep key={step.stage} step={step} extra={renderExtra?.(step)} />
        ))}
      </ol>
    );
  }
  return (
    <ol
      className={cn(
        "grid divide-y divide-border lg:grid-cols-3 lg:grid-rows-[repeat(6,auto)] lg:divide-x lg:divide-y-0",
        className,
      )}
    >
      {steps.map((step) => (
        <FullStep key={step.stage} step={step} led={step.stage === ledStage} />
      ))}
    </ol>
  );
}

/** Height of the value slot: the figure, or the statement that stands in for it. */
const SLOT = "flex h-11 items-end";
const SLOT_FIGURE = "numeral text-[2.25rem] leading-none";

function FullStep({ step, led }: { step: PathwayStep; led: boolean }) {
  const { measure, status } = step;
  const value = measure?.value ?? null;
  return (
    <li className="flex min-w-0 flex-col px-4 pt-4 pb-5 sm:px-6 lg:row-span-6 lg:grid lg:grid-rows-subgrid">
      <StepTitle step={step} />
      <div className="pt-3">
        <StepStatus step={step} />
      </div>

      {measure && value !== null ? (
        <>
          <p className={cn(SLOT, "pt-3")}>
            <span className={cn(SLOT_FIGURE, STATUS_FIGURE[status])}>
              {led ? gapToFinland(value, measure.finland) : formatPct(value)}
            </span>
          </p>
          <p className="pt-2 type-caption text-muted-foreground">
            {!led && (
              <span className={cn("figure font-medium", STATUS_FIGURE[status])}>
                {gapToFinland(value, measure.finland)}{" "}
              </span>
            )}
            vs Finland, {measure.direction}
          </p>
          <p className="pt-1 type-caption text-pretty text-muted-foreground">{measure.counts}</p>
        </>
      ) : (
        <>
          <NoValue />
          <p className="pt-2 type-caption text-muted-foreground">
            {measure ? (
              <>
                Finland <span className="figure">{formatPct(measure.finland)}</span>, {measure.direction}
              </>
            ) : (
              "Not measured anywhere in Finland"
            )}
          </p>
          <p className="pt-1 type-caption text-pretty text-muted-foreground">
            {measure
              ? measure.note
              : "No public statistic shows how often GPs spot possible cancer at the first visit."}
          </p>
        </>
      )}

      <MeasureBar
        className="pt-4"
        value={value}
        finland={measure ? measure.finland : null}
        finlandLabel={measure ? `Finland ${formatPct(measure.finland)}` : undefined}
        status={status}
      />
    </li>
  );
}

/**
 * The value slot of a step with no value: the statement sits on the baseline of the figures
 * beside it. The hidden figure is a strut of the same size, so the alignment is exact.
 */
function NoValue() {
  return (
    <p className={cn(SLOT, "pt-3")}>
      <span className="flex items-baseline">
        <span aria-hidden className={cn(SLOT_FIGURE, "invisible w-0")}>
          0
        </span>
        <span className="text-[1.0625rem] leading-none font-medium text-muted-foreground">No public data</span>
      </span>
    </p>
  );
}

function CompactStep({ step, extra }: { step: PathwayStep; extra?: ReactNode }) {
  const { measure, status } = step;
  const value = measure?.value ?? null;
  return (
    <li className="flex min-w-0 flex-col px-4 py-2.5 sm:px-5 md:py-2">
      <div className="flex items-center justify-between gap-3">
        <StepTitle step={step} compact />
        {measure && value !== null && (
          <span className={cn("numeral text-[1.375rem] leading-6", STATUS_FIGURE[status])}>{formatPct(value)}</span>
        )}
      </div>
      <p className="pt-0.5 type-caption text-muted-foreground">
        {measure ? measure.counts : "No public statistic measures this step"}
      </p>
      <MeasureBar
        className="pt-2"
        size="sm"
        value={value}
        finland={measure ? measure.finland : null}
        status={status}
      />
      <div className="pt-2">
        <StepStatus step={step}>{extra}</StepStatus>
      </div>
    </li>
  );
}
