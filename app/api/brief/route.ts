import { NextResponse, type NextRequest } from "next/server";

import { briefIsFree, generateBrief } from "@/lib/brief/generate";
import { rateLimit } from "@/lib/exa/rate-limit";

// GET /api/brief?county=vantaa-kerava[&mode=fallback]
// A plain-language brief for one county. Claude writes it from the snapshot fact
// sheet; a validator drops any claim whose numbers or sources aren't in the
// snapshot; with no key, a failure, a timeout or too few valid claims, the
// precomputed brief is returned instead (mode: "fallback", with a reason).
// mode=fallback forces the precomputed brief (demo / outage testing).
// Only a request that would call Claude counts against the rate limit; cached,
// shared in-flight, fallback and unknown-county requests are free.

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("county") ?? "";
  const forceFallback = params.get("mode") === "fallback";
  if (!briefIsFree(id, forceFallback)) {
    const limited = rateLimit(request, "brief");
    if (limited) return limited;
  }
  const brief = await generateBrief(id, { forceFallback });
  if (!brief) {
    return NextResponse.json({ error: `Unknown county "${id.slice(0, 64)}".` }, { status: 404 });
  }
  return NextResponse.json(brief, { headers: { "Cache-Control": "no-store" } });
}
