import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { buildBriefContext } from "@/lib/brief/context";
import { fallbackResponse } from "@/lib/brief/generate";

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

  return <CountyBriefClient countyId={context.county.id} initial={initial} chips={chips} />;
}
