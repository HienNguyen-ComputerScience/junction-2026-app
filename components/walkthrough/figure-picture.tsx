"use client";

import { Check } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { AnimatedNumber, Disclosure } from "@/components/motion";
import type { GradeLevel } from "@/lib/insights";
import type { AreaFigure } from "@/lib/walkthrough/model";

/**
 * The picture beside "What one figure really counts": one area's GP-wait share, counted up, then
 * what it counts and what it does not. Parts marked data-story-step are picked out as the
 * text beside them is read (ScrollStory in components/motion). The area can be changed.
 */
export function FigurePicture({
  areas,
  year,
  glyphs,
  source,
}: {
  areas: AreaFigure[];
  /** The insights grade shapes, drawn on the server (GradeGlyph), so no grade data ships to the browser. */
  glyphs: Record<GradeLevel, ReactNode>;
  /** The figure's source chip, drawn on the server. */
  source: ReactNode;
  year: number;
}) {
  const selectId = useId();
  const [areaId, setAreaId] = useState(areas[0]?.id ?? "");
  const area = areas.find((candidate) => candidate.id === areaId) ?? areas[0];
  if (!area) return null;

  return (
    <div className="flex flex-col gap-6 rounded-[14px] bg-keylime-wash p-7 sm:p-10">
      <div className="flex flex-col gap-2" data-print="hide">
        <label htmlFor={selectId} className="text-base font-semibold text-forest-ink">
          Choose another area
        </label>
        <select
          id={selectId}
          value={area.id}
          onChange={(event) => setAreaId(event.target.value)}
          className="min-h-12 w-full max-w-[22rem] rounded-[14px] border border-input bg-cream-paper px-3 text-base text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
        >
          {areas.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name} ({candidate.text})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2" aria-live="polite">
        <p className="numeral text-6xl leading-none text-forest-ink sm:text-7xl">
          {/* Re-keyed on the area, so a new choice counts up to its own exact value. */}
          <AnimatedNumber key={area.id} value={area.value} final={area.text} decimals={1} level="loud" />
        </p>
        <p className="text-base leading-6 text-charcoal">
          of non-urgent GP (health-centre doctor) visits in <strong className="font-semibold">{area.name}</strong> came
          more than a week after people asked, {year}.
        </p>
      </div>
      {area.grade ? (
        // The caveat in a few words; the reason behind "Why?". Re-keyed so it closes on a new area.
        <div key={`grade-${area.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[14px] bg-cream-paper px-4 py-2">
          <span className="flex items-center gap-2 text-base leading-6 font-semibold text-forest-ink">
            {glyphs[area.grade.level]}
            {area.grade.label}
          </span>
          <Disclosure show="Why?" hide="Hide why" tone="quiet" className="basis-full sm:basis-auto">
            <p className="pb-2 text-base leading-6 text-charcoal">{area.grade.reason}</p>
          </Disclosure>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2" data-story-step="0">
        <Counted>Counted: visits</Counted>
        <NotCounted>Not counted: people</NotCounted>
      </div>
      <div className="grid gap-3 sm:grid-cols-2" data-story-step="1">
        <Counted>Counted: every non-urgent GP visit</Counted>
        <NotCounted>Not published: cancer-related visits alone</NotCounted>
      </div>
      {source}
    </div>
  );
}

function Counted({ children }: { children: string }) {
  return (
    <p className="flex items-start gap-2 rounded-[14px] bg-cream-paper p-4 text-base leading-6 font-semibold text-forest-ink">
      <Check aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
      {children}
    </p>
  );
}

function NotCounted({ children }: { children: string }) {
  return (
    <p className="htr-hatch rounded-[14px] border border-dashed border-status-grey p-4 text-base leading-6 font-semibold text-forest-ink">
      {children}
    </p>
  );
}
