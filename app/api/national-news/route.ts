import { NextResponse, type NextRequest } from "next/server";

import { search, searchCached, type SearchRequest, isoDaysAgo, simulateOutage } from "@/lib/exa/client";
import { GOV_FI, NATIONAL_CANCER_QUERY, NEWS_FI, TTL } from "@/lib/exa/config";
import { demoCacheGet } from "@/lib/exa/demo-cache";
import { rateLimit } from "@/lib/exa/rate-limit";

// GET /api/national-news?days=30
// National cancer-pathway news for Finland (one shared strip, not per county), newest first.
// `days` is the look-back window: one of 7, 30, 90 or 365; anything else is served as the default, 30.

const ALLOWED_DAYS = [7, 30, 90, 365];

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = ALLOWED_DAYS.includes(requested) ? requested : 30;
  const since = isoDaysAgo(days);

  const body: SearchRequest = {
    query: NATIONAL_CANCER_QUERY,
    type: "fast",
    numResults: 5,
    userLocation: "FI",
    startPublishedDate: since,
    includeDomains: [...NEWS_FI, ...GOV_FI],
    contents: { highlights: { maxCharacters: 600 } },
  };
  // `days` is one of ALLOWED_DAYS, so pinning by window is a bounded key set.
  const opts = { ttlMs: TTL.news, simulateOutage: simulateOutage(request), cacheKey: `national:${days}`, pin: true };

  // Count against the limit only when this would call Exa; a fresh cache hit is free.
  if (!searchCached(body, opts)) {
    const limited = rateLimit(request, "news");
    if (limited) return limited;
  }
  let result = await search(body, opts);

  let message: string | undefined;
  if (result.freshness === "unavailable") {
    const saved = demoCacheGet("national-news", String(days));
    if (saved) {
      result = { items: saved.items, freshness: "stale-cache", retrievedAt: saved.retrievedAt };
      message = `Live search unavailable. Showing saved results from ${saved.retrievedAt}.`;
    } else {
      message = "Live search unavailable.";
    }
  }

  const items = [...result.items].sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));

  return NextResponse.json({
    label: "Finland, this month",
    days,
    since,
    freshness: result.freshness,
    ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
    ...(message && { message }),
    items,
  });
}
