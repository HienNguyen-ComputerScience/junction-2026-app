import { AlertTriangle, CircleDashed, Minus } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import type { GapStatus } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

export type TrendPoint = { year: number; value: number | null };

export type StageCardProps = {
  step: number;
  title: string;
  status: GapStatus;
  /** Present when the stage has a public indicator. */
  measure?: {
    value: number | null;
    nationalValue: number;
    caption: string;
    note: string;
    sourceId: string;
    year: number;
    trend: TrendPoint[];
  };
  /** Shown instead of a measure when there is no public indicator. */
  emptyText?: string;
};

const STATUS_STYLE: Record<GapStatus, { card: string; badge: string }> = {
  red: {
    card: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    badge: "bg-red-600 text-white",
  },
  amber: {
    card: "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    badge: "bg-amber-400 text-amber-950",
  },
  no_data: {
    card: "border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40",
    badge: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
  },
};

const STATUS_ICON = { red: AlertTriangle, amber: Minus, no_data: CircleDashed };

export function StageCard({ step, title, status, measure, emptyText }: StageCardProps) {
  const style = STATUS_STYLE[status];
  const Icon = STATUS_ICON[status];

  return (
    <article className={`flex h-full flex-col gap-3 rounded-xl border-2 p-4 ${style.card}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Step {step}</span>
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>
        <span
          className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}
        >
          <Icon aria-hidden className="size-3.5" />
          {STATUS_LABEL[status]}
        </span>
      </div>

      {measure ? (
        <>
          <div className="flex flex-col gap-0.5">
            {measure.value === null ? (
              <span className="text-2xl font-semibold text-muted-foreground">No value</span>
            ) : (
              <span className="text-3xl font-semibold tabular-nums">
                {formatPct(measure.value)}
              </span>
            )}
            <span className="text-sm">{measure.caption}</span>
            <span className="text-sm text-muted-foreground">
              Finland: {formatPct(measure.nationalValue)}
            </span>
          </div>
          <p className="text-sm">{measure.note}</p>
          <TrendStrip trend={measure.trend} />
          <div className="mt-auto">
            <SourceChip sourceId={measure.sourceId} year={measure.year} />
          </div>
        </>
      ) : (
        <p className="text-sm">{emptyText}</p>
      )}
    </article>
  );
}

function TrendStrip({ trend }: { trend: TrendPoint[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">Trend</span>
      <div className="flex items-end gap-3">
        {trend.map((point) => (
          <div key={point.year} className="flex w-12 flex-col items-center gap-1">
            <span className="text-xs font-medium tabular-nums">
              {point.value === null ? "n/a" : formatPct(point.value)}
            </span>
            <div className="flex h-10 w-full items-end rounded-sm bg-background/70">
              {point.value !== null && (
                <div
                  className="w-full rounded-sm bg-foreground/60"
                  style={{ height: `${point.value}%` }}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{point.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
