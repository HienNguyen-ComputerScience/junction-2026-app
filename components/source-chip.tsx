import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getSource, type Source } from "@/lib/data";

/**
 * Readable publisher names for the hosts the snapshot cites (data/sources.json). The data keeps
 * the bare hostname as `publisher`; a chip shows who that is, and the hostname stays in the
 * tooltip. files.hackjunction.app is the hackathon's own file server, not the author of what it
 * hosts: such a chip shows the document's own title in short form (see shortTitle), and only
 * falls back to the name below when the title has no short form.
 */
const HOST_NAME: Record<string, string> = {
  "pmc.ncbi.nlm.nih.gov": "PubMed Central",
  "pubmed.ncbi.nlm.nih.gov": "PubMed",
  "cochranelibrary.com": "Cochrane Library",
  "nice.org.uk": "NICE",
  "riksdagen.se": "Sveriges riksdag",
  "thl.fi": "THL",
  "sotkanet.fi": "Sotkanet",
  "files.hackjunction.app": "Challenge brief (Junction)",
};

const HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

/** The publisher as a hostname without "www.", or null when it is a written-out name. */
function publisherHost(source: Source): string | null {
  const publisher = source.publisher.trim().replace(/^www\./i, "");
  return HOSTNAME.test(publisher) ? publisher.toLowerCase() : null;
}

/** Hosts that only store a file: the chip names the document, not the file server. */
const FILE_HOSTS = new Set(["files.hackjunction.app"]);
const MAX_TITLE = 30;

/**
 * A short form of a document's own title: its opening words, word for word, up to the first
 * colon and to what fits a chip ("Kansallinen syöpästrategia 2026-2035: Toimeenpanon…" gives
 * "Kansallinen syöpästrategia"). Never a translation or a rewording; the full title stays in
 * the tooltip and the aria-label. Null when fewer than two words fit.
 */
function shortTitle(name: string): string | null {
  const words = name.split(":")[0].trim().split(/\s+/);
  while (words.length > 2 && words.join(" ").length > MAX_TITLE) words.pop();
  const lead = words.join(" ");
  return words.length >= 2 && lead.length <= MAX_TITLE ? lead : null;
}

/** Visible chip text. Must make sense on its own: touch screens never show the title tooltip. */
export function sourceLabel(source: Source): string {
  if (source.source_id === "sotkanet-regions") return "Sotkanet regions";
  const match = /^sotkanet-(\d+)$/.exec(source.source_id);
  if (match) return `Sotkanet ${match[1]}`;
  const host = publisherHost(source);
  if (host === null) return source.publisher;
  if (FILE_HOSTS.has(host)) return shortTitle(source.name) ?? HOST_NAME[host] ?? host;
  return HOST_NAME[host] ?? host;
}

/**
 * Source reference: a small mono tag that links to the source. Sits next to, or in the same
 * block as, every number. 24px tall on desktop, 28px on phones; the hit area is 36px tall on a phone and 40px from sm, and neighbouring chips sit 8px apart.
 * One format everywhere: "<publisher or Sotkanet id>" and, when the figure has a year, " · 2025".
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
  const host = publisherHost(source);
  const title = host ? `${source.name} (${host})` : source.name;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={`${label}: ${title} (opens in a new tab)`}
      className="group/chip relative inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1 rounded-sm border border-border bg-muted px-1.5 align-middle type-mark whitespace-nowrap text-muted-foreground transition-colors outline-none after:absolute after:-inset-x-0.5 after:-inset-y-1 after:content-[''] sm:after:-inset-y-2 hover:border-foreground/30 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-6 sm:px-2"
    >
      <span className="truncate">{label}</span>
      <ArrowUpRight aria-hidden className="size-3 shrink-0 opacity-70 group-hover/chip:opacity-100" />
    </a>
  );
}
