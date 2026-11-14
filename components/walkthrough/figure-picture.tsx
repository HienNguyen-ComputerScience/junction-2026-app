"use client";

import { Check } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { AnimatedBar, AnimatedNumber } from "@/components/motion";
import type { GradeLevel } from "@/lib/insights";
import type { AreaFigure } from "@/lib/walkthrough/model";

/**
 * The picture beside "What one figure really counts": one area's GP-wait share, counted up, with
 * Finland's level, then what it counts and what it does not. Parts marked data-at appear as the
 * text beside them is reached (components/walkthrough/story.tsx). The area can be changed.
 */
export function FigurePicture({
  areas,
  finland,
  year,
  glyphs,
}: {
  areas: AreaFigure[];
  /** The insights grade shapes, drawn on the server (GradeGlyph), so no grade data ships to the browser. */
  glyphs: Record<GradeLevel, ReactNode>;
  finland: { value: number; text: string } | null;
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
          of non-urgent GP visits in <strong className="font-semibold">{area.name}</strong> came more than a week
          after people asked ({year}).
        </p>
        {area.grade ? (
          <p className="flex items-start gap-2 text-base leading-6 text-charcoal">
            <span className="mt-[5px] text-forest-ink">{glyphs[area.grade.level]}</span>
            <span>
              <strong className="font-semibold text-forest-ink">{area.grade.label}.</strong> {area.grade.reason}
            </span>
          </p>
        ) : null}
      </div>

      {finland ? (
        <div className="flex flex-col gap-2">
          <AnimatedBar
            key={area.id}
            value={area.value}
            marker={finland.value}
            markerLabel={`Finland ${finland.text}`}
            tone={area.value > finland.value ? "red" : "slate"}
            label={`${area.name} ${area.text}, Finland ${finland.text}`}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2" data-at="1">
        <Counted title="Counted: visits">Each kept appointment counts once.</Counted>
        <NotCounted title="Not counted: people">One person can make several visits, so this is not a share of people.</NotCounted>
      </div>
      <div className="grid gap-3 sm:grid-cols-2" data-at="2">
        <Counted title="Counted: every non-urgent GP visit">Whatever the reason for the visit, possible cancer included.</Counted>
        <NotCounted title="Not published: cancer-related visits alone">No figure picks out visits where cancer was suspected.</NotCounted>
      </div>
    </div>
  );
}

function Counted({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-cream-paper p-4">
      <p className="flex items-center gap-2 text-base leading-6 font-semibold text-forest-ink">
        <Check aria-hidden className="size-5 shrink-0" strokeWidth={2} />
        {title}
      </p>
      <p className="text-base leading-6 text-charcoal">{children}</p>
    </div>
  );
}

function NotCounted({ title, children }: { title: string; children: string }) {
  return (
    <div className="htr-hatch flex flex-col gap-1 rounded-[14px] border border-dashed border-status-grey p-4">
      <p className="text-base leading-6 font-semibold text-forest-ink">{title}</p>
      <p className="text-base leading-6 text-charcoal">{children}</p>
    </div>
  );
}
