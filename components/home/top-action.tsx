import { FirstStep, plainTitle } from "@/components/act/action-card";
import { SourceChip } from "@/components/source-chip";
import type { Evidence } from "@/lib/data";

/**
 * The first recommended action for an area, as the second row of the home answer card: the
 * action, its First step box and its evidence source. The owner, precedent and limitations are
 * on the act page. `keepLevel`: no measured step is worse than Finland, so the label reads as
 * keeping the level, not fixing a break.
 */
export function TopAction({ action, keepLevel = false }: { action: Evidence; keepLevel?: boolean }) {
  return (
    // The hero card's second row, under a hairline: the action on the left, the First step box
    // and the evidence source on the right.
    <div className="grid gap-x-8 gap-y-4 border-t border-border px-5 py-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">
          {keepLevel ? "Action to keep this level" : "Recommended action 1"}
        </h3>
        <p className="text-base leading-snug font-semibold text-pretty text-foreground">{plainTitle(action.action)}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <FirstStep compact>{action.first_step}</FirstStep>
        <p className="flex items-center gap-2 type-caption text-muted-foreground">
          Evidence <SourceChip sourceId={action.source_id} />
        </p>
      </div>
    </div>
  );
}
