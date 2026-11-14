import { cn } from "cn";

import { getGrade, type GradeBrief, type GradeLevel } from "@/lib/insights";

/** The shape that goes with each level, so grades never depend on colour alone. */
export function GradeGlyph({ level, className }: { level: GradeLevel; className?: string }) {
  const common = { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": true, className: cn("shrink-0", className) };
  switch (level) {
    case "solid":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="5.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "care":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 1.5 A5.5 5.5 0 0 0 7 12.5 Z" fill="currentColor" />
        </svg>
      );
    case "shared":
      return (
        <svg {...common}>
          <circle cx="5" cy="7" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="7" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 2" />
        </svg>
      );
  }
}

const SURFACE: Record<GradeLevel, string> = {
  solid: "bg-mint-veil border-transparent",
  care: "bg-cream-paper border-forest-ink",
  shared: "bg-slate-hush border-transparent",
  none: "bg-cream-paper border-dashed border-forest-ink",
};

/**
 * A small plain label beside a number: how far to trust it, and why in one sentence.
 *
 * Pass a `grade` you already have, or `areaId` + `indicatorId` + `year` to look it up in
 * data/insights/grades.json. The reason is visible text under the label (never hover-only);
 * `showReason={false}` leaves only the label, for tight table cells where the reason is shown
 * elsewhere on the page.
 */
export function ConfidenceBadge({
  grade,
  areaId,
  indicatorId,
  year,
  showReason = true,
  className,
}: {
  grade?: GradeBrief;
  areaId?: string;
  indicatorId?: string;
  year?: number;
  showReason?: boolean;
  className?: string;
}) {
  const resolved =
    grade ?? (areaId && indicatorId && year !== undefined ? getGrade(areaId, indicatorId, year) : undefined);
  if (!resolved) return null;
  return (
    <span data-slot="confidence-badge" className={cn("inline-flex max-w-full flex-col items-start gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 whitespace-nowrap text-sm leading-6 font-semibold text-forest-ink",
          SURFACE[resolved.level],
        )}
      >
        <GradeGlyph level={resolved.level} />
        <span>
          <span className="sr-only">Confidence: </span>
          {resolved.label}
        </span>
      </span>
      {showReason ? <span className="text-base leading-snug text-pretty text-charcoal">{resolved.reason}</span> : null}
    </span>
  );
}
