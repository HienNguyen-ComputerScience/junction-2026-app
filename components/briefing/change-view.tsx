"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

import { useBriefingChoices } from "@/components/briefing/shell";
import { CHOICE_BUTTON, SECONDARY_BUTTON } from "@/components/briefing/ui";
import { AnimatedNumber } from "@/components/motion";

export type ChangeAction = {
  id: string;
  number: number;
  title: string;
  precedent: string;
  result: string;
  limitations: string;
  watch: {
    name: string;
    direction: string;
    /** "85.4%". */
    value: string;
    finland: string;
    year: number;
    target: {
      /** "Finland's level (54.7%)". */
      levelName: string;
      paces: { year: number; perYear: number; points: number; years: number }[];
    } | null;
  } | null;
};

type Panel = "where" | "measure";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Step 5, "What it could change", for the action in focus.
 *
 * On the step itself: what was reported where the action was tried, in the study's own words
 * and unit, set at reading size on its own panel with its source; and under it, always in
 * view, that it is not a forecast for this area and what the study cannot say.
 *
 * Behind two buttons, so the step stays short:
 *  - "Show where it was tried": the place and the programme.
 *  - "Show what the area would measure": the published figure the area would watch, the plain
 *    statement that FirstLine gives no estimate of the action's effect here, and how fast that
 *    figure would have to move to reach a published level by a year the director picks. That
 *    pace is arithmetic on published shares and assumes nothing about what the action achieves,
 *    which is why it sits apart from the result and says so.
 * No estimate of the action's effect is shown anywhere: no effect size in the evidence table is
 * measured in the unit of either figure.
 */
