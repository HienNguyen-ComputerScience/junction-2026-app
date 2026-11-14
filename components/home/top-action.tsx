import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { plainTitle } from "@/components/act/action-card";
import { SourceChip } from "@/components/source-chip";
import type { Evidence } from "@/lib/data";

/**
 * The first recommended action for an area, as the second row of the home answer card: the
 * action's title and its evidence source. Its first step, owner, precedent and limitations are
 * on the act page, where they are used. `keepLevel`: no measured step is worse than Finland, so the label reads as
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
    // The answer card's last row, under a hairline.
    <div className="group relative flex flex-col items-start gap-2.5 rounded-b-panel border-t border-border px-5 py-5 transition-colors hover:bg-accent/50 sm:px-8">
      <h4 className="font-sans text-base font-medium text-muted-foreground">
        {keepLevel ? "Action to keep this level" : "Recommended action 1"}
      </h4>
      <p className="text-base leading-snug font-semibold text-pretty text-foreground">{plainTitle(action.action)}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href={href}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-sm text-base font-medium text-brand-ink underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
        >
          Open this action and its first step
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
        </Link>
        <span className="relative z-10 inline-flex items-center gap-2 text-base text-muted-foreground">
          Evidence <SourceChip sourceId={action.source_id} />
        </span>
      </div>
    </div>
  );
}
