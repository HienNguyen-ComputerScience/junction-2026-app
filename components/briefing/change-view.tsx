"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

import { CountUp } from "@/components/briefing/motion";
import { useBriefingChoices } from "@/components/briefing/shell";
import { CHOICE_BUTTON, SECONDARY_BUTTON, STATEMENT } from "@/components/briefing/ui";

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
      /** "Finland's level" or "the best area's level". */
      short: string;
      /** "Finland's level (54.7%)". */
      levelName: string;
      paces: { year: number; perYear: number; points: number; years: number }[];
    } | null;
  } | null;
};

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Step 5, "What it could change", for the action in focus.
 *
 * Two things, kept apart on purpose:
 *  1. What was reported where the action was tried, in the study's own words and unit, with
 *     its limits and its source. It is a result elsewhere, never a forecast for this area.
 *  2. The published figure the area would watch, and, behind its own button, how fast that
 *     figure would have to move to reach a published level by a year the director picks. That
 *     is arithmetic on published shares and assumes nothing about what the action achieves.
 * No estimate of the action's effect here is shown: no effect size in the evidence table is
 * measured in the unit of either figure. The step says so in words.
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
  const paceId = useId();
  const { action: chosen, setAction, year, setYear } = useBriefingChoices();
  const [paceOpen, setPaceOpen] = useState(false);
  const index = Math.min(chosen, actions.length - 1);
  const action = actions[index];
  const watch = action.watch;
  const target = watch?.target ?? null;
  const pace = target?.paces.find((candidate) => candidate.year === year) ?? target?.paces[0] ?? null;

  return (
    <div className="flex flex-col gap-[21px]">
      {actions.length > 1 ? (
        <div role="group" aria-label="Choose the action" className="bf-rise flex flex-wrap items-center gap-3" style={i(1)}>
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
        <div className="flex flex-col gap-2.5">
          <p className="bf-rise text-base leading-6 font-semibold text-pretty text-forest-ink" style={i(2)}>
            Action {action.number}: {action.title}
          </p>
          <p className="bf-rise type-eyebrow" style={i(3)}>
            Result where it was tried
          </p>
          <h1
            data-briefing-heading
            tabIndex={-1}
            aria-live="polite"
            className={cn("bf-rise", STATEMENT, "sm:text-[1.5rem]")}
            style={i(3)}
          >
            {action.result}
          </h1>
          <p className="bf-rise flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-base leading-6 text-pretty text-charcoal" style={i(4)}>
            <span className="min-w-0 basis-full">
              <span className="font-semibold">Where: </span>
              {action.precedent}
            </span>
            <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap text-forest-ink">
              Source: {resultChips[index]}
            </span>
          </p>
          <p className="bf-rise text-base leading-6 text-pretty text-charcoal" style={i(5)}>
            <span className="font-semibold">Read it with care: this is a result elsewhere, not a forecast for {areaName}. </span>
            {action.limitations}
          </p>
        </div>

        <section
          aria-label={`How ${areaName} would know it is working`}
          className="bf-rise flex flex-col gap-[14px] rounded-[14px] bg-keylime-wash p-[21px] sm:p-[28px]"
          style={i(6)}
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
            <>
              <button
                type="button"
                aria-expanded={paceOpen}
                aria-controls={paceId}
                onClick={() => setPaceOpen(!paceOpen)}
                className={cn(SECONDARY_BUTTON, "w-full sm:w-fit")}
              >
                {paceOpen ? "Hide the pace" : `Show the pace that would reach ${target.short}`}
              </button>
              <div id={paceId} hidden={!paceOpen} className="bf-rise flex flex-col gap-[14px]">
                <div role="group" aria-label="Choose the target year" className="flex flex-wrap items-center gap-2.5">
                  <span className="basis-full text-base leading-6 font-semibold text-forest-ink">
                    Reach {target.levelName} by the end of:
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
                    <CountUp value={pace.perYear} final={pace.perYear.toFixed(1)} />
                  </span>
                  percentage points better each year, for {pace.years} {pace.years === 1 ? "year" : "years"} ({pace.points.toFixed(1)}{" "}
                  points in all).
                </p>
                <p className="text-base leading-6 text-pretty text-charcoal">
                  This is arithmetic on the two published figures above: an even pace from {watch.year} to {pace.year}. It
                  assumes nothing about what any action will achieve.
                </p>
              </div>
            </>
          ) : watch ? (
            <p className="text-base leading-6 text-pretty text-charcoal">
              This figure sets no target for {areaName}: it already has the best published level, or the figure does not
              cover the whole area. The aim is to hold the level.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
