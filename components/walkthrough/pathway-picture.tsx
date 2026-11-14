import { Check } from "lucide-react";

import type { PathwaySlot } from "@/lib/walkthrough/model";

/**
 * The cancer pathway as seven slots. Parts appear as the text beside it is reached: first the
 * published steps fill in (data-at 1), then the unpublished ones show as empty, hatched slots
 * marked "Not published" (data-at 2), then what exists instead (data-at 3). On paper, a phone,
 * with reduced motion or without script, everything is there at once.
 */
export function PathwayPicture({ slots }: { slots: PathwaySlot[] }) {
  return (
    <ol className="flex flex-col gap-2 rounded-[14px] bg-keylime-wash p-5 sm:p-7">
      {slots.map((slot) => (
        <li
          key={slot.id}
          className="relative grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 overflow-hidden rounded-[14px] bg-cream-paper p-3"
        >
          {/* The fill: a mint wash for a published step, hatching for a gap. */}
          <span
            aria-hidden
            data-at={slot.published ? "1" : "2"}
            className={
              slot.published
                ? "absolute inset-0 bg-mint-veil"
                : "htr-hatch absolute inset-0 rounded-[14px] border border-dashed border-status-grey"
            }
          />
          <span className="relative pt-0.5 text-base leading-6 font-semibold text-forest-ink tabular-nums">{slot.number}</span>
          <span className="relative flex min-w-0 flex-col gap-0.5">
            <span className="text-base leading-6 font-semibold text-forest-ink">{slot.title}</span>
            {slot.published ? (
              <span data-at="1" className="flex items-start gap-1.5 text-base leading-6 text-charcoal">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-forest-ink" strokeWidth={2.25} />
                <span>Published: {slot.text.charAt(0).toLowerCase() + slot.text.slice(1)}</span>
              </span>
            ) : (
              <span data-at="2" className="text-base leading-6 font-semibold text-charcoal">
                Not published by area
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
