import { NextResponse, type NextRequest } from "next/server";

import { search, isoDaysAgo, simulateOutage } from "@/lib/exa/client";
import { COUNTIES, TTL } from "@/lib/exa/config";
import { demoCacheGet } from "@/lib/exa/demo-cache";
import { rateLimit } from "@/lib/exa/rate-limit";

// GET /api/county-news?county=vantaa-kerava
// Last 12 months of Finnish news + county pages on GP access for one area, newest first.
// Any county or city id in data/counties.json (22 areas); unknown ids → 404.
// National cancer-pathway news is the same for every county, so it lives in /api/national-news.

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "news");
  if (limited) return limited;

  const id = request.nextUrl.searchParams.get("county") ?? "";
  const county = COUNTIES.get(id);
  if (!county) {
    return NextResponse.json({ error: `Unknown county "${id}".`, counties: [...COUNTIES.keys()] }, { status: 404 });
  }

  const since = isoDaysAgo(365);
  let result = await search(
    {
      query: county.query,
      type: "fast",
      numResults: 8,
      userLocation: "FI",
      startPublishedDate: since,
      includeDomains: county.includeDomains,
      contents: { highlights: { maxCharacters: 600, query: "lääkärille pääsy, jonotusaika, hoitotakuu" } },
    },
    { ttlMs: TTL.news, simulateOutage: simulateOutage(request), cacheKey: `news:${id}:${county.query}`, pin: true },
  );

  // Last resort when Exa is down and this instance has no copy: the committed demo cache.
  let message: string | undefined;
  if (result.freshness === "unavailable") {
    const saved = demoCacheGet("county-news", id);
    if (saved) {
      result = { items: saved.items, freshness: "stale-cache", retrievedAt: saved.retrievedAt };
      message = `Live search unavailable. Showing saved results from ${saved.retrievedAt}.`;
    } else {
      message = "Live search unavailable.";
    }
  }

  const seen = new Set<string>();
  const items = result.items
    .filter((item) => !seen.has(item.url) && seen.add(item.url))
    .sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));

  return NextResponse.json({
    county: { id, name: county.name },
    label: "Found live — unverified",
    since,
    freshness: result.freshness,
    ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
    ...(message && { message }),
    items,
  });
}
