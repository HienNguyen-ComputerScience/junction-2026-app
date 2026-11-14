"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "cn";

import { prefersReducedMotion } from "@/lib/motion";

/** Wide enough for a picture beside its text; below this the picture stacks above the text. */
const SIDE_BY_SIDE = "(min-width: 1024px)";
/** A text block counts as reached once its top passes this share of the window's height. */
const REACHED_AT = 0.62;

/**
 * A picture that stays in place while two or three short text blocks scroll past it, each one
 * adding a part to the picture (parts carry `data-at="1"`, `"2"` …; `data-at="0"` or none is the
 * base).
 *
 * - Parts only ever appear: once a block is reached, its part stays, also when the reader scrolls
 *   back up. Nothing depends on scrolling to an exact place.
 * - Scrolling itself is never touched: the blocks are watched with an IntersectionObserver.
 * - The server HTML has no stage, so the picture is finished: that is what a page without script,
 *   reduced motion, a phone (where the picture sits above its text, not beside it) and paper show.
 *   Only a wide screen with motion allowed, where the story starts below the fold, is put back to
 *   stage 0 to be filled in.
 */
export function Story({
  picture,
  blocks,
  label,
  className,
}: {
  /** The picture, server-rendered, with its parts marked `data-at`. */
  picture: ReactNode;
  /** The text blocks, in order. Block n adds the parts marked `data-at="n"`. */
  blocks: ReactNode[];
  /** What the picture shows, for screen readers (the picture's parts are all in the page). */
  label: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window) || !window.matchMedia(SIDE_BY_SIDE).matches) return;
    // Already on screen or scrolled past (a refresh halfway down, an "On this page" link): leave it finished.
    if (root.getBoundingClientRect().top < window.innerHeight * REACHED_AT) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-block]"));
    root.dataset.storyStage = "0";
    let stage = 0;

    const update = () => {
      let reached = 0;
      items.forEach((item, index) => {
        if (item.getBoundingClientRect().top < window.innerHeight * REACHED_AT) reached = index + 1;
      });
      if (reached > stage) {
        stage = reached;
        root.dataset.storyStage = String(stage);
      }
      if (stage >= items.length) observer.disconnect();
    };

    const observer = new IntersectionObserver(update, {
      rootMargin: `0px 0px -${Math.round((1 - REACHED_AT) * 100)}% 0px`,
      threshold: [0, 1],
    });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("htr-story grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16", className)}
    >
      <figure aria-label={label} className="htr-sticky self-start lg:sticky lg:top-24">
        {picture}
      </figure>
      <div className="flex flex-col gap-10 lg:gap-0">
        {blocks.map((block, index) => (
          <div key={index} data-block={index + 1} className="flex flex-col gap-4 lg:min-h-[62vh] lg:justify-center">
            {block}
          </div>
        ))}
      </div>
    </div>
  );
}
