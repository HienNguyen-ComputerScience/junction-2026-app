import type { ReactNode } from "react";
import { cn } from "cn";

import { STEP_UNIT } from "@/components/county/area-lead";
import { CaveatNote, Disclosure, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PlanStep } from "@/lib/plan-model";
import { formatPct } from "@/lib/ranking";

/**
 * The picture that holds still while the county's three steps scroll past: the three steps as
 * a short vertical path, each with its figure and status in words. Each step is a
 * `data-story-step` part, so it lights up as its text is read. Its final state (all lit) is the
 * whole picture on its own.
 *
 * Each step is a small grid: number | name | figure on the first row, the status tag on the
 * second, running under the figure too so the longer labels stay on one line.
 */
export function StepsPicture({ steps, mainStage, year }: { steps: PlanStep[]; mainStage: string | null; year: number }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-eyebrow">The first three steps, {year}</p>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li
            key={step.stage}
            data-story-step={index}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 rounded-panel border border-border bg-card px-5 py-4"
          >
            <span
              aria-hidden
              className={cn(
                "col-start-1 row-span-2 row-start-1 flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold",
                step.status === "red" ? "bg-status-red text-cream-paper" : "border border-forest-ink text-forest-ink",
              )}
            >
              {step.number}
            </span>
            <p className="col-start-2 row-start-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-forest-ink">
              <span>
                <span className="sr-only">Step {step.number}: </span>
                {step.label}
              </span>
              {step.stage === mainStage ? <span className="rounded-full bg-forest-ink px-2.5 py-0.5 text-base font-semibold text-cream-paper">The main delay</span> : null}
            </p>
            <StatusBadge
              status={step.status}
              className="col-start-2 row-start-2 h-auto max-w-full shrink items-baseline col-span-2 justify-self-start whitespace-normal leading-snug max-sm:rounded-lg"
            >
              {step.statusLabel}
            </StatusBadge>
            <p
              className={cn(
                "numeral col-start-3 row-start-1 text-right text-[2rem] leading-none",
                step.status === "red" ? "text-status-red-ink" : "text-forest-ink",
              )}
            >
              {step.value !== null ? formatPct(step.value) : <span className="font-display text-[1.5rem] font-light">No figure</span>}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** "In 2025, 85.4% of non-urgent GP visits waited more than 7 days. Finland overall: 54.7%. …" */
function StepFacts({ step }: { step: PlanStep }) {
  const unit = STEP_UNIT[step.stage];
  const change = step.changeText ? ` ${step.changeText.charAt(0).toUpperCase()}${step.changeText.slice(1)}.` : null;
  const finland = step.finland !== null ? <span className="figure font-semibold">{formatPct(step.finland)}</span> : null;

  // A figure of its own: say it as a sentence, then Finland overall and the change since 2023.
  if (step.value !== null && unit) {
    return (
      <>
        <p>
          In {step.year}, <span className="figure font-semibold">{formatPct(step.value)}</span> {unit}.
          {finland ? <> Finland overall: {finland}.</> : null}
          {change}
        </p>
        {step.note ? <p>{step.note}</p> : null}
      </>
    );
  }
  // No figure of its own: why first, then what Finland overall shows for the same measure.
  return (
    <>
      {step.note ? <p>{step.note}</p> : null}
      {step.measure ? (
        unit && finland ? (
          <p>
            Finland overall, {step.year}: {finland} {unit}.
          </p>
        ) : (
          <p>
            {step.measure}, {step.year}.{finland ? <> Finland overall: {finland}.</> : null}
            {change}
          </p>
        )
      ) : null}
    </>
  );
}

/**
 * One step told in words, beside the picture (which already shows the figure, its status and
 * "The main delay"): the step's name, its figure as a sentence with Finland overall, the change
 * since 2023, the one caveat (short, with "Why?"), the source, and the trend behind a button.
 */
export function StepStoryText({ step, trend }: { step: PlanStep; trend?: ReactNode }) {
  return (
    <div className="motion-loud flex flex-col items-start gap-4 py-6">
      <Reveal>
        <p className="type-eyebrow">Step {step.number}</p>
      </Reveal>
      <Reveal index={1}>
        <h3 className="font-display text-[1.5rem] leading-[1.2] font-light text-forest-ink">{step.label}</h3>
      </Reveal>
      <Reveal index={2} className="flex max-w-[52ch] flex-col gap-2 text-[1.0625rem] leading-relaxed text-pretty">
        <StepFacts step={step} />
      </Reveal>
      <Reveal index={3} className="flex flex-col items-start gap-3">
        {step.caveat ? <CaveatNote short="part of the rise may be how visits are recorded">{step.caveat}</CaveatNote> : null}
        {step.sourceId ? <SourceChip sourceId={step.sourceId} year={step.year} /> : null}
      </Reveal>
      {trend ? (
        <Disclosure label="the trend, 2023–2025" className="print:hidden">
          {trend}
        </Disclosure>
      ) : null}
    </div>
  );
}
