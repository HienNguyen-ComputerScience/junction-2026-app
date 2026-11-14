import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";
import { Frame, FramePanel, FramePanelLabel } from "@/components/ui/frame";

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
          summaryClassName="min-h-11 w-full gap-1.5 px-3.5 py-2.5 hover:no-underline"
          summary={
            <>
              {/* A phone gets the short label, so the count never wraps alone. */}
              <span className="sm:hidden">
                Limitations <span className="font-normal text-muted-foreground tabular-nums">({items.length})</span>
                : read before acting
              </span>
              <span className="max-sm:hidden">
                {TITLE} <span className="font-normal text-muted-foreground tabular-nums">({items.length})</span>
              </span>
            </>
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
    <Frame as="aside" aria-labelledby="limitations-heading" className={className}>
      <FramePanel padding="none">
        <FramePanelLabel>
          <h2 id="limitations-heading" className="font-sans type-caption font-medium tracking-normal">
            {TITLE}
          </h2>
        </FramePanelLabel>
        <div className="flex flex-col gap-2.5 px-4 pt-3 pb-2 sm:px-6">
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
        </div>
      </FramePanel>
    </Frame>
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

const BODY = "text-[0.8125rem] leading-[1.6] text-pretty text-muted-foreground";

function Limitation({ item }: { item: LimitationItem }) {
  // Indicator items read "Short name: limitation". The name becomes the item's first line with
  // its source at the right end, the limitation sits under it; the words stay the same.
  const split = item.sourceId ? item.text.indexOf(": ") : -1;
  if (split <= 0) {
    return (
      <li className="flex flex-col gap-0.5">
        <p className={BODY}>{withFigures(item.text)}</p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] leading-5 font-medium text-foreground">
          {item.text.slice(0, split)}
          <span className="sr-only">:</span>
        </p>
        {item.sourceId && <SourceChip sourceId={item.sourceId} />}
      </div>
      <p className={BODY}>{withFigures(item.text.slice(split + 2))}</p>
    </li>
  );
}
