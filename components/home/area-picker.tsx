"use client";

import { cn } from "cn";
import { ArrowRight, ChevronDown, LoaderCircle } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { markArrival } from "@/components/briefing/arrival";
import { PRIMARY_BUTTON } from "@/components/briefing/ui";
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
 * The home page's tool, as cells of the page grid: the area list and the one filled button
 * ("Start the briefing for …") under the headline, the briefing's step 1 for that area beside
 * them, and below a divider the two places to look through the data that the nav doesn't name.
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

  // The two places the nav does not name. The nav's own items (insights, how to read, sources)
  // are one line above the headline, so they are not repeated here.
  const links = [
    { href: "/compare", label: `Compare all ${totalAreas} areas` },
    { href: `/county/${area.id}`, label: `Full page for ${area.name}` },
  ];

  return (
    <>
      <FramePanel
        padding="none"
        className="flex flex-col gap-5 p-5 sm:p-7 lg:col-start-1 lg:row-start-2 lg:justify-center lg:gap-6 print:hidden"
      >
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
          <Link
            href={startHref}
            onClick={markArrival}
            className={cn(PRIMARY_BUTTON, "group w-full justify-between text-left text-[1.0625rem]")}
          >
            <span className="text-balance">Start the briefing for {area.name}</span>
            <StartIcon />
          </Link>
          <p className="text-base leading-6 text-balance text-charcoal">
            {BRIEFING_STEP_COUNT} short steps · download or print at the end
          </p>
        </div>
      </FramePanel>

      {/* The briefing's step 1 for the chosen area. A new area's card rises in once (not on load). */}
      {preview ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-frame-border bg-cream-paper p-5 sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-center"
        >
          <div key={area.id} className={picked ? "animate-fade-up" : undefined}>
            {preview}
          </div>
        </div>
      ) : null}

      <section
        aria-labelledby="own-heading"
        className="mt-6 flex flex-col gap-3 border-t border-forest-ink/25 pt-6 sm:mt-10 lg:col-span-2 print:hidden"
      >
        <h2 id="own-heading" className="type-title text-forest-ink">
          Or look through the data yourself
        </h2>
        <ul className="flex flex-col gap-x-10 gap-y-1 sm:flex-row sm:flex-wrap">
          {links.map((link) => (
            <li key={link.href}>
              <TextLink kind="nav" href={link.href} className="min-h-11 text-base">
                {link.label}
              </TextLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Start's arrow: it nudges forward on hover and focus, and turns into a spinner while the briefing loads. */
function StartIcon() {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoaderCircle aria-hidden className="size-5 shrink-0 motion-safe:animate-spin" strokeWidth={1.75} />
  ) : (
    <ArrowRight
      aria-hidden
      className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
      strokeWidth={1.75}
    />
  );
}
