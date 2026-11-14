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

const CHIP: Record<GapStatus, string> = {
  red: "border-status-red-border bg-status-red-soft text-status-red-ink",
  amber: "border-status-amber-border bg-status-amber-soft text-status-amber-ink",
  no_data: "border-status-grey-border bg-status-grey-soft text-status-grey-ink",
};

/**
 * Status chip: a dot plus a text label, so status never relies on colour alone.
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
  /** chip: tinted pill. plain: dot + coloured text only, for dense lists. */
  variant?: "chip" | "plain";
}) {
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "xs" && "h-5 text-[0.6875rem]",
        size === "sm" && "h-6 text-[0.75rem]",
        size === "md" && "h-7 text-[0.8125rem]",
        variant === "chip" && [
          "border",
          size === "xs" ? "px-1.5" : size === "sm" ? "px-2" : "px-2.5",
          status === "no_data" && "border-dashed",
          CHIP[status],
        ],
        variant === "plain" && STATUS_INK[status],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          size === "md" && "size-2",
          STATUS_FILL[status],
        )}
      />
      {children}
    </span>
  );
}
