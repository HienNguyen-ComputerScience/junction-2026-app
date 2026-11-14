"use client";

import { useId, useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import { cn } from "cn";

import {
  FINNISH_ROADMAP,
  KAYPA_HOITO,
  NICE_NG12,
  NO_MATCH_LINKS,
  RED_FLAG_CATEGORIES,
  TIERS,
  matchCategories,
  type GuidelineLink,
} from "@/lib/red-flags";

function LinkList({ links, className }: { links: GuidelineLink[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2 max-sm:gap-0.5", className)}>
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm underline decoration-foreground/30 underline-offset-4 outline-none transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:inline-block max-sm:py-1.5"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The labels of the result card's sections, shared by the result and its empty state. */
const SECTION = {
  category: "Warning-sign category",
  speed: "How fast",
  gp: "What the GP or clinic does",
  links: "Check the detail in the guideline",
} as const;

/** A placeholder line in the empty state: static, no shimmer. */
function Line({ className }: { className?: string }) {
  return <span className={cn("block h-2.5 rounded-[3px] bg-foreground/[0.07]", className)} />;
}

/** Before any input: the result card's own sections, greyed, so the answer has a visible place. */
function EmptyResult() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-dashed border-input p-4 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <p aria-hidden className="type-caption text-faint">
          {SECTION.category}
        </p>
        <p className="type-heading text-pretty text-muted-foreground">
          Pick a concern or type a few words to see the warning-sign category and the referral route
        </p>
      </div>
      <div aria-hidden className="flex flex-col gap-4 border-t border-border pt-4">
        <div className="flex flex-col gap-2.5">
          <p className="type-caption text-faint">{SECTION.speed}</p>
          <Line className="w-11/12" />
          <Line className="w-7/12" />
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="type-caption text-faint">{SECTION.gp}</p>
          <Line className="w-full" />
          <Line className="w-10/12" />
          <Line className="w-5/12" />
        </div>
      </div>
      <div aria-hidden className="flex flex-col gap-2.5 border-t border-border pt-4">
        <p className="type-caption text-faint">{SECTION.links}</p>
        <Line className="w-8/12" />
        <Line className="w-9/12" />
        <Line className="w-6/12" />
      </div>
    </div>
  );
}

export function RedFlagHelper() {
  const textId = useId();
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");

  // Everything is computed here in the browser from what's on screen.
  const typed = matchCategories(text);
  const matchedIds = new Set([...picked, ...typed]);
  const matched = RED_FLAG_CATEGORIES.filter((category) => matchedIds.has(category.id)).sort(
    (a, b) => TIERS[a.urgency].rank - TIERS[b.urgency].rank,
  );
  const hasInput = picked.length > 0 || text.trim() !== "";
  const tier = matched.length > 0 ? TIERS[matched[0].urgency] : TIERS.safety_net;
  const links: GuidelineLink[] =
    matched.length > 0
      ? [...new Map(matched.flatMap((c) => c.links).map((l) => [l.url, l])).values()]
      : NO_MATCH_LINKS;

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  return (
    // Desktop: the question on the left; the note and the route on the right, so the answer
    // appears beside the input. Phone: the note first, then the question, then the route.
    // Neutral surfaces: red and amber are reserved for data status.
    <div className="grid gap-x-10 gap-y-5 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-4">
      <div role="note" className="flex gap-3 rounded-lg border border-input px-4 py-3.5 lg:col-start-2 lg:row-start-1">
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" strokeWidth={1.75} />
        <div className="flex flex-col gap-0.5">
          <p className="text-[0.9375rem] font-semibold">Decision support, not diagnosis. If in doubt, refer.</p>
          <p className="type-caption text-muted-foreground">
            No patient data is stored or sent. Matching runs only in this browser.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <fieldset className="@container flex flex-col">
          <legend className="mb-3 text-sm font-medium">What is the concern? Pick any that fit.</legend>
          {/* Equal toggle rows; two columns only where the longest label fits on one line. */}
          <div className="grid gap-1.5 @[44rem]:grid-cols-2">
            {RED_FLAG_CATEGORIES.map((category) => {
              const on = picked.includes(category.id);
              // Matched from the typed words: shown, but not ticked, so a click still toggles it.
              const fromText = !on && typed.includes(category.id);
              return (
                <label
                  key={category.id}
                  title={category.examples}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                    on
                      ? "border-foreground/40 bg-muted"
                      : fromText
                        ? "border-foreground/25 bg-muted"
                        : "border-input hover:bg-muted/60",
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => toggle(category.id)}
                  />
                  {/* The tick box carries the state, so it never rests on a surface step alone. */}
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                      on
                        ? "border-foreground bg-foreground text-background"
                        : fromText
                          ? "border-foreground/60 text-foreground"
                          : "border-foreground/35 bg-background/40",
                    )}
                  >
                    {(on || fromText) && <Check className="size-3" strokeWidth={2.5} />}
                  </span>
                  <span className="min-w-0 flex-1 text-pretty">{category.label}</span>
                  {fromText && (
                    <span className="shrink-0 type-micro text-muted-foreground">
                      Matched<span className="sr-only"> by your description</span>
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor={textId} className="text-sm font-medium">
            Or describe it in a few words (English or Finnish)
          </label>
          <input
            id={textId}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={300}
            placeholder="e.g. weight loss, tiredness"
            autoComplete="off"
            className="h-11 rounded-lg border border-input bg-muted px-3 text-[0.9375rem] transition-[border-color,box-shadow] outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="type-micro text-muted-foreground">
            Our own plain-language categories, not guideline text. UK guideline, Finnish criteria pending
            (roadmap 2.5.2). Exact criteria, ages and tests are in the guidelines:
          </p>
          <LinkList
            links={[NICE_NG12, KAYPA_HOITO, FINNISH_ROADMAP]}
            className="type-caption text-foreground/90"
          />
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <div aria-live="polite">
          {hasInput ? (
            <div className="flex flex-col gap-4 rounded-lg border border-input bg-muted p-4 sm:p-5">
              <div className="flex flex-col gap-1.5">
                <p className="type-caption text-muted-foreground">
                  {matched.length > 0
                    ? `${SECTION.category}: ${matched.map((c) => c.label.toLowerCase()).join("; ")}`
                    : "No category matched. That does not rule anything out."}
                </p>
                {matched.length === 0 ? (
                  <p className="text-sm font-medium">
                    If you are worried or it gets worse, contact a health professional now.
                  </p>
                ) : null}
                <p className="type-title text-pretty">{tier.title}</p>
              </div>
              <dl className="flex flex-col gap-4 border-t border-border pt-4">
                <div className="flex flex-col gap-1">
                  <dt className="type-caption text-muted-foreground">{SECTION.speed}</dt>
                  <dd className="text-sm leading-relaxed text-pretty">{tier.speed}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="type-caption text-muted-foreground">{SECTION.gp}</dt>
                  <dd className="text-sm leading-relaxed text-pretty">{tier.gpAction}</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="type-caption text-muted-foreground">{SECTION.links}</p>
                <LinkList links={links} className="text-sm" />
              </div>
            </div>
          ) : (
            <EmptyResult />
          )}
        </div>
      </div>
    </div>
  );
}
