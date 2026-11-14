import { FirstStep } from "@/components/act/action-card";
import { SourceChip } from "@/components/source-chip";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import type { Evidence } from "@/lib/data";

/**
 * The first recommended action for an area, condensed from the act page's action card: the
 * action, its First step box, its owner and its evidence source. The rest (precedent, evidence,
 * limitations, "Source checked") is on the act page.
 */
export function TopAction({ action }: { action: Evidence }) {
  return (
    <FramePanel padding="none" className="flex h-full flex-col">
      <FramePanelLabel className="sm:px-5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">Recommended action 1</h3>
        <SourceChip sourceId={action.source_id} />
      </FramePanelLabel>
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5">
        <p className="type-heading text-pretty text-foreground">{action.action}</p>
        <FirstStep compact>{action.first_step}</FirstStep>
        <p className="type-caption text-pretty text-muted-foreground">Owner: {action.who_implements}</p>
      </div>
    </FramePanel>
  );
}
