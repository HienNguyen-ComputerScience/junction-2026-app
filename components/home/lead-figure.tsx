import { SourceChip } from "@/components/source-chip";
import { withFigures } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import type { Gap, Stage } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

/** What the big share counts, said under it. Visits and referrals, never people. */
const WHAT: Partial<Record<Stage, string>> = {
  gp_access: "of non-urgent GP visits wait over 7 days (lower is better)",
  referral: "of referrals are processed within 3 days (higher is better)",
};

/**
 * The focal number of the home card: the step's share as the largest mark, its status and
 * source beside it, and one caption directly under it that says what it counts and gives
 * Finland's value for comparison. Nothing for a step without a value.
 */
export function LeadFigure({ gap }: { gap: Gap }) {
  if (gap.value === null) return null;
  const what = WHAT[gap.stage];
  return (
    <div className="flex flex-col gap-1.5">
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
      {what ? (
        <p className="text-base leading-snug text-muted-foreground">
          {what} · {withFigures(`Finland ${formatPct(gap.national_value)}`)}
        </p>
      ) : null}
    </div>
  );
}
