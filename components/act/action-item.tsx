import type { ReactNode } from "react";

import { figureQualifier, plainStat, statisticLine } from "@/components/act/action-card";
import { Disclosure } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { FramePanel } from "@/components/ui/frame";
import { STAGE_LABELS } from "@/lib/act";
import { plainTitle } from "@/lib/action-title";
import type { Evidence } from "@/lib/data";

/** A small label inside an opened section. `printOnly` repeats the button's words on paper, where the button is hidden. */
function Label({ children, printOnly = false }: { children: ReactNode; printOnly?: boolean }) {
  return (
    <p className={`text-sm font-semibold text-forest-ink ${printOnly ? "hidden print:block" : ""}`}>{children}</p>
  );
}

/** The opened content of one "Show …" button: a raised block under the button. */
function Opened({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-lg bg-mint-veil px-5 py-4 print:px-0 print:py-1">{children}</div>;
}

const TEXT = "text-base leading-relaxed text-pretty text-foreground";

/** NICE content may not be reproduced outside the UK: its quote is never shown, only linked. */
const isNice = (action: Evidence) => action.source_id.startsWith("ev-nice");

/**
 * One recommended action on the act page, in small chunks. Always visible: the action number and
 * pathway step, the title, who does it, why it is here, and the checked source. Each deeper part
 * sits behind its own plainly labelled button and opens in place: the first step, where it was
 * done and what happened (the study figure, with its comparison and source), the source's own
 * wording, and the limits of the evidence. Print opens all of them.
 */
export function ActionItem({ action, index, why }: { action: Evidence; index: number; why: string }) {
  const stat = action.effect_size ? plainStat(action.effect_size) : null;
  const qualifier = stat && action.effect_size ? figureQualifier(action.effect_size) : null;
  const hasSourceDetail = action.effect_size !== null || !isNice(action);

  return (
    <FramePanel
      padding="none"
      id={`action-${index}`}
      className="flex w-full min-w-0 scroll-mt-20 flex-col gap-4 px-6 py-7 sm:px-9 sm:py-8"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-forest-ink tabular-nums">Action {index}</span>
          <span aria-hidden> · </span>
          Step: {STAGE_LABELS[action.stage]}
        </p>
        <h3 className="font-display text-[1.75rem] leading-[1.2] font-light text-pretty text-forest-ink">
          {plainTitle(action.action)}
        </h3>
      </div>

      <dl className="flex flex-col gap-2 text-base leading-relaxed">
        <div>
          <dt className="inline font-semibold">Who does it: </dt>
          <dd className="inline text-pretty">{action.who_implements.replace(": ", ", ")}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Why here: </dt>
          <dd className="inline text-pretty">{why}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <dt className="font-semibold">Evidence:</dt>
          <dd className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            {action.verified ? <Badge variant="checked">Source checked</Badge> : null}
            <SourceChip sourceId={action.source_id} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-1 border-t border-border pt-3 print:gap-3 print:border-0">
        <Disclosure tone="quiet" label="the first step">
          <Opened>
            <Label printOnly>First step</Label>
            <p className={`${TEXT} font-semibold`}>{action.first_step}</p>
            <Label>What the whole action involves</Label>
            <p className={TEXT}>{action.detail}</p>
          </Opened>
        </Disclosure>

        <Disclosure
          tone="quiet"
          show="Show where this was done and what happened"
          hide="Hide where this was done and what happened"
        >
          <Opened>
            <Label>Where it was done</Label>
            <p className={TEXT}>{action.precedent}</p>
            <Label>What happened there</Label>
            {stat ? (
              <div className="flex flex-col gap-1">
                <p className="numeral text-[1.5rem] leading-tight text-foreground">{stat}</p>
                <p className="text-sm text-pretty text-muted-foreground first-letter:uppercase">
                  {qualifier ?? "A study result, not a forecast for this county."}
                </p>
                <span className="pt-1">
                  <SourceChip sourceId={action.source_id} />
                </span>
              </div>
            ) : null}
            <p className={`${TEXT} tabular-nums`}>{action.effect_text}</p>
          </Opened>
        </Disclosure>

        {hasSourceDetail ? (
          <Disclosure tone="quiet" label="the source">
            <Opened>
              <Label printOnly>The source</Label>
              {action.effect_size ? (
                <p className={TEXT}>Figure as the study states it: {statisticLine(action.effect_size)}</p>
              ) : null}
              {isNice(action) ? null : (
                <>
                  <Label>Quote and page</Label>
                  <p className={`${TEXT} border-l-2 border-forest-ink/30 pl-3`}>{action.quote_or_page}</p>
                </>
              )}
            </Opened>
          </Disclosure>
        ) : null}

        <Disclosure
          tone="quiet"
          show="Show what this will not fix or prove"
          hide="Hide what this will not fix or prove"
        >
          <Opened>
            <Label printOnly>What this will not fix or prove</Label>
            <p className={TEXT}>{action.limitations}</p>
          </Opened>
        </Disclosure>
      </div>
    </FramePanel>
  );
}
