"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "cn";

import { CHOICE_BUTTON, STATEMENT } from "@/components/briefing/ui";

type YearShare = { year: number; value: number; finland: number | null };

type DotState = "base" | "excess" | "short" | "empty";

/**
 * What a dot is, for a share where the counted thing is bad (late visits, `lower`) or good
 * (referrals handled in time, `higher`). `n` is this area's whole number of every 100, `f`
 * Finland's.
 *  - base: counted here.
 *  - excess: counted here, beyond Finland's level (late visits above Finland's level).
 *  - short: counted at Finland's level but not here.
 */
function dotState(index: number, n: number, f: number | null, better: "lower" | "higher"): DotState {
  const at = index + 1;
  if (f === null) return at <= n ? "base" : "empty";
  if (at <= Math.min(n, f)) return "base";
  if (at <= n) return better === "lower" ? "excess" : "base";
  if (at <= f) return "short";
  return "empty";
}

/**
 * Step 3's picture: a hundred dots, one per visit (or referral) of every hundred, filled to
 * the area's share. The year buttons re-fill it to that year's published share, so "is it
 * getting worse?" is answered by watching the same hundred change.
 *
 * Whole dots are the published one-decimal share rounded to a whole number, and the sentence
 * says "about". Nothing moves until a year is pressed.
 */
export function HundredGrid({
  areaName,
  things,
  did,
  better,
  years,
}: {
  areaName: string;
  /** "non-urgent GP visits". */
  things: string;
  /** "came more than a week after people asked". */
  did: string;
  better: "lower" | "higher";
  /** Oldest first; the last one is shown first. */
  years: YearShare[];
}) {
  const [year, setYear] = useState(years[years.length - 1].year);
  const current = years.find((entry) => entry.year === year) ?? years[years.length - 1];
  const n = Math.round(current.value);
  const f = current.finland === null ? null : Math.round(current.finland);

  const states = Array.from({ length: 100 }, (_, index) => dotState(index, n, f, better));
  const has = (state: DotState) => states.includes(state);
  const worse = f !== null && (better === "lower" ? n > f : n < f);

  // Late visits up to Finland's level are neutral and the part above it is red, the same rule
  // as the bars elsewhere on the site. Referrals in time are slate; the part missing against
  // Finland's level is hatched red.
  const baseFill = better === "lower" && worse ? "bg-status-grey" : "bg-status-amber-bar";
  const dotClass: Record<DotState, string> = {
    base: baseFill,
    excess: "bg-status-red",
    short:
      better === "lower"
        ? "border-2 border-dashed border-status-grey bg-transparent"
        : "border-2 border-status-red bg-status-red-soft",
    empty: "bg-track",
  };
  const legend: { state: DotState; text: string }[] = (
    [
      {
        state: "base",
        text:
          better === "lower"
            ? worse
              ? "Late, up to Finland's level"
              : "Late: more than a week after people asked"
            : "Processed within 3 days",
      },
      { state: "excess", text: "Late, above Finland's level" },
      {
        state: "short",
        text:
          better === "lower"
            ? `Late at Finland's level, not in ${areaName}`
            : `Within 3 days at Finland's level, not in ${areaName}`,
      },
      { state: "empty", text: better === "lower" ? "Within a week" : "Took longer than 3 days" },
    ] as const
  ).filter((item) => has(item.state));

  return (
    <div className="flex flex-col gap-[21px]">
      <h1
        data-briefing-heading
        tabIndex={-1}
        aria-live="polite"
        className={`animate-fade-up ${STATEMENT}`}
        style={{ "--i": 1 } as CSSProperties}
      >
        In {current.year}, about {n} of every 100 {things} in {areaName} {did}.
        {f !== null ? ` Across Finland: about ${f}.` : ""}
      </h1>

      <div className="flex flex-col gap-[14px]">
        <div
          role="img"
          aria-label={`${n} of 100 dots are filled for ${areaName}${f !== null ? `; Finland's level is ${f}` : ""}.`}
          className="grid w-fit grid-cols-10 gap-1.5 sm:grid-cols-20"
        >
          {states.map((state, index) => (
            <span
              key={index}
              className={cn("bf-pop bf-dot size-4 rounded-full sm:size-[1.125rem]", dotClass[state])}
              style={{ "--d": 420 + index * 7, "--t": index * 5 } as CSSProperties}
            />
          ))}
        </div>
        <ul className="animate-fade-up flex flex-col gap-1 text-base leading-6 text-charcoal" style={{ "--i": 5 } as CSSProperties}>
          {legend.map((item) => (
            <li key={item.state} className="flex items-start gap-2.5">
              <span aria-hidden className={cn("mt-1 size-4 shrink-0 rounded-full", dotClass[item.state])} />
              <span className="text-pretty">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {years.length > 1 ? (
        <div
          role="group"
          aria-label="Show another year"
          className="animate-fade-up flex flex-wrap items-center gap-3"
          style={{ "--i": 6 } as CSSProperties}
        >
          <span className="text-base leading-6 font-semibold text-forest-ink max-sm:basis-full">Show the year:</span>
          {years.map((entry) => (
            <button
              key={entry.year}
              type="button"
              aria-pressed={entry.year === current.year}
              onClick={() => setYear(entry.year)}
              className={cn(CHOICE_BUTTON, "min-w-[5.5rem]")}
            >
              {entry.year}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
