"use client";

import { useId, useState } from "react";
import { ShieldAlert } from "lucide-react";

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

function LinkList({ links }: { links: GuidelineLink[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm underline decoration-foreground/30 underline-offset-4 outline-none transition-colors hover:text-brand-ink hover:decoration-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
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
    <div className="flex flex-col gap-6">
      {/* Desktop: the question on the left; the note and the route on the right, so the answer
          appears beside the input. Neutral surfaces: red and amber are reserved for data status. */}
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col">
            <legend className="mb-2.5 text-sm font-medium">What is the concern? Pick any that fit.</legend>
            <div className="flex flex-wrap gap-2">
              {RED_FLAG_CATEGORIES.map((category) => {
                const on = picked.includes(category.id);
                return (
                  <label
                    key={category.id}
                    title={category.examples}
                    className={`flex min-h-10 cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:min-h-9 ${
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-card hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => toggle(category.id)}
                    />
                    {category.label}
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
              className="h-11 rounded-lg border border-input bg-card px-3 text-[0.9375rem] transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div role="note" className="flex gap-3 rounded-lg border border-input bg-muted/50 p-3 text-sm">
            <ShieldAlert aria-hidden className="mt-0.5 size-[1.125rem] shrink-0 text-foreground" strokeWidth={1.75} />
            <div>
              <p className="font-semibold">Decision support, not diagnosis. If in doubt, refer.</p>
              <p className="text-muted-foreground">
                No patient data is stored or sent. Matching runs only in this browser.
              </p>
            </div>
          </div>

          <div aria-live="polite" className="flex flex-1 flex-col">
            {hasInput ? (
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-input bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-1.5">
                  <p className="type-caption text-muted-foreground">
                    {matched.length > 0
                      ? `Warning-sign category: ${matched.map((c) => c.label.toLowerCase()).join("; ")}`
                      : "No category matched. That does not rule anything out."}
                  </p>
                  {matched.length === 0 ? (
                    <p className="text-sm font-medium">
                      If you are worried or it gets worse, contact a health professional now.
                    </p>
                  ) : null}
                  <p className="type-title text-pretty">{tier.title}</p>
                </div>
                <dl className="flex flex-col gap-3 border-t border-border/80 pt-4">
                  <div className="flex flex-col gap-1">
                    <dt className="type-caption text-muted-foreground">How fast</dt>
                    <dd className="text-sm leading-relaxed text-pretty">{tier.speed}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="type-caption text-muted-foreground">What the GP or clinic does</dt>
                    <dd className="text-sm leading-relaxed text-pretty">{tier.gpAction}</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5 border-t border-border/80 pt-4 text-sm">
                  <p className="type-caption text-muted-foreground">Check the detail in the guideline</p>
                  <LinkList links={links} />
                </div>
              </div>
            ) : (
              <p className="flex flex-1 items-center rounded-lg border border-dashed border-input p-4 text-sm text-muted-foreground sm:p-5 lg:min-h-40">
                Pick a category or type a few words to see the warning-sign category and the referral route.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/80 pt-4 type-micro text-muted-foreground">
        <p className="max-w-[46rem]">
          Our own plain-language categories, not guideline text. UK guideline, Finnish criteria pending
          (roadmap 2.5.2). Exact criteria, ages and tests are in the guidelines:
        </p>
        <LinkList links={[NICE_NG12, KAYPA_HOITO, FINNISH_ROADMAP]} />
      </div>
    </div>
  );
}
