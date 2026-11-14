import type { ReactNode } from "react";
import { cn } from "cn";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal } from "@/components/motion/reveal";
import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PlanStep } from "@/lib/plan-model";
import { formatPct } from "@/lib/ranking";

/**
 * One pathway step as a self-contained unit: its name, the area's figure (counting up once), the
 * status in words, what the figure counts with Finland's value, the change since 2023, the one
 * caveat that applies, and the source. A step without a figure of its own says so in words
 * (step 2 everywhere, HUS-wide referrals, Helsinki's city units). Used by the county page and
 * the action plan, with the same data (`getAreaSteps` / `plan.steps`).
 */
export function StepUnit({
  step,
  index = 0,
  flag,
  headingLevel = "h3",
  children,
}: {
  step: PlanStep;
  index?: number;
  /** A short label above the step, e.g. "The main delay". */
  flag?: string;
  headingLevel?: "h2" | "h3";
  /** Extra content under the text and above the source, e.g. the step's trend. */
  children?: ReactNode;
}) {
  const Heading = headingLevel;
  return (
    <Reveal index={index} className="print-keep flex">
      <FramePanel padding="none" className="step-unit flex w-full min-w-0 flex-col gap-3 p-6 sm:p-7 print:gap-2 print:p-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="type-eyebrow">Step {step.number}</span>
          {flag ? (
            <span className="rounded-full bg-forest-ink px-2.5 py-0.5 text-[0.8125rem] font-semibold text-cream-paper">{flag}</span>
          ) : null}
        </p>
        <Heading className="type-heading">{step.label}</Heading>
        {step.value !== null ? (
          <p className={cn("numeral text-5xl print:text-3xl", step.status === "red" ? "text-status-red-ink" : "text-forest-ink")}>
            <AnimatedNumber value={step.value} final={formatPct(step.value)} />
          </p>
        ) : (
          <p className="font-display text-3xl font-light text-forest-ink print:text-2xl">No figure</p>
        )}
        <StatusBadge status={step.status} className="h-auto max-w-full shrink items-baseline whitespace-normal leading-snug">
          {step.statusLabel}
        </StatusBadge>
        {step.measure ? (
          <p className="text-base">
            {step.measure}, {step.year} ({step.direction}).
            {step.finland !== null ? (
              <>
                {" "}
                Finland: <span className="figure font-semibold">{formatPct(step.finland)}</span>.
              </>
            ) : null}
          </p>
        ) : null}
        {step.note ? <p className="text-base text-muted-foreground">{step.note}</p> : null}
        {step.changeText ? <p className="text-base">{step.changeText}.</p> : null}
        {step.caveat ? (
          <p className="rounded-lg bg-mint-veil px-4 py-3 text-base">
            <span className="font-semibold">Read with care: </span>
            {step.caveat}
          </p>
        ) : null}
        {children}
        {step.sourceId ? (
          <div className="mt-auto pt-1">
            <SourceChip sourceId={step.sourceId} year={step.year} />
          </div>
        ) : null}
      </FramePanel>
    </Reveal>
  );
}
