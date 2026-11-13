import { Badge } from "@/components/ui/badge";
import { getSource, type Source } from "@/lib/data";

export function sourceLabel(source: Source): string {
  if (source.source_id === "sotkanet-regions") return "Sotkanet regions";
  const match = /^sotkanet-(\d+)$/.exec(source.source_id);
  if (match) return `Sotkanet ${match[1]}`;
  return source.publisher;
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
  const label = sourceLabel(source);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.name}
      className="inline-flex"
    >
      <Badge variant="outline" className="hover:bg-muted">
        {year === undefined ? label : `${label} · ${year}`}
      </Badge>
    </a>
  );
}
