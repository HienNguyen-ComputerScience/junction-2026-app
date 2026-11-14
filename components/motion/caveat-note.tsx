import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * A caveat attached to the figure it qualifies: a small framed note (mint, pill-rounded) that
 * says the caveat in a few words, always visible, with the full explanation behind a plainly
 * labelled "Why?" button. A native <details>: works without script, the explanation is in the
 * HTML (find in page, screen readers), and it is always open on paper.
 */
export function CaveatNote({
  short,
  children,
  className,
}: {
  /** The caveat in a few words, e.g. "Counts visits, not people". Always visible. */
  short: ReactNode;
  /** The full explanation, behind "Why?". Leave out when the short form says it all. */
  children?: ReactNode;
  className?: string;
}) {
  const label = (
    <>
      <span className="font-semibold">Read with care: </span>
      {short}
    </>
  );
  if (!children) {
    return (
      <p data-slot="caveat-note" className={cn("w-fit max-w-full rounded-[1.25rem] border border-sage-mist bg-mint-veil px-4 py-2 text-base text-pretty", className)}>
        {label}
      </p>
    );
  }
  return (
    <details
      data-slot="caveat-note"
      className={cn("disclosure group/why w-fit max-w-full rounded-[1.25rem] border border-sage-mist bg-mint-veil px-4 py-2 text-base", className)}
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <span className="text-pretty">{label}</span>
        <span className="inline-flex min-h-8 items-center rounded-full border border-forest-ink bg-cream-paper px-3 text-base font-semibold text-forest-ink hover:bg-keylime-wash print:hidden">
          <span data-when="closed">Why?</span>
          <span data-when="open">Hide why</span>
        </span>
      </summary>
      <div data-slot="disclosure-content" className="max-w-[64ch] pt-2 pb-1 text-base text-pretty">
        {children}
      </div>
    </details>
  );
}
