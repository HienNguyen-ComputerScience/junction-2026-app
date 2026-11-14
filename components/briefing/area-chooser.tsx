"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { markArrival } from "@/components/briefing/arrival";
import { PRIMARY_BUTTON } from "@/components/briefing/ui";

/**
 * The start of the briefing: one labelled list of the areas and one button that says what it
 * does. The list opens on the area named by the caller, so a judge with two minutes can press
 * Start straight away; a director picks their own area first.
 */
export function AreaChooser({
  areas,
  defaultId,
}: {
  /** All areas, in alphabetical order. */
  areas: { id: string; name: string }[];
  defaultId: string;
}) {
  const selectId = useId();
  const [areaId, setAreaId] = useState(defaultId);
  const area = areas.find((candidate) => candidate.id === areaId) ?? areas[0];

  return (
    <div className="flex flex-col gap-[21px]">
      <div className="flex flex-col gap-2">
        <label htmlFor={selectId} className="type-heading text-forest-ink">
          Choose your area
        </label>
        <select
          id={selectId}
          value={area.id}
          onChange={(event) => setAreaId(event.target.value)}
          className="h-[3.25rem] w-full max-w-sm rounded-[14px] border border-input bg-cream-paper px-4 text-base font-semibold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
        >
          {areas.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <Link href={`/briefing/${area.id}`} onClick={markArrival} className={`${PRIMARY_BUTTON} w-full sm:w-fit`}>
        Start the briefing for {area.name}
        <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
