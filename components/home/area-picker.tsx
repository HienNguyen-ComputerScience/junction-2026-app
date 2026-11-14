"use client";

import { cn } from "cn";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { FinlandMap, type FinlandMapArea } from "@/components/map/finland-map";
import { buttonVariants } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { TextLink } from "@/components/ui/text-link";
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
  /** Per area: the bottleneck step's focal figure (absent when it has no value). Server-rendered. */
  leads: Record<string, ReactNode>;
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
 * The home page's tool: pick an area (the select or the map) and see where its pathway breaks.
 * Desktop: picker and map on the left, the answer hero on the right, both columns the same
 * height. Phone: the select, the answer, then the map.
 */
export function AreaPicker({ areas, mapAreas, defaultId, year, totalAreas, leads, notes, actions, steps, mapChips, mapNote, mapKey }: Props) {
  const selectId = useId();
  const answerRef = useRef<HTMLDivElement>(null);
  const urlArea = useSyncExternalStore(subscribe, readUrlArea, noUrlArea);
  const [picked, setPicked] = useState<string | null>(null);

  const byId = (id: string | null) => areas.find((area) => area.id === id);
  const area = byId(picked) ?? byId(urlArea) ?? byId(defaultId) ?? areas[0];

  function choose(id: string, fromMap: boolean) {
    if (!byId(id)) return;
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("area", id);
    window.history.replaceState(null, "", url);
    const name = byId(id)?.name;
    if (name) document.title = `${name} · FirstLine`;
    // On a phone the answer sits above the map: bring it back into view.
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
    <section
      aria-label="Pick an area"
      className="grid gap-2 lg:grid-cols-[21rem_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:items-stretch"
    >
      {/* The picker. */}
      <FramePanel padding="none" className="px-5 pt-5 pb-4 sm:px-6 lg:col-start-1 lg:row-start-1">
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          Choose your area
        </label>
        <div className="relative mt-1.5">
          <select
            id={selectId}
            value={area.id}
            onChange={(event) => choose(event.target.value, false)}
            className="h-11 w-full appearance-none rounded-lg border border-input bg-muted pr-10 pl-3 text-[0.9375rem] font-medium text-foreground transition-colors outline-none hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <TextLink kind="nav" href="/compare" className="text-sm">
          Compare all {totalAreas} areas
        </TextLink>
      </FramePanel>

      {/* The answer hero for the selected area. Content starts at the top with 32px of padding;
          the card is as tall as the left column and its action block sits at the bottom. */}
      <div ref={answerRef} className="flex scroll-mt-4 flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <FramePanel padding="none" className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6 sm:p-8 sm:pb-6">
            <div className="flex flex-col gap-4" aria-live="polite">
              <p className="type-caption font-medium text-muted-foreground">
                {area.name}, {year}
              </p>
              {leads[area.id] ?? null}
              <h2 className="type-heading text-pretty text-foreground">{area.verdict}</h2>
              {notes[area.id] ?? null}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/county/${area.id}/act`} className={cn(buttonVariants({ size: "lg" }), "max-sm:w-full")}>
                See all actions
                <ArrowRight aria-hidden data-icon="inline-end" />
              </Link>
              <TextLink kind="nav" href={`/county/${area.id}`} className="text-sm">
                Full pathway for {area.name}
              </TextLink>
            </div>
            {steps[area.id] ?? null}
          </div>
          {/* Pinned to the bottom of the card, so it ends where the map card ends. */}
          <div className="mt-auto">{area.actionId ? (actions[area.actionId] ?? null) : null}</div>
        </FramePanel>
      </div>

      {/* The map: last on a phone, under the picker from lg. */}
      <FramePanel padding="none" className="flex flex-col max-lg:order-last lg:col-start-1 lg:row-start-2">
        <FramePanelLabel className="flex-col items-start gap-0">
          <span>Red: any step worse than Finland</span>
          <span className="pt-0.5 text-[0.75rem] leading-4 font-normal text-muted-foreground">
            Click an area on the map
          </span>
        </FramePanelLabel>
        <div className="flex flex-col items-center px-5 pt-3 pb-3 sm:px-6">
          <FinlandMap
            areas={mapAreas}
            selectedId={area.id}
            highlight={[area.id]}
            onSelect={(id) => choose(id, true)}
            label={`Map of Finland's ${totalAreas} areas, coloured by the worst of the measured steps against Finland's level`}
            className="h-[16.25rem] lg:h-[12.875rem]"
          />
        </div>
        <BarKey items={mapKey} className="px-5 pb-1 sm:px-6" />
        <Disclosure summary="How the map is coloured" className="px-5 pb-1 sm:px-6">
          <p className="pb-2 pl-[1.375rem] type-caption text-pretty text-muted-foreground">{mapNote}</p>
        </Disclosure>
        {/* The sources of the colours: one row at the bottom of the card, wrapped if it must. */}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 px-5 pt-1 pb-4 sm:px-6">
          {mapChips.map((chip, i) => (
            <span key={i} className="inline-flex">
              {chip}
            </span>
          ))}
        </div>
      </FramePanel>
    </section>
  );
}
