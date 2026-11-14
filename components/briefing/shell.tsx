"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "cn";

import { takeArrival } from "@/components/briefing/arrival";
import { EdgeLines, PRIMARY_BUTTON, SECONDARY_BUTTON, TEXT_LINK } from "@/components/briefing/ui";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import {
  BRIEFING_STEP_COUNT,
  BRIEFING_STEPS,
  briefingHref,
  stepForSegment,
  type BriefingStepId,
} from "@/lib/briefing/steps";

/** What the director chose on the way: carried from step to step, never needed to read a step. */
type Choices = {
  /** Index of the action in focus (0 to 2): chosen in step 4, read by steps 5 and 6. */
  action: number;
  setAction: (index: number) => void;
  /** The target year chosen in step 5, passed on to the plan page in step 6. */
  year: number;
  setYear: (year: number) => void;
};

const ChoicesContext = createContext<Choices | null>(null);

export function useBriefingChoices(): Choices {
  const choices = useContext(ChoicesContext);
  if (!choices) throw new Error("useBriefingChoices must be used inside BriefingShell");
  return choices;
}

/**
 * The frame of the briefing: one cream card that holds one step at a time.
 *
 * - Which step is on screen comes from the address (the path segment after the area), so
 *   Next and Back are plain links, the browser's Back button works, and a refreshed or
 *   emailed address reopens the same step. All six steps arrive with the first one, so a
 *   press changes the screen at once.
 * - A step only moves when a button is pressed: pressing Next mounts the next step, which
 *   plays its entrance once and stops.
 * - On a step change the keyboard focus moves to the step's statement, so a screen reader
 *   reads the new step and the next Tab lands on its first button. The page title changes
 *   with the step ("Step 2 of 6: …"), which is what browsers announce on navigation.
 */
export function BriefingShell({
  areaId,
  areaName,
  steps,
  defaultYear,
  children,
}: {
  areaId: string;
  areaName: string;
  /** The six steps, rendered on the server. */
  steps: Record<BriefingStepId, ReactNode>;
  defaultYear: number;
  /** The route's own page: nothing for a step, the not-found screen for an unknown address. */
  children: ReactNode;
}) {
  const step = stepForSegment(useSelectedLayoutSegment());
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shown = useRef<BriefingStepId | null>(null);
  const [action, setAction] = useState(0);
  const [year, setYear] = useState(defaultYear);
  const choices = useMemo(() => ({ action, setAction, year, setYear }), [action, year]);

  const stepId = step?.id ?? null;
  useEffect(() => {
    const previous = shown.current;
    shown.current = stepId;
    // The first step shown after a page load keeps the browser's own focus and scroll; the
    // first step shown by pressing Start takes the focus like every later one.
    const pressed = previous === null ? takeArrival() : previous !== stepId;
    if (!pressed || stepId === null) return;
    const card = cardRef.current;
    if (!card) return;
    if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: "start" });
    card.querySelector<HTMLElement>("[data-briefing-heading]")?.focus({ preventScroll: true });
  }, [stepId]);

  // An address that names no step: the page below is the not-found screen.
  if (!step) return <>{children}</>;

  const previous = BRIEFING_STEPS[step.number - 2];
  const next = BRIEFING_STEPS[step.number];

  return (
    <ChoicesContext.Provider value={choices}>
      <div className={cn("bf-root bg-keylime-wash px-4 py-6 sm:px-6 sm:py-10 print:hidden", MOTION_LOUD_CLASS)}>
        <div
          ref={cardRef}
          className="relative mx-auto flex w-full max-w-[60rem] scroll-mt-4 flex-col overflow-clip rounded-[14px] border border-border-mist bg-cream-paper lg:min-h-[41rem]"
        >
          {/* Where am I, and the way out. Always visible. */}
          <div className="flex flex-col gap-3 px-[21px] pt-[21px] sm:px-[42px] sm:pt-[28px]">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <p className="text-base leading-6 font-semibold text-forest-ink">Briefing for {areaName}</p>
              <Link href="/compare" className={TEXT_LINK}>
                Leave the briefing: full table of all areas
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-base leading-6 font-semibold text-charcoal">
                Step {step.number} of {BRIEFING_STEP_COUNT}
              </p>
              <div aria-hidden className="flex flex-1 gap-1.5">
                {BRIEFING_STEPS.map((item) => (
                  <span key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-track">
                    {item.number <= step.number ? (
                      <span
                        // Re-keyed on the current step so only the newest part grows in.
                        key={item.number === step.number ? `now-${step.id}` : "done"}
                        className={cn("block h-full rounded-full bg-forest-ink", item.number === step.number && "animate-line-in")}
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* One step. Re-keyed, so the step and the lines play once on every press. */}
          <div key={step.id} className="relative flex flex-1 flex-col">
            <EdgeLines className="absolute top-[13.5rem] left-0 max-lg:hidden" />
            <div className="flex flex-1 flex-col gap-[21px] px-[21px] pt-[28px] pb-[28px] sm:px-[42px] lg:pr-[84px] lg:pl-[126px]">
              {steps[step.id]}
            </div>
          </div>

          {/* The way on and the way back: two plainly labelled buttons, always in the same place.
              The bar stays at the bottom of the window while a long step scrolls, so the way on is
              never below the fold. */}
          <nav
            aria-label="Briefing steps"
            className="sticky bottom-0 z-10 flex items-stretch justify-between gap-3 rounded-b-[14px] border-t border-border-mist bg-cream-paper px-[21px] py-[14px] sm:px-[42px]"
          >
            <Link href={previous ? briefingHref(areaId, previous) : "/briefing"} className={cn(SECONDARY_BUTTON, "shrink-0 max-sm:px-4")}>
              <ArrowLeft aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
              <span>
                Back<span className="max-sm:sr-only">{previous ? "" : ": choose another area"}</span>
              </span>
            </Link>
            {next ? (
              <Link href={briefingHref(areaId, next)} className={cn(PRIMARY_BUTTON, "max-sm:flex-1 max-sm:px-4")}>
                <span>Next: {next.next}</span>
                <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
              </Link>
            ) : (
              <Link href="/briefing" className={cn(SECONDARY_BUTTON, "max-sm:flex-1 max-sm:px-4")}>
                <span>
                  Start again<span className="max-sm:sr-only"> with another area</span>
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>
      {children}
    </ChoicesContext.Provider>
  );
}
