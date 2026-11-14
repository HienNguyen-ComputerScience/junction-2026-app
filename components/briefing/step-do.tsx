import type { CSSProperties } from "react";

import { ActionChooser } from "@/components/briefing/action-chooser";
import { Pill, STATEMENT } from "@/components/briefing/ui";
import { SourceChip } from "@/components/source-chip";
import type { Briefing } from "@/lib/briefing/model";
import { briefingHref } from "@/lib/briefing/steps";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

const COUNT_WORD = ["No", "One", "Two", "Three"];

/**
 * Step 4, "What to do on Monday": the recommended actions for the step where the delay is,
 * all visible, each with who is responsible, the first step and where it was tried.
 * The actions and their order come from lib/act (the same rule as the act page).
 */
export function StepDo({ briefing }: { briefing: Briefing }) {
  const { county, actions, anyRed } = briefing;
  const count = COUNT_WORD[actions.length] ?? String(actions.length);
  const things = actions.length === 1 ? "thing" : "things";

  return (
    <>
      <Pill className="bf-rise">What to do on Monday</Pill>
      <h1
        data-briefing-heading
        tabIndex={-1}
        className={`bf-rise ${STATEMENT}`}
        style={i(1)}
      >
        {actions.length === 0
          ? `No action is recommended for ${county.name}: no measured step has a figure to act on.`
          : anyRed
            ? `${count} ${things} ${county.name} can start on Monday, chosen for the step where the delay is.`
            : `${count} ${things} that help ${county.name} keep its level, chosen for the step closest to Finland's level.`}
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

      <p className="bf-rise text-base leading-6 text-pretty text-charcoal" style={i(5)}>
        These are proposals for service planning, picked by a fixed rule from a checked evidence table. They are not
        medical advice.
      </p>
    </>
  );
}
