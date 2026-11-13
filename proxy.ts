import { NextResponse, type NextRequest } from "next/server";

import areas from "@/data/counties.json";

// With Cache Components the prerendered shell starts a 200 response before the page can call
// notFound(), so an unknown county id would get the not-found UI with a 200 status. Proxy runs
// before rendering: unknown ids (and the national "finland" row) are rewritten to a path no route
// matches, which renders the not-found page with a real 404.
const countyIds = new Set(areas.filter((area) => area.kind !== "country").map((area) => area.id));

export function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2];
  if (id && countyIds.has(id)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/county-not-found", request.url));
}

export const config = {
  matcher: ["/county/:id", "/county/:id/act"],
};
