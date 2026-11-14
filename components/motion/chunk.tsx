import type { ReactNode } from "react";
import { cn } from "cn";

import { CaveatNote } from "@/components/motion/caveat-note";
import { Reveal } from "@/components/motion/reveal";

/**
 * One idea per screen-height, told in order: a short serif statement, the figure that backs it
 * (an AnimatedNumber or AnimatedBar landing on its exact value), one plain sentence on what it
 * means, then the source chip(s) and the one main caveat (a CaveatNote: a few words always
 * visible, the full explanation behind "Why?"). Each piece fades and rises as it enters the
 * viewport (the louder motion set, about 500 ms, short staggers) and stays.
 *
 * - The figure, its source and its caveat are plain HTML from the server: readable before any
 *   script runs, and simply there under reduced motion and in print.
 * - `lead` is the page's opening chunk: the statement is the page's h1-sized line and the chunk
 *   does not reserve a screen-height, so the headline figure sits above the fold.
 * - Pass the heading level the page outline needs (`as="h2"` by default).
 */
export function Chunk({
  eyebrow,
  statement,
  figure,
  meaning,
  source,
  caveat,
  children,
  as: Heading = "h2",
  lead = false,
  id,
  className,
}: {
  /** A short label above the statement, e.g. "Step 1" or "Finland, 2025". */
  eyebrow?: ReactNode;
  /** One short sentence, set in the serif. */
  statement: ReactNode;
  /** The figure that backs the statement. */
  figure?: ReactNode;
  /** One plain sentence: what the figure means. */
  meaning?: ReactNode;
  /** Source chip(s). Always shown with the figure. */
  source?: ReactNode;
  /** The one main caveat: `short` always visible, `why` behind a "Why?" button. */
  caveat?: { short: ReactNode; why?: ReactNode };
  /** Anything else that belongs to this idea, after the caveat (a small chart, a button). */
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
  lead?: boolean;
  id?: string;
  className?: string;
}) {
  let i = 0;
  return (
    <section
      id={id}
      data-slot="chunk"
      className={cn(
        "motion-loud flex flex-col justify-center gap-5 print:min-h-0 print:gap-3 print:py-4",
        lead ? "pt-4 pb-12 sm:pt-8 sm:pb-16" : "py-16 sm:py-24 lg:min-h-[70vh]",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal index={i++}>
          <p className="type-eyebrow">{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal index={i++}>
        <Heading
          className={cn(
            "max-w-[24ch] font-display font-light text-pretty text-forest-ink",
            lead ? "text-[2.5rem] leading-[1.1] sm:text-[3.5rem]" : "text-[2rem] leading-[1.15] sm:text-[2.75rem]",
          )}
        >
          {statement}
        </Heading>
      </Reveal>
      {figure ? (
        <Reveal index={i++} className="chunk-figure">
          {figure}
        </Reveal>
      ) : null}
      {meaning ? (
        <Reveal index={i++}>
          <p className="max-w-[60ch] text-[1.1875rem] leading-[1.6] text-pretty text-foreground">{meaning}</p>
        </Reveal>
      ) : null}
      {source || caveat ? (
        <Reveal index={i++} className="flex max-w-[68ch] flex-col items-start gap-3">
          {source ? <div className="flex flex-wrap items-center gap-2">{source}</div> : null}
          {caveat ? <CaveatNote short={caveat.short}>{caveat.why}</CaveatNote> : null}
        </Reveal>
      ) : null}
      {children ? <Reveal index={i++}>{children}</Reveal> : null}
    </section>
  );
}

/** The big figure inside a Chunk: the numeral face at display size, with a unit in words after it. */
export function ChunkFigure({
  children,
  unit,
  tone = "plain",
}: {
  children: ReactNode;
  unit?: ReactNode;
  tone?: "plain" | "alarm";
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span
        className={cn(
          "numeral text-[4.5rem] leading-none sm:text-[6.5rem] print:text-[36pt]",
          tone === "alarm" ? "text-status-red-ink" : "text-forest-ink",
        )}
      >
        {children}
      </span>
      {unit ? <span className="max-w-[22ch] font-display text-[1.5rem] leading-snug font-light text-forest-ink">{unit}</span> : null}
    </p>
  );
}
