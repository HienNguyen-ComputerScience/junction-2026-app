// One motion language for the whole site: one easing, two volume levels.
// "quiet" is the default and is used on the detail pages (home, compare, county, act, ask,
// plan). "loud" is for the guided briefing, where one statement or one figure is the whole
// screen. The same numbers live in app/globals.css as CSS variables (--motion-*); the class
// `motion-loud` on an ancestor switches a subtree to the loud set. Keep the two in step.

export const MOTION_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export type MotionLevel = "quiet" | "loud";

export type MotionTimings = {
  /** Fade and slight rise of one element, in ms. */
  rise: number;
  /** Delay between neighbouring elements (multiplied by the element's index), in ms. */
  stagger: number;
  /** A bar growing from the left to its value, in ms. */
  bar: number;
  /** A number counting up to its value, in ms. */
  count: number;
  /** How far an element rises, in px. */
  distance: number;
  /** A "Show …" section easing open, in ms. */
  open: number;
};

export const MOTION: Record<MotionLevel, MotionTimings> = {
  quiet: { rise: 320, stagger: 60, bar: 500, count: 600, distance: 8, open: 280 },
  loud: { rise: 500, stagger: 120, bar: 700, count: 700, distance: 14, open: 360 },
};

/** Class for a subtree that should move at the loud level (the briefing). */
export const MOTION_LOUD_CLASS = "motion-loud";

/** Ease-out cubic, the curve numbers count up on. `t` and the result are 0 to 1. */
export function easeOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - (1 - clamped) ** 3;
}

/** True when the visitor asked the system for less motion. Client only. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
