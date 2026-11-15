"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * A figure that always shows its real value.
 *
 * The exact final text (`final`, or the value formatted with `decimals`, `prefix` and `suffix`)
 * is what the server renders, what the first browser frame shows and what screen readers read.
 * Nothing counts: no other value is ever on screen or in the page.
 *
 * - A figure that starts below the fold fades in and rises a few pixels (opacity and translate
 *   only) when it scrolls into view. One already on screen at load is simply there.
 * - Reduced motion and print: no movement, the value is simply there.
 * - Without script the figure is never hidden.
 *
 * `value`, `from`, `level`, `play` and `align` stay in the props so no call site changes; the
 * text comes from `final`, or from `value`, `decimals`, `prefix` and `suffix`.
 */
export function AnimatedNumber({
  value,
  final,
  decimals = 1,
  prefix = "",
  suffix = "",
  className,
}: {
  /** The number shown (when `final` is not given). */
  value: number;
  /** The exact text, e.g. the output of formatPct. Defaults to the formatted value. */
  final?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Kept for existing call sites: nothing counts up any more. */
  from?: number;
  /** Kept for existing call sites. */
  level?: "quiet" | "loud";
  /** Kept for existing call sites. */
  play?: boolean;
  /** Kept for existing call sites. */
  align?: "start" | "end";
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const text = final ?? `${prefix}${value.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    // Already on screen: show it as it is. Only a figure still below the fold waits to rise.
    // One with no box at all sits in a closed section: it has nothing to rise from, so it is just there.
    const rect = root.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    if (rect.bottom > 0 && rect.top < window.innerHeight * 0.94) return;

    root.dataset.pending = "true";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          delete root.dataset.pending;
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      delete root.dataset.pending;
    };
  }, []);

  return (
    <span
      ref={rootRef}
      data-slot="animated-number"
      className={cn(
        "inline-block whitespace-nowrap tabular-nums transition-[opacity,translate] duration-500 ease-out",
        "data-[pending=true]:translate-y-2 data-[pending=true]:opacity-0",
        "print:data-[pending=true]:translate-y-0 print:data-[pending=true]:opacity-100",
        className,
      )}
    >
      {text}
    </span>
  );
}
