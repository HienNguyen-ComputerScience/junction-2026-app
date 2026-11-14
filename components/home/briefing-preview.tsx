import { SourceLine } from "@/components/briefing/source-line";
import { Pill, STATEMENT, StatusLabel } from "@/components/briefing/ui";
import { AnimatedNumber, CaveatNote } from "@/components/motion";
import type { BriefingStand } from "@/lib/briefing/model";
import { BRIEFING_STEP_COUNT, BRIEFING_STEPS } from "@/lib/briefing/steps";
import { formatPct } from "@/lib/ranking";

/**
 * Step 1 of the guided briefing ("Where you stand") as the home page's first card, from the
 * briefing's own model (`buildBriefing(id).stand`): the figure in the briefing's type, its
 * statement, Finland's figure in one status line, the source and the one main caveat.
 *
 * Left to the briefing itself: the bars, the rank line and the two in-step buttons. The statement
 * is an h2 (the home page has its own h1) and the count is the site's quiet one.
 */
export function BriefingPreview({ stand }: { stand: BriefingStand }) {
  const figure = formatPct(stand.value);
  const finland = formatPct(stand.finland);
  const status =
    stand.value === stand.finland
      ? `Same as Finland overall: ${finland}.`
      : `${stand.gapText} (${finland})${stand.status === "red" ? ", a longer wait." : ", a shorter wait."}`;

  return (
    <div className="flex flex-col gap-5">
      <Pill>
        Step 1 of {BRIEFING_STEP_COUNT} · {BRIEFING_STEPS[0].label}
      </Pill>

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

      <StatusLabel status={stand.status}>{status}</StatusLabel>

      {/* The source and the one main caveat, always visible; the rest of the limitation is behind "Why?". */}
      <div className="flex flex-col gap-3">
        <SourceLine sourceId={stand.sourceId} year={stand.year} />
        <CaveatNote short="counts visits, not people">{stand.limitation}</CaveatNote>
      </div>
    </div>
  );
}
