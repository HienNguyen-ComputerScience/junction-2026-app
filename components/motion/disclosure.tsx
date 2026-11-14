import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * A "show more" button: a plainly labelled control that opens more detail in place.
 *
 * The label reads "Show <label>" when closed and "Hide <label>" when open (or pass `show` and
 * `hide` for other wording). It looks like a button, because it is one: an outlined control with
 * its words on it, never an icon alone. Nothing else on the page moves when it opens.
 *
 * It is a native <details>, so it works without script, the hidden text is in the HTML and found
 * by the browser's "find in page", and it is keyboard and screen-reader operable as it stands.
 * It eases open where the browser can animate a native <details>, opens at once elsewhere and
 * under reduced motion, and is always expanded on paper.
 *
 * Do not put a headline figure, its source or its main limitation in here: those stay visible.
 */
export function Disclosure({
  label,
  show,
  hide,
  defaultOpen = false,
  tone = "outline",
  className,
  contentClassName,
  children,
}: {
  /** What is behind the button, lower case: "how this is measured" → "Show how this is measured". */
  label?: string;
  /** Full closed-state wording, instead of "Show <label>". */
  show?: string;
  /** Full open-state wording, instead of "Hide <label>". */
  hide?: string;
  /** Open at first render: for content that is the point of the page (the ranking table). */
  defaultOpen?: boolean;
  /** outline: a button on cream. quiet: a text-weight button for use inside a dense panel. */
  tone?: "outline" | "quiet";
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const closed = show ?? `Show ${label ?? "more"}`;
  const open = hide ?? `Hide ${label ?? "this"}`;
  return (
    <details data-slot="disclosure" className={cn("disclosure group/show", className)} open={defaultOpen}>
      <summary
        className={cn(
          "inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg text-base font-semibold text-forest-ink outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 print:hidden",
          tone === "outline"
            ? "border border-forest-ink bg-cream-paper px-4 py-2 hover:bg-mint-veil"
            : "underline decoration-forest-ink/40 underline-offset-4 hover:decoration-forest-ink",
        )}
      >
        <Plus aria-hidden strokeWidth={1.75} className="size-4 shrink-0 group-open/show:hidden" />
        <Minus aria-hidden strokeWidth={1.75} className="hidden size-4 shrink-0 group-open/show:block" />
        <span className="group-open/show:hidden">{closed}</span>
        <span className="hidden group-open/show:inline">{open}</span>
      </summary>
      <div data-slot="disclosure-content" className={cn("pt-4", contentClassName)}>
        {children}
      </div>
    </details>
  );
}
