"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export type CarouselItem = {
  id: string;
  /** The full plain title of the item: the tooltip and accessible name of its numbered step button. */
  label: string;
  node: ReactNode;
};

/**
 * One row of cards you move along, with no library: a CSS scroll-snap track plus buttons.
 *  - "single": one card at exactly the full width, none of the next one in view; a header row says "Action 1 of 3"
 *    and has numbered step buttons (`showSteps`) and Previous/Next.
 *  - "multi": compact cards, about three at once from lg (two from sm, one on a phone); the
 *    counter reads "1–3 of 8".
 * Touch swipe, trackpad and shift-wheel scroll the track itself. With the carousel focused, the
 * left and right arrow keys (and Home and End) move it. No autoplay; the buttons scroll
 * instantly under prefers-reduced-motion. Every card in a row has the same height. WAI-ARIA
 * carousel: a labelled region, each card a slide ("2 of 3"), the counter a polite live region.
 * A single item is shown as it is, with no controls.
 */
export function CardCarousel({
  items,
  label,
  noun = "item",
  layout = "single",
  showSteps = false,
  className,
}: {
  items: CarouselItem[];
  /** The accessible name of the region. */
  label: string;
  /** What one card is, lower case: "action" gives "Action 1 of 3", "Previous action". */
  noun?: string;
  layout?: "single" | "multi";
  /** Numbered step buttons in the header row (single layout, a handful of items). */
  showSteps?: boolean;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [view, setView] = useState({ first: 0, last: 0, atStart: true, atEnd: items.length < 2 });
  const total = items.length;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    let first = -1;
    let last = -1;
    let nearest = 0;
    let nearestGap = Infinity;
    Array.from(track.children).forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const shown = Math.min(rect.right, box.right) - Math.max(rect.left, box.left);
      // A card counts as in view when most of it is: the peek of the next one does not.
      if (shown >= rect.width * 0.6) {
        if (first < 0) first = i;
        last = i;
      }
      const gap = Math.abs(rect.left - box.left);
      if (gap < nearestGap) {
        nearestGap = gap;
        nearest = i;
      }
    });
    if (first < 0) first = last = nearest;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    setView((old) =>
      old.first === first && old.last === last && old.atStart === atStart && old.atEnd === atEnd
        ? old
        : { first, last, atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [measure, total]);

  function onScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(measure);
  }

  function goTo(index: number) {
    const track = trackRef.current;
    const slide = track?.children[Math.max(0, Math.min(total - 1, index))];
    if (!track || !(slide instanceof HTMLElement)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: slide.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowRight") goTo(view.first + 1);
    else if (event.key === "ArrowLeft") goTo(view.first - 1);
    else if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(total - 1);
    else return;
    event.preventDefault();
  }

  if (total === 0) return null;
  if (total === 1) return <div className={className}>{items[0].node}</div>;

  const counter =
    layout === "single" || view.first === view.last
      ? `${Noun} ${view.first + 1} of ${total}`
      : `${view.first + 1}–${view.last + 1} of ${total}`;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col gap-3 rounded-panel outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p aria-live="polite" aria-atomic className="text-sm font-semibold text-foreground tabular-nums">
          {counter}
        </p>
        {showSteps && (
          <div className="flex items-center gap-1.5">
            {items.map((item, i) => {
              const active = i >= view.first && i <= view.last;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={`Go to ${noun} ${i + 1}: ${item.label}`}
                  aria-current={i === view.first ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-input bg-muted text-foreground hover:border-foreground/25 hover:bg-accent",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            className="size-9 px-0 aria-disabled:pointer-events-none aria-disabled:text-faint"
            aria-label={`Previous ${noun}`}
            disabled={view.atStart}
            focusableWhenDisabled
            onClick={() => goTo(view.first - 1)}
          >
            <ChevronLeft aria-hidden strokeWidth={1.75} />
          </Button>
          <Button
            variant="outline"
            className="size-9 px-0 aria-disabled:pointer-events-none aria-disabled:text-faint"
            aria-label={`Next ${noun}`}
            disabled={view.atEnd}
            focusableWhenDisabled
            onClick={() => goTo(view.first + 1)}
          >
            <ChevronRight aria-hidden strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {/* The track: swipe, trackpad and shift-wheel scroll it; snap-mandatory settles on a card.
          The cards stretch, so every card in the row is as tall as the tallest. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="relative flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            inert={i < view.first || i > view.last}
            className={cn(
              "flex min-w-0 shrink-0 grow-0 snap-start",
              layout === "single"
                ? "basis-full"
                : "basis-full sm:basis-[calc((100%-0.75rem)/2)] lg:basis-[calc((100%-1.5rem)/3)]",
            )}
          >
            {item.node}
          </div>
        ))}
      </div>
    </div>
  );
}
