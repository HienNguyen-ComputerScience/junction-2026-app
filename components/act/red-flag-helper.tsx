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
    <ul className="flex flex-col gap-1">
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

const TIER_STYLES = {
  urgent: "border-red-600/40 bg-red-50 dark:bg-red-950/30",
  vague: "border-amber-600/40 bg-amber-50 dark:bg-amber-950/30",
  safety_net: "border-sky-600/40 bg-sky-50 dark:bg-sky-950/30",
} as const;

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
    <div className="flex flex-col gap-4">
      <div
        role="note"
        className="flex gap-3 rounded-lg border border-red-600/40 bg-red-50 p-3 text-sm dark:bg-red-950/30"
      >
        <ShieldAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-red-700 dark:text-red-400" />
        <div>
          <p className="font-semibold">Decision support, not diagnosis. If in doubt, refer.</p>
          <p>No patient data is stored or sent. Matching runs only in this browser.</p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">What is the concern? Pick any that fit.</legend>
        <div className="flex flex-wrap gap-2">
          {RED_FLAG_CATEGORIES.map((category) => {
            const on = picked.includes(category.id);
            return (
              <label
                key={category.id}
                title={category.examples}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring ${
                  on ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
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

      <div className="flex flex-col gap-1">
        <label htmlFor={textId} className="text-sm font-medium">
          Or describe it in a few words (English or Finnish)
        </label>
        <input
          id={textId}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. weight loss, tiredness"
          autoComplete="off"
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div aria-live="polite">
        {hasInput ? (
          <div className={`flex flex-col gap-3 rounded-lg border p-4 text-sm ${TIER_STYLES[tier.urgency]}`}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {matched.length > 0
                  ? `Warning-sign category: ${matched.map((c) => c.label.toLowerCase()).join("; ")}`
                  : "No category matched. That does not rule anything out."}
              </p>
              <p className="mt-1 text-base font-semibold">{tier.title}</p>
            </div>
            <p>
              <span className="font-medium">How fast: </span>
              {tier.speed}
            </p>
            <p>
              <span className="font-medium">What the GP or clinic does: </span>
              {tier.gpAction}
            </p>
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">Check the detail in the guideline</p>
              <LinkList links={links} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pick a category or type a few words to see the warning-sign category and the referral route.
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          Our own plain-language categories, not guideline text. UK guideline, Finnish criteria pending
          (roadmap 2.5.2). Exact criteria, ages and tests are in the guidelines:
        </p>
        <LinkList links={[NICE_NG12, KAYPA_HOITO, FINNISH_ROADMAP]} />
      </div>
    </div>
  );
}
