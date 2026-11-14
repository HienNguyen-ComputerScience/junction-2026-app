import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import type { Gap } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

/** What the bottleneck step's share counts: the county hero's wording for the same step. */
const CAPTION: Record<Gap["stage"], string> = {
  gp_access: "of non-urgent GP visits waited more than 7 days",
  referral: "of referrals were processed within 3 days (higher is faster)",
  gp_recognition: "",
};

/**
 * The home card's focal number: the bottleneck step's share, its status and source on one row,
 * and what it counts with Finland's value. Nothing for a step without a value.
 */
export function LeadFigure({ gap }: { gap: Gap }) {
  if (gap.value === null || !CAPTION[gap.stage]) return null;
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className={`numeral text-[3rem] leading-none ${STATUS_FIGURE[gap.status]}`}>{formatPct(gap.value)}</p>
        <StatusBadge status={gap.status} size="sm">
          {STATUS_LABEL[gap.status]}
        </StatusBadge>
        <SourceChip sourceId={gap.source_id} year={gap.year} />
      </div>
      <p className="type-caption text-muted-foreground">
        {CAPTION[gap.stage]} · Finland <span className="figure">{formatPct(gap.national_value)}</span>
      </p>
    </div>
  );
}
