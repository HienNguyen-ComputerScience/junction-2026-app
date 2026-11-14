import { FirstStep } from "@/components/act/action-card";
import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import type { Evidence } from "@/lib/data";

/**
 * The first recommended action for an area, condensed from the act page's action card: the
 * action, its First step box, its owner and its evidence source. The rest (precedent, evidence,
 * limitations, "Source checked") is on the act page.
 */
export function TopAction({ action }: { action: Evidence }) {
  return (
    // Wide: the action and its owner on the left, the First step box and the evidence source on
    // the right. No title strip: the small heading leads the left column.
    <FramePanel
      padding="none"
      className="grid h-full gap-x-8 gap-y-4 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start"
    >
      <div className="flex flex-col gap-2.5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">Recommended action 1</h3>
        <p className="text-base leading-snug font-semibold text-pretty text-foreground">{action.action}</p>
        <dl className="mt-1 flex flex-col gap-1 type-caption text-muted-foreground">
          <dt>Owner</dt>
          <dd className="text-pretty text-foreground/90">{action.who_implements}</dd>
        </dl>
      </div>
      <div className="flex flex-col gap-2.5">
        <FirstStep compact>{action.first_step}</FirstStep>
        <p className="flex items-center gap-2 type-caption text-muted-foreground">
          Evidence <SourceChip sourceId={action.source_id} />
        </p>
      </div>
    </FramePanel>
  );
}
