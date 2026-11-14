"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

import { useBriefingChoices } from "@/components/briefing/shell";
import { SECONDARY_BUTTON, TEXT_LINK } from "@/components/briefing/ui";
import { Disclosure } from "@/components/motion";

export type ChooserAction = {
  id: string;
  number: number;
  title: string;
  owner: string;
  firstStep: string;
  precedent: string;
  /** "National cancer strategy roadmap, measure 2.5.1 (…)" with its funding route, or null. */
  roadmap: { label: string; funding: string } | null;
};

/**
 * Step 4's list: every recommended action is named on screen at once, numbered, one under the
 * other (never a carousel). One button per action shows its first step and who is responsible;
 * the first action starts open, so the step answers "what do I do on Monday" before any press.
 * Where it was tried and how it is funded sit one level further in, behind the shared
 * Disclosure, and a link leads to step 5 with this action in focus.
 */
export function ActionChooser({
  actions,
  sourceChips,
  roadmapChips,
  changeHref,
}: {
  actions: ChooserAction[];
  /** Per action, the chip of the source behind "where it was tried". Rendered on the server. */
  sourceChips: ReactNode[];
  /** Per action, the chip of the roadmap, or null. */
  roadmapChips: ReactNode[];
  /** Step 5's address. */
  changeHref: string;
}) {
  const base = useId();
  const { setAction } = useBriefingChoices();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ol className="flex flex-col gap-3">
      {actions.map((action, index) => {
        const isOpen = index === open;
        return (
          <li
            key={action.id}
            className="animate-fade-up flex gap-3.5 rounded-[14px] bg-keylime-wash p-[21px]"
            style={{ "--i": index + 2 } as CSSProperties}
          >
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest-ink text-base font-semibold text-cream-paper"
            >
              {action.number}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-3 text-base leading-6 text-charcoal">
              <h2 className="type-heading pt-0.5 text-pretty text-forest-ink">
                <span className="sr-only">Action {action.number}: </span>
                {action.title}
              </h2>
              <div id={`${base}-${action.id}`} hidden={!isOpen} className="animate-fade-up flex flex-col gap-2">
                <p className="text-pretty">
                  <span className="font-semibold">First step: </span>
                  {action.firstStep}
                </p>
                <p className="text-pretty">
                  <span className="font-semibold">Responsible: </span>
                  {action.owner}
                </p>
                <Disclosure tone="quiet" label="where it was tried and how it is funded" contentClassName="flex flex-col gap-3 pt-2">
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-pretty">
                    <span className="min-w-0 basis-full">
                      <span className="font-semibold">Where it was tried: </span>
                      {action.precedent}
                    </span>
                    <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap text-forest-ink">
                      Source: {sourceChips[index]}
                    </span>
                  </p>
                  {action.roadmap ? (
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-pretty">
                      <span className="min-w-0 basis-full">
                        <span className="font-semibold">National measure and funding: </span>
                        {action.roadmap.label}. {action.roadmap.funding}
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap text-forest-ink">
                        Source: {roadmapChips[index]}
                      </span>
                    </p>
                  ) : (
                    <p className="text-pretty">
                      <span className="font-semibold">National measure and funding: </span>
                      The evidence table names no national roadmap measure or funding route for this action.
                    </p>
                  )}
                </Disclosure>
                <Link href={changeHref} onClick={() => setAction(index)} className={cn(TEXT_LINK, "inline-flex w-fit items-center gap-2")}>
                  See the result where it was tried
                  <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
                </Link>
              </div>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${action.id}`}
                onClick={() => {
                  setOpen(isOpen ? null : index);
                  setAction(index);
                }}
                className={cn(SECONDARY_BUTTON, "min-h-12 w-full py-2.5 sm:w-fit")}
              >
                {isOpen ? "Hide the first step" : "Show the first step"}
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
