"use client";

import { type CSSProperties, useRef } from "react";
import { cn } from "cn";

import { useInViewOnce } from "@/components/motion/use-in-view";

const TONE = {
  /** Worse than Finland's level. */
  red: "bg-status-red",
  /** At or better than Finland's level. */
  slate: "bg-status-amber-bar",
  /** No public data, or a neutral quantity. */
  grey: "bg-status-grey",
  /** A plain quantity with no status. */
  forest: "bg-forest-ink",
} as const;

export type BarTone = keyof typeof TONE;

/**
 * A horizontal bar that grows from the left to its value, once.
 *
 * The server renders it at full length; the growth is a transform on top, so there is no layout
 * shift and nothing to wait for without script. `label` is what a screen reader hears (the bar
 * is one image): put the value and what it measures in it. Colour is never the only signal:
 * show the figure and its status in words next to the bar.
 *
 * - By default it grows when it first enters the viewport, or when a `Reveal` around it plays.
 * - With `play` it is driven by a button: empty while false, grows when it turns true.
 * - `marker` draws a vertical line at a reference value (Finland's level), `markerLabel` names it.
 */
export function AnimatedBar({
  value,
  max = 100,
  tone = "forest",
  label,
  marker,
  markerLabel,
  play,
  index = 0,
  className,
}: {
  /** The bar's value, on the same scale as `max`. */
  value: number;
  /** The value at the right end of the track. */
  max?: number;
  tone?: BarTone;
  /** Read by screen readers, e.g. "Vantaa and Kerava 85.4%, Finland 54.7%". */
  label: string;
  /** A reference line, on the same scale as `value`. */
  marker?: number;
  /** Visible text under the reference line, e.g. "Finland 54.7%". */
  markerLabel?: string;
  /** Button-driven mode. Leave undefined to grow on entering view. */
  play?: boolean;
  /** Position among sibling bars, for a small stagger. */
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useInViewOnce(ref, {
    enabled: play === undefined,
    onBelowFold: (el) => {
      // Inside a Reveal the parent already holds the bar back; marking both is harmless.
      el.dataset.bar = "wait";
    },
    onEnter: (el) => {
      if (el.dataset.bar === "wait") el.dataset.bar = "in";
    },
  });
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  const state = play === undefined ? "load" : play ? "in" : "wait";
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-slot="animated-bar"
      data-bar={state}
      className={cn("relative w-full", markerLabel ? "pb-6" : "", className)}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-track">
        <div
          data-bar-fill
          className={cn("absolute inset-y-0 left-0 rounded-full", TONE[tone])}
          style={{ width: pct(value) }}
        />
      </div>
      {marker !== undefined ? (
        <>
          <div aria-hidden className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 bg-forest-ink" style={{ left: pct(marker) }} />
          {markerLabel ? (
            <div
              aria-hidden
              className="absolute top-4.5 -translate-x-1/2 type-note whitespace-nowrap text-muted-foreground"
              style={{ left: `clamp(2.5rem, ${pct(marker)}, calc(100% - 2.5rem))` }}
            >
              {markerLabel}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
