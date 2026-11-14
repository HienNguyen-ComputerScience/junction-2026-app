"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

// The briefing's one door to the shared motion pieces. Until components/motion lands on the
// foundation branch, CountUp below is a local stand-in with the same contract as the shared
// AnimatedNumber: the exact final text is what the server renders and what a screen reader
// reads at every moment; the moving digits are a decorative overlay on top of it.

const COUNT_MS = 700;

function easeOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - (1 - clamped) ** 3;
}

/**
 * A figure that counts up to its exact value, once, when the step comes on screen (a step is
 * mounted by the press of a button, so the count is always the answer to a press).
 * Reduced motion: no counting, the value is simply there.
 */
export function CountUp({
  value,
  final,
  decimals = 1,
  suffix = "",
  delay = 0,
  className,
}: {
  value: number;
  /** The exact text at rest, e.g. the output of formatPct. */
  final: string;
  decimals?: number;
  suffix?: string;
  /** Milliseconds to wait before counting, so the figure follows the element before it. */
  delay?: number;
  className?: string;
}) {
  const finalRef = useRef<HTMLSpanElement | null>(null);
  const liveRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const finalEl = finalRef.current;
    const liveEl = liveRef.current;
    if (!finalEl || !liveEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      finalEl.style.opacity = "";
      liveEl.style.display = "";
      liveEl.textContent = "";
    };
    const start = performance.now() + delay;
    finalEl.style.opacity = "0";
    liveEl.style.display = "block";
    const tick = (now: number) => {
      const t = (now - start) / COUNT_MS;
      if (t >= 1) {
        finish();
        return;
      }
      liveEl.textContent = `${(value * easeOut(t)).toFixed(decimals)}${suffix}`;
      frame = requestAnimationFrame(tick);
    };
    tick(performance.now());
    return finish;
  }, [value, decimals, suffix, delay]);

  return (
    <span className={cn("relative inline-block whitespace-nowrap tabular-nums", className)}>
      <span ref={finalRef}>{final}</span>
      <span ref={liveRef} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden" />
    </span>
  );
}
