"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "cn";

import { useInViewOnce } from "@/components/motion/use-in-view";

type RevealElement = "div" | "section" | "li" | "p" | "span" | "article" | "tr";

/**
 * Fades its content in with a slight rise, once.
 *
 * - By default it plays when the element first enters the viewport. Content already on screen at
 *   load plays straight away as a CSS animation, so the server-rendered HTML is complete and
 *   readable before any script runs.
 * - With `show` it is driven by a button instead: hidden (and skipped by screen readers) while
 *   `show` is false, played when it turns true. Use it for one-step-at-a-time screens.
 * - `index` staggers neighbours (0, 1, 2 …).
 * - Bars inside (`AnimatedBar`, `animate-bar-grow`) start growing when the Reveal plays.
 * - Reduced motion and print: the content is simply there.
 */
export function Reveal({
  as: Comp = "div",
  index = 0,
  show,
  className,
  style,
  children,
}: {
  as?: RevealElement;
  /** Position among siblings; each step delays by one stagger. */
  index?: number;
  /** Button-driven mode: false hides, true plays. Leave undefined to play on entering view. */
  show?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useInViewOnce(ref, {
    enabled: show === undefined,
    onBelowFold: (el) => {
      el.dataset.reveal = "wait";
    },
    onEnter: (el) => {
      if (el.dataset.reveal === "wait") el.dataset.reveal = "in";
    },
  });
  const state = show === undefined ? "load" : show ? "in" : "hold";
  const props = {
    "data-reveal": state,
    className: cn(className),
    style: { "--i": index, ...style } as CSSProperties,
  };
  // One element type per branch keeps the ref typed without a cast to `any`.
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };
  switch (Comp) {
    case "section":
      return <section ref={setRef} {...props}>{children}</section>;
    case "li":
      return <li ref={setRef} {...props}>{children}</li>;
    case "p":
      return <p ref={setRef} {...props}>{children}</p>;
    case "span":
      return <span ref={setRef} {...props}>{children}</span>;
    case "article":
      return <article ref={setRef} {...props}>{children}</article>;
    case "tr":
      return <tr ref={setRef} {...props}>{children}</tr>;
    default:
      return <div ref={setRef} {...props}>{children}</div>;
  }
}
