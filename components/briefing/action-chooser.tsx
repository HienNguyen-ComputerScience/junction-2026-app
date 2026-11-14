"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

import { useBriefingChoices } from "@/components/briefing/shell";
import { SECONDARY_BUTTON, TEXT_LINK } from "@/components/briefing/ui";

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
 * other (never a carousel), each as one short row, so all three are in view on a small laptop
 * before anything is pressed (the audit found actions two and three below the fold).
 * "Show the first step" opens one action at a time on its first step and who is responsible;
 * where it was tried and how it is funded sit one press further in, and a link leads to step 5
 * with this action in focus.
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
  const [open, setOpen] = useState<number | null>(null);
  const [more, setMore] = useState(false);

  return (
    <ol className="flex flex-col gap-3">
      {actions.map((action, index) => {
        const isOpen = index === open;
        return (
          <li
            key={action.id}
            className="animate-fade-up flex flex-col gap-3 rounded-[14px] bg-keylime-wash p-[21px]"
            style={{ "--i": index + 2 } as CSSProperties}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5">
              <div className="flex min-w-0 flex-1 items-start gap-3.5">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest-ink text-base font-semibold text-cream-paper"
                >
                  {action.number}
                </span>
                <h2 className="type-heading min-w-0 pt-0.5 text-pretty text-forest-ink">
                  <span className="sr-only">Action {action.number}: </span>
                  {action.title}
                </h2>
              </div>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${action.id}`}
                onClick={() => {
                  setOpen(isOpen ? null : index);
                  setMore(false);
                  setAction(index);
                }}
                className={cn(SECONDARY_BUTTON, "min-h-11 shrink-0 px-4 py-2 max-sm:w-full")}
              >
                {isOpen ? "Hide the first step" : "Show the first step"}
                <span className="sr-only"> of action {action.number}</span>
              </button>
            </div>

            <div
              id={`${base}-${action.id}`}
              hidden={!isOpen}
              className="animate-fade-up flex flex-col gap-2 text-base leading-6 text-charcoal sm:pl-[2.875rem]"
            >
              <p className="text-pretty">
                <span className="font-semibold">First step: </span>
                {action.firstStep}
              </p>
              <p className="text-pretty">
                <span className="font-semibold">Responsible: </span>
                {action.owner}
              </p>
              <button
                type="button"
                aria-expanded={isOpen && more}
                aria-controls={`${base}-${action.id}-more`}
                onClick={() => setMore(!more)}
                className={cn(TEXT_LINK, "min-h-11 w-fit cursor-pointer text-left")}
              >
                {more ? "Hide where it was tried and how it is funded" : "Show where it was tried and how it is funded"}
              </button>
              <div id={`${base}-${action.id}-more`} hidden={!more} className="animate-fade-up flex flex-col gap-3">
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
              </div>
              <Link href={changeHref} onClick={() => setAction(index)} className={cn(TEXT_LINK, "inline-flex w-fit items-center gap-2")}>
                See the result where it was tried
                <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
