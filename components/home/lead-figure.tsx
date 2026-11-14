import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import type { Gap } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

/**
 * The focal number of the home card: the step's share as the largest mark, its status and
 * source beside it. What the share counts and its gap to Finland are said once, by the main
 * reason sentence that follows; Finland's level is on the what-if bar. Nothing for a step
 * without a value.
 */
export function LeadFigure({ gap }: { gap: Gap }) {
  if (gap.value === null) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <p className={`numeral text-[3.5rem] leading-[0.95] sm:text-[4.75rem] ${STATUS_FIGURE[gap.status]}`}>
        {formatPct(gap.value)}
      </p>
      <div className="flex flex-col items-start gap-1.5">
        <StatusBadge status={gap.status} size="md">
          {STATUS_LABEL[gap.status]}
        </StatusBadge>
        <SourceChip sourceId={gap.source_id} year={gap.year} />
      </div>
    </div>
  );
}
