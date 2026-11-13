import { NextResponse, type NextRequest } from "next/server";

import { search, isoDaysAgo, simulateOutage } from "@/lib/exa/client";
import { GOV_FI, NATIONAL_CANCER_QUERY, NEWS_FI, TTL } from "@/lib/exa/config";

// GET /api/national-news?days=30
// National cancer-pathway news for Finland (one shared strip, not per county), newest first.
// `days` is the look-back window: default 30, clamped to 7–365.

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = Number.isFinite(requested) ? Math.min(365, Math.max(7, Math.round(requested))) : 30;
  const since = isoDaysAgo(days);

  const result = await search(
    {
      query: NATIONAL_CANCER_QUERY,
      type: "fast",
      numResults: 5,
      userLocation: "FI",
      startPublishedDate: since,
      includeDomains: [...NEWS_FI, ...GOV_FI],
      contents: { highlights: { maxCharacters: 600 } },
    },
    { ttlMs: TTL.news, simulateOutage: simulateOutage(request) },
  );

  const items = [...result.items].sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));

  return NextResponse.json({
    label: "Finland, this month",
    days,
    since,
    freshness: result.freshness,
    ...(result.freshness === "unavailable" && { message: "Live search unavailable." }),
    items,
  });
}
