"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

import { easeOut, MOTION, type MotionLevel, prefersReducedMotion } from "@/lib/motion";

/**
 * A figure that counts up to its value, once.
 *
 * The exact final text (`final`, or the value formatted with `decimals`, `prefix` and `suffix`)
 * is what the server renders, what screen readers read at every moment, and what the count
 * lands on: the moving digits are a decorative overlay (`aria-hidden`) on top of it, so no
 * intermediate value is ever announced and nothing shifts while it counts.
 *
 * - By default it plays when the figure first enters the viewport.
 * - With `play` it is driven by a button: it shows the final value while `play` is false and
 *   counts when it turns true.
 * - Reduced motion: no counting, the value is simply there.
 */
export function AnimatedNumber({
  value,
  final,
  decimals = 1,
  prefix = "",
  suffix = "",
  from = 0,
  level = "quiet",
  play,
  align = "start",
  className,
}: {
  /** The number to count to. */
  value: number;
  /** The exact text at rest, e.g. the output of formatPct. Defaults to the formatted value. */
  final?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Where the count starts. */
  from?: number;
  level?: MotionLevel;
  /** Button-driven mode. Leave undefined to play on entering view. */
  play?: boolean;
  /** Which edge the moving digits hold on to: "end" for right-aligned table cells. */
  align?: "start" | "end";
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const finalRef = useRef<HTMLSpanElement | null>(null);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  const text = final ?? `${prefix}${value.toFixed(decimals)}${suffix}`;
  const duration = MOTION[level].count;

  useEffect(() => {
    const root = rootRef.current;
    const finalEl = finalRef.current;
    const liveEl = liveRef.current;
    if (!root || !finalEl || !liveEl) return;
    if (play === false || prefersReducedMotion()) return;

    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      finalEl.style.opacity = "";
      liveEl.style.display = "";
      liveEl.textContent = "";
    };
    const run = () => {
      const start = performance.now();
      finalEl.style.opacity = "0";
      liveEl.style.display = "block";
      const tick = (now: number) => {
        const t = (now - start) / duration;
        if (t >= 1) {
          finish();
          return;
        }
        liveEl.textContent = `${prefix}${(from + (value - from) * easeOut(t)).toFixed(decimals)}${suffix}`;
        frame = requestAnimationFrame(tick);
      };
      tick(start);
    };

    if (play === true || !("IntersectionObserver" in window)) {
      run();
      return finish;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      finish();
    };
  }, [value, decimals, prefix, suffix, from, duration, play]);

  return (
    <span
      ref={rootRef}
      data-slot="animated-number"
      className={cn("relative inline-block whitespace-nowrap tabular-nums", className)}
    >
      <span ref={finalRef} data-number-final>
        {text}
      </span>
      <span
        ref={liveRef}
        aria-hidden
        className={cn("pointer-events-none absolute inset-y-0 hidden", align === "end" ? "right-0" : "left-0")}
      />
    </span>
  );
}
