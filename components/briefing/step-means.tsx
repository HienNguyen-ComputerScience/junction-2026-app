import type { CSSProperties } from "react";

import { ButtonPanels } from "@/components/briefing/button-panels";
import { HundredGrid } from "@/components/briefing/hundred-grid";
import { SourceDetails, SourceLine } from "@/components/briefing/source-line";
import { Pill, STATEMENT } from "@/components/briefing/ui";
import type { Briefing } from "@/lib/briefing/model";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Step 3, "What it means": the share of the step in focus said the way a director would say it,
 * "about 85 of every 100", on a hundred dots, with a button per year to see how it moved.
 * The change since the first year and the caveat on reading it are always on screen together.
 */
export function StepMeans({ briefing }: { briefing: Briefing }) {
  const { county, meaning } = briefing;

  if (!meaning) {
    return (
      <>
        <Pill className="animate-fade-up">What it means</Pill>
        <h1 data-briefing-heading tabIndex={-1} className={`animate-fade-up ${STATEMENT}`} style={i(1)}>
          No public figure is published for {county.name} on the measured steps, so there is nothing to put into plain
          numbers here.
        </h1>
      </>
    );
  }

  const latest = meaning.years[meaning.years.length - 1];
  return (
    <>
      <Pill className="animate-fade-up">What it means</Pill>
      {meaning.noRedNote ? (
        <p className="animate-fade-up text-base leading-6 text-pretty text-charcoal">{meaning.noRedNote}</p>
      ) : null}

      <HundredGrid
        areaName={county.name}
        things={meaning.things}
        did={meaning.did}
        better={meaning.better}
        years={meaning.years}
      />

      {meaning.changeText ? (
        <p className="animate-fade-up text-base leading-6 text-pretty text-charcoal" style={i(6)}>
          <span className="font-semibold text-forest-ink">Since {meaning.years[0].year}:</span> {meaning.changeText}
          {meaning.caveat ? <> {meaning.caveat}</> : null}
        </p>
      ) : null}

      <div className="animate-fade-up" style={i(7)}>
        <SourceLine sourceId={meaning.sourceId} year={latest.year}>{meaning.limitation}</SourceLine>
      </div>

      <div className="animate-fade-up" style={i(8)}>
        <ButtonPanels
          items={[
            {
              id: "source",
              show: "Show me the source",
              hide: "Hide the source",
              content: <SourceDetails sourceId={meaning.sourceId} year={latest.year} indicatorId={meaning.indicatorId} />,
            },
          ]}
        />
      </div>
    </>
  );
}
