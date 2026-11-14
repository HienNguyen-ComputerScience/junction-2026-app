import { cn } from "cn";
import type { ReactNode } from "react";

import { buildPathwaySteps, StepMark, type PathwayStep } from "@/components/pathway/pathway-steps";
import { getBottleneck } from "@/lib/act";
import type { Stage } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/ranking";

type Group = "patient" | "county" | "hospital";

// The eight steps as drawn in the challenge talk (slide 10), from the first symptom to the
// start of treatment. FirstLine covers steps 3 to 5; `stage` marks them (their mark and status
// come from the data). `short` is the one-line label of the small line.
const STEPS: { label: string; short: string; group: Group; stage?: Stage }[] = [
  { label: "Symptom", short: "Symptom", group: "patient" },
  { label: "Seeks care", short: "Seeks care", group: "patient" },
  { label: "Getting to a GP", short: "GP access", group: "county", stage: "gp_access" },
  { label: "GP recognises warning signs", short: "GP recognition", group: "county", stage: "gp_recognition" },
  { label: "GP to specialist referral", short: "Referral", group: "county", stage: "referral" },
  { label: "Diagnosis", short: "Diagnosis", group: "hospital" },
  { label: "Treatment plan", short: "Treatment plan", group: "hospital" },
  { label: "Treatment", short: "Treatment", group: "hospital" },
];

const GROUPS: { group: Group; label: string; from: number; span: number }[] = [
  { group: "patient", label: "Before care: not measured", from: 1, span: 2 },
  { group: "county", label: "Where a county can act", from: 3, span: 3 },
  { group: "hospital", label: "Hospital: not measured", from: 6, span: 3 },
];

/** Where the pathway breaks, in the words of the verdicts. */
const BREAK_PHRASE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

/** A step's status in words: the status term, or "No county figure" for a hospital group's value. */
function statusWords(card: PathwayStep): string {
  if (card.measure?.shared && card.measure.value === null) return "No county figure";
  return STATUS_LABEL[card.status];
}

/** The centre of node `i` (0-based) of eight, as a percentage of the line's width. */
const centre = (i: number) => ((i + 0.5) / STEPS.length) * 100;

/**
 * The pathway from the first symptom to treatment, as one line of eight nodes: FirstLine's three
 * steps carry the step cards' marks (number and status; hollow and dashed with no public data),
 * the patient's and the hospital's steps are small hollow nodes. Where the area's pathway breaks
 * (its worst step, when one is worse than Finland), the line is cut and lit in status red, with
 * the label "Breaks here: …"; past the break the line is dashed.
 *
 *  - "lg" (home): labels, each FirstLine step's status in words, and "not measured" once for the
 *    patient's and once for the hospital's steps.
 *  - "sm" (county and act pages, under the title): one row, the break label on the left and
 *    short labels under the nodes.
 */
