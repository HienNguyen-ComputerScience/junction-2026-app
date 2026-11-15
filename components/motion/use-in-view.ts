"use client";

import { type RefObject, useEffect } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Calls `onEnter` once, the first time the element is in the viewport (straight away when it
 * already is). Returns nothing: callers act on the DOM node, so no render is triggered.
 * Does nothing under reduced motion or where IntersectionObserver is missing.
 *
 * `onBelowFold` runs first, and only for an element that starts below the fold: the place to
 * put it in its waiting state. An element already on screen at load is left alone, so the page
 * never blanks and nothing jumps.
 */
export function useInViewOnce(
  ref: RefObject<HTMLElement | null>,
  options: { enabled?: boolean; onBelowFold?: (el: HTMLElement) => void; onEnter: (el: HTMLElement) => void },
  deps: readonly unknown[] = [],
) {
  const { enabled = true, onBelowFold, onEnter } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const inView = el.getBoundingClientRect().top < window.innerHeight * 0.94;
    if (inView) {
      onEnter(el);
      return;
    }
    onBelowFold?.(el);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          onEnter(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // The callbacks are read fresh on each run; callers pass the values they depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enabled, ...deps]);
}
