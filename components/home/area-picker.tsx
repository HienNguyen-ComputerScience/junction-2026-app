"use client";

import { cn } from "cn";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { markArrival } from "@/components/briefing/arrival";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/briefing/ui";
import { FinlandMap, type FinlandMapArea } from "@/components/map/finland-map";
import { Reveal } from "@/components/motion";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { TextLink } from "@/components/ui/text-link";
import { BRIEFING_STEP_COUNT, BRIEFING_STEPS, briefingHref } from "@/lib/briefing/steps";
import type { GapStatus } from "@/lib/data";

/** One area as the picker needs it. Plain data: everything with a number is pre-rendered. */
export type PickerArea = {
  id: string;
  name: string;
  /** The one-line reason (components/pathway/wording): where the delay sits and how it moved. */
  verdict: string;
  /** The area's overall status: the one the map colours it by. */
  status: GapStatus;
  /** Key of the area's first recommended action in `actions`, or null. */
  actionId: string | null;
};

type Props = {
  /** All areas, in the order of the select. */
  areas: PickerArea[];
  mapAreas: FinlandMapArea[];
  /** Shown before anyone picks: the area named by ?area= on this request, else the one that leads the ranking. */
  defaultId: string;
  year: number;
  totalAreas: number;
  /** Per area: the briefing's step 1 as a card (absent when the area has no briefing). Server-rendered. */
  previews: Record<string, ReactNode>;
  /** One short line under an area's verdict (a recording caveat), where it has one. */
  notes: Record<string, ReactNode>;
  /** Per area: the first recommended action, pre-rendered (title and First step), linking to it on the act page. Keyed by PickerArea.actionId (the area id). */
  actions: Record<string, ReactNode>;
  /** Per area: "The three steps" status row, pre-rendered. */
  steps: Record<string, ReactNode>;
  /** The source chips of the map's colours, shown on one row at the bottom of the map card. */
  mapChips: ReactNode[];
  /** What the colours are and the map's source, behind "How the map is coloured". */
  mapNote: string;
  /** The key's states: those that appear on the map, and the hatch (Åland). */
  mapKey: ("red" | "amber" | "no_data")[];
};

// The selection is mirrored in the URL (?area=), read after hydration so the page stays static.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const readUrlArea = () => new URLSearchParams(window.location.search).get("area");
const noUrlArea = () => null;

/**
 * The home page. First screen: the guided briefing's opening, one tinted card with the area list
 * and the one filled button ("Start the 2-minute briefing for …"), beside a preview of the
 * briefing's step 1 for that area with its own "Next" button. Below a divider, "Or look through
 * the data yourself": the map, the area's three steps, the first recommended action and plain
 * links to the other pages, revealed quietly on scroll.
 *
 * Phone: the list, the Start button, the step-1 card, then the rest.
 */
