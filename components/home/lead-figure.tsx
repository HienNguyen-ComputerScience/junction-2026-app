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
 * The home tool's focal number: the bottleneck step's share as the page's largest mark, its
 * status and source beside it, and one caption with what it counts and Finland's value.
 * Nothing for a step without a value.
 */
export function LeadFigure({ gap }: { gap: Gap }) {
  if (gap.value === null || !CAPTION[gap.stage]) return null;
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
        {CAPTION[gap.stage]} · Finland <span className="figure text-foreground">{formatPct(gap.national_value)}</span>
      </p>
    </div>
  );
}
