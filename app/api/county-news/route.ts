import { NextResponse, type NextRequest } from "next/server";

import { search, isoDaysAgo, simulateOutage } from "@/lib/exa/client";
import { COUNTY_QUERIES, COUNTY_SITES, NEWS_FI, TTL } from "@/lib/exa/config";

// GET /api/county-news?county=vantaa-kerava
// Last 12 months of Finnish news + county pages on GP access for one county, newest first.
// National cancer-pathway news is the same for every county, so it lives in /api/national-news.

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("county") ?? "";
  const county = COUNTY_QUERIES[id];
  if (!county) {
    return NextResponse.json(
      { error: `Unknown county "${id}".`, counties: Object.keys(COUNTY_QUERIES) },
      { status: 404 },
    );
  }

  const since = isoDaysAgo(365);
  const result = await search(
    {
      query: county.query,
      type: "fast",
      numResults: 8,
      userLocation: "FI",
      startPublishedDate: since,
      includeDomains: [...NEWS_FI, ...COUNTY_SITES],
      contents: { highlights: { maxCharacters: 600, query: "lääkärille pääsy, jonotusaika, hoitotakuu" } },
    },
    { ttlMs: TTL.news, simulateOutage: simulateOutage(request) },
  );

  const seen = new Set<string>();
  const items = result.items
    .filter((item) => !seen.has(item.url) && seen.add(item.url))
    .sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));

  return NextResponse.json({
    county: { id, name: county.name },
    label: "Found live with Exa",
    since,
    freshness: result.freshness,
    ...(result.freshness === "unavailable" && { message: "Live search unavailable." }),
    items,
  });
}
