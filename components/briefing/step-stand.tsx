import type { CSSProperties, ReactNode } from "react";

import { ButtonPanels } from "@/components/briefing/button-panels";
import { CompareArea } from "@/components/briefing/compare-area";
import { SourceDetails, SourceLine } from "@/components/briefing/source-line";
import { Pill, ShareBar, STATEMENT, StatusLabel } from "@/components/briefing/ui";
import { AnimatedNumber } from "@/components/motion";
import type { Briefing } from "@/lib/briefing/model";
import { formatPct, GP_WAIT_ID } from "@/lib/ranking";

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Step 1, "Where you stand": one figure, the GP wait, counted up to its exact value; the
 * area's bar growing beside Finland's; the area's marker sliding to its place among the areas.
 *
 * `confidence` is a slot beside the figure for a small label on how firmly the figure can be
 * read (the insights branch's confidence grade). Empty until that component is wired in.
 */
export function StepStand({ briefing, confidence }: { briefing: Briefing; confidence?: ReactNode }) {
  const { county, stand } = briefing;
  const tone = stand.status === "red" ? "red" : "amber";
  const figure = formatPct(stand.value);
  // Left end of the line is the lowest share, right end the highest.
  const place = stand.ranked > 1 ? ((stand.ranked - stand.rank) / (stand.ranked - 1)) * 100 : 0;
  const others = stand.areas.filter((area) => area.id !== county.id);
  const defaultOther = stand.best.id === county.id ? others[0] : stand.best;

  return (
    <>
      <Pill className="animate-fade-up">Where you stand</Pill>

      <div className="flex flex-col gap-1">
        <div className="animate-fade-up flex flex-wrap items-end gap-x-5 gap-y-2" style={i(1)}>
          {/* The figure as drawn. The heading below carries it for screen readers. */}
          <p aria-hidden className="font-display text-[3.5rem] leading-[1.05] font-light tracking-[-0.03em] text-forest-ink lining-nums sm:text-[4.625rem]">
            <AnimatedNumber value={stand.value} final={figure} suffix="%" level="loud" play className="lining-nums" />
          </p>
          {confidence ? <div data-slot="briefing-confidence" className="pb-2 text-base leading-6 text-charcoal">{confidence}</div> : null}
        </div>
        <h1
          data-briefing-heading
          tabIndex={-1}
          className={`animate-fade-up ${STATEMENT}`}
          style={i(2)}
        >
          <span className="sr-only">{figure} </span>
          {stand.statement}
        </h1>
      </div>

      <div className="animate-fade-up flex flex-col gap-3" style={i(3)}>
        <ShareBar name={county.name} value={stand.value} text={figure} tone={tone} index={4} />
        <ShareBar name="Finland overall" value={stand.finland} text={formatPct(stand.finland)} tone="plain" index={5} />
      </div>

      <div className="animate-fade-up flex flex-col gap-3" style={i(4)}>
        <p className="flex flex-wrap items-start gap-x-3 gap-y-1 text-base leading-6 text-charcoal">
          <StatusLabel status={stand.status}>
            {stand.gapText}
            {stand.value === stand.finland ? "." : stand.status === "red" ? ", a longer wait." : ", a shorter wait."}
          </StatusLabel>
          <span>{stand.rankText}</span>
        </p>
        {/* The areas in order, one tick each; this area's marker slides to its own place. */}
        <div aria-hidden className="flex flex-col gap-1.5">
          <div className="relative mx-2 h-5">
            {stand.areas.map((area, index) => (
              <span
                key={area.id}
                className="absolute top-1.5 h-2 w-px bg-status-grey"
                style={{ left: `${stand.ranked > 1 ? ((stand.ranked - 1 - index) / (stand.ranked - 1)) * 100 : 0}%` }}
              />
            ))}
            <div className="bf-rank absolute inset-0" style={{ transform: `translateX(${place}%)` }}>
              <span
                className={`absolute top-0 left-0 size-5 -translate-x-1/2 rounded-full border-[3px] border-cream-paper ${
                  tone === "red" ? "bg-status-red" : "bg-status-amber"
                }`}
              />
            </div>
          </div>
          <div className="flex justify-between gap-4 text-base leading-6 text-charcoal">
            <span>Lowest share</span>
            <span className="text-right">Highest share</span>
          </div>
        </div>
      </div>

      <div className="animate-fade-up" style={i(5)}>
        <SourceLine sourceId={stand.sourceId} year={stand.year}>{stand.limitation}</SourceLine>
      </div>

      <div className="animate-fade-up" style={i(6)}>
        <ButtonPanels
          items={[
            {
              id: "source",
              show: "Show me the source",
              hide: "Hide the source",
              content: <SourceDetails sourceId={stand.sourceId} year={stand.year} indicatorId={GP_WAIT_ID} />,
            },
            ...(defaultOther
              ? [
                  {
                    id: "compare",
                    show: "Compare with another area",
                    hide: "Hide the comparison",
                    content: (
                      <CompareArea
                        area={{ id: county.id, name: county.name, value: stand.value }}
                        tone={tone}
                        others={others}
                        defaultId={defaultOther.id}
                        finland={stand.finland}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </>
  );
}
