import type { CSSProperties } from "react";

import { ActionChooser } from "@/components/briefing/action-chooser";
import { Pill, STATEMENT } from "@/components/briefing/ui";
import { SourceChip } from "@/components/source-chip";
import type { Briefing } from "@/lib/briefing/model";
import { briefingHref } from "@/lib/briefing/steps";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

const COUNT_WORD = ["No", "One", "Two", "Three"];

/**
 * Step 4, "What to do": the recommended actions for the step where the delay is,
 * all three named at once in three short rows; a button on each opens its first step.
 * The actions and their order come from lib/act (the same rule as the act page).
 */
export function StepDo({ briefing }: { briefing: Briefing }) {
  const { county, actions, anyRed } = briefing;
  const count = COUNT_WORD[actions.length] ?? String(actions.length);
  const things = actions.length === 1 ? "action" : "actions";

  return (
    <>
      <Pill className="animate-fade-up">What to do</Pill>
      <h1
        data-briefing-heading
        tabIndex={-1}
        className={`animate-fade-up ${STATEMENT}`}
        style={i(1)}
      >
        {actions.length === 0
          ? `No action is recommended for ${county.name}: no measured step has a figure to act on.`
          : anyRed
            ? `${count} ${things} for ${county.name}.`
            : `${count} ${things} that ${actions.length === 1 ? "helps" : "help"} ${county.name} keep its level.`}
      </h1>

      {actions.length > 0 ? (
        <ActionChooser
          changeHref={briefingHref(county.id, "change")}
          actions={actions.map((action) => ({
            id: action.id,
            number: action.number,
            title: action.title,
            owner: action.owner,
            firstStep: action.firstStep,
            precedent: action.precedent,
            roadmap: action.measure
              ? {
                  label: `National cancer strategy roadmap, measure ${action.measure.measure_id} (Goal ${action.measure.goal}: ${action.measure.goal_title})`,
                  funding: action.measure.funding,
                }
              : null,
          }))}
          sourceChips={actions.map((action) => (
            <SourceChip key={action.id} sourceId={action.sourceId} />
          ))}
          roadmapChips={actions.map((action) =>
            action.measure ? <SourceChip key={action.id} sourceId={action.measure.source_id} /> : null,
          )}
        />
      ) : null}

      <p className="animate-fade-up text-base leading-6 text-pretty text-charcoal" style={i(5)}>
        Chosen for the step {anyRed ? "where the delay is" : "closest to Finland overall"}, by a fixed rule from a checked
        evidence table. Proposals for service planning, not medical advice.
      </p>
    </>
  );
}
