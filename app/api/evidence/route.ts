import { NextResponse, type NextRequest } from "next/server";

import { search, simulateOutage } from "@/lib/exa/client";
import { ACTION_DOMAINS, ACTION_QUERIES, GOV_FI, NORDIC_INTL, TTL } from "@/lib/exa/config";

// GET /api/evidence?action=fast-track
// `action` is a preset key (see ACTION_QUERIES) or free text (max 200 chars), e.g. an
// action title from docs/evidence/evidence.json. Results are "found live — unverified".

export async function GET(request: NextRequest) {
  const action = (request.nextUrl.searchParams.get("action") ?? "").trim().slice(0, 200);
  if (!/\p{L}{2,}/u.test(action)) {
    return NextResponse.json(
      { error: "Missing ?action=. Use a preset or free text.", presets: Object.keys(ACTION_QUERIES) },
      { status: 400 },
    );
  }

  const query = ACTION_QUERIES[action] ?? action;
  // Probe finding: `fast` + domain filter finds the same key papers as `deep` in ~0.5 s instead of 10–30 s.
  const result = await search(
    {
      query,
      type: "fast",
      numResults: 5,
      includeDomains: ACTION_DOMAINS[action] ?? [...NORDIC_INTL, ...GOV_FI],
      contents: { highlights: { maxCharacters: 500 } },
    },
    { ttlMs: TTL.evidence, simulateOutage: simulateOutage(request), snippetChars: 500 },
  );

  return NextResponse.json({
    action,
    query,
    label: "Found live — unverified",
    freshness: result.freshness,
    ...(result.freshness === "unavailable" && { message: "Live search unavailable." }),
    items: result.items,
  });
}
