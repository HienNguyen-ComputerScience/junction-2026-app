"use client";

import { cn } from "cn";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { FinlandMap, type FinlandMapArea } from "@/components/map/finland-map";
import { buttonVariants } from "@/components/ui/button";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { TextLink } from "@/components/ui/text-link";
import type { GapStatus } from "@/lib/data";

/** One area as the picker needs it. Plain data: everything with a number is pre-rendered. */
export type PickerArea = {
  id: string;
  name: string;
  /** Where the pathway stands, in one sentence. */
  verdict: string;
  /** The area's overall status: the one the map colours it by. */
  status: GapStatus;
  /** The first recommended action's id (a key of `actions`), or null when there is none. */
  actionId: string | null;
};

type Props = {
  /** The page's headline (h1 and its sub-line), set at the top of the composed block. */
  header: ReactNode;
  /** All areas, in the order of the select. */
  areas: PickerArea[];
  mapAreas: FinlandMapArea[];
  /** Shown before anyone picks: the area named by ?area= on this request, else the one that leads the ranking. */
  defaultId: string;
  year: number;
  totalAreas: number;
  /** Server-rendered parts, so no snapshot data is shipped to the browser. */
  steps: Record<string, ReactNode>;
  /** Per area: the bottleneck step's focal figure (absent when it has no value). */
  leads: Record<string, ReactNode>;
  whatIfs: Record<string, ReactNode>;
  actions: Record<string, ReactNode>;
  mapChip: ReactNode;
};

// The selection is mirrored in the URL (?area=), read after hydration so the page stays static.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const readUrlArea = () => new URLSearchParams(window.location.search).get("area");
const noUrlArea = () => null;

/**
 * The home page's tool, as one composed first screen: on the left the headline, then one card
 * with the area picker, the selected area's key figure, verdict, the way to its actions and its
 * top action; on the right the map of Finland, filling the block's full height, with the
 * Helsinki region enlarged so its small areas can be clicked. Under the block: the what-if and
 * the three steps for the same area. Phone: headline, the card, the map, then the rest.
 */
export function AreaPicker({
  header,
  areas,
  mapAreas,
  defaultId,
  year,
  totalAreas,
  steps,
  leads,
  whatIfs,
  actions,
  mapChip,
}: Props) {
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

  // Optional parts are left out when empty, never kept as a gap.
  const action = area.actionId ? actions[area.actionId] : null;
  const what = whatIfs[area.id] ?? null;

  return (
    <>
      {/* The composed first screen: headline and answer on the left, the map on the right. */}
      <section
        aria-label="Pick an area"
        className="grid gap-x-6 gap-y-5 lg:grid-cols-[minmax(0,1fr)_26rem]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          {header}

          <FramePanel padding="none" ref={answerRef} className="scroll-mt-4">
            <div className="flex flex-col gap-4 px-5 pt-4 pb-5 sm:px-6">
              {/* The picker is the card's title row: the answer under it is for this area. */}
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <div className="flex w-full flex-col gap-1.5 sm:w-[15rem]">
                  <label htmlFor={selectId} className="type-caption font-medium text-muted-foreground">
                    Choose your area
                  </label>
                  <div className="relative">
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
                </div>
                <p className="pb-3 type-caption text-muted-foreground">
                  <span className="lg:hidden">or tap an area on the map below</span>
                  <span className="max-lg:hidden">or click an area on the map</span>
                </p>
                <TextLink kind="jump" href="#ranking" className="pb-3 type-caption sm:ml-auto">
                  Compare all {totalAreas} areas
                </TextLink>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4" aria-live="polite">
                <p className="type-caption font-medium text-muted-foreground">
                  {area.name}, {year}: {area.status === "red" ? "where the pathway breaks" : "where the pathway stands"}
                </p>
                {leads[area.id] ?? null}
                <h2 className="type-heading text-pretty text-foreground">{area.verdict}</h2>
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
            </div>
            {action}
          </FramePanel>
        </div>

        {/* The map fills the block's height: the left column sets it, the map takes what is left
            after its title, caption and key. */}
        <FramePanel padding="none" className="flex min-h-0 flex-col">
          <FramePanelLabel className="flex-col items-start justify-start gap-y-1.5">
            <span>Worst measured step against Finland</span>
            {mapChip}
          </FramePanelLabel>
          <div className="relative min-h-[24rem] flex-1">
            <FinlandMap
              areas={mapAreas}
              selectedId={area.id}
              onSelect={(id) => choose(id, true)}
              inset
              label={`Map of Finland's ${totalAreas} areas, coloured by the worst of the measured steps against Finland's level`}
              className="absolute inset-x-5 top-3 bottom-1 sm:inset-x-6"
            />
          </div>
          {/* The title says what the colour is; the line under the map only credits it. */}
          <p className="px-5 pt-2 type-note text-muted-foreground sm:px-6">Map: Statistics Finland, CC BY 4.0</p>
          {/* The page's one key: the map's fills and the steps' bars use the same marks. */}
          <BarKey className="gap-x-5 gap-y-1 px-5 pt-3 pb-5 sm:px-6" />
        </FramePanel>
      </section>

      {/* The same area, in more detail: the what-if, then the three steps. */}
      <section aria-label={`${area.name} in detail`} className="-mt-4 grid gap-2 sm:-mt-8">
        {what}
        <FramePanel padding="none">
          <FramePanelLabel>
            <h3 className="font-sans type-caption font-medium text-muted-foreground">
              The three steps to a specialist in {area.name} ({year})
            </h3>
          </FramePanelLabel>
          {steps[area.id]}
        </FramePanel>
      </section>
    </>
  );
}
