import { NextResponse, type NextRequest } from "next/server";

import { search, searchCached, type SearchRequest, simulateOutage } from "@/lib/exa/client";
import { EVIDENCE_ROW_IDS, PRESET_KEYS, TTL, resolveEvidence } from "@/lib/exa/config";
import { demoCacheGet } from "@/lib/exa/demo-cache";
import { rateLimit } from "@/lib/exa/rate-limit";

// GET /api/evidence?action=ev-ref-denmark-cpp
// `action` is one of (checked in this order):
//   - an evidence row id from data/evidence.json (e.g. ev-ref-denmark-cpp): research query built
//     from the row's action + precedent;
//   - an evidence row's action title, exactly (what the UI sends today): same query as its id;
//   - a preset key (fast-track, rapid-diagnostic-centres, ...).
// Anything else (free text) is a 400: the UI never sends it and each one would cost a live search.
// Results are "found live — unverified".

export async function GET(request: NextRequest) {
  const action = (request.nextUrl.searchParams.get("action") ?? "").trim().slice(0, 200);
  if (!/\p{L}{2,}/u.test(action)) {
    return NextResponse.json(
      { error: "Missing ?action=. Use an evidence id, a preset or free text.", presets: PRESET_KEYS, actionIds: EVIDENCE_ROW_IDS },
      { status: 400 },
    );
  }

  const resolved = resolveEvidence(action);
  if (resolved.key.startsWith("text:")) {
    return NextResponse.json(
      { error: "Unknown action. Use an evidence id, an evidence title or a preset.", presets: PRESET_KEYS, actionIds: EVIDENCE_ROW_IDS },
      { status: 400 },
    );
  }
  // Probe finding: `fast` + domain filter finds the same key papers as `deep` in ~0.5 s instead of 10–30 s.
  const body: SearchRequest = {
    query: resolved.query,
    type: "fast",
    numResults: 5,
    includeDomains: resolved.includeDomains,
    contents: { highlights: { maxCharacters: 500 } },
  };
  const opts = {
    ttlMs: TTL.evidence,
    simulateOutage: simulateOutage(request),
    snippetChars: 500,
    cacheKey: `evidence:${resolved.key}:${resolved.query}`,
    pin: true,
  };

  // Count against the limit only when this would call Exa; a fresh cache hit is free.
  if (!searchCached(body, opts)) {
    const limited = rateLimit(request, "evidence");
    if (limited) return limited;
  }
  let result = await search(body, opts);

  let message: string | undefined;
  if (result.freshness === "unavailable") {
    const saved = demoCacheGet("evidence", resolved.key);
    if (saved) {
      result = { items: saved.items, freshness: "stale-cache", retrievedAt: saved.retrievedAt };
      message = `Live search unavailable. Showing saved results from ${saved.retrievedAt}.`;
    } else {
      message = "Live search unavailable.";
    }
  }

  return NextResponse.json({
    action,
    ...(resolved.actionId && { actionId: resolved.actionId }),
    query: resolved.query,
    label: "Found live — unverified",
    freshness: result.freshness,
    ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
    ...(message && { message }),
    items: result.items,
  });
}
