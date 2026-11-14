import type { ReactNode } from "react";
import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";

export type LimitationItem = {
  /** One short line, in bold: what the limitation is about. */
  title?: string;
  /** The limitation in full, in the secondary grey under the title. Never cut. */
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
  glossHus = false,
}: {
  /** Spell out the first "HUS" in the items (when nothing above it on the page has). */
  glossHus?: boolean;
  items: LimitationItem[];
  /** How many items show before the "show more" disclosure ("box" only). */
  visibleCount?: number;
  variant?: "box" | "disclosure";
  className?: string;
}) {
  const glossAt = glossHus ? items.findIndex((item) => HUS_TERM.test(item.text)) : -1;
  const glossed = (item: LimitationItem) => glossAt >= 0 && items[glossAt] === item;

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
              <Limitation key={item.text} item={item} gloss={glossed(item)} />
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
          <Limitation key={item.text} item={item} gloss={glossed(item)} />
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
              <Limitation key={item.text} item={item} gloss={glossed(item)} />
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

const BODY = "text-[0.8125rem] leading-[1.6] text-pretty text-muted-foreground";

/** "HUS", with "-wide value" when it follows, so the gloss goes after the whole term. */
const HUS_TERM = /\bHUS(?:-wide(?: value)?)?\b/;

/**
 * One limitation: a bold short line (its source at the right end), then the detail in the
 * secondary grey. An item without a title is the detail alone.
 */
function Limitation({ item, gloss = false }: { item: LimitationItem; gloss?: boolean }) {
  // The first "HUS" on the page is spelled out beside the words, which stay as written.
  const match = gloss ? HUS_TERM.exec(item.text) : null;
  const end = match ? match.index + match[0].length : -1;
  return (
    <li className="flex flex-col gap-0.5">
      {item.title ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.8125rem] leading-5 font-semibold text-foreground">
            {item.title}
            <span className="sr-only">:</span>
          </p>
          {item.sourceId && <SourceChip sourceId={item.sourceId} />}
        </div>
      ) : null}
      <p className={BODY}>
        {end < 0 ? (
          withFigures(item.text)
        ) : (
          <>
            {withFigures(item.text.slice(0, end))} (HUS: Helsinki University Hospital region)
            {withFigures(item.text.slice(end))}
          </>
        )}
      </p>
      {!item.title && item.sourceId && <SourceChip sourceId={item.sourceId} />}
    </li>
  );
}
