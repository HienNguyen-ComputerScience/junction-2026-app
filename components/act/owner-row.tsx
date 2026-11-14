import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Who implements an action: the one "Owner" line of home, the county brief and the act page.
 * A 12px muted label and a 14px value on one line; where an action also names its evidence
 * source, that follows on the same line ("Owner: … · Evidence: PubMed Central").
 */
export function OwnerRow({
  owner,
  evidence,
  className,
}: {
  owner: string;
  /** The evidence source, as text or a chip. Left out where the card has no room for it. */
  evidence?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-snug text-muted-foreground", className)}>
      <span className="min-w-0 text-pretty">
        <span className="text-[0.75rem]">Owner:</span> {owner}
      </span>
      {evidence ? (
        <>
          <span className="min-w-0">
            <span aria-hidden>· </span>
            <span className="text-[0.75rem]">Evidence:</span> {evidence}
          </span>
        </>
      ) : null}
    </p>
  );
}
