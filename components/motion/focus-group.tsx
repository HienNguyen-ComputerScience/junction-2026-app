"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "cn";

import { prefersReducedMotion } from "@/lib/motion";

/** How close to the top or bottom of the page counts as "at the end": the first or last item is in focus there. */
const EDGE = 48;

/**
 * Focus effect for a scroll page: every item is a card. The one nearest the middle of the screen
 * is Mint Veil and slightly larger (scale 1.02); the others are Cream Paper with a Border Mist
 * hairline, slightly smaller (0.96). The card changes, never the text: no opacity anywhere. As
 * the reader scrolls, focus moves to the next card. The page scrolls normally.
 *
 * - Items are every `Chunk` and every `ScrollStory` text block inside the group (they carry
 *   `data-focus-item`); put `data-focus-item` on anything else that should take part. Sticky
 *   pictures, full tables, the limitations box and MoreCard stay out.
 * - One IntersectionObserver per group, on a band through the middle of the viewport. Nothing
 *   captures the wheel or touch, nothing snaps, nothing scrolls by script.
 * - An item holding keyboard focus or an opened "Show …" stays in the focused state.
 * - At the very top of the page the first item is in focus, at the very bottom the last.
 * - Before script runs, under reduced motion and in print, every item is in one neutral state
 *   (cream with the hairline, no scale, no animation). Styles: app/globals.css, "FocusGroup".
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
    // At the ends of the page the first or last item takes focus (the middle band may never reach it).
    const update = () => {
      const list = items();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < EDGE && list.length) setFocus(list[0]);
      else if (window.scrollY > max - EDGE && list.length) setFocus(list[list.length - 1]);
      if (root.querySelector("[data-focus='in']")) root.dataset.focusOn = "";
    };
    // Paper gets the neutral state; coming back resumes.
    const toNeutral = () => {
      delete root.dataset.focusOn;
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
    window.addEventListener("beforeprint", toNeutral);
    window.addEventListener("afterprint", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("beforeprint", toNeutral);
      window.removeEventListener("afterprint", update);
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
