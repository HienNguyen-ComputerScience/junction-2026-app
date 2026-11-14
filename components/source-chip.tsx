import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getSource, type Source } from "@/lib/data";

/** Visible chip text. Must make sense on its own: touch screens never show the title tooltip. */
export function sourceLabel(source: Source): string {
  if (source.source_id === "sotkanet-regions") return "Sotkanet regions";
  const match = /^sotkanet-(\d+)$/.exec(source.source_id);
  if (match) return `Sotkanet ${match[1]}`;
  return `Source: ${source.publisher}`;
}

/**
 * Source reference: a small mono tag that links to the source. Sits next to, or in the same
 * block as, every number. 24px tall on desktop, 28px on phones, with a larger hit area.
 */
export function SourceChip({
  sourceId,
  year,
}: {
  sourceId: string;
  year?: number;
}) {
  const source = getSource(sourceId);
  if (!source) {
    return <Badge variant="outline">source missing</Badge>;
  }
  const label = year === undefined ? sourceLabel(source) : `${sourceLabel(source)} · ${year}`;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.name}
      aria-label={`${label}: ${source.name} (opens in a new tab)`}
      className="group/chip relative inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1 rounded-sm border border-border bg-card px-2 align-middle type-mark whitespace-nowrap text-muted-foreground transition-colors outline-none after:absolute after:-inset-x-0.5 after:-inset-y-2 after:content-[''] hover:border-brand/40 hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-6"
    >
      <span className="truncate">{label}</span>
      <ArrowUpRight aria-hidden className="size-3 shrink-0 opacity-70 group-hover/chip:opacity-100" />
    </a>
  );
}
