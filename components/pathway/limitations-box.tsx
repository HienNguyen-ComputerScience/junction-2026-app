import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";

export type LimitationItem = {
  text: string;
  sourceId?: string;
};

const TITLE = "Limitations: read before acting on these numbers";

/**
 * The caveats travel with the numbers. No wording is cut, and nothing is clipped.
 *  - "box": the title and the first items always visible, the rest open in place.
 *  - "disclosure": one line that opens to every item, for narrow screens where the box would
 *    sit far below the first screen. The page shows one or the other at a given width, never
 *    both, so screen readers meet the content once.
 */
export function LimitationsBox({
  items,
  visibleCount = 3,
  variant = "box",
  className = "",
}: {
  items: LimitationItem[];
  /** How many items show before the "show more" disclosure ("box" only). */
  visibleCount?: number;
  variant?: "box" | "disclosure";
  className?: string;
}) {
  if (variant === "disclosure") {
    return (
      <aside aria-label="Limitations" className={className}>
        <Disclosure
          className="rounded-panel border border-frame-border bg-frame"
          summaryClassName="min-h-11 w-full gap-1.5 px-3.5 py-2.5 type-micro font-medium hover:no-underline"
          summary={
            <span>
              {TITLE} <span className="font-normal text-muted-foreground tabular-nums">({items.length})</span>
            </span>
          }
        >
          <ul className="flex flex-col gap-3 border-t border-frame-border px-3.5 pt-3 pb-4">
            {items.map((item) => (
              <Limitation key={item.text} item={item} />
            ))}
          </ul>
        </Disclosure>
      </aside>
    );
  }

  const first = items.slice(0, visibleCount);
  const rest = items.slice(visibleCount);

  return (
    <aside
      aria-labelledby="limitations-heading"
      className={cn(
        "flex flex-col gap-3 rounded-panel border border-frame-border bg-frame p-4 sm:px-5",
        className,
      )}
    >
      <h2 id="limitations-heading" className="font-sans text-[0.9375rem] leading-snug font-semibold tracking-normal">
        {TITLE}
      </h2>
      <ul className="flex flex-col gap-3">
        {first.map((item) => (
          <Limitation key={item.text} item={item} />
        ))}
      </ul>
      {rest.length > 0 && (
        <Disclosure
          summary={
            <>
              <span className="group-open/disc:hidden">
                Show {rest.length} more {rest.length === 1 ? "limitation" : "limitations"}
              </span>
              <span className="hidden group-open/disc:inline">Show fewer</span>
            </>
          }
          className="-my-1.5"
        >
          <ul className="flex flex-col gap-3 pt-1 pb-2">
            {rest.map((item) => (
              <Limitation key={item.text} item={item} />
            ))}
          </ul>
        </Disclosure>
      )}
    </aside>
  );
}

const BODY = "text-[0.8125rem] leading-[1.6] text-pretty text-muted-foreground";

function Limitation({ item }: { item: LimitationItem }) {
  // Indicator items read "Short name: limitation". The name becomes the item's first line with
  // its source at the right end, the limitation sits under it; the words stay the same.
  const split = item.sourceId ? item.text.indexOf(": ") : -1;
  if (split <= 0) {
    return (
      <li className="flex flex-col gap-1">
        <p className={BODY}>{item.text}</p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] leading-5 font-semibold text-foreground">
          {item.text.slice(0, split)}
          <span className="sr-only">:</span>
        </p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </div>
      <p className={BODY}>{item.text.slice(split + 2)}</p>
    </li>
  );
}
