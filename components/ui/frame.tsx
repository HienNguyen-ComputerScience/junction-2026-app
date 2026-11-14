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
 * A frame is a section, not a surface: its title sits on the page and its panels are the one
 * raised surface (bg-card and a hairline). Inside a panel, items are separated by space and
 * hairline dividers; the only surface inside a panel is a block that means something (the
 * First step box, an input, a chip). So nothing is ever more than two surfaces deep. No shadows.
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
        "group/frame flex flex-col text-foreground",
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
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-0 pb-4",
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
      className={cn("col-span-2 max-w-[68ch] type-caption text-muted-foreground", className)}
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
 * The title row of a panel that needs a title: the title on the left, its chip (a source, a
 * provenance tag) on the right. Use it as the first child of a `FramePanel padding="none"`; a
 * panel without a title has none. `divider` draws a hairline under it, only where rows with
 * their own dividers follow (a list, a table); otherwise the space alone separates it.
 */
function FramePanelLabel({
  className,
  divider = false,
  ...props
}: React.ComponentProps<"div"> & { divider?: boolean }) {
  return (
    <div
      data-slot="frame-panel-label"
      className={cn(
        "flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-5 type-caption font-medium text-foreground sm:px-6",
        divider ? "border-b border-border py-2" : "pt-4 pb-0",
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
      className={cn("px-0 pt-4 type-caption text-muted-foreground", className)}
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
