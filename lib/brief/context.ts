import { areas, evidence, gaps, indicators, sources, values } from "@/lib/data";

import { buildContextFromSnapshot } from "./facts";
import type { BriefContext } from "./types";

/**
 * The fact sheet for one county's brief, built only from the committed snapshot
 * (lib/data.ts). Returns null for an unknown county id.
 */
export function buildBriefContext(countyId: string): BriefContext | null {
  return buildContextFromSnapshot({ areas, indicators, values, gaps, evidence, sources }, countyId);
}
