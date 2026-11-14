import { ChangeView } from "@/components/briefing/change-view";
import { Pill, STATEMENT } from "@/components/briefing/ui";
import { SourceChip } from "@/components/source-chip";
import type { Briefing } from "@/lib/briefing/model";
import { formatPct } from "@/lib/ranking";

/**
 * Step 5, "What it could change". The server hands the client view plain text and the source
 * chips; see ChangeView for why a result elsewhere and the area's own target pace are kept apart.
 */
export function StepChange({ briefing }: { briefing: Briefing }) {
  const { county, actions } = briefing;

  if (actions.length === 0) {
    return (
      <>
        <Pill className="animate-fade-up">What it could change</Pill>
        <h1 data-briefing-heading tabIndex={-1} className={`animate-fade-up ${STATEMENT}`}>
          No action is recommended for {county.name}, so there is no result from elsewhere to show.
        </h1>
      </>
    );
  }

  return (
    <>
      <Pill className="animate-fade-up">What it could change</Pill>
      <ChangeView
        areaName={county.name}
        targetYears={briefing.targetYears}
        actions={actions.map((action) => ({
          id: action.id,
          number: action.number,
          title: action.title,
          precedent: action.precedent,
          result: action.result,
          limitations: action.limitations,
          watch: action.watch
            ? {
                name: action.watch.name,
                direction: action.watch.direction,
                value: formatPct(action.watch.value),
                finland: formatPct(action.watch.finland),
                year: action.watch.year,
                target: action.watch.target
                  ? {
                      levelName: action.watch.target.levelName,
                      paces: action.watch.target.paces,
                    }
                  : null,
              }
            : null,
        }))}
        resultChips={actions.map((action) => (
          <SourceChip key={action.id} sourceId={action.sourceId} />
        ))}
        watchChips={actions.map((action) =>
          action.watch ? <SourceChip key={action.id} sourceId={action.watch.sourceId} year={action.watch.year} /> : null,
        )}
      />
    </>
  );
}
