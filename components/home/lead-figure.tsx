import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import type { Gap } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";
import type { AreaValue } from "@/lib/what-if";

/**
 * The focal number of the home card and the county header: the step's share as the largest
 * mark, its status and source beside it, and under it the benchmark it is read against:
 * Finland's own level and the best area's. What the share counts is said once, by the main
 * reason sentence that follows. Nothing for a step without a value.
 */
export function LeadFigure({ gap, best }: { gap: Gap; best: AreaValue | null }) {
  if (gap.value === null) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p
          className={`numeral text-[3.5rem] leading-[0.95] sm:text-[4.75rem] ${STATUS_FIGURE[gap.status]}`}
        >
          {formatPct(gap.value)}
        </p>
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge status={gap.status} size="md">
            {STATUS_LABEL[gap.status]}
          </StatusBadge>
          <SourceChip sourceId={gap.source_id} year={gap.year} />
        </div>
      </div>
      <p className="text-sm text-pretty text-muted-foreground">
        Finland <span className="figure text-foreground">{formatPct(gap.national_value)}</span>
        {best && (
          <>
            {" "}
            · best area <span className="figure text-foreground">{formatPct(best.value)}</span> ({best.name})
          </>
        )}
      </p>
    </div>
  );
}
