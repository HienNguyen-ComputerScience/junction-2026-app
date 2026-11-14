import type { ReactNode } from "react";
import { cn } from "cn";

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
            className="flex items-center gap-4 rounded-panel border border-border bg-card px-5 py-4"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold",
                step.status === "red" ? "bg-status-red text-cream-paper" : "border border-forest-ink text-forest-ink",
              )}
            >
              {step.number}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-forest-ink">
                <span>
                  <span className="sr-only">Step {step.number}: </span>
                  {step.label}
                </span>
                {step.stage === mainStage ? <span className="rounded-full bg-forest-ink px-2.5 py-0.5 text-base font-semibold text-cream-paper">The main delay</span> : null}
              </p>
              <StatusBadge status={step.status} className="h-auto max-w-full shrink items-baseline whitespace-normal leading-snug max-sm:rounded-lg">
                {step.statusLabel}
              </StatusBadge>
            </div>
            <p className={cn("numeral shrink-0 text-[2rem] leading-none", step.status === "red" ? "text-status-red-ink" : "text-forest-ink")}>
              {step.value !== null ? formatPct(step.value) : <span className="font-display text-[1.5rem] font-light">No figure</span>}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One step told in words, beside the picture (which already shows the figure and its status):
 * the step's name, what the figure counts with Finland's value, the change since 2023, the one
 * caveat (short, with "Why?"), the source, and the trend behind a button.
 */
export function StepStoryText({
  step,
  flag,
  trend,
}: {
  step: PlanStep;
  flag?: string;
  trend?: ReactNode;
}) {
  return (
    <div className="motion-loud flex flex-col items-start gap-4 py-6">
      <Reveal className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="type-eyebrow">Step {step.number}</span>
        {flag ? <span className="rounded-full bg-forest-ink px-2.5 py-0.5 text-base font-semibold text-cream-paper">{flag}</span> : null}
      </Reveal>
      <Reveal index={1}>
        <h3 className="font-display text-[2rem] leading-[1.15] font-light text-forest-ink sm:text-[2.5rem]">{step.label}</h3>
      </Reveal>
      <Reveal index={3} className="flex max-w-[52ch] flex-col gap-2 text-[1.0625rem] leading-relaxed text-pretty">
        {step.measure ? (
          <p>
            {step.measure}, {step.year}.
            {step.finland !== null ? (
              <>
                {" "}
                Finland: <span className="figure font-semibold">{formatPct(step.finland)}</span>.
              </>
            ) : null}
            {step.changeText ? ` ${step.changeText.charAt(0).toUpperCase()}${step.changeText.slice(1)}.` : null}
          </p>
        ) : null}
        {step.note ? <p>{step.note}</p> : null}
      </Reveal>
      <Reveal index={4} className="flex flex-col items-start gap-3">
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
