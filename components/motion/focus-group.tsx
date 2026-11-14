"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "cn";

import { prefersReducedMotion } from "@/lib/motion";

/** How close to the top or bottom of the page counts as "at the end": everything is in focus there. */
const EDGE = 48;

/**
 * Focus effect for a scroll page: the chunk nearest the middle of the screen is in focus at full
 * strength; the others step back (opacity 0.8 and scale 0.98 from 640px, opacity 0.85 on a
 * phone). As the reader scrolls, focus moves to the next chunk. The page scrolls normally.
 *
 * - Items are every `Chunk` and every `ScrollStory` text block inside the group (they carry
 *   `data-focus-item`); put `data-focus-item` on anything else that should take part. Sticky
 *   pictures never fade.
 * - One IntersectionObserver per group, on a band through the middle of the viewport. Nothing
 *   captures the wheel or touch, nothing snaps, nothing scrolls by script.
 * - Dim, never hide: faded items stay readable (AA measured at the floor), clickable and in the
 *   accessibility tree. An item holding keyboard focus or an opened "Show …" is at full strength.
 * - Full strength everywhere before script runs, under reduced motion, in print, and at the very
 *   top and bottom of the page (so the first and last chunks of a short page come into focus).
 */
export function FocusGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const items = () => [...root.querySelectorAll<HTMLElement>("[data-focus-item]")];

    const setFocus = (target: Element) => {
      for (const item of items()) {
        if (item === target) item.dataset.focus = "in";
        else delete item.dataset.focus;
      }
    };
    // At the ends of the page the effect rests, so every item is at full strength.
    const atEdge = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return window.scrollY < EDGE || window.scrollY > max - EDGE;
    };
    const update = () => {
      if (atEdge()) delete root.dataset.focusOn;
      else if (root.querySelector("[data-focus='in']")) root.dataset.focusOn = "";
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((entry) => entry.isIntersecting).at(-1);
        if (!hit) return; // Between two items: the last one keeps focus.
        setFocus(hit.target);
        update();
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const item of items()) observer.observe(item);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      delete root.dataset.focusOn;
      for (const item of items()) delete item.dataset.focus;
    };
  }, []);

  return (
    <div ref={ref} data-focus-group="" className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
}
