import { NextResponse, type NextRequest } from "next/server";

import areas from "@/data/counties.json";

// With Cache Components the prerendered shell starts a 200 response before the page can call
// notFound(), so an unknown county id would get the not-found UI with a 200 status. Proxy runs
// before rendering: unknown ids (and the national "finland" row) are rewritten to a path no route
// matches, which renders the not-found page with a real 404. The guided briefing has the same
// need for its area id and its step segment.
const countyIds = new Set(areas.filter((area) => area.kind !== "country").map((area) => area.id));

// The briefing's step segments (steps 2 to 6). Keep in step with BRIEFING_STEP_SLUGS in
// lib/briefing/steps.ts; listed here because proxy runs before that module is part of every build.
const briefingSteps = new Set([
  "where-the-delay-is",
  "what-it-means",
  "what-to-do",
  "what-it-could-change",
  "save-or-share",
]);

// Step 6's old address, from before it was renamed; links already shared keep working.
const OLD_SHARE_STEP = "take-it-to-your-board";

export function proxy(request: NextRequest) {
  const [, section, id, step] = request.nextUrl.pathname.split("/");
  if (section === "briefing" && step === OLD_SHARE_STEP && countyIds.has(id)) {
    const url = request.nextUrl.clone();
    url.pathname = `/briefing/${id}/save-or-share`;
    return NextResponse.redirect(url, 308);
  }
  const known = id !== undefined && countyIds.has(id) && (section !== "briefing" || step === undefined || briefingSteps.has(step));
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/county-not-found", request.url));
}

export const config = {
  matcher: ["/county/:id", "/county/:id/act", "/county/:id/plan", "/briefing/:id", "/briefing/:id/:step"],
};