export function AreaPicker({ areas, mapAreas, defaultId, year, totalAreas, previews, notes, actions, steps, mapChips, mapNote, mapKey }: Props) {
  const selectId = useId();
  const answerRef = useRef<HTMLDivElement>(null);
  const urlArea = useSyncExternalStore(subscribe, readUrlArea, noUrlArea);
  const [picked, setPicked] = useState<string | null>(null);

  const byId = (id: string | null) => areas.find((area) => area.id === id);
  const area = byId(picked) ?? byId(urlArea) ?? byId(defaultId) ?? areas[0];
  const preview = previews[area.id] ?? null;
  // An area the briefing has no step 1 for (no published GP figure) starts at the briefing's own chooser.
  const startHref = preview ? briefingHref(area.id) : "/briefing";

  function choose(id: string, fromMap: boolean) {
    if (!byId(id)) return;
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("area", id);
    window.history.replaceState(null, "", url);
    const name = byId(id)?.name;
    if (name) document.title = `${name} · FirstLine`;
    // On a phone the area's answer sits above the map: bring it back into view.
    const top = answerRef.current?.getBoundingClientRect().top ?? 0;
    if (fromMap && top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      answerRef.current?.scrollIntoView({
        block: "start",
        behavior: reduce ? "auto" : "smooth",
      });
    }
  }

  return (
    <>
      {/* First screen: the briefing's opening. */}
      <section
        aria-label="Guided briefing"
        className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start"
      >
        <FramePanel padding="none" className="flex flex-col gap-5 p-5 sm:p-7 print:hidden">
          <div className="flex flex-col gap-2">
            <label htmlFor={selectId} className="type-heading text-forest-ink">
              Choose your area
            </label>
            <div className="relative">
              <select
                id={selectId}
                value={area.id}
                onChange={(event) => choose(event.target.value, false)}
                className="h-[3.25rem] w-full appearance-none rounded-lg border border-input bg-cream-paper pr-11 pl-4 text-base font-semibold text-charcoal transition-colors outline-none hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
              >
                {areas.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                strokeWidth={1.75}
                className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-forest-ink"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href={startHref} onClick={markArrival} className={cn(PRIMARY_BUTTON, "w-full text-[1.0625rem] print:hidden")}>
              <span>Start the 2-minute briefing for {area.name}</span>
              <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            </Link>
            <p className="text-base leading-6 text-pretty text-charcoal">
              {BRIEFING_STEP_COUNT} short steps · about 2 minutes · ends in a plan you can print for your board
            </p>
          </div>
        </FramePanel>

        {/* The briefing's step 1 for the chosen area. */}
        {preview ? (
          <div
            aria-live="polite"
            className="flex flex-col gap-6 rounded-lg border border-frame-border bg-cream-paper p-5 sm:p-7"
          >
            {preview}
            <Link
              href={briefingHref(area.id, "where")}
              onClick={markArrival}
              className={cn(SECONDARY_BUTTON, "w-full sm:w-fit print:hidden")}
            >
              <span>Next: {BRIEFING_STEPS[1].next}</span>
              <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            </Link>
          </div>
        ) : null}
      </section>

      {/* Everything else, below a clear divider. */}
      <section aria-labelledby="own-heading" className="mt-8 flex flex-col gap-4 sm:mt-12 print:mt-4">
        <div className="flex items-center gap-4 border-t border-forest-ink/25 pt-6 print:pt-3">
          <h2 id="own-heading" className="type-title text-forest-ink">
            Or look through the data yourself
          </h2>
        </div>

        <Reveal className="grid gap-3 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-stretch">
          {/* The area's answer: its verdict, the three steps and the first recommended action. */}
          <div ref={answerRef} className="flex scroll-mt-4 flex-col lg:col-start-2 lg:row-start-1">
            <FramePanel padding="none" className="flex flex-1 flex-col">
              <div className="flex flex-col gap-5 p-5 sm:p-7 sm:pb-6">
                <div className="flex flex-col gap-2">
                  <p className="text-base text-muted-foreground">
                    {area.name}, {year}
                  </p>
                  <h3 className="type-heading text-pretty text-foreground">{area.verdict}</h3>
                  {notes[area.id] ?? null}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <TextLink kind="nav" href={`/county/${area.id}/act`} className="text-base">
                    See all actions for {area.name}
                  </TextLink>
                  <TextLink kind="nav" href={`/county/${area.id}`} className="text-base">
                    Full pathway for {area.name}
                  </TextLink>
                </div>
                {steps[area.id] ?? null}
              </div>
              <div className="mt-auto">{area.actionId ? (actions[area.actionId] ?? null) : null}</div>
            </FramePanel>
          </div>

          {/* The map: after the answer on a phone, on the left from lg. */}
          <FramePanel padding="none" className="flex flex-col lg:col-start-1 lg:row-start-1">
            <FramePanelLabel>
              <span className="text-base">Where a step is worse than Finland</span>
            </FramePanelLabel>
            <div className="flex flex-col items-center px-5 pt-3 pb-3 sm:px-6">
              <FinlandMap
                areas={mapAreas}
                selectedId={area.id}
                highlight={[area.id]}
                onSelect={(id) => choose(id, true)}
                label={`Map of Finland's ${totalAreas} areas, coloured by the worst of the measured steps against Finland's level`}
                className="h-[16.25rem]"
              />
            </div>
            <BarKey items={mapKey} className="px-5 pb-1 sm:px-6" />
            <Disclosure summary="How the map is coloured" className="px-5 pb-1 sm:px-6">
              <p className="pb-2 pl-[1.375rem] text-base text-pretty text-muted-foreground">{mapNote}</p>
            </Disclosure>
            <div className="mt-auto flex flex-wrap items-center gap-1.5 px-5 pt-1 pb-4 sm:px-6">
              {mapChips.map((chip, i) => (
                <span key={i} className="inline-flex">
                  {chip}
                </span>
              ))}
            </div>
          </FramePanel>
        </Reveal>

        <Reveal index={1} className="print:hidden">
          <nav aria-label="More pages" className="rounded-lg bg-keylime-wash px-5 py-2 sm:px-7">
            <ul className="flex flex-col divide-y divide-border [&>li]:py-1.5">
              <li>
                <TextLink kind="nav" href="/compare" className="text-base">
                  Compare all {totalAreas} areas
                </TextLink>
              </li>
              <li>
                <TextLink kind="nav" href="/insights" className="text-base">
                  Where access is hardest
                </TextLink>
              </li>
              <li>
                <TextLink kind="nav" href="/how-to-read" className="text-base">
                  How to read these numbers
                </TextLink>
              </li>
              <li>
                <TextLink kind="nav" href="/sources" className="text-base">
                  Sources &amp; limitations
                </TextLink>
              </li>
            </ul>
          </nav>
        </Reveal>
      </section>
    </>
  );
}
