import type { CSSProperties, ReactNode } from "react";
import { cn } from "cn";

import type { GapStatus } from "@/lib/data";

// The briefing's few parts (no data imports, so client components can use them too), in the "cream paper" language: Forest Ink for every button, heading
// and stroke; Cream Paper for the card; keylime, mint and sage only as surfaces; Charcoal body
// text never below 16px; 14px corners, pills at 999px; no shadow and no coloured card border.

/** A button that leads somewhere: Forest Ink fill, Cream text, 14px 21px, a trailing arrow. */
export const PRIMARY_BUTTON =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[14px] bg-forest-ink px-[21px] py-[14px] text-center text-base leading-6 font-semibold text-cream-paper transition-colors outline-none hover:bg-forest-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink";

/** A button that shows something on this step, or goes back: cream with a plain edge. */
export const SECONDARY_BUTTON =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[14px] border border-input bg-cream-paper px-[21px] py-[13px] text-center text-base leading-6 font-semibold text-forest-ink transition-colors outline-none hover:bg-keylime-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink aria-expanded:bg-mint-veil aria-pressed:bg-mint-veil";

/** One of a few choices (a year, an action): the chosen one is filled, so it reads without colour. */
export const CHOICE_BUTTON =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[14px] border border-input bg-cream-paper px-[21px] py-[13px] text-center text-base leading-6 font-semibold text-forest-ink transition-colors outline-none hover:bg-keylime-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink aria-pressed:border-forest-ink aria-pressed:bg-forest-ink aria-pressed:text-cream-paper";

/**
 * A step's one statement: the light serif at 23px (28px from a tablet up), with lining figures
 * so "100" and "2025" read as numbers. It takes the keyboard focus when its step comes on screen.
 */
export const STATEMENT = "type-statement lining-nums outline-none sm:text-[1.75rem] sm:leading-[1.45]";

/** A plain text link inside the briefing: Forest Ink, underlined, 16px. */
export const TEXT_LINK =
  "rounded-sm text-base font-semibold text-forest-ink underline underline-offset-4 outline-none hover:text-forest-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink";

/** The small tag that names a step. The one uppercase style on the page. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-border bg-cream-paper px-[14px] py-[9px] type-eyebrow",
        className,
      )}
    >
      {children}
    </span>
  );
}

const LINE_WIDTHS = [40, 47, 53, 58, 55, 47, 40];

/**
 * The only decoration: a few thin Forest Ink lines that slide in from the card's left edge.
 * They play once per step and stop. Hidden from screen readers, from phones and from paper.
 */
export function EdgeLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none flex flex-col gap-[15px] overflow-hidden print:hidden", className)}>
      {LINE_WIDTHS.map((width, index) => (
        <span
          key={index}
          className="bf-line block h-[2px] bg-forest-ink"
          style={{ width, "--i": index } as CSSProperties}
        />
      ))}
    </div>
  );
}

const STATUS_MARK: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber",
  no_data: "border border-dashed border-status-grey bg-transparent",
};

const STATUS_TEXT: Record<GapStatus, string> = {
  red: "text-status-red-ink",
  amber: "text-status-amber-ink",
  no_data: "text-status-grey-ink",
};

/** A status in words with its mark, at body size: the colour never stands alone. */
export function StatusLabel({ status, children, className }: { status: GapStatus; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-start gap-2 text-base leading-6 font-semibold", STATUS_TEXT[status], className)}>
      <span aria-hidden className={cn("mt-[0.4375rem] size-2.5 shrink-0 rounded-[3px]", STATUS_MARK[status])} />
      <span>{children}</span>
    </span>
  );
}

/** A labelled bar on a 0 to 100 track: the name, the bar growing to its length, the exact value. */
export function ShareBar({
  name,
  value,
  text,
  tone,
  index = 0,
}: {
  name: string;
  value: number;
  /** The exact value as shown, e.g. "85.4%". */
  text: string;
  tone: "red" | "amber" | "plain";
  index?: number;
}) {
  const fill = tone === "red" ? "bg-status-red" : tone === "amber" ? "bg-status-amber-bar" : "bg-status-grey";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[11rem_minmax(0,1fr)_4.25rem]">
      <span className="text-base leading-6 font-semibold text-charcoal">{name}</span>
      <span className="text-right text-base leading-6 font-semibold text-charcoal tabular-nums sm:order-3">{text}</span>
      <span aria-hidden className="col-span-2 h-3 overflow-hidden rounded-full bg-track sm:order-2 sm:col-span-1">
        <span
          className={cn("bf-bar block h-full rounded-full", fill)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, "--i": index } as CSSProperties}
        />
      </span>
    </div>
  );
}