export function PathwayStrip({
  countyId,
  size,
  heading,
  className,
}: {
  countyId: string;
  size: "lg" | "sm";
  /** "sm": a section title over the break label, in the same left column. */
  heading?: ReactNode;
  className?: string;
}) {
  const cards = buildPathwaySteps(countyId);
  const cardOf = (stage?: Stage) => cards.find((card) => card.stage === stage);
  const { focus, anyRed } = getBottleneck(countyId);
  const breakStage = anyRed ? (focus[0]?.stage ?? null) : null;
  const breakIndex = breakStage ? STEPS.findIndex((step) => step.stage === breakStage) : -1;
  const lg = size === "lg";

  const label = breakStage ? (
    <p className="flex items-start gap-2 text-status-red-ink">
      <span aria-hidden className="mt-[0.4375rem] size-2 shrink-0 rounded-[2px] bg-status-red" />
      <span className={cn("font-semibold text-pretty", lg ? "text-[0.9375rem] leading-6" : "text-sm leading-5")}>
        Breaks here: {BREAK_PHRASE[breakStage]}
      </span>
    </p>
  ) : (
    <p className={cn("text-pretty text-muted-foreground", lg ? "text-[0.9375rem] leading-6" : "text-sm leading-5")}>
      No measured step is worse than Finland&apos;s level
    </p>
  );

  const line = (
    <div className="relative">
      <Segments breakIndex={breakIndex} lg={lg} />
      <ol className="relative grid grid-cols-8">
        {STEPS.map((step, index) => {
          const card = cardOf(step.stage);
          const isBreak = index === breakIndex;
          return (
            <li key={step.label} className="flex min-w-0 flex-col items-center px-1 text-center">
              <span className={cn("flex shrink-0 items-center justify-center", lg ? "h-8" : "h-6")}>
                {card ? (
                  <StepMark
                    step={card.step}
                    status={card.status}
                    className={cn(
                      lg ? "size-8 text-[0.875rem]" : "size-6 text-[0.75rem]",
                      "ring-4 ring-card",
                      card.status === "no_data" && "bg-card",
                      isBreak && "outline-2 outline-offset-[5px] outline-status-red",
                    )}
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "rounded-full border-[1.5px] border-foreground/40 bg-card",
                      lg ? "size-3" : "size-2.5",
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 whitespace-nowrap",
                  lg ? "pt-2 text-[0.8125rem] leading-5 max-md:sr-only" : "pt-1.5 type-note max-sm:sr-only",
                  card ? "font-medium text-foreground" : "text-muted-foreground",
                  isBreak && "text-status-red-ink",
                )}
              >
                <span className="sr-only">
                  Step {index + 1} of {STEPS.length}
                  {card ? `, FirstLine step ${card.step}, ${step.label}` : ""}:{" "}
                </span>
                <span aria-hidden={card ? true : undefined}>{step.short}</span>
                {card && <span className="sr-only">, {statusWords(card)}</span>}
                {!card && <span className="sr-only">, not measured here</span>}
                {isBreak && <span className="sr-only">. The pathway breaks here.</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  if (!lg) {
    return (
      <figure
        aria-label="The pathway from the first symptom to treatment"
        className={cn("grid items-center gap-x-6 gap-y-3 md:grid-cols-[13rem_minmax(0,1fr)]", className)}
      >
        <figcaption className="flex flex-col gap-1">
          {heading}
          {label}
        </figcaption>
        {line}
      </figure>
    );
  }

  return (
    <figure aria-label="The pathway from the first symptom to treatment" className={cn("flex flex-col gap-3", className)}>
      {/* The break label sits over its node; with no break, the line's one sentence leads it. */}
      <figcaption className="relative min-h-6">
        {breakIndex >= 0 ? (
          <span
            className="absolute top-0 flex flex-col"
            style={
              centre(breakIndex) < 60
                ? { left: `calc(${centre(breakIndex)}% - 0.3rem)` }
                : { right: `calc(${100 - centre(breakIndex)}% - 0.3rem)` }
            }
          >
            {label}
          </span>
        ) : (
          label
        )}
      </figcaption>
      {line}
      {/* One row under the labels: each of FirstLine's steps says its status in words; the
          patient's and the hospital's steps say once, over a bracket, that they are not measured. */}
      <div aria-hidden className="-mt-1.5 grid grid-cols-8 max-md:hidden">
        {GROUPS.map((group) =>
          group.group === "county" ? (
            STEPS.slice(group.from - 1, group.from - 1 + group.span).map((step) => {
              const card = cardOf(step.stage);
              return (
                <span
                  key={step.label}
                  className={cn(
                    "px-1 text-center type-note text-pretty",
                    card?.status === "red" ? "text-status-red-ink" : "text-muted-foreground",
                  )}
                >
                  {card ? statusWords(card) : null}
                </span>
              );
            })
          ) : (
            <span
              key={group.group}
              className="relative flex justify-center pt-2"
              style={{ gridColumn: `${group.from} / span ${group.span}` }}
            >
              <span
                className="absolute top-0 h-1.5 border-x border-b border-foreground/20"
                style={{ left: `${50 / group.span}%`, right: `${50 / group.span}%` }}
              />
              <span className="type-note whitespace-nowrap text-muted-foreground">{group.label}</span>
            </span>
          ),
        )}
      </div>
    </figure>
  );
}

/**
 * The line between the nodes, one segment per gap. Before the break: a solid neutral line. The
 * break: the segment after the breaking node, in status red and cut in the middle. After it:
 * dashed, the steps the delay pushes back. With no break, one solid neutral line.
 */
function Segments({ breakIndex, lg }: { breakIndex: number; lg: boolean }) {
  const top = lg ? "top-4" : "top-3";
  return (
    <div aria-hidden className={cn("absolute inset-x-0", top)}>
      {Array.from({ length: STEPS.length - 1 }, (_, k) => {
        const left = `${centre(k)}%`;
        const width = `${100 / STEPS.length}%`;
        if (breakIndex >= 0 && k === breakIndex) {
          return (
            <span key={k} className="absolute -translate-y-1/2" style={{ left, width }}>
              <span
                className={cn("absolute left-0 w-[36%] -translate-y-1/2 rounded-full bg-status-red", lg ? "h-[3px]" : "h-0.5")}
              />
              <span
                className={cn("absolute right-0 w-[36%] -translate-y-1/2 rounded-full bg-status-red", lg ? "h-[3px]" : "h-0.5")}
              />
            </span>
          );
        }
        const after = breakIndex >= 0 && k > breakIndex;
        return (
          <span
            key={k}
            className={cn(
              "absolute -translate-y-1/2",
              after
                ? "h-0 border-t-[1.5px] border-dashed border-foreground/25"
                : cn("bg-foreground/35", lg ? "h-0.5" : "h-px"),
            )}
            style={{ left, width }}
          />
        );
      })}
    </div>
  );
}
