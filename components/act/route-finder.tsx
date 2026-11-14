"use client";

import { useId, useState, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "cn";

import { TextLink } from "@/components/ui/text-link";

import {
  FINNISH_ROADMAP,
  HINT_WORDS,
  KAYPA_HOITO,
  NICE_NG12,
  NO_MATCH_LINKS,
  RED_FLAG_CATEGORIES,
  TIERS,
  matchCategories,
  type GuidelineLink,
  type Urgency,
} from "@/lib/red-flags";

/** The four routes, fastest first. */
const ROUTES: Urgency[] = ["urgent", "vague", "prompt", "safety_net"];

/** The first clause of the tier's speed line: "Seen by a GP soon. These ..." becomes "Seen by a GP soon". */
function shortSpeed(speed: string): string {
  return speed.split(/[,.]/)[0];
}

/** The guideline's name is the link; what comes after the first colon is muted detail beside it. */
function splitLabel(label: string): { name: string; detail?: string } {
  const cut = label.indexOf(": ");
  return cut > 0
    ? { name: label.slice(0, cut), detail: label.slice(cut + 2) }
    : { name: label };
}

function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-sm border border-border px-1.5 text-[0.75rem] leading-5 font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Links({
  label,
  links,
  chips,
}: {
  label: string;
  links: GuidelineLink[];
  chips: Record<string, ReactNode>;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="type-caption text-muted-foreground">{label}</p>
      <ul className="grid gap-x-6 gap-y-0.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const { name, detail } = splitLabel(link.label);
          return (
            <li key={link.url} className="min-w-0 text-pretty">
              <TextLink
                kind="external"
                href={link.url}
                inline
                detail={detail}
                className="max-sm:py-1.5"
              >
                {name}
              </TextLink>
              {link.source_id && chips[link.source_id] ? (
                <span className="ml-1.5 inline-block align-middle">
                  {chips[link.source_id]}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RouteFinder({ chips }: { chips: Record<string, ReactNode> }) {
  const groupId = useId();
  const textId = useId();
  const hintId = useId();
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");

  // Everything is computed here in the browser from what's on screen. Typed words that match
  // select the most urgent matching category; with no match the chip pick (if any) stays.
  const typedIds = matchCategories(text);
  const typed = RED_FLAG_CATEGORIES.filter((category) =>
    typedIds.includes(category.id),
  ).sort((a, b) => TIERS[a.urgency].rank - TIERS[b.urgency].rank);
  const fromText = typed.length > 0;
  const selectedId = fromText ? typed[0].id : picked;
  const selected =
    RED_FLAG_CATEGORIES.find((category) => category.id === selectedId) ?? null;
  // The typed words matched nothing: say so beside the field, and fall back to the safety net.
  const noTextMatch = text.trim() !== "" && !fromText;
  const route: Urgency | null = selected
    ? selected.urgency
    : noTextMatch
      ? "safety_net"
      : null;
  const links = selected ? selected.links : NO_MATCH_LINKS;

  function pick(id: string) {
    setPicked(id);
    setText("");
  }

  function clear() {
    setPicked(null);
    setText("");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* The question on the left, the safety note on the right. Neutral surfaces: red and amber
          are reserved for data status. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-0.5">
          <h3 className="type-heading">Which referral route fits a concern?</h3>
          <p className="type-caption text-muted-foreground">
            Pick one concern to see the route and how fast.
          </p>
        </div>
        <div
          role="note"
          className="flex gap-2.5 rounded-lg border border-input px-3 py-2 lg:max-w-[48rem]"
        >
          <ShieldAlert
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-foreground"
            strokeWidth={1.75}
          />
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              Decision support, not diagnosis. If in doubt, refer.
            </p>
            <p className="type-caption text-muted-foreground">
              Severe or sudden symptoms (chest pain, trouble breathing, heavy
              bleeding): call 112 now. Nothing is stored or sent.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p id={groupId} className="text-sm font-medium">
              Concern
            </p>
            {selected || text !== "" ? (
              <button
                type="button"
                onClick={clear}
                className="rounded-sm text-sm font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:py-1.5"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div
            role="radiogroup"
            aria-labelledby={groupId}
            className="flex flex-wrap gap-1"
          >
            {RED_FLAG_CATEGORIES.map((category) => {
              const on = category.id === selectedId;
              return (
                <label
                  key={category.id}
                  title={category.examples}
                  className={cn(
                    "flex min-h-8 cursor-pointer items-center rounded-full border px-2.5 py-1 text-[0.8rem] leading-snug transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/60 max-sm:min-h-10",
                    on
                      ? "border-brand bg-brand/15 font-medium text-foreground ring-1 ring-brand"
                      : "border-input text-foreground/85 hover:bg-muted/60",
                  )}
                >
                  <input
                    type="radio"
                    name={groupId}
                    className="sr-only"
                    checked={on}
                    onChange={() => pick(category.id)}
                  />
                  {category.label}
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={textId} className="text-sm font-medium">
            Or describe it in a few words (English or Finnish)
          </label>
          <div className="relative">
            <input
              id={textId}
              type="text"
              value={text}
              onChange={(event) => {
                const value = event.target.value;
                setText(value);
                // Words that match nothing replace a chip pick: the safety-net line shows, not a stale route.
                if (value.trim() !== "" && matchCategories(value).length === 0)
                  setPicked(null);
              }}
              maxLength={300}
              placeholder="e.g. weight loss, tiredness"
              autoComplete="off"
              aria-describedby={hintId}
              className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-[0.9375rem] transition-[border-color,box-shadow] outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
            />
            {fromText ? (
              <Tag className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 border-brand/60 bg-muted text-foreground">
                Matched from your words
              </Tag>
            ) : noTextMatch ? (
              <Tag className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 bg-muted text-foreground">
                No category matched
              </Tag>
            ) : null}
          </div>
          <p id={hintId} className="type-caption text-muted-foreground">
            Works with words like {HINT_WORDS.join(", ")} (also in Finnish).
          </p>
        </div>
      </div>

      {/* The four routes: always shown, so the reader sees what is being decided between. With
          a concern picked, its route is outlined and tagged; the others step back. */}
      <ul
        aria-label="The four referral routes, fastest first"
        className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
      >
        {ROUTES.map((urgency, index) => {
          const tier = TIERS[urgency];
          const on = route === urgency;
          const dim = route !== null && !on;
          return (
            <li
              key={urgency}
              aria-current={on ? "true" : undefined}
              className={cn(
                "relative flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors",
                on
                  ? "border-brand bg-brand/10 ring-2 ring-brand"
                  : "border-input",
                dim && "border-border",
              )}
            >
              {on ? (
                <Tag className="absolute -top-2.5 right-2 border-brand bg-brand text-background">
                  This route
                </Tag>
              ) : null}
              <p
                className={cn(
                  "flex gap-2 text-sm leading-snug font-semibold",
                  dim && "text-muted-foreground",
                )}
              >
                <span aria-hidden className="font-normal text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-pretty">{tier.title}</span>
              </p>
              <p
                className={cn(
                  "type-caption pl-4 text-pretty",
                  dim ? "text-muted-foreground/80" : "text-foreground/85",
                )}
              >
                {shortSpeed(tier.speed)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* One short result line plus its guideline links. Announced when it changes. */}
      <div
        aria-live="polite"
        className="flex flex-col gap-2 rounded-lg border border-input bg-muted px-4 py-2.5"
      >
        {selected || noTextMatch ? (
          <>
            <p className="text-sm leading-relaxed text-pretty">
              {selected ? (
                <>
                  {typed.length > 1 ? (
                    <Tag className="mr-2 align-middle">
                      Most urgent match shown
                    </Tag>
                  ) : null}
                  <span className="font-medium">
                    What the GP or clinic does:{" "}
                  </span>
                  {TIERS[selected.urgency].gpAction}
                </>
              ) : (
                <>
                  <span className="font-medium">
                    No category matched your words. That does not rule anything
                    out.{" "}
                  </span>
                  If you are worried or it gets worse, contact a health
                  professional now.
                </>
              )}
            </p>
            <Links
              label="Check the detail in the guideline"
              links={links}
              chips={chips}
            />
          </>
        ) : (
          <>
            <Links
              label="Pick a concern or type a few words to light up a route. Our own plain-language categories, not guideline text. Exact criteria:"
              links={[NICE_NG12, KAYPA_HOITO, FINNISH_ROADMAP]}
              chips={chips}
            />
          </>
        )}
      </div>
    </div>
  );
}
