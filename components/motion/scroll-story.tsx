"use client";

import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { cn } from "cn";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * The step a ScrollStory is on: 0, 1, 2 … while it is being told, or null for the final state
 * (server render, no JavaScript, reduced motion, phones, print). A picture drawn in its final
 * state must read correctly on its own.
 */
const StoryStepContext = createContext<number | null>(null);

/** For a client picture that redraws per step (e.g. a bar moving into its rank). */
export function useStoryStep(): number | null {
  return useContext(StoryStepContext);
}

const WIDE = "(min-width: 1024px)";

/**
 * Sticky storytelling: a picture holds still while two or three short text blocks scroll past
 * it, and each block changes the picture as it reaches the middle of the screen.
 *
 * - The picture is server-rendered in its final state. Parts of it marked
 *   `data-story-step="n"` get `data-story-state="future" | "current" | "past"` while the story
 *   is being told: future parts are dimmed, the current one is marked, past ones stay lit. A
 *   client picture can read the step with `useStoryStep()` instead.
 * - IntersectionObserver on the text blocks (a band through the middle of the viewport). Normal
 *   scrolling only: no wheel or touch capture, no snap, no parallax.
 * - From 1024px the picture sticks beside the text. Narrower, it stacks above the text in its
 *   final state. Reduced motion, no JavaScript and print give the same static document.
 */
export function ScrollStory({
  picture,
  steps,
  label,
  pictureSide = "start",
  className,
}: {
  /** The picture that holds still. Mark its parts with data-story-step. */
  picture: ReactNode;
  /** Two or three short text blocks, in order. */
  steps: ReactNode[];
  /** What the story is about, for screen readers (the picture's region label). */
  label: string;
  pictureSide?: "start" | "end";
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [step, setStep] = useState<number | null>(null);

  // Follow the block crossing the middle of the screen, only on wide screens with motion allowed.
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const wide = window.matchMedia(WIDE);
    let observer: IntersectionObserver | null = null;
    const start = () => {
      observer?.disconnect();
      observer = null;
      if (!wide.matches) {
        setStep(null);
        return;
      }
      setStep(0);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index >= 0) setStep(index);
          }
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      for (const el of stepRefs.current) if (el) observer.observe(el);
    };
    start();
    wide.addEventListener("change", start);
    // Leaving for print shows the final state; coming back resumes the story where it was.
    const toFinal = () => setStep(null);
    window.addEventListener("beforeprint", toFinal);
    window.addEventListener("afterprint", start);
    return () => {
      observer?.disconnect();
      wide.removeEventListener("change", start);
      window.removeEventListener("beforeprint", toFinal);
      window.removeEventListener("afterprint", start);
    };
  }, [steps.length]);

  // Mark the picture's parts. The final state (null) clears every mark.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    for (const part of root.querySelectorAll<HTMLElement>("[data-story-step]")) {
      if (step === null) {
        delete part.dataset.storyState;
        continue;
      }
      const at = Number(part.dataset.storyStep);
      part.dataset.storyState = at === step ? "current" : at < step ? "past" : "future";
    }
  }, [step]);

  return (
    <StoryStepContext.Provider value={step}>
      <div
        ref={rootRef}
        data-scroll-story={step === null ? "final" : "telling"}
        className={cn("grid gap-8 lg:grid-cols-2 lg:gap-16", className)}
      >
        <div
          role="group"
          aria-label={label}
          className={cn(
            "scroll-story-picture lg:sticky lg:top-[max(6rem,calc(50vh-16rem))] lg:self-start",
            pictureSide === "end" && "lg:order-2",
          )}
        >
          {picture}
        </div>
        <div className="flex flex-col gap-10 lg:gap-0">
          {steps.map((content, index) => (
            <div
              key={index}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-story-block={index}
              data-active={step === index ? "" : undefined}
              className="scroll-story-step flex flex-col justify-center lg:min-h-[75vh]"
            >
              {content}
            </div>
          ))}
        </div>
      </div>
    </StoryStepContext.Provider>
  );
}
