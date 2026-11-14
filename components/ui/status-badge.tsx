import * as React from "react";
import { cn } from "cn";

import type { GapStatus } from "@/lib/data";

/** Fill colour for bars, dots and markers, by data status. */
export const STATUS_FILL: Record<GapStatus, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber",
  no_data: "bg-status-grey",
};

/** Readable (AA) text colour, by data status. */
export const STATUS_INK: Record<GapStatus, string> = {
  red: "text-status-red-ink",
  amber: "text-status-amber-ink",
  no_data: "text-status-grey-ink",
};

/**
 * Colour for a big figure (`numeral`), by data status. Only "worse than Finland" colours the
 * figure itself; an amber figure stays in the text colour, with the marker and the label
 * carrying the amber, so a page keeps a calm end. Use this for numerals, STATUS_INK for labels.
 */
export const STATUS_FIGURE: Record<GapStatus, string> = {
  red: "text-status-red-ink",
  amber: "text-foreground",
  no_data: "text-muted-foreground",
};

const CHIP: Record<GapStatus, string> = {
  red: "border-status-red-border bg-status-red-soft text-status-red-ink",
  amber: "border-status-amber-border bg-status-amber-soft text-status-amber-ink",
  no_data: "border-status-grey-border bg-status-grey-soft text-status-grey-ink",
};

/**
 * Status chip: an 8px square mark plus a text label, so status never relies on colour alone.
 * Always pass the label text (e.g. STATUS_LABEL[status] from lib/ranking).
 */
export function StatusBadge({
  status,
  size = "sm",
  variant = "chip",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  status: GapStatus;
  size?: "xs" | "sm" | "md";
  /** chip: tinted tag. plain: mark + coloured text. quiet: mark + muted text, for dense lists. */
  variant?: "chip" | "plain" | "quiet";
}) {
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm font-medium whitespace-nowrap",
        // Quiet is a line of secondary text (13px), not a tag: it has one size.
        variant === "quiet" && "h-5 text-[0.8125rem] leading-5",
        // xs is as tall as the source chip it sits beside.
        variant !== "quiet" && size === "xs" && "h-6 text-[0.6875rem]",
        variant !== "quiet" && size === "sm" && "h-6 text-[0.75rem]",
        variant !== "quiet" && size === "md" && "h-7 text-[0.8125rem]",
        variant === "chip" && [
          "border",
          size === "xs" ? "px-1.5" : size === "sm" ? "px-2" : "px-2.5",
          status === "no_data" && "border-dashed",
          CHIP[status],
        ],
        variant === "plain" && STATUS_INK[status],
        variant === "quiet" && "font-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-[2px]", STATUS_FILL[status])}
      />
      {children}
    </span>
  );
}
