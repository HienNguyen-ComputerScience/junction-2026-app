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
 * The home page's tool: pick an area (the select or the map) and see where its pathway breaks,
 * the steps, the top recommended action and the what-if, all for that area. Desktop: picker
 * and map on the left, the answer on the right. Phone: the select, the answer, then the map.
 */
export function AreaPicker({
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
    // No outer frame: the panels sit on the page, so the deepest nesting is panel > First step box.
    <section
      aria-label="Pick an area"
      className="grid gap-2 lg:grid-cols-[21rem_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)]"
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
        <p className="mt-1.5 type-caption text-muted-foreground">
          <span className="lg:hidden">Or tap an area on the map below.</span>
          <span className="max-lg:hidden">Or click an area on the map.</span>
        </p>
        <TextLink kind="jump" href="#ranking" className="text-sm">
          Compare all {totalAreas} areas
        </TextLink>
      </FramePanel>

      {/* The answer for the selected area: the hero card (figure, verdict, the way to the actions,
          and the top action as its second row), then the what-if, then the three steps. */}
      <div ref={answerRef} className="grid scroll-mt-4 content-start gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <FramePanel padding="none">
          <div className="flex flex-col gap-5 px-5 pt-5 pb-5 sm:px-6">
            <div className="flex flex-col gap-3" aria-live="polite">
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

        {what}

        <FramePanel padding="none">
          <FramePanelLabel>
            <h3 className="font-sans type-caption font-medium text-muted-foreground">
              The three steps to a specialist ({year})
            </h3>
          </FramePanelLabel>
          {steps[area.id]}
        </FramePanel>
      </div>

      {/* The map: last on a phone, under the picker from lg. */}
      <FramePanel padding="none" className="max-lg:order-last lg:col-start-1 lg:row-start-2">
        <FramePanelLabel>
          <span>Worst measured step against Finland</span>
          {mapChip}
        </FramePanelLabel>
        <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-4 sm:px-6">
          <FinlandMap
            areas={mapAreas}
            selectedId={area.id}
            highlight={[area.id]}
            onSelect={(id) => choose(id, true)}
            label={`Map of Finland's ${totalAreas} areas, coloured by the worst of the measured steps against Finland's level`}
            className="mb-5 h-[16.25rem] lg:h-[20rem]"
          />
          <p className="self-start type-caption text-pretty text-muted-foreground">
            Each area is coloured by the worse of its two measured steps, the GP wait and the referral, against Finland
            (the same status as its answer). An area is red if either is worse. Not specific to cancer: the GP wait
            covers all non-urgent GP visits. Map: Statistics Finland, CC BY 4.0
          </p>
        </div>
        {/* The page's one key: the map's fills and the steps' bars use the same marks. */}
        <BarKey className="px-5 pt-1 pb-5 sm:px-6" />
      </FramePanel>
    </section>
  );
}
