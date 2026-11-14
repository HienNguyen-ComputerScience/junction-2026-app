import type { ReactNode } from "react";
import { cn } from "cn";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { Disclosure } from "@/components/motion/disclosure";
import { Reveal } from "@/components/motion/reveal";
import { SourceChip } from "@/components/source-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import type { GapStatus } from "@/lib/data";

/**
 * One statistic as a self-contained unit: a small label, the figure (counting up once as it comes
 * into view), what it means in one or two plain sentences, its status in words, the limitation
 * that applies, and its source. Everything a reader needs is visible; `detail` sits behind a
 * plainly labelled "Show …" button for those who want more.
 *
 * Used for the lead figures at the top of a page or a section, never for table cells.
 */
export function StatUnit({
  eyebrow,
  value,
  final,
  decimals = 1,
  suffix = "",
  unit,
  tone = "plain",
  status,
  limitation,
  sources,
  detail,
  detailLabel = "how this is measured",
  index = 0,
  className,
  children,
}: {
  eyebrow: string;
  /** The figure to count to. */
  value: number;
  /** The exact text at rest, e.g. "54.7%". Defaults to the value with `decimals` and `suffix`. */
  final?: string;
  decimals?: number;
  /** Part of the figure, e.g. "%". */
  suffix?: string;
  /** Set smaller after the figure, e.g. "of 22 areas", "points". */
  unit?: string;
  /** alarm: the figure in the status ink (worse than Finland). */
  tone?: "plain" | "alarm";
  status?: { status: GapStatus; label: string };
  /** The one limitation that applies, always visible. */
  limitation?: ReactNode;
  sources: { sourceId: string; year?: number }[];
  detail?: ReactNode;
  detailLabel?: string;
  index?: number;
  className?: string;
  /** The plain sentence(s) that say what the figure means. */
  children: ReactNode;
}) {
  return (
    <Reveal index={index} className={cn("print-keep flex", className)}>
      <div data-slot="stat-unit" className="flex w-full flex-col gap-3.5 rounded-lg bg-card p-7 sm:p-8">
        <p className="type-eyebrow">{eyebrow}</p>
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className={cn("numeral text-[3.5rem] sm:text-[4rem]", tone === "alarm" ? "text-status-red-ink" : "text-forest-ink")}>
            <AnimatedNumber value={value} final={final} decimals={decimals} suffix={suffix} />
          </span>
          {unit ? <span className="font-display text-2xl font-light text-forest-ink">{unit}</span> : null}
        </p>
        {status ? <StatusBadge status={status.status}>{status.label}</StatusBadge> : null}
        <div className="flex max-w-[48ch] flex-col gap-2 text-base text-pretty">{children}</div>
        {limitation ? <p className="max-w-[48ch] text-sm text-pretty text-muted-foreground">{limitation}</p> : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {sources.map((source) => (
            <SourceChip key={`${source.sourceId}-${source.year ?? ""}`} sourceId={source.sourceId} year={source.year} />
          ))}
        </div>
        {detail ? (
          <Disclosure label={detailLabel} tone="quiet">
            <div className="max-w-[56ch] text-base text-pretty">{detail}</div>
          </Disclosure>
        ) : null}
      </div>
    </Reveal>
  );
}
