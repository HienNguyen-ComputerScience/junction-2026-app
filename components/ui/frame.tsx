import * as React from "react";
import { cn } from "cn";

/**
 * Framed card: a tinted outer frame with a label row, holding one or more white panels.
 *
 *   <Frame aria-labelledby="x">
 *     <FrameHeader>
 *       <FrameTitle id="x">Title</FrameTitle>
 *       <FrameMeta>small meta / chips</FrameMeta>
 *       <FrameDescription>optional one-line description</FrameDescription>
 *     </FrameHeader>
 *     <FramePanel>content</FramePanel>
 *     <FrameFooter>footnotes</FrameFooter>
 *   </Frame>
 *
 * tone="inverse" scopes the dark tokens (.dark) to the frame: use it once per screen, for the key message.
 * Frame and FramePanel never clip overflow, so `sticky` children keep working.
 */

type FrameElement = "section" | "div" | "article" | "aside";

function Frame({
  as: Comp = "section",
  tone = "default",
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "ref"> & { as?: FrameElement; tone?: "default" | "inverse" }) {
  return (
    <Comp
      data-slot="frame"
      data-tone={tone}
      className={cn(
        "group/frame flex flex-col rounded-frame border border-frame-border bg-frame p-1.5 text-foreground",
        tone === "inverse" && "dark border-transparent bg-background",
        className,
      )}
      {...props}
    />
  );
}

function FrameHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-header"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 pt-3 pb-3 sm:px-4",
        className,
      )}
      {...props}
    />
  );
}

type HeadingTag = "h1" | "h2" | "h3" | "div";

function FrameTitle({
  as: Comp = "h2",
  className,
  ...props
}: Omit<React.ComponentProps<"h2">, "ref"> & { as?: HeadingTag }) {
  return (
    <Comp
      data-slot="frame-title"
      className={cn("col-start-1 type-heading text-foreground", className)}
      {...props}
    />
  );
}

function FrameMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-meta"
      className={cn(
        "col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 type-caption text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function FrameDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="frame-description"
      className={cn("col-span-2 max-w-3xl type-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

const PANEL_PADDING = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
} as const;

function FramePanel({
  padding = "md",
  className,
  ...props
}: React.ComponentProps<"div"> & { padding?: keyof typeof PANEL_PADDING }) {
  return (
    <div
      data-slot="frame-panel"
      className={cn(
        "rounded-panel border border-border/80 bg-card text-card-foreground shadow-[0_1px_2px_oklch(0.2_0.02_260/0.05)]",
        "group-data-[tone=inverse]/frame:border-white/8 group-data-[tone=inverse]/frame:shadow-none",
        PANEL_PADDING[padding],
        className,
      )}
      {...props}
    />
  );
}

function FrameFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-footer"
      className={cn("px-3 pt-3 pb-2 type-micro text-muted-foreground sm:px-4", className)}
      {...props}
    />
  );
}

export { Frame, FrameHeader, FrameTitle, FrameMeta, FrameDescription, FramePanel, FrameFooter };
