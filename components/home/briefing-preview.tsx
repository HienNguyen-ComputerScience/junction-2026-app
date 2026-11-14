import { SourceLine } from "@/components/briefing/source-line";
import { Pill, ShareBar, STATEMENT, StatusLabel } from "@/components/briefing/ui";
import { AnimatedNumber } from "@/components/motion";
import type { BriefingStand } from "@/lib/briefing/model";
import { BRIEFING_STEP_COUNT, BRIEFING_STEPS } from "@/lib/briefing/steps";
import { formatPct } from "@/lib/ranking";

/** The limitation's first sentence: "Visits, not people; all non-urgent GP visits, not only cancer-related ones." */
function mainCaveat(limitation: string): string {
  const end = limitation.indexOf(". ");
  return end === -1 ? limitation : limitation.slice(0, end + 1);
}

/**
 * Step 1 of the guided briefing ("Where you stand"), as the home page's first card: the same
 * figure, statement, bars, comparison and source line as the briefing's own step 1, built from
 * the same model (`buildBriefing(id).stand`), so the home page shows the briefing working.
 *
 * Differences from `StepStand`: the statement is an h2 (the home page has its own h1), the count
 * is the site's quiet one and plays on entering view, and the rank, the GP definition and the
 * two in-step buttons are left to the briefing itself. The "Next" button is the picker's (it needs the area).
 */
export function BriefingPreview({ name, stand }: { name: string; stand: BriefingStand }) {
  const tone = stand.status === "red" ? "red" : "amber";
  const figure = formatPct(stand.value);
  const relation =
    stand.value === stand.finland ? "." : stand.status === "red" ? ", which is worse." : ", which is better.";

  return (
    <div className="flex flex-col gap-5">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base leading-6 text-charcoal">
        <Pill>
          Step 1 of {BRIEFING_STEP_COUNT}
        </Pill>
        <span>
          <span className="font-semibold text-forest-ink">{BRIEFING_STEPS[0].label}</span> · {name}, {stand.year}
        </span>
      </p>

      <div className="flex flex-col gap-1">
        {/* The figure as drawn. The heading below carries it for screen readers. */}
        <p
          aria-hidden
          className="font-display text-[3.5rem] leading-[1.05] font-light tracking-[-0.03em] text-forest-ink lining-nums sm:text-[4.625rem]"
        >
          <AnimatedNumber value={stand.value} final={figure} suffix="%" className="lining-nums" />
        </p>
        <h2 className={STATEMENT}>
          <span className="sr-only">{figure} </span>
          {stand.statement}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <ShareBar name={name} value={stand.value} text={figure} tone={tone} index={0} />
        <ShareBar name="Finland as a whole" value={stand.finland} text={formatPct(stand.finland)} tone="plain" index={1} />
      </div>

      <p className="flex flex-wrap items-start gap-x-3 gap-y-1 text-base leading-6 text-charcoal">
        <StatusLabel status={stand.status}>
          {stand.gapText}
          {relation}
        </StatusLabel>
      </p>

      {/* The main caveat only; the briefing's step 1 adds what a GP is. */}
      <SourceLine sourceId={stand.sourceId} year={stand.year}>
        {mainCaveat(stand.limitation)}
      </SourceLine>
    </div>
  );
}
