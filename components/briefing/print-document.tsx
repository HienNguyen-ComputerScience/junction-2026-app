import type { ReactNode } from "react";

import type { Briefing } from "@/lib/briefing/model";
import { BRIEFING_STEPS } from "@/lib/briefing/steps";
import { getDataGaps, getSource } from "@/lib/data";
import { formatPct } from "@/lib/ranking";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A source named in full where it is used on paper, since a chip cannot be pressed there. */
function sourceName(sourceId: string | null): string | null {
  return sourceId ? (getSource(sourceId)?.name ?? null) : null;
}

function Section({ number, title, children }: { number: number; title?: string; children: ReactNode }) {
  const step = BRIEFING_STEPS[number - 1];
  return (
    <section className="mt-6 border-t border-[#b6b6b0] pt-4">
      <h2 className="font-sans text-[13pt] leading-snug font-semibold tracking-normal text-[#0f3e17]">
        {step.number}. {title ?? step.label}
      </h2>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Source({ id, year }: { id: string | null; year?: number }) {
  const name = sourceName(id);
  if (!name) return null;
  return (
    <p className="text-[10pt] leading-snug">
      Source: {name}
      {year === undefined ? "" : `, ${year}`}.
    </p>
  );
}

/**
 * The whole briefing for one area as one document, for paper and PDF. It is in the page from
 * the start but only shown when printing, where it replaces the on-screen card: every step
 * written out in its final state, all actions open, every source named in full with its
 * address. It reads the same model as the screen, so the two cannot disagree.
 */
export function BriefingPrint({ briefing }: { briefing: Briefing }) {
  const { county, stand, pathway, meaning, actions } = briefing;
  const retrieved = briefing.sources[0]?.retrieved;
  const afterReferral = getDataGaps(county.id).filter((gap) => gap.step === "diagnosis" || gap.step === "treatment");

  return (
    <article className="bf-print hidden bg-white px-0 text-[11pt] leading-normal text-[#222222] print:block">
      <p className="text-[10pt] font-semibold tracking-[0.08em] text-[#0f3e17] uppercase">FirstLine briefing</p>
      <h1 className="type-page mt-1 text-[22pt] text-[#0f3e17]">Early cancer care in {county.name}</h1>
      <p className="mt-2 text-[10pt] leading-snug">
        {county.name_fi}. Figures for {briefing.year}
        {retrieved ? `, copied from the public sources on ${DATE.format(new Date(`${retrieved}T00:00:00Z`))}` : ""}.
        Decision support for service planning. Not medical advice. No patient data.
      </p>

      <Section number={1}>
        <p>
          <strong>{formatPct(stand.value)}</strong> {stand.statement} Finland as a whole: {formatPct(stand.finland)}.
        </p>
        <p>
          {stand.gapText}. {stand.rankText}
        </p>
        <p>{stand.limitation}</p>
        <Source id={stand.sourceId} year={stand.year} />
      </Section>

      <Section number={2}>
        <p>
          <strong>{pathway.lede}</strong>
        </p>
        {pathway.stages.map((stage) => (
          <div key={stage.stage}>
            <p>
              <strong>
                Step {stage.number}: {stage.label}.
              </strong>{" "}
              {stage.statusLabel}
              {stage.isBreak ? " (the delay is here)" : ""}. {stage.figures}
            </p>
            <Source id={stage.sourceId} year={stage.year} />
          </div>
        ))}
        {afterReferral.map((gap) => (
          <div key={gap.id}>
            <p>
              <strong>After the referral, not published by area.</strong> {gap.missing}: {gap.today}
            </p>
            <Source id={gap.source_id} />
          </div>
        ))}
      </Section>

      <Section number={3}>
        {meaning ? (
          <>
            {meaning.noRedNote ? <p>{meaning.noRedNote}</p> : null}
            {[...meaning.years].reverse().map((entry) => (
              <p key={entry.year}>
                In {entry.year}, about {Math.round(entry.value)} of every 100 {meaning.things} in {county.name} {meaning.did}{" "}
                ({formatPct(entry.value)}).
                {entry.finland === null
                  ? ""
                  : ` Across Finland: about ${Math.round(entry.finland)} (${formatPct(entry.finland)}).`}
              </p>
            ))}
            {meaning.changeText ? (
              <p>
                Since {meaning.years[0].year}: {meaning.changeText} {meaning.caveat ?? ""}
              </p>
            ) : null}
            <p>{meaning.limitation}</p>
            <Source id={meaning.sourceId} />
          </>
        ) : (
          <p>No public figure is published for {county.name} on the measured steps.</p>
        )}
      </Section>

      <Section number={4}>
        {actions.length === 0 ? <p>No action is recommended: no measured step has a figure to act on.</p> : null}
        {actions.map((action) => (
          <div key={action.id} className="mt-1 break-inside-avoid">
            <p>
              <strong>
                Action {action.number}: {action.title}
              </strong>{" "}
              ({action.stageLabel})
            </p>
            <p>First step: {action.firstStep}</p>
            <p>Responsible: {action.owner}</p>
            <p>Where it was tried: {action.precedent}</p>
            {action.measure ? (
              <p>
                National measure and funding: roadmap measure {action.measure.measure_id} (Goal {action.measure.goal}:{" "}
                {action.measure.goal_title}). {action.measure.funding}
              </p>
            ) : null}
            <Source id={action.sourceId} />
          </div>
        ))}
      </Section>

      <Section number={5}>
        {actions.map((action) => (
          <div key={action.id} className="mt-1 break-inside-avoid">
            <p>
              <strong>Action {action.number}, result where it was tried:</strong> {action.result}
            </p>
            <p>
              This is a result elsewhere, not a forecast for {county.name}. {action.limitations}
            </p>
            <Source id={action.sourceId} />
          </div>
        ))}
        {[...new Map(actions.flatMap((action) => (action.watch ? [[action.watch.indicatorId, action.watch] as const] : []))).values()].map(
          (watch) => (
            <div key={watch.indicatorId} className="mt-1 break-inside-avoid">
              <p>
                <strong>The published figure to watch:</strong> {watch.name} (Sotkanet {watch.indicatorId}; {watch.direction}).{" "}
                {county.name} in {watch.year}: {formatPct(watch.value)}. Finland: {formatPct(watch.finland)}.
              </p>
              {watch.target ? (
                <p>
                  To reach {watch.target.levelName}:{" "}
                  {watch.target.paces
                    .map((pace) => `by the end of ${pace.year}, ${pace.perYear.toFixed(1)} percentage points better each year`)
                    .join("; ")}
                  . This is arithmetic on the published figures, an even pace, and assumes nothing about what any action
                  will achieve.
                </p>
              ) : (
                <p>This figure sets no target here: the aim is to hold the level.</p>
              )}
              <Source id={watch.sourceId} year={watch.year} />
            </div>
          ),
        )}
        <p>
          No estimate of any action&apos;s effect in {county.name} is given: no published study measures these actions on
          these figures.
        </p>
      </Section>

      <Section number={6} title="The action plan as a file">
        <p>
          The action plan for {county.name} (actions, sources, limits, and blank lines for names, dates and cost)
          downloads as a Word or Excel file from {briefing.actPath} on the FirstLine site. The full figures are at /county/{county.id} and the table of all{" "}
          {stand.ranked} areas at /compare.
        </p>
      </Section>

      <section className="mt-6 border-t border-[#b6b6b0] pt-4">
        <h2 className="font-sans text-[13pt] leading-snug font-semibold tracking-normal text-[#0f3e17]">Sources</h2>
        <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-[10pt] leading-snug">
          {briefing.sources.map((source) => (
            <li key={source.source_id}>
              {source.name}. {source.publisher}. <span className="break-all">{source.url}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
