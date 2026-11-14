import * as React from "react";
import { cn } from "cn";

/**
 * Framed card: an outer frame with a label row, holding one or more panels.
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
 * The page is dark: a frame is one surface step above the page and a panel one step above the
 * frame, each edged with a hairline. No shadows.
 */

type FrameElement = "section" | "div" | "article" | "aside";

function Frame({
  as: Comp = "section",
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "ref"> & { as?: FrameElement }) {
  return (
    <Comp
      data-slot="frame"
      className={cn(
        "group/frame flex flex-col rounded-frame border border-frame-border bg-frame p-1.5 text-foreground",
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
  // A frame title is a section title (type-title, 22px). A caller's own type-* class replaces
  // the default instead of being added to it: two type utilities on one element would be
  // settled by their order in the stylesheet, not by the caller.
  const hasType = /(^|\s)type-/.test(className ?? "");
  return (
    <Comp
      data-slot="frame-title"
      className={cn("col-start-1 text-foreground", !hasType && "type-title", className)}
      {...props}
    />
  );
}

function FrameMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-meta"
      className={cn(
        // Beside the title from sm up; under it, left-aligned, on a phone.
        "col-span-2 col-start-1 row-start-2 flex flex-wrap items-center gap-2 type-caption text-muted-foreground sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-end",
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
        "rounded-panel border border-border bg-card text-card-foreground",
        PANEL_PADDING[padding],
        className,
      )}
      {...props}
    />
  );
}

/**
 * The label strip of a panel that has a title: the title on the left, its chip (a source, a
 * provenance tag) on the right, a hairline under it. Use it as the first child of a
 * `FramePanel padding="none"`; a panel without a title has no strip.
 */
function FramePanelLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-panel-label"
      className={cn(
        "flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-border px-4 py-2 type-caption font-medium text-foreground sm:px-6",
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
      className={cn("px-3 pt-3 pb-2 type-caption text-muted-foreground sm:px-4", className)}
      {...props}
    />
  );
}

export {
  Frame,
  FrameHeader,
  FrameTitle,
  FrameMeta,
  FrameDescription,
  FramePanel,
  FramePanelLabel,
  FrameFooter,
};
