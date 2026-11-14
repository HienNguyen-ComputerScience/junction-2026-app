import type { ReactNode } from "react";
import { cn } from "cn";

import { AnimatedNumber, CaveatNote, Reveal } from "@/components/motion";

/**
 * One text block of a ScrollStory that states a single fact: eyebrow, a short serif statement,
 * the figure counting up, one plain line on what it means, the source, and the caveat if any.
 */
export function StoryFact({
  eyebrow,
  statement,
  value,
  final,
  unit,
  tone = "plain",
  meaning,
  source,
  caveat,
  why,
}: {
  eyebrow: ReactNode;
  statement: ReactNode;
  value?: number;
  final?: string;
  unit?: string;
  tone?: "plain" | "alarm";
  meaning: ReactNode;
  source?: ReactNode;
  caveat?: ReactNode;
  why?: ReactNode;
}) {
  return (
    <div className="motion-loud flex flex-col items-start gap-4 py-6">
      <Reveal>
        <p className="type-eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal index={1}>
        <h3 className="font-display text-[2rem] leading-[1.15] font-light text-pretty text-forest-ink sm:text-[2.5rem]">{statement}</h3>
      </Reveal>
      {value !== undefined && final ? (
        <Reveal index={2}>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className={cn("numeral text-[3.5rem] leading-none", tone === "alarm" ? "text-status-red-ink" : "text-forest-ink")}>
              <AnimatedNumber value={value} final={final} level="loud" />
            </span>
            {unit ? <span className="font-display text-[1.5rem] font-light text-forest-ink">{unit}</span> : null}
          </p>
        </Reveal>
      ) : null}
      <Reveal index={3}>
        <p className="max-w-[48ch] text-[1.0625rem] leading-relaxed text-pretty">{meaning}</p>
      </Reveal>
      <Reveal index={4} className="flex flex-col items-start gap-3">
        {caveat ? <CaveatNote short={caveat}>{why}</CaveatNote> : null}
        {source}
      </Reveal>
    </div>
  );
}
