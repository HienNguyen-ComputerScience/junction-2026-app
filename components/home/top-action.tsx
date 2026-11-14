import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FirstStep, plainTitle } from "@/components/act/action-card";
import { SourceChip } from "@/components/source-chip";
import type { Evidence } from "@/lib/data";

/**
 * The first recommended action for an area, as the second row of the home answer card: the
 * action, its First step box and its evidence source. The owner, precedent and limitations are
 * on the act page. `keepLevel`: no measured step is worse than Finland, so the label reads as
 * keeping the level, not fixing a break. The whole block is one link to the action on the act
 * page (`href`): "Open this action" is the link and stretches over the block; the source chip,
 * itself a link, sits above it.
 */
export function TopAction({
  action,
  keepLevel = false,
  href,
}: {
  action: Evidence;
  keepLevel?: boolean;
  /** The action on the act page (…/act#action-1). */
  href: string;
}) {
  return (
    // The hero card's second row, under a hairline: the action on the left, the First step box
    // and the evidence source on the right.
    <div className="group relative grid rounded-b-panel gap-x-8 gap-y-4 border-t border-border px-5 py-5 transition-colors hover:bg-accent/50 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div className="flex flex-col items-start gap-2.5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">
          {keepLevel ? "Action to keep this level" : "Recommended action 1"}
        </h3>
        <p className="text-base leading-snug font-semibold text-pretty text-foreground">{plainTitle(action.action)}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-brand-ink underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
        >
          Open this action
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        <FirstStep compact>{action.first_step}</FirstStep>
        <p className="flex items-center gap-2 type-caption text-muted-foreground">
          Evidence{" "}
          <span className="relative z-10 inline-flex">
            <SourceChip sourceId={action.source_id} />
          </span>
        </p>
      </div>
    </div>
  );
}
