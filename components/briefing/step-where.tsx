import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

import { ButtonPanels } from "@/components/briefing/button-panels";
import { Pill, STATEMENT, StatusLabel } from "@/components/briefing/ui";
import { SourceChip } from "@/components/source-chip";
import type { Briefing, BriefingStage } from "@/lib/briefing/model";
import { getDataGaps, type Stage } from "@/lib/data";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

const AFTER_LABEL: Record<string, string> = { diagnosis: "Diagnosis", treatment: "Start of treatment" };

/** One step of the way to care as a tile: its number, its name and its status in words. */
function StageTile({ stage, index, confidence }: { stage: BriefingStage; index: number; confidence?: ReactNode }) {
  const measured = stage.status !== "no_data";
  return (
    // The cream under the tint keeps the tile opaque, so the line of the way stays behind it.
    <li className="animate-fade-up rounded-[14px] bg-cream-paper" style={i(index + 2)}>
      <div
        className={cn(
          "relative flex h-full flex-col gap-2.5 overflow-hidden rounded-[14px] p-[21px]",
          stage.isBreak ? "bg-status-red-soft" : measured ? "bg-keylime-wash" : "border border-dashed border-status-grey",
        )}
      >
      {/* The mark of the step that is worse than Finland: a bar drawn across the top, then the words. */}
      {stage.isBreak ? (
        <span aria-hidden className="animate-line-in absolute inset-x-0 top-0 h-1.5 bg-status-red" style={i(6)} />
      ) : null}
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-base font-semibold",
            measured ? "bg-forest-ink text-cream-paper" : "border border-dashed border-status-grey text-charcoal",
          )}
        >
          {stage.number}
        </span>
        <h2 className="type-heading text-forest-ink">
          <span className="sr-only">Step {stage.number} of the way to care: </span>
          {stage.label}
        </h2>
      </span>
      <StatusLabel status={stage.status}>{stage.statusLabel}</StatusLabel>
      {stage.note ? <p className="text-base leading-6 text-pretty text-charcoal">{stage.note}</p> : null}
      {stage.isBreak ? (
        <p className="bf-pop text-base leading-6 font-semibold text-status-red-ink" style={{ "--d": 1100 } as CSSProperties}>
          The delay is here.
        </p>
      ) : null}
      {confidence ? <div data-slot="briefing-confidence" className="text-base leading-6 text-charcoal">{confidence}</div> : null}
      </div>
    </li>
  );
}

/**
 * Step 2, "Where the delay is": the three steps from asking for a GP to reaching a specialist,
 * drawn in order, with the one that is worse than Finland marked. A step without a public
 * figure is shown as that, in words, and counted in the sentence under the row.
 *
 * `confidence` is a slot per step, under its status, for the insights branch's confidence grade.
 */
export function StepWhere({
  briefing,
  confidence,
}: {
  briefing: Briefing;
  confidence?: Partial<Record<Stage, ReactNode>>;
}) {
  const { county, pathway } = briefing;
  const missing = pathway.stages.filter((stage) => stage.finding !== null);
  const afterReferral = getDataGaps(county.id).filter((gap) => gap.step === "diagnosis" || gap.step === "treatment");

  const missingLine =
    missing.length === 0
      ? null
      : missing.length === 1
        ? `Step ${missing[0].number} cannot be judged in any area of Finland: nobody publishes a figure for it. That is a finding in itself.`
        : `Steps ${missing.map((stage) => stage.number).join(" and ")} cannot be judged for ${county.name}: no public figure exists for them. That is a finding in itself.`;

  return (
    <>
      <Pill className="animate-fade-up">Where the delay is</Pill>
      <h1
        data-briefing-heading
        tabIndex={-1}
        className={`animate-fade-up ${STATEMENT}`}
        style={i(1)}
      >
        {pathway.lede}
      </h1>

      <div className="relative">
        {/* The way itself: one line drawn from the first step to the last, behind the tiles. */}
        <span aria-hidden className="animate-line-in absolute top-[2.3125rem] right-6 left-6 h-px bg-forest-ink max-sm:hidden" style={i(2)} />
        <ol className="relative grid gap-3 sm:grid-cols-3">
          {pathway.stages.map((stage, index) => (
            <StageTile key={stage.stage} stage={stage} index={index} confidence={confidence?.[stage.stage]} />
          ))}
        </ol>
      </div>

      {missingLine ? (
        <p className="animate-fade-up text-base leading-6 text-pretty text-charcoal" style={i(6)}>
          {missingLine}
        </p>
      ) : null}

      <div className="animate-fade-up" style={i(7)}>
        <ButtonPanels
          items={[
            {
              id: "figures",
              show: "Show the figures and their sources",
              hide: "Hide the figures",
              content: (
                <div className="flex flex-col gap-[21px]">
                  <h2 className="type-heading text-forest-ink">The figures behind the three steps, {briefing.year}</h2>
                  <ol className="flex flex-col gap-[14px]">
                    {pathway.stages.map((stage) => (
                      <li key={stage.stage} className="flex flex-col gap-1.5 text-base leading-6 text-charcoal">
                        <span className="font-semibold">
                          Step {stage.number}: {stage.label}
                        </span>
                        <span className="text-pretty">{stage.figures}</span>
                        {stage.sourceId ? (
                          <span className="inline-flex items-center gap-2 font-semibold text-forest-ink">
                            Source: <SourceChip sourceId={stage.sourceId} year={stage.year} />
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  {afterReferral.length > 0 ? (
                    <div className="flex flex-col gap-2 text-base leading-6 text-charcoal">
                      <h3 className="font-semibold">After the referral: not published by area</h3>
                      <ul className="flex flex-col gap-2">
                        {afterReferral.map((gap) => (
                          <li key={gap.id} className="text-pretty">
                            <span className="font-semibold">{AFTER_LABEL[gap.step] ?? gap.step}.</span> {gap.missing}: {gap.today}{" "}
                            <SourceChip sourceId={gap.source_id} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ),
            },
            {
              id: "words",
              show: "Explain these three steps",
              hide: "Hide the explanation",
              content: (
                <div className="flex flex-col gap-[14px]">
                  <h2 className="type-heading text-forest-ink">The three steps in plain words</h2>
                  <ol className="flex flex-col gap-[14px]">
                    {pathway.stages.map((stage) => (
                      <li key={stage.stage} className="flex flex-col gap-1 text-base leading-6 text-charcoal">
                        <span className="font-semibold">
                          Step {stage.number}: {stage.label}
                        </span>
                        <span className="text-pretty">{stage.explains}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-base leading-6 text-pretty text-charcoal">
                    The colours compare {county.name} with Finland as a whole in {briefing.year}, not with a clinical
                    standard.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
