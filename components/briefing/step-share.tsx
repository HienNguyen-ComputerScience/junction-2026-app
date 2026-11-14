import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { BriefingShare } from "@/components/briefing/briefing-share";
import { SourceLine } from "@/components/briefing/source-line";
import { Pill, STATEMENT, TEXT_LINK } from "@/components/briefing/ui";
import type { Briefing } from "@/lib/briefing/model";
import { briefingHref } from "@/lib/briefing/steps";
import { formatPct } from "@/lib/ranking";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Step 6, "Save or share this briefing": the way out of the browser first (the shared "Save or
 * share" control, open: print this briefing as one document, download the action plan for Word
 * or Excel, or send the briefing's address by email), then the briefing in three lines.
 *
 * `moreLinks` is a slot at the end of the link list, for a link to /insights ("See where
 * access is hardest across Finland") once that page exists. Pass <li> elements.
 */
export function StepShare({ briefing, moreLinks }: { briefing: Briefing; moreLinks?: ReactNode }) {
  const { county, stand, pathway, actions } = briefing;
  const first = actions[0];

  return (
    <>
      <Pill className="animate-fade-up">Save or share this briefing</Pill>
      <h1
        data-briefing-heading
        tabIndex={-1}
        className={`animate-fade-up ${STATEMENT}`}
        style={i(1)}
      >
        That is the briefing for {county.name}. Keep it on paper or as a file, or send it on.
      </h1>

      <div className="animate-fade-up" style={i(2)}>
        <BriefingShare
          areaName={county.name}
          planFilePath={briefing.planFilePath}
          actionIds={actions.map((action) => action.id)}
          targetLevels={actions.map((action) => action.watch?.target?.level ?? null)}
          briefingPath={briefingHref(county.id)}
        />
      </div>

      <ol className="flex flex-col gap-[14px] text-base leading-6 text-charcoal">
        <li className="animate-fade-up flex flex-col gap-1" style={i(3)}>
          <span className="type-eyebrow">Where you stand</span>
          <span className="text-pretty">
            {formatPct(stand.value)} {stand.statement} Finland: {formatPct(stand.finland)}.
          </span>
        </li>
        <li className="animate-fade-up flex flex-col gap-1" style={i(4)}>
          <span className="type-eyebrow">Where the delay is</span>
          <span className="text-pretty">{pathway.lede}</span>
        </li>
        {first ? (
          <li className="animate-fade-up flex flex-col gap-1" style={i(5)}>
            <span className="type-eyebrow">First thing to do</span>
            <span className="text-pretty">{first.title}.</span>
          </li>
        ) : null}
      </ol>

      <div className="animate-fade-up" style={i(6)}>
        <SourceLine sourceId={stand.sourceId} year={stand.year}>
          Visits, not people; all non-urgent GP visits, not only cancer-related ones.
        </SourceLine>
      </div>


      <div className="animate-fade-up flex flex-col gap-2 text-base leading-6 text-charcoal" style={i(7)}>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8">
          <li>
            <Link href={`/county/${county.id}`} className={TEXT_LINK}>
              Full page for {county.name}
            </Link>
          </li>
          <li>
            <Link href="/compare" className={TEXT_LINK}>
              Table of all {stand.ranked} areas
            </Link>
          </li>
          {moreLinks}
        </ul>
      </div>
    </>
  );
}
