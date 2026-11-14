import type { ReactNode } from "react";

import { RecordingNote } from "@/components/pathway/recording-note";
import { SourceChip } from "@/components/source-chip";
import { buildBriefContext } from "@/lib/brief/context";
import { fallbackResponse } from "@/lib/brief/generate";
import { getRecordingCaveat } from "@/lib/recording";

import { CountyBriefClient } from "./county-brief-client";

/**
 * County brief section. Renders the precomputed brief on the server (works with
 * no API key and no network), and a button that swaps in the AI-written brief
 * from /api/brief. Every claim shows a source chip.
 */
export function CountyBrief({ countyId }: { countyId: string }) {
  const context = buildBriefContext(countyId);
  if (!context) return null;

  const initial = fallbackResponse(context);
  // Chips for every source in the fact sheet: AI claims may cite ones the fallback doesn't.
  const chips: Record<string, ReactNode> = Object.fromEntries(
    context.sources.map((source) => [source.source_id, <SourceChip key={source.source_id} sourceId={source.source_id} />]),
  );

  // The brief's trend claim says the GP wait share rose since 2023; the caveat is fixed text
  // outside the brief, so the AI cannot drop it and the claim checker never sees it.
  const caveat = getRecordingCaveat(context.county.id);

  return (
    <div className="flex flex-col gap-3">
      <CountyBriefClient countyId={context.county.id} initial={initial} chips={chips} />
      {caveat && <RecordingNote caveat={caveat} />}
    </div>
  );
}
