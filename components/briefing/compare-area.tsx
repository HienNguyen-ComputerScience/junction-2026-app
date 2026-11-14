"use client";

import { useId, useState } from "react";

import { ShareBar } from "@/components/briefing/ui";

type Area = { id: string; name: string; value: number };

const pct = (value: number) => `${value.toFixed(1)}%`;
const diff1 = (a: number, b: number) => Math.round((Number(a.toFixed(1)) - Number(b.toFixed(1))) * 10) / 10;

/**
 * "Compare with another area": a labelled list of the other areas and two bars, this area's
 * and the chosen one's. The data has no measure of which areas are alike, so nothing is called
 * "similar": the list opens on the area with the lowest share (or, for that area itself, the
 * highest) and says so. All figures are the same published indicator and year as the step's.
 */
export function CompareArea({
  area,
  tone,
  others,
  defaultId,
  finland,
}: {
  area: Area;
  tone: "red" | "amber";
  /** Every other ranked area, highest share first. */
  others: Area[];
  defaultId: string;
  finland: number;
}) {
  const selectId = useId();
  const [otherId, setOtherId] = useState(defaultId);
  const other = others.find((candidate) => candidate.id === otherId) ?? others[0];
  if (!other) return null;

  const lowest = others[others.length - 1];
  const highest = others[0];
  const diff = diff1(other.value, area.value);
  const place =
    other.id === lowest.id && other.value < area.value
      ? " It has the lowest share of all the areas."
      : other.id === highest.id && other.value > area.value
        ? " It has the highest share of all the areas."
        : "";
  const sentence =
    diff === 0
      ? `${other.name} is level with ${area.name}.${place}`
      : `${other.name} is ${Math.abs(diff).toFixed(1)} percentage points ${diff < 0 ? "lower" : "higher"} than ${area.name}.${place}`;

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex flex-col gap-2">
        <label htmlFor={selectId} className="type-heading text-forest-ink">
          Compare {area.name} with
        </label>
        <select
          id={selectId}
          value={other.id}
          onChange={(event) => setOtherId(event.target.value)}
          className="h-[3.25rem] w-full max-w-sm rounded-[14px] border border-input bg-cream-paper px-4 text-base font-semibold text-charcoal outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
        >
          {[...others]
            .sort((a, b) => a.name.localeCompare(b.name, "en"))
            .map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
        </select>
      </div>
      {/* Re-keyed on the chosen area so its bar grows to its own length on every choice. */}
      <div key={other.id} className="flex flex-col gap-3">
        <ShareBar name={area.name} value={area.value} text={pct(area.value)} tone={tone} />
        <ShareBar
          name={other.name}
          value={other.value}
          text={pct(other.value)}
          tone={other.value > finland ? "red" : "amber"}
          index={1}
        />
      </div>
      <p aria-live="polite" className="text-base leading-6 text-pretty text-charcoal">
        {sentence} Same figure, same year, same source as above. Red: above Finland&apos;s level ({pct(finland)}).
      </p>
    </div>
  );
}
