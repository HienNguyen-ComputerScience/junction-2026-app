import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getSource, type Source } from "@/lib/data";

/** Visible chip text. Must make sense on its own: touch screens never show the title tooltip. */
export function sourceLabel(source: Source): string {
  if (source.source_id === "sotkanet-regions") return "Sotkanet regions";
  const match = /^sotkanet-(\d+)$/.exec(source.source_id);
  if (match) return `Sotkanet ${match[1]}`;
  return `Source: ${source.publisher}`;
}

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
      className="group/chip relative inline-flex shrink-0 rounded-full outline-none after:absolute after:-inset-x-0.5 after:-inset-y-1.5 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Badge
        variant="outline"
        className="gap-1.5 tabular-nums text-foreground/85 group-hover/chip:border-brand/40 group-hover/chip:text-brand-ink"
      >
        {label}
        <ExternalLink aria-hidden className="size-3 opacity-60 group-hover/chip:opacity-100" />
      </Badge>
    </a>
  );
}
