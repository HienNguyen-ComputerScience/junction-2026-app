import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";

export type LimitationItem = {
  /** Anchor name: the box's own copy of the item is `#limit-<id>`, for links such as a tab's "see why". */
  id?: string;
  /** One short line in bold: the point of the limitation. */
  title: string;
  /** One grey line of twelve words or fewer under the title. */
  short: string;
  /** The full wording, behind the item's chevron. Nothing is cut. */
  text: string;
  sourceId?: string;
};

const TITLE = "Limitations: read before acting on these numbers";

/**
 * The caveats travel with the numbers. Each item shows its title, its source and one short grey
 * line; its full wording opens behind the item's chevron, and nothing is clipped.
 *  - "box": the title and the first items always visible, the rest open in place.
 *  - "disclosure": one line that opens to every item, for narrow screens where the box would
 *    sit far below the first screen. The page shows one or the other at a given width, never
 *    both, so screen readers meet the content once, and only the box carries the anchors.
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
          <ul className="flex flex-col gap-1 border-t border-frame-border px-3.5 pt-3 pb-4">
            {items.map((item) => (
              <Limitation key={item.title} item={item} />
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
        "flex flex-col gap-2 rounded-panel border border-frame-border px-4 pt-3.5 pb-2 sm:px-5",
        className,
      )}
    >
      <h2 id="limitations-heading" className="font-sans text-[0.8125rem] leading-snug font-medium tracking-normal">
        {TITLE}
      </h2>
      <ul className="flex flex-col gap-1">
        {first.map((item) => (
          <Limitation key={item.title} item={item} anchor />
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
          <ul className="flex flex-col gap-1 pt-1 pb-2">
            {rest.map((item) => (
              <Limitation key={item.title} item={item} anchor />
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

const BODY = "text-[0.8125rem] leading-[1.55] text-pretty text-muted-foreground";

/**
 * One limitation: a chevron row with the bold title and one grey line, its source chip at the
 * right end of the title line (a sibling of the row, never inside it) and the full wording
 * under the chevron.
 */
function Limitation({ item, anchor = false }: { item: LimitationItem; anchor?: boolean }) {
  return (
    <li id={anchor && item.id ? `limit-${item.id}` : undefined} className="relative scroll-mt-24">
      <Disclosure
        summaryClassName="min-h-0 w-full items-start gap-1.5 py-1 [&>svg]:mt-[3px]"
        summary={
          <span className="flex min-w-0 flex-col">
            <span className={cn("text-[0.8125rem] leading-5 font-semibold text-pretty text-foreground", item.sourceId && "pr-[8.25rem]")}>
              {item.title}
              <span className="sr-only">:</span>
            </span>
            <span className={cn(BODY, "font-normal")}>{item.short}</span>
          </span>
        }
      >
        <p className={cn(BODY, "pr-1 pb-2 pl-[1.375rem]")}>{withFigures(item.text)}</p>
      </Disclosure>
      {item.sourceId && (
        <span className="absolute top-0.5 right-0">
          <SourceChip sourceId={item.sourceId} />
        </span>
      )}
    </li>
  );
}
