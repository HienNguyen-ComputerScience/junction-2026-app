import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import "./briefing.css";
import { AreaChooser } from "@/components/briefing/area-chooser";
import { EdgeLines, Pill, STATEMENT, TEXT_LINK } from "@/components/briefing/ui";
import { BRIEFING_STEPS, BRIEFING_STEP_COUNT } from "@/lib/briefing/steps";
import { counties } from "@/lib/data";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import { getRanking } from "@/lib/ranking";

export const metadata: Metadata = {
  title: "Guided briefing | FirstLine",
  description:
    "A short guided briefing on early cancer care in one area of Finland: where it stands, where the delay is, and what to do.",
};

const i = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * The start of the guided briefing: choose the area, press Start. The list opens on the area
 * with the highest share of late GP visits, so the page is never an empty form.
 */
export default function BriefingStartPage() {
  const areas = [...counties]
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((county) => ({ id: county.id, name: county.name }));
  const defaultId = getRanking()[0]?.county.id ?? areas[0].id;

  return (
    <main className={`bf-root ${MOTION_LOUD_CLASS} bg-keylime-wash px-4 py-6 sm:px-6 sm:py-10`}>
      <div className="relative mx-auto flex w-full max-w-[60rem] flex-col overflow-hidden rounded-[14px] border border-border-mist bg-cream-paper lg:min-h-[41rem]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-[21px] pt-[21px] sm:px-[42px] sm:pt-[28px]">
          <p className="text-base leading-6 font-semibold text-forest-ink">Guided briefing</p>
          <Link href="/compare" className={TEXT_LINK}>
            Skip the briefing: full table of all areas
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col">
          <EdgeLines className="absolute top-[13.5rem] left-0 max-lg:hidden" />
          <div className="flex flex-1 flex-col gap-[21px] px-[21px] pt-[28px] pb-[42px] sm:px-[42px] lg:pr-[84px] lg:pl-[126px]">
            <Pill className="animate-fade-up">{BRIEFING_STEP_COUNT} steps</Pill>
            <h1 className={`animate-fade-up ${STATEMENT}`} style={i(1)}>
              Early cancer care in your area, brought to you one piece at a time: where you stand, where the delay is,
              and what to do about it.
            </h1>

            <ol className="animate-fade-up grid gap-x-8 gap-y-1.5 text-base leading-6 text-charcoal sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3" style={i(2)}>
              {BRIEFING_STEPS.map((step) => (
                <li key={step.id} className="flex gap-2.5">
                  <span className="w-5 shrink-0 font-semibold text-forest-ink tabular-nums">{step.number}.</span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>

            <div className="animate-fade-up" style={i(3)}>
              <AreaChooser areas={areas} defaultId={defaultId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
