import type { ReactNode } from "react";
import { cn } from "cn";

import { TEXT_LINK } from "@/components/briefing/ui";
import { SourceChip } from "@/components/source-chip";
import { getSource, indicators } from "@/lib/data";

/**
 * The source of a figure and the limit that applies to it, always together and always visible
 * next to the figure: motion and buttons never hide either.
 */
export function SourceLine({
  sourceId,
  year,
  children,
  className,
}: {
  sourceId: string;
  year?: number;
  /** The limitation in one or two plain sentences. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-2 text-base leading-6 text-pretty text-charcoal", className)}>
      <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap text-forest-ink">
        Source: <SourceChip sourceId={sourceId} year={year} />
      </span>
      {children ? <span className="min-w-0 basis-full sm:basis-auto sm:flex-1">{children}</span> : null}
    </p>
  );
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Where a link goes, in words: "sotkanet.fi". */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the source";
  }
}

/**
 * What "Show me the source" opens: who publishes the figure, its full official name, the year,
 * the day our copy was taken, what it cannot say, and a link that says where it leads.
 */
export function SourceDetails({ sourceId, year, indicatorId }: { sourceId: string; year?: number; indicatorId?: string }) {
  const source = getSource(sourceId);
  if (!source) return <p className="text-base leading-6 text-charcoal">The source of this figure is missing from the snapshot.</p>;
  const indicator = indicatorId ? indicators.find((candidate) => candidate.indicator_id === indicatorId) : undefined;
  const rows: [string, string][] = [
    ["Published by", source.publisher],
    ["Official name", indicator ? `${indicator.name} (Sotkanet ${indicator.indicator_id})` : source.name],
    ...(year === undefined ? [] : ([["Year of the figure", String(year)]] as [string, string][])),
    ["Our copy was taken on", DATE.format(new Date(`${source.retrieved}T00:00:00Z`))],
    ...(indicator ? ([["What it cannot say", indicator.limitation]] as [string, string][]) : []),
  ];
  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="type-heading text-forest-ink">Where this figure comes from</h2>
      <dl className="grid gap-x-6 gap-y-2 text-base leading-6 text-charcoal sm:grid-cols-[12rem_minmax(0,1fr)]">
        {rows.map(([term, text]) => (
          <div key={term} className="contents">
            <dt className="font-semibold max-sm:mt-1.5">{term}</dt>
            <dd className="text-pretty">{text}</dd>
          </div>
        ))}
      </dl>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className={cn(TEXT_LINK, "w-fit")}>
        Open the source at {hostOf(source.url)} (opens in a new window)
      </a>
    </div>
  );
}
