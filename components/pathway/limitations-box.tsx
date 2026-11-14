import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";

export type LimitationItem = {
  /** One short line in bold: the point of the limitation. The text under it is its detail. */
  title?: string;
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
          summaryClassName="min-h-11 w-full gap-1.5 px-3.5 py-2.5 hover:no-underline"
          summary={
            <span>
              <span className="sm:hidden">
                Limitations{" "}
                <span className="font-normal whitespace-nowrap text-muted-foreground tabular-nums">({items.length})</span>
                : read before acting
              </span>
              <span className="max-sm:hidden">
                {TITLE}{" "}
                <span className="font-normal whitespace-nowrap text-muted-foreground tabular-nums">({items.length})</span>
              </span>
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
        "flex flex-col gap-2.5 rounded-panel border border-frame-border px-4 pt-3.5 pb-2 sm:px-5",
        className,
      )}
    >
      <h2 id="limitations-heading" className="font-sans text-[0.8125rem] leading-snug font-medium tracking-normal">
        {TITLE}
      </h2>
      <ul className="flex flex-col gap-2.5">
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
          className="-mt-1"
        >
          <ul className="flex flex-col gap-2.5 pt-1 pb-2">
            {rest.map((item) => (
              <Limitation key={item.text} item={item} />
            ))}
          </ul>
        </Disclosure>
      )}
    </aside>
  );
}

/** Percentages (and ranges such as "0-3%") in the figure face, as everywhere else; words unchanged. */
function withFigures(text: string): ReactNode {
  return text.split(/(\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?%)/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="figure">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

const BODY = "text-[0.8125rem] leading-[1.5] text-pretty text-muted-foreground";

function Limitation({ item }: { item: LimitationItem }) {
  // An item with a title: the title in bold with its source at the right end, the detail under
  // it in the secondary grey. Indicator items without one read "Short name: limitation", and the
  // name becomes the first line the same way; the words stay the same.
  const split = item.title ? -1 : item.sourceId ? item.text.indexOf(": ") : -1;
  const title = item.title ?? (split > 0 ? item.text.slice(0, split) : null);
  const detail = split > 0 ? item.text.slice(split + 2) : item.text;
  if (title === null) {
    return (
      <li className="flex flex-col gap-0.5">
        <p className={BODY}>{withFigures(item.text)}</p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] leading-5 font-semibold text-pretty text-foreground">
          {title}
          <span className="sr-only">:</span>
        </p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </div>
      <p className={BODY}>{withFigures(detail)}</p>
    </li>
  );
}
