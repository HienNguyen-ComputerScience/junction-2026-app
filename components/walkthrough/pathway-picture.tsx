import { Check } from "lucide-react";

import type { PathwaySlot } from "@/lib/walkthrough/model";

/**
 * The cancer pathway as seven slots: a published step filled in mint with a tick and what is published, an
 * unpublished one drawn as an empty, hatched slot marked "Not published by area" (a gap, never a
 * zero). Inside a ScrollStory the published steps are picked out first (story step 0), then the
 * empty ones (step 1), then their "Not published" labels (step 2). The final state reads alone.
 */
export function PathwayPicture({ slots }: { slots: PathwaySlot[] }) {
  return (
    <ol className="flex flex-col gap-2 rounded-[14px] bg-keylime-wash p-5 sm:p-7">
      {slots.map((slot) => (
        <li
          key={slot.id}
          data-story-step={slot.published ? "0" : "1"}
          className={
            slot.published
              ? "grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 rounded-[14px] bg-mint-veil px-3 py-2.5"
              : "htr-hatch grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 rounded-[14px] border border-dashed border-status-grey bg-cream-paper px-3 py-2.5"
          }
        >
          <span className="pt-0.5 text-base leading-6 font-semibold text-forest-ink tabular-nums">{slot.number}</span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-base leading-6 font-semibold text-forest-ink">{slot.title}</span>
            {slot.published ? (
              <span className="flex items-start gap-1.5 text-base leading-6 text-charcoal">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-forest-ink" strokeWidth={2.25} />
                <span>
                  <span className="sr-only">Published: </span>
                  {slot.text}
                </span>
              </span>
            ) : (
              <span data-story-step="2" className="-ml-2 w-fit rounded-full px-2 text-base leading-6 font-semibold text-charcoal">
                Not published by area
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