export function ChangeView({
  areaName,
  actions,
  resultChips,
  watchChips,
  targetYears,
}: {
  areaName: string;
  actions: ChangeAction[];
  /** Per action: the chip of the study behind the result. Rendered on the server. */
  resultChips: ReactNode[];
  /** Per action: the chip of the published figure to watch, or null. */
  watchChips: ReactNode[];
  targetYears: readonly number[];
}) {
  const base = useId();
  const { action: chosen, setAction, year, setYear } = useBriefingChoices();
  const [open, setOpen] = useState<Panel | null>(null);
  const index = Math.min(chosen, actions.length - 1);
  const action = actions[index];
  const watch = action.watch;
  const target = watch?.target ?? null;
  const pace = target?.paces.find((candidate) => candidate.year === year) ?? target?.paces[0] ?? null;
  const toggle = (panel: Panel) => setOpen(open === panel ? null : panel);

  return (
    <div className="flex flex-col gap-[21px]">
      {actions.length > 1 ? (
        <div role="group" aria-label="Choose the action" className="animate-fade-up flex flex-wrap items-center gap-3" style={i(1)}>
          {actions.map((candidate, candidateIndex) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidateIndex === index}
              onClick={() => setAction(candidateIndex)}
              className={cn(CHOICE_BUTTON, "min-h-12 py-2.5")}
            >
              Action {candidate.number}
            </button>
          ))}
        </div>
      ) : null}

      {/* Re-keyed on the action, so choosing another one plays its result in. */}
      <div key={action.id} className="flex flex-col gap-[21px]">
        <p className="animate-fade-up type-heading text-pretty text-forest-ink" style={i(2)}>
          Action {action.number}: {action.title}
        </p>

        {/* The result, at reading size on its own panel, with its source. */}
        <div className="animate-fade-up flex flex-col gap-3 rounded-[14px] bg-keylime-wash p-[21px] sm:p-[28px]" style={i(3)}>
          <p className="type-eyebrow">Result where it was tried</p>
          <h1
            data-briefing-heading
            tabIndex={-1}
            aria-live="polite"
            className="font-sans text-[1.125rem] leading-[1.5] sm:text-[1.25rem] font-normal tracking-normal text-pretty text-charcoal outline-none"
          >
            {action.result}
          </h1>
          <p className="inline-flex flex-wrap items-center gap-2 text-base leading-6 font-semibold text-forest-ink">
            Source: {resultChips[index]}
          </p>
        </div>

        {/* The caveat is never behind a button. */}
        <p className="animate-fade-up text-base leading-6 text-pretty text-charcoal" style={i(4)}>
          <span className="font-semibold">Not a forecast for {areaName}. </span>
          {action.limitations}
        </p>

        <div className="animate-fade-up flex flex-col gap-[14px]" style={i(5)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              aria-expanded={open === "where"}
              aria-controls={`${base}-where`}
              onClick={() => toggle("where")}
              className={SECONDARY_BUTTON}
            >
              {open === "where" ? "Hide where it was tried" : "Show where it was tried"}
            </button>
            <button
              type="button"
              aria-expanded={open === "measure"}
              aria-controls={`${base}-measure`}
              onClick={() => toggle("measure")}
              className={SECONDARY_BUTTON}
            >
              {open === "measure" ? "Hide what the area would measure" : `Show what ${areaName} would measure`}
            </button>
          </div>

          <div
            id={`${base}-where`}
            hidden={open !== "where"}
            className="animate-fade-up flex flex-col gap-2 rounded-[14px] bg-keylime-wash p-[21px] sm:p-[28px]"
          >
            <h2 className="type-heading text-forest-ink">Where it was tried</h2>
            <p className="text-base leading-6 text-pretty text-charcoal">{action.precedent}</p>
          </div>

          <section
            id={`${base}-measure`}
            hidden={open !== "measure"}
            aria-label={`How ${areaName} would know it is working`}
            className="animate-fade-up flex flex-col gap-[14px] rounded-[14px] bg-keylime-wash p-[21px] sm:p-[28px]"
          >
            <h2 className="type-heading text-forest-ink">How {areaName} would know it is working</h2>
            {watch ? (
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-base leading-6 text-pretty text-charcoal">
                <span className="min-w-0 basis-full">
                  Watch one published figure: {watch.name.charAt(0).toLowerCase() + watch.name.slice(1)} ({watch.direction}).{" "}
                  {areaName} in {watch.year}: <span className="font-semibold">{watch.value}</span>. Finland:{" "}
                  <span className="font-semibold">{watch.finland}</span>.
                </span>
                <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap text-forest-ink">
                  Source: {watchChips[index]}
                </span>
              </p>
            ) : (
              <p className="text-base leading-6 text-pretty text-charcoal">
                No published figure follows this step for {areaName} yet, so the area would have to record its own.
              </p>
            )}
            <p className="text-base leading-6 text-pretty text-charcoal">
              FirstLine gives no estimate of this action&apos;s effect in {areaName}: no published study measures it on this
              figure.
            </p>

            {watch && target && pace ? (
              <div className="flex flex-col gap-[14px] border-t border-border pt-[14px]">
                <div role="group" aria-label="Choose the target year" className="flex flex-wrap items-center gap-2.5">
                  <span className="basis-full text-base leading-6 font-semibold text-forest-ink">
                    To reach {target.levelName} by the end of:
                  </span>
                  {targetYears.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      aria-pressed={candidate === pace.year}
                      onClick={() => setYear(candidate)}
                      className={cn(CHOICE_BUTTON, "min-h-12 px-4 py-2.5")}
                    >
                      {candidate}
                    </button>
                  ))}
                </div>
                <p aria-live="polite" className="text-base leading-6 text-pretty text-charcoal">
                  <span
                    key={pace.year}
                    className="mr-1.5 font-display text-[2.5rem] leading-[1.35] font-light tracking-[-0.01em] text-forest-ink lining-nums"
                  >
                    <AnimatedNumber value={pace.perYear} final={pace.perYear.toFixed(1)} level="loud" play={open === "measure"} />
                  </span>{" "}
                  percentage points better each year, for {pace.years} {pace.years === 1 ? "year" : "years"} ({pace.points.toFixed(1)}{" "}
                  points in all).
                </p>
                <p className="text-base leading-6 text-pretty text-charcoal">
                  This is arithmetic on the two published figures above: an even pace from {watch.year} to {pace.year}. It
                  assumes nothing about what any action will achieve.
                </p>
              </div>
            ) : watch ? (
              <p className="text-base leading-6 text-pretty text-charcoal">
                This figure sets no target for {areaName}: it already has the best published level, or the figure does not
                cover the whole area. The aim is to hold the level.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
