"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "cn";

import type { GapStatus, Stage } from "@/lib/data";

export type StoryStep = {
  stage: Stage;
  /** Two to four words: "Getting to a GP". */
  label: string;
  /** The status in words; colour is never the only signal. */
  statusText: string;
  status: GapStatus;
  /** The county's main delay. */
  main: boolean;
};

const DOT: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber",
  no_data: "border-2 border-dashed border-status-grey bg-cream-paper",
};

const INK: Record<GapStatus, string> = {
  red: "text-status-red-ink",
  amber: "text-status-amber-ink",
  no_data: "text-muted-foreground",
};

/**
 * The act page's scroll story: a picture of the pathway that holds still beside the actions
 * (stacked above them under 768px), lighting up the step the action in the middle of the window
 * works on. The actions are `children`; each card carries `data-story-stage` and
 * `data-story-index`. Ordinary scrolling only: an IntersectionObserver reads where the reader
 * is, nothing captures the wheel or snaps. Without script, or before the first action is
 * reached, the picture shows the statuses alone.
 */
export function ActionStory({ steps, children }: { steps: StoryStep[]; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<{ stage: string; index: string } | null>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const cards = [...root.querySelectorAll<HTMLElement>("[data-story-stage]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setActive({ stage: el.dataset.storyStage ?? "", index: el.dataset.storyIndex ?? "" });
        }
      },
      // A band across the middle of the window: the card crossing it is the one being read.
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:items-start md:gap-14">
      <figure
        aria-label="The pathway to a specialist, with this area's status at each step"
        className="rounded-lg bg-keylime-wash px-7 py-7 md:sticky md:top-28 print:static"
      >
        <ol className="relative flex flex-col gap-5">
          {/* The line joining the three steps. */}
          <span aria-hidden className="absolute top-3 bottom-3 left-[0.6875rem] w-px bg-forest-ink/25" />
          {steps.map((step, i) => {
            const lit = active?.stage === step.stage;
            return (
              <li
                key={step.stage}
                className={cn(
                  "relative -mx-3 flex gap-4 rounded-lg px-3 py-2.5 motion-safe:transition-colors motion-safe:duration-300",
                  lit && "bg-sage-mist",
                )}
              >
                <span aria-hidden className={cn("relative mt-0.5 size-[1.375rem] shrink-0 rounded-full", DOT[step.status])} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-base font-semibold text-forest-ink">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.label}
                  </span>
                  <span className={cn("text-sm", INK[step.status], step.main && "font-semibold")}>{step.statusText}</span>
                  {lit ? (
                    <span className="mt-1 w-fit rounded-full bg-cream-paper px-3 py-0.5 text-sm font-semibold text-forest-ink">
                      Action {active?.index} works here
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </figure>
      <div ref={listRef} className="min-w-0">
        {children}
      </div>
    </div>
  );
}
