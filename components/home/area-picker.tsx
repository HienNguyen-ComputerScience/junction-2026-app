"use client";

import { cn } from "cn";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { markArrival } from "@/components/briefing/arrival";
import { PRIMARY_BUTTON } from "@/components/briefing/ui";
import { Reveal } from "@/components/motion";
import { FramePanel } from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
import { BRIEFING_STEP_COUNT, briefingHref } from "@/lib/briefing/steps";

/** One area as the picker needs it. */
export type PickerArea = { id: string; name: string };

type Props = {
  /** All areas, in the order of the list. */
  areas: PickerArea[];
  /** Shown before anyone picks: the area named by ?area= on this request, else the one that leads the ranking. */
  defaultId: string;
  totalAreas: number;
  /** Per area: the briefing's step 1 as a card (absent when the area has no briefing). Server-rendered. */
  previews: Record<string, ReactNode>;
};

// The selection is mirrored in the URL (?area=), read after hydration so the page stays static.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const readUrlArea = () => new URLSearchParams(window.location.search).get("area");
const noUrlArea = () => null;

/**
 * The home page. First screen: the area list and the one filled button ("Start the briefing
 * for …") beside the briefing's step 1 for that area. Below a divider, one link per
 * place to look through the data: the briefing and the area page show the rest.
 */
export function AreaPicker({ areas, defaultId, totalAreas, previews }: Props) {
  const selectId = useId();
  const urlArea = useSyncExternalStore(subscribe, readUrlArea, noUrlArea);
  const [picked, setPicked] = useState<string | null>(null);

  const byId = (id: string | null) => areas.find((area) => area.id === id);
  const area = byId(picked) ?? byId(urlArea) ?? byId(defaultId) ?? areas[0];
  const preview = previews[area.id] ?? null;
  // An area the briefing has no step 1 for (no published GP figure) starts at the briefing's own chooser.
  const startHref = preview ? briefingHref(area.id) : "/briefing";

  function choose(id: string) {
    const next = byId(id);
    if (!next) return;
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("area", id);
    window.history.replaceState(null, "", url);
    document.title = `${next.name} · FirstLine`;
  }

  const links = [
    { href: "/compare", label: `Compare all ${totalAreas} areas` },
    { href: `/county/${area.id}`, label: `Full page for ${area.name}` },
    { href: "/insights", label: "Where access is hardest" },
    { href: "/how-to-read", label: "How to read these numbers" },
    { href: "/sources", label: "Sources & limitations" },
  ];

  return (
    <>
      <section aria-label="Guided briefing" className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <FramePanel padding="none" className="flex flex-col gap-5 p-5 sm:p-7 lg:justify-center lg:gap-7 print:hidden">
          <div className="flex flex-col gap-2">
            <label htmlFor={selectId} className="type-heading text-forest-ink">
              Choose your area
            </label>
            <div className="relative">
              <select
                id={selectId}
                value={area.id}
                onChange={(event) => choose(event.target.value)}
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
            <Link href={startHref} onClick={markArrival} className={cn(PRIMARY_BUTTON, "w-full text-[1.0625rem]")}>
              <span>Start the briefing for {area.name}</span>
              <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            </Link>
            <p className="text-base leading-6 text-pretty text-charcoal">
              {BRIEFING_STEP_COUNT} short steps · about 2 minutes · download or print at the end
            </p>
          </div>
        </FramePanel>

        {/* The briefing's step 1 for the chosen area. */}
        {preview ? (
          <div aria-live="polite" className="rounded-lg border border-frame-border bg-cream-paper p-5 sm:p-7">
            {preview}
          </div>
        ) : null}
      </section>

      <Reveal as="section" className="mt-8 flex flex-col gap-2 border-t border-forest-ink/25 pt-6 sm:mt-12 print:hidden">
        <h2 id="own-heading" className="type-title text-forest-ink">
          Or look through the data yourself
        </h2>
        <nav aria-labelledby="own-heading">
          <ul className="flex flex-col divide-y divide-border">
            {links.map((link) => (
              <li key={link.href} className="py-1.5">
                <TextLink kind="nav" href={link.href} className="text-base">
                  {link.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>
    </>
  );
}
