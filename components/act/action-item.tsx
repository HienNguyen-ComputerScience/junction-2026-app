import type { ReactNode } from "react";

import { actionCopy, lowerFirst, STEP_SHORT } from "@/components/act/action-copy";
import { figureQualifier, plainStat, statisticLine } from "@/components/act/action-card";
import { Disclosure, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { plainTitle } from "@/lib/action-title";
import type { Evidence } from "@/lib/data";

/** One part of the opened details: a small label and its text. */
function Part({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold text-forest-ink">{label}</p>
      {children}
    </div>
  );
}

const TEXT = "text-base leading-relaxed text-pretty text-foreground";
const PILL = "inline-flex min-h-8 w-fit items-center rounded-full bg-cream-paper px-3.5 py-1 text-base text-forest-ink";

/** NICE content may not be reproduced outside the UK: its quote is never shown, only linked. */
const isNice = (action: Evidence) => action.source_id.startsWith("ev-nice");

/**
 * One recommended action on the act page: a card that reveals in order as it scrolls in (number
 * and title, owner pill and, where the actions span several steps, the step pill; the one-line
 * why; the source chip). Everything else is behind one "Show details" button that opens in place,
 * and is always open on paper.
 */
export function ActionItem({ action, index, showStep }: { action: Evidence; index: number; showStep: boolean }) {
  const copy = actionCopy(action);
  const stat = action.effect_size ? plainStat(action.effect_size) : null;
  const qualifier = stat && action.effect_size ? figureQualifier(action.effect_size) : null;

  return (
    <article
      data-focus-item
      id={`action-${index}`}
      aria-labelledby={`action-${index}-title`}
      className="flex w-full min-w-0 scroll-mt-28 flex-col gap-5 rounded-lg bg-mint-veil px-7 py-8 sm:px-10 sm:py-10"
    >
      <Reveal index={0} className="flex items-baseline gap-5">
        <span aria-hidden className="numeral text-[3.5rem] leading-none text-forest-ink">
          {index}
        </span>
        <h3 id={`action-${index}-title`} className="font-display text-[1.75rem] leading-[1.2] font-light text-pretty text-forest-ink">
          <span className="sr-only">Action {index}: </span>
          {copy.title}
        </h3>
      </Reveal>

      <Reveal index={1} className="flex flex-wrap gap-2">
        <span className={PILL}>Owner: {copy.owner}</span>
        {showStep ? <span className={PILL}>Fixes: {lowerFirst(STEP_SHORT[action.stage])}</span> : null}
      </Reveal>

      <Reveal as="p" index={2} className="text-lg leading-snug text-pretty text-foreground">
        {copy.why}
      </Reveal>

      <Reveal index={3}>
        <SourceChip sourceId={action.source_id} />
      </Reveal>

      <Reveal index={4}>
        <Disclosure tone="quiet" label="details">
          <div className="flex flex-col gap-5 rounded-lg bg-cream-paper px-5 py-5 sm:px-6 print:px-0 print:py-1">
            <Part label="First step">
              <p className={`${TEXT} font-semibold`}>{action.first_step}</p>
            </Part>
            <Part label="The action in full">
              <p className={TEXT}>
                {plainTitle(action.action)}. {action.detail}
              </p>
              <p className={TEXT}>
                <span className="font-semibold">Who implements it: </span>
                {action.who_implements}
              </p>
            </Part>
            <Part label="Where it was done and what happened">
              <p className={TEXT}>{action.precedent}</p>
              {stat ? (
                <div className="flex flex-col gap-1 pt-1">
                  <p className="numeral text-[1.5rem] leading-tight text-foreground">{stat}</p>
                  <p className="text-base text-pretty text-muted-foreground first-letter:uppercase">
                    {qualifier ?? "A study result, not a forecast for this county."}
                  </p>
                </div>
              ) : null}
              <p className={`${TEXT} tabular-nums`}>{action.effect_text}</p>
              {action.effect_size ? (
                <p className={TEXT}>Figure as the study states it: {statisticLine(action.effect_size)}</p>
              ) : null}
              {isNice(action) ? null : (
                <p className={`${TEXT} border-l-2 border-forest-ink/30 pl-3`}>{action.quote_or_page}</p>
              )}
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
                {action.verified ? <Badge variant="checked">Source checked</Badge> : null}
                <SourceChip sourceId={action.source_id} />
              </span>
            </Part>
            <Part label="What it will not fix or prove">
              <p className={TEXT}>{action.limitations}</p>
            </Part>
          </div>
        </Disclosure>
      </Reveal>
    </article>
  );
}
