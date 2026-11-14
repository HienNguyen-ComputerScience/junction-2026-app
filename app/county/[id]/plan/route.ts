import type { NextRequest } from "next/server";

/**
 * The plan used to be a page of its own. It is now a download on the actions page ("Save or
 * share"), so an old link, a bookmark or an emailed plan address lands there. The files still
 * come from ./export (?format=docx|xlsx). Unknown area ids are 404s before this runs (proxy.ts).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/county/[id]/plan">) {
  const { id } = await ctx.params;
  return Response.redirect(new URL(`/county/${encodeURIComponent(id)}/act`, request.url), 307);
}
