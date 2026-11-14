import { SourceChip } from "@/components/source-chip";

// Median days from first symptoms to treatment in a Finnish lymphoma study, by where the first
// healthcare contact was (H. Kuitunen, Junction 2026 challenge talk; source kuitunen-2026).
const PUBLIC_DAYS = 127;
const PRIVATE_DAYS = 76;

/**
 * Why the first step matters, as one plain comparison under the step cards: the difference of
 * the study's two medians, in days, then both medians and what they compare. Context for
 * getting to a GP, not a figure for this area.
 */
export function FirstContactGap() {
  const longer = PUBLIC_DAYS - PRIVATE_DAYS;
  return (
    <div className="grid gap-x-8 gap-y-2 border-t border-border px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-center">
      <div className="flex flex-col gap-1">
        <p className="type-caption font-medium text-muted-foreground">Why getting to a GP matters</p>
        <p className="numeral text-[1.75rem] leading-tight text-foreground">
          {longer} days longer
        </p>
      </div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-pretty text-muted-foreground">
        <span>
          from first symptoms to treatment when the first contact was public primary care (median{" "}
          <span className="figure text-foreground">{PUBLIC_DAYS} days</span>) rather than private or occupational care
          (<span className="figure text-foreground">{PRIVATE_DAYS} days</span>). Lymphoma patients in Finland; not a
          figure for this area.
        </span>
        <SourceChip sourceId="kuitunen-2026" />
      </p>
    </div>
  );
}
